import * as yaml from "js-yaml";
import * as _ from "lodash";
import * as ast from "yaml-ast-parser";
import * as tv4 from "tv4";
import * as rules from "./rules";
import * as lineColumn from "line-column";
import { parsed as schema } from "./schemas";
import { YAMLNode } from "yaml-ast-parser";
import { astPosition } from "./ast";
import { defaultRegistry, Registry } from "./engine";

export type RuleType =
  "error" |
  "warn" |
  "info";

export interface LintedDoc {
  index: number;
  findings: RuleTrigger[];
}

export interface RuleTrigger {
  type: RuleType;
  rule: string;
  message: string;

  links?: string[];
  positions?: Range[];
  err?: Error;
}

export interface Example {
  description: string;
  yaml: string;
}

export interface Examples {
  right: Example[];
  wrong: Example[];
}

export interface Test {
  AnyOf?: {
    path: string;
    pred: Test;
  };
  AllOf?: {
    path: string;
    pred: Test;
  };
  And?: {
    preds: Test[];
  };
  Or?: {
    preds: Test[];
  };
  IsEmpty?: {
    path: string;
  };
  Truthy?: {
    path: string;
  };
  NotBoolString?: {
    path: string;
  };
  InvalidURL?: {
    path: string;
  };
  Eq?: {
    path: string;
    value: any;
  };
  KeyDoesntMatch?: {
    pattern: string;
  };
  Semver?: {
    path: string;
    required: boolean;
  };
  SemverRange?: {
    path: string;
    required: boolean;
  };
  Exists?: {
    path: string;
  };
  Match?: {
    path: string;
    pattern: string;
  };
  NotMatch?: {
    path: string;
    pattern: string;
  };
  Neq?: {
    path: string;
    value: any;
  };
  LT?: {
    path: string;
    value: number;
  };
  GT?: {
    path: string;
    value: number;
  };
  GTE?: {
    path: string;
    value: number;
  };
  LTE?: {
    path: string;
    value: number;
  };
  FalseyIfPresent?: {
    path: string;
    field: string;
  };
  Falsey?: {
    path: string;
  };
  MonitorContainerMissing?: {
    monitorPath: string;
  };

  ContainerNamesNotUnique?: {};
  ConfigOptionExists?: {};
  ConfigOptionIsCircular?: {};
  ContainerVolumesFromMissing?: {};
  EventSubscriptionContainerMissing?: {};
  WhenExpressionConfigInvalid?: {};

  MoreThan?: {
    limit: number;
    values: string[];
  };
  Dot?: {
    path: string;
    pred: Test;
  };

  // allow arbitrary rules at compile time for now, need a better way to do this.
  // at least engine.Registry will complain at runtime if they're not supported.
  [key: string]: any;
}

export interface YAMLRule {
  test: Test;
  type: RuleType;
  name: string;
  message: string;
  links?: string[];
  examples?: Examples;
}

export interface RuleMatchedAt {
  matched: boolean;
  paths?: string[];
}

export interface Predicate<T> {
  test(root: T): RuleMatchedAt;
}

export interface Range {
  start: Position;
  path?: string;
  end?: Position;
}

export interface Position {
  position: number;
  line?: number;
  column?: number;
}

export interface MultidocLintOpts {
  rules?: YAMLRule[];
  schema?: any;
  registry?: Registry;
}

export interface LintOpts extends MultidocLintOpts {
  lineColumnFinder?: any;
  offset?: number;
}

const DOC_SEPARATOR =  `---\n`;
const DOC_SEPARATOR_LENGTH = DOC_SEPARATOR.length;

/**
 * uses a hack to split on yaml docs. Avoid using if posible
 */
export function hackLintMultidoc(inYaml: string, maybeOpts?: MultidocLintOpts): LintedDoc[] {
  // It's just one doc, do the normal thing, but keep signature same
  if (inYaml.indexOf(DOC_SEPARATOR) === -1) {
    return [{
      index: 0,
      findings: lint(inYaml, maybeOpts),
    }];
  }

  // It's many docs, split it on --- and lint each one,
  // tracking offset for accurate global line/column computation
  const opts = maybeOpts || {};
  const docs = inYaml.split(DOC_SEPARATOR).slice(1);
  let offset = inYaml.indexOf(DOC_SEPARATOR) + DOC_SEPARATOR_LENGTH;
  const lineColumnFinder = lineColumn(inYaml);

  return _.map(docs, (doc, index) => {
    const linted = new Linter(doc, {
      rules: opts.rules,
      registry: opts.registry,
      lineColumnFinder,
      offset,
    }).lint();

    offset += doc.length + DOC_SEPARATOR_LENGTH;
    return ({
      index,
      findings: linted,
    });
  });
}

export class Linter {

  public static withDefaults(inYaml: string): Linter {
    return new Linter(inYaml, { rules: rules.all, schema });
  }

  private readonly inYaml: string;
  private readonly rules?: YAMLRule[];
  private readonly schema?: any;

  private readonly registry: Registry;
  private readonly lineColumnFinder: any;
  private readonly offset: number;

  constructor(inYaml: string, maybeOpts?: LintOpts) {
    const opts: LintOpts = maybeOpts || {};
    this.inYaml = inYaml;
    this.offset = opts.offset || 0;
    this.registry = opts.registry || defaultRegistry;
    this.lineColumnFinder = opts.lineColumnFinder || lineColumn(inYaml);
    this.rules = opts.rules;
    this.schema = opts.schema;
  }

  public lint(): RuleTrigger[] {

    if (!this.inYaml) {
      return [this.noDocError()];
    }
    let root;
    try {
      root = yaml.safeLoad(this.inYaml);
    } catch (err) {
      return [this.loadYamlError(err)];
    }

    if (!root) {
      return [this.noDocError()];
    }

    const yamlAST: YAMLNode = ast.safeLoad(this.inYaml, null) as any;
    if (this.schema) {
      const res = tv4.validateMultiple(root, this.schema, false, true);
      if (!res.valid) {
        return this.schemaErrors(yamlAST, res.errors, this.lineColumnFinder, this.offset);
      }
    }

    return this.evaluateRules(root, yamlAST);
  }

  private loadYamlError(err: any): RuleTrigger {
    const positions = [] as Range[];

    if (err.mark && err.mark.position) {
      positions.push(
        {
          start: {
            column: this.lineColumnFinder.fromIndex(err.mark.position + this.offset).col - 1,
            line: this.lineColumnFinder.fromIndex(err.mark.position + this.offset).line - 1,
            position: err.mark.position + this.offset,
          },
        },
      );
    }

    return {
      type: "error",
      rule: "mesg-yaml-valid",
      message: err.message,
      positions,
    };
  }

  private noDocError(): RuleTrigger {
    return {
      type: "warn",
      rule: "mesg-yaml-not-empty",
      message: "No document provided",
    };

  }

  private evaluateRules(root: any, yamlAST: YAMLNode): RuleTrigger[] {
    if (_.isEmpty(this.rules)) {
      return [];
    }

    const ruleTriggers: RuleTrigger[] = [];

    _.forEach(this.rules!, (rule: YAMLRule) => {

      let result: RuleMatchedAt = { matched: false };
      const compiled = this.registry.compile(rule.test);
      try {
        result = compiled.test(root);
      } catch (err) {
        console.log(`error testing rule ${rule.type}:${rule.name}`, err);
        // ignore errors for now
      }

      if (result.matched) {
        let positions = _.flatMap(result.paths!,
          path => astPosition(yamlAST, path, this.lineColumnFinder, this.offset),
        );

        if (_.isEmpty(positions)) {
          const shorterPaths = _.map(result.paths!, p => p.split(".").slice(0, -1).join("."));
          positions = _.flatMap(shorterPaths,
            path => astPosition(yamlAST, path, this.lineColumnFinder, this.offset),
          );
        }

        const message = _.isEmpty(positions) ?
            rule.message :
            `${rule.message} [${positions[0].path}]`;

        ruleTriggers.push({
          type: rule.type,
          rule: rule.name,
          links: rule.links,
          message,
          positions,
        });
      }
    });

    return ruleTriggers;
  }

  private schemaErrors(yamlAST: YAMLNode, errors: tv4.ValidationError[], lineColumnFinder: any, offset: number): RuleTrigger[] {
    return _.map(errors, (err: tv4.ValidationError) => {
      let positions: Range[] = [];

      if (err.dataPath) {
        positions = astPosition(yamlAST, err.dataPath.slice(1).replace(/\//g, "."), lineColumnFinder, offset);
      }

      const message = _.isEmpty(positions) ?
          err.message :
          `${err.message} [${positions[0].path}]`;

      return {
        rule: "prop-schema-valid",
        type: "error" as RuleType,
        positions,
        message,
      };
    });

  }

}

/**
 * Lint a single yaml document against a set of `YAMLRule`s
 *
 * @param inYaml           yaml to lint
 * @param maybeOpts        LintOpts
 * @returns RuleTrigger[]  will be empty if linting passes
 */
export function lint(inYaml: string, maybeOpts?: LintOpts): RuleTrigger[] {
  return new Linter(inYaml, maybeOpts).lint();
}

/**
 * Lint a single yaml document against the default set of `YAMLRule`s
 * and document schema
 *
 * @param inYaml           yaml to lint
 * @returns RuleTrigger[]  will be empty if linting passes
 */
export function defaultLint(inYaml: string): RuleTrigger[] {
  return Linter.withDefaults(inYaml).lint();
}
