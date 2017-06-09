import * as yaml from "js-yaml";
import * as _ from "lodash";
import * as ast from "yaml-ast-parser";
import * as lineColumn from "line-column";
import { YAMLNode } from "yaml-ast-parser";
import { astPosition } from "./ast";

export type RuleType =
  "error" |
  "warn" |
  "optimization";

export interface LintedDoc {
  index: number;
  findings: RuleTrigger[];
}

export interface RuleTrigger {
  type: RuleType;
  rule: string;
  received: any;
  message: string;

  positions?: Range[];
  err?: Error;
}

export interface YAMLRule {
  test: Predicate<any>;
  type: RuleType;
  name: string;
  message: string;
}

export interface RuleMatched {
  matched: boolean;
  paths?: string[];
}

export interface Predicate<T> {
  test(root: T): RuleMatched;
}

export class Neq implements Predicate<any> {

  constructor(private readonly path: string,
              private readonly value: string) {
  }

  public test(object: any): RuleMatched {
    return {
      matched: _.get(object, this.path) === this.value,
      paths: [this.path],
    };
  }
}

export class Exists implements Predicate<any> {

  constructor(private readonly path: string) {
  }

  public test(object: any): RuleMatched {
    return {
      matched: !_.get(object, this.path),
      paths: [this.path],
    };
  }
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
export function lintMultidoc(inYaml: string, rules?: YAMLRule[]): LintedDoc[] {
  let docs = inYaml.split(`---`).slice(1);

  let offset = inYaml.indexOf(`---`) + 3;

  const lineColumnFinder = lineColumn(inYaml);

  return _.map(docs, (doc, index) => {
    const vetted = lint(doc, rules, lineColumnFinder, offset);
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
export function lint(inYaml: string, rules?: YAMLRule[], lineColumnFinder?: any, positionOffset?: number): RuleTrigger[] {
  const offset: number = positionOffset || 0;
  lineColumnFinder = lineColumnFinder || lineColumn(inYaml);

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
    const result = rule.test.test(root);
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
      });
    }
  });

  return ruleTriggers;
}

function loadYamlError(err: any, inYaml: string, lineColumnFinder: any, offset: any): RuleTrigger {
  return {
    type: "error",
    rule: "validYaml",
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
    rule: "notEmpty",
    received: inYaml,
    message: "No document provided",
  };

}
