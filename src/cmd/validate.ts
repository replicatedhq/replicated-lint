#!/usr/bin/env node

import * as _ from "lodash";
import * as linter from "../";
import * as yaml from "js-yaml";
import * as fs from "fs";
import {
  consoleReporter,
  junitReporter,
  readExtraRules,
  Reporter,
  ruleNotifiesAt,
} from "../cmdutil/reporters";
import {readFromStdin} from "../cmdutil/stdin";
import {parsed as replicatedSchema} from "../schemas";

exports.name = "validate";
exports.describe = "Lint a yaml document from a file or stdin";
exports.builder = {
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
  schema: {
    alias: "s",
    describe: "Path to file containing JSONSchema for the document",
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
};

exports.handler = main;

export const reporters: { [key: string]: Reporter } = {
  "console": consoleReporter,
  "junit": junitReporter,
};

function main(argv) {
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
  const {extraRules, threshold, reporter, outputDir, excludeDefaults, schema} = argv;

  const justSyntaxChecks: linter.YAMLRule[] = [
    linter.rules.schema.yamlValid,
    linter.rules.schema.yamlNotEmpty,
  ];

  const baseRules: linter.YAMLRule[] =
    excludeDefaults ? justSyntaxChecks : linter.rules.all;

  const extra = extraRules.map(readExtraRules);
  const rules = baseRules.concat(...extra).filter(ruleNotifiesAt(threshold));

  let resolvedSchema: any = excludeDefaults ? undefined : replicatedSchema;
  if (schema) {
    resolvedSchema = yaml.safeLoad(fs.readFileSync(schema).toString());
  }

  const opts: linter.LintOpts = {rules, schema: resolvedSchema};
  const results: linter.RuleTrigger[] = linter.lint(inYaml, opts);

  reporters[reporter](inYaml, rules, results, outputDir);

  if (!_.isEmpty(results)) {
    process.exit(1);
  }
}
