#!/usr/bin/env node

import * as _ from "lodash";
import * as linter from "../";
import * as yaml from "js-yaml";
import * as fs from "fs";
import { consoleReporter, junitReporter, readExtraRules, Reporter, ruleNotifiesAt } from "../cmdutil/reporters";
import { readFromStdin } from "../cmdutil/stdin";
import { parsed as replicatedSchema } from "../schemas";

export const name = "validate";
export const describe = "Lint a yaml document from a file or stdin";
export const builder = {
  infile: {
    alias: "f",
    describe: "Input file to validate. Use \"-\" for stdin",
    type: "string",
    "default": "-",
  },
  threshold: {
    alias: "t",
    describe: "Threshold of of issues to report",
    type: "string",
    choices: ["info", "warn", "error"],
    "default": "error",
  },
  extraRules: {
    alias: "e",
    describe: "Path to file containing YAML definitions for additional validation rules. Can be specified multiple times.",
    type: "array",
    "default": [],
  },
  project: {
    describe: "name of a project to use instead of defaults",
    type: "string",
    "default": "",
  },
  schema: {
    alias: "s",
    describe: "Path to file containing JSONSchema for the document",
    type: "string",
  },
  scheduler: {
    describe: "Optional scheduler argument. Can be: native, swarm, or k8s",
    type: "string",
  },
  reporter: {
    alias: "r",
    describe: "Output Format to use",
    type: "string",
    "default": "console",
    choices: ["console", "junit"],
  },
  outputDir: {
    alias: "o",
    describe: "junit reporter only -- path to directory to output junit xml reports",
    type: "string",
    "default": "test-results",
  },
  excludeDefaults: {
    alias: "x",
    describe: "Exclude default rulesets + schema for replicated yaml, only use rules specified by --extraRules",
    type: "boolean",
    "default": false,
  },
  multidocIndex: {
    describe: "select a document out of a multidoc yaml stream. By default the first document will be read",
    type: "number",
    "default": 0,
  },
  _waitForDebugger: {
    describe: "Internal -- sleep 5000ms at command start, helpful for attaching a debugger",
    type: "boolean",
    "default": false,
  },
};

export const handler = argv => main(argv);

export const reporters: { [key: string]: Reporter } = {
  "console": consoleReporter,
  "junit": junitReporter,
};

async function main(argv) {

  if (argv._waitForDebugger) {
    await new Promise<void>((resolve) => setTimeout(resolve, 5000));
  }

  let {extraRules} = argv;
  if (_.isEmpty(extraRules)) {
    extraRules = [];
  } else if (_.isString(extraRules)) {
    extraRules = [extraRules];
  }

  argv.extraRules = extraRules;

  if (argv.infile !== "-") {
    lint(fs.readFileSync(argv.infile).toString(), argv);
  } else {
    readFromStdin().then(d => lint(d, argv));
  }
}

function lint(inYaml: string, argv: any) {
  const {extraRules, threshold, reporter, outputDir, excludeDefaults, schema, project} = argv;

  const justSyntaxChecks: linter.YAMLRule[] = [
    linter.rules.schema.yamlValid,
    linter.rules.schema.yamlNotEmpty,
  ];

  let baseRules: linter.YAMLRule[] =
    excludeDefaults ? justSyntaxChecks : linter.rules.all;
  let resolvedSchema: any = excludeDefaults ? undefined : replicatedSchema;

  if (project) {
    const projectModule = linter.projects[project];
    if (!projectModule) {
      throw new Error(`couldn't find project ${project}, try one of ${Object.keys(linter.projects)}`);
    }
    baseRules = projectModule.rules;
    resolvedSchema = projectModule.schema;
  }

  const extra = extraRules.map(readExtraRules);
  const rules = baseRules.concat(...extra).filter(ruleNotifiesAt(threshold));

  if (schema) {
    resolvedSchema = yaml.safeLoad(fs.readFileSync(schema).toString());
  }

  const opts: linter.MultidocLintOpts = {rules, schema: resolvedSchema, multidocIndex: argv.multidocIndex, scheduler: argv.scheduler};
  const results: linter.RuleTrigger[] = linter.hackLintMultidoc(inYaml, opts);

  reporters[reporter](inYaml, rules, results, outputDir);

  if (!_.isEmpty(results)) {
    process.exit(1);
  }
}

// but also
exports.handler = handler;
exports.name = name;
exports.describe = describe;
exports.builder = builder;
