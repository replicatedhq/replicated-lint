#!/usr/bin/env node

import * as _ from "lodash";
import * as linter from "../";
import * as fs from "fs";
import { ruleTypeLT } from "../lint";
import { consoleReporter, junitReporter } from "../cmdutil/reporters";
import { readFromStdin } from "../cmdutil/stdin";
import { parsed as schema } from "../schemas";

exports.describe = "validate";
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
    describe: "Path to file containing JSON definitions for additional yaml rules. Can be specified multiple times.",
    type: "array",
    "default": [],
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
};

exports.handler = main;

export const reporters: { [key: string]: ((yaml: string, rulesUsed: linter.YAMLRule[], results: linter.RuleTrigger[], outputPath?: string) => any) } = {
  "console": consoleReporter,
  "junit": junitReporter,
};

function main(argv) {
  let extraRules = argv.extraRules;
  if (_.isEmpty(extraRules)) {
    extraRules = [];
  } else if (_.isString(extraRules)) {
    extraRules = [extraRules];
  }

  if (argv.infile !== "-") {
    lint(fs.readFileSync(argv.infile).toString(), extraRules, argv.threshold, argv.reporter, argv.outputDir);
  } else {
    readFromStdin().then(d => lint(d, extraRules, argv.threshold, argv.reporter, argv.outputDir));
  }
}

function lint(inYaml: string, extraRules: string[], threshold: linter.RuleType, reporter: string, output: string) {

  const extra = (extraRules).map(filePath => JSON.parse(fs.readFileSync(filePath).toString()));
  const rules = linter.rules.all.concat(...extra).filter(rule => !ruleTypeLT(rule.type, threshold));
  const opts: linter.LintOpts = { rules, schema };
  const results: linter.RuleTrigger[] = linter.lint(inYaml, opts);

  reporters[reporter](inYaml, rules, results, output);
}
