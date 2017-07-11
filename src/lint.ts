import * as yaml from "js-yaml";
import * as _ from "lodash";
import * as ast from "yaml-ast-parser";
import * as lineColumn from "line-column";
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
  received: any;
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
  Truthy?: {
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
  ConfigOptionExists?: {};
  ConfigOptionIsCircular?: {};
  FalseyIfPresent?: {
    path: string;
    field: string;
  };
  GT?: {
    path: string;
    value: number;
  };
  MonitorContainerMissing?: {
    monitorPath: string;
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

const DOC_SEPARATOR_LENGTH = 3;

/**
 * uses a hack to split on yaml docs. Avoid using if posible
 */
export function lintMultidoc(inYaml: string, rules?: YAMLRule[], registry?: Registry): LintedDoc[] {
  let docs = inYaml.split(`---`).slice(1);

  let offset = inYaml.indexOf(`---`) + 3;

  const lineColumnFinder = lineColumn(inYaml);

  return _.map(docs, (doc, index) => {
    const vetted = lint(doc, rules, registry, lineColumnFinder, offset);
    offset += doc.length + DOC_SEPARATOR_LENGTH;
    return ({
      index,
      findings: vetted,
    });
  });
}

/**
 * Lint a single yaml document against a set of `YAMLRule`s
 *
 * @param inYaml           yaml to lint
 * @param rules            set of rules to apply
 * @returns RuleTrigger[]  will be empty if linting passes
 */
export function lint(inYaml: string, rules?: YAMLRule[], maybeRegistry?: Registry, maybeLineColumnFinder?: any, positionOffset?: number): RuleTrigger[] {
  const offset: number = positionOffset || 0;
  const registry: Registry = maybeRegistry || defaultRegistry;
  const lineColumnFinder: any = maybeLineColumnFinder || lineColumn(inYaml);

  if (!inYaml) {
    return [noDocError(inYaml)];
  }
  let root;
  try {
    root = yaml.safeLoad(inYaml);
  } catch (err) {
    return [loadYamlError(err, inYaml, lineColumnFinder, offset)];
  }

  if (!root) {
    return [noDocError(inYaml)];
  }

  const yamlAST: YAMLNode = <any> ast.safeLoad(inYaml, null);

  if (_.isEmpty(rules)) {
    return [];
  }

  const ruleTriggers: RuleTrigger[] = [];

  _.forEach(rules!, (rule: YAMLRule) => {

    let result: RuleMatchedAt = { matched: false };
    const compiled = registry.compile(rule.test);
    try {
      result = compiled.test(root);
    } catch (err) {
      console.log(`error testing rule ${rule.type}:${rule.name}`, err);
      // ignore errors for now
    }

    if (result.matched) {
      let positions = _.flatMap(result.paths!,
        path => astPosition(yamlAST, path, lineColumnFinder, offset),
      );

      if (_.isEmpty(positions)) {
        const shorterPaths = _.map(result.paths!, p => p.split(".").slice(0, -1).join("."));
        positions = _.flatMap(shorterPaths,
          path => astPosition(yamlAST, path, lineColumnFinder, offset),
        );
      }

      ruleTriggers.push({
        type: rule.type,
        rule: rule.name,
        received: _.map(result.paths!, p => _.get(root, p))[0],
        message: rule.message,
        positions,
        links: rule.links,
      });
    }
  });

  return ruleTriggers;
}

function loadYamlError(err: any, inYaml: string, lineColumnFinder: any, offset: any): RuleTrigger {
  return {
    type: "error",
    rule: "mesg-yaml-valid",
    received: inYaml,
    positions: [
      {
        start: {
          column: lineColumnFinder.fromIndex(err.mark.position + offset).col - 1,
          line: lineColumnFinder.fromIndex(err.mark.position + offset).line - 1,
          position: err.mark.position + offset,
        },
      },
    ],
    message: err.message,
  };
}

function noDocError(inYaml: string): RuleTrigger {
  return {
    type: "warn",
    rule: "mesg-yaml-not-empty",
    received: inYaml,
    message: "No document provided",
  };

}
