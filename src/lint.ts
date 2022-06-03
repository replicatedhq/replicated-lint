import * as yaml from "js-yaml";
import * as _ from "lodash";
import * as ast from "yaml-ast-parser";
import { YAMLNode } from "yaml-ast-parser";
import * as tv4 from "tv4";
import * as rules from "./rules";
import * as lineColumn from "line-column";
import { parsed as schema } from "./schemas";
import { astPosition, tokenize } from "./ast";
import { defaultRegistry, Registry } from "./engine";
import { JSONSchema4 } from "json-schema";

export type RuleType =
  "error" |
  "warn" |
  "info";

function ruleTypeLevel(type: RuleType): number {
  switch (type) {
    case "error":
      return 50;
    case "warn":
      return 40;
    case "info":
      return 30;
    default:
      return 99;
  }
}

export function ruleTypeLT(t1: RuleType, t2: RuleType): boolean {
  return ruleTypeLevel(t1) < ruleTypeLevel(t2);
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
  scheduler?: string;
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
  Not?: {
    pred: Test;
  };
  IsEmpty?: {
    path: string;
  };
  IsNotBytesCount?: {
    path: string;
  };
  IsNotRAMCount?: {
    path: string;
  };
  IsNotKubernetesQuantity?: {
    path: string;
  };
  ArrayMemberFieldsNotUnique?: {
    path: string;
  };
  IsNotUint?: {
    path: string;
  };
  Truthy?: {
    path: string;
  };
  NotBoolString?: {
    path: string;
  };
  NotUintString?: {
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
  SemverMinimum?: {
    path: string;
    minimum: string;
  };
  Exists?: {
    path: string;
  };
  Match?: {
    path: string;
    pattern: string;
  };
  NotMatch?: {
    path?: string;
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
  IsNotScheduler?: {
    scheduler: string;
  };

  ContainerNamesNotUnique?: {};
  ConfigOptionExists?: {};
  ConfigOptionIsCircular?: {};
  ContainerVolumesFromMissing?: {};
  EventSubscriptionContainerMissing?: {};
  WhenExpressionConfigInvalid?: {};
  CustomRequirementsNotUnique?: {};
  ContainerVolumesFromSubscription?: {};

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

export interface TestOpts {
  scheduler?: string;
}

export interface Predicate<T> {
  test(root: T, testOps?: TestOpts): RuleMatchedAt;
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
  schema?: JSONSchema4;
  registry?: Registry;
  multidocIndex?: number;
  scheduler?: string;
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
export function hackLintMultidoc(inYaml: string, maybeOpts?: MultidocLintOpts): RuleTrigger[] {
  const targetIndex = maybeOpts ? maybeOpts.multidocIndex : 0;
  // It's just one doc, do the normal thing, but keep signature same
  if (inYaml.indexOf(DOC_SEPARATOR) === -1) {
    return lint(inYaml, maybeOpts);
  }

  // It's many docs, split it on --- and lint each one,
  // tracking offset for accurate global line/column computation
  const opts = maybeOpts || {};
  const docs = inYaml.split(DOC_SEPARATOR).slice(1);
  let offset = inYaml.indexOf(DOC_SEPARATOR) + DOC_SEPARATOR_LENGTH;
  const lineColumnFinder = lineColumn(inYaml);

  let index = 0;
  for (const doc of docs) {
    if (index === targetIndex) {
      return new Linter(doc, {
        rules: opts.rules,
        registry: opts.registry,
        lineColumnFinder,
        offset,
        scheduler: opts.scheduler,
      }).lint();
    }
    offset += doc.length + DOC_SEPARATOR_LENGTH;
    index += 1;
  }
  return [Linter.noDocError()];
}

export class Linter {

  public static withDefaults(inYaml: string, maybeOpts: LintOpts = {}): Linter {
    const { scheduler = "" } = maybeOpts;
    return new Linter(inYaml, {rules: rules.all, schema, scheduler });
  }

  public static noDocError(): RuleTrigger {
    return {
      type: "error",
      rule: "mesg-yaml-not-empty",
      message: "Document must not be empty",
    };

  }

  private readonly inYaml: string;
  private readonly rules?: YAMLRule[];
  private readonly schema?: any;

  private readonly registry: Registry;
  private readonly lineColumnFinder: any;
  private readonly offset: number;

  private readonly scheduler: string;

  constructor(inYaml: string, maybeOpts?: LintOpts) {
    const opts: LintOpts = maybeOpts || {};
    this.inYaml = inYaml;
    this.offset = opts.offset || 0;
    this.registry = opts.registry || defaultRegistry;
    this.lineColumnFinder = opts.lineColumnFinder || lineColumn(inYaml);
    this.rules = opts.rules;
    this.schema = opts.schema;
    this.scheduler = opts.scheduler || "";
  }

  public lint(): RuleTrigger[] {

    if (!this.inYaml) {
      return [Linter.noDocError()];
    }
    let root;
    try {
      root = yaml.safeLoad(this.inYaml);
    } catch (err) {
      return [this.loadYamlError(err)];
    }

    if (!root) {
      return [Linter.noDocError()];
    }

    const yamlAST: YAMLNode = ast.safeLoad(this.inYaml) as any;
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
      const errorRange = this.lineColumnFinder.fromIndex(err.mark.position + this.offset);
      // check if error is in range. If not, default error to end of document.
      const columnPosition = errorRange ? errorRange.col - 1 : 0;
      const linePosition = errorRange ? errorRange.line - 1 : this.lineColumnFinder.lineToIndex.length;
      positions.push(
        {
          start: {
            column: columnPosition,
            line: linePosition,
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

  private evaluateRules(root: any, yamlAST: YAMLNode): RuleTrigger[] {
    if (_.isEmpty(this.rules)) {
      return [];
    }

    const ruleTriggers: RuleTrigger[] = [];

    _.forEach(this.rules!, (rule: YAMLRule) => {

      let result: RuleMatchedAt = {matched: false};
      const compiled = this.registry.compile(rule.test);
      try {
        result = compiled.test(root, {
          scheduler: this.scheduler,
        });
      } catch (err) {
        console.log(`error testing rule ${rule.type}:${rule.name}`, err);
        // ignore errors for now
      }

      if (result.matched) {
        let positions = _.flatMap(result.paths!,
          path => astPosition(yamlAST, tokenize(path), this.lineColumnFinder, this.offset),
        );

        if (_.isEmpty(positions)) {
          const shorterPaths = _.map(result.paths!, p => p.split(".").slice(0, -1).join("."));
          positions = _.flatMap(shorterPaths,
            path => astPosition(yamlAST, tokenize(path), this.lineColumnFinder, this.offset),
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
        positions = astPosition(yamlAST, err.dataPath.slice(1).split("/"), lineColumnFinder, offset);
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
 * @param maybeOpts        LintOpts
 * @returns RuleTrigger[]  will be empty if linting passes
 */
export function defaultLint(inYaml: string, maybeOpts?: LintOpts): RuleTrigger[] {
  return Linter.withDefaults(inYaml, maybeOpts).lint();
}
