#!/usr/bin/env node

import * as _ from "lodash";
import * as linter from "../";
import * as chalk from "chalk";
import {consoleReporter, readExtraRules} from "../cmdutil/reporters";
import {lint} from "../lint";
import {parsed as replicatedYAMLSchema} from "../schemas";

exports.name = "validate";
exports.describe = "Verify a rules against their documented `example`s in the rule specifications. Run with `-x false` to test the built-in rules";
exports.builder = {
  rules: {
    alias: "r",
    describe: "Path to file containing YAML definitions for additional validation rules. Can be specified multiple times.",
    type: "array",
    "default": [],
  },
  replicated: {
    describe: "Flag to validate the built-in replicated rules. Any files passed in extraRules will be ignored.",
    type: "boolean",
    "default": false,
  },
};

exports.handler = main;

function main(argv) {
  let {rules} = argv;
  if (_.isEmpty(rules)) {
    rules = [];
  } else if (_.isString(rules)) {
    rules = [rules];
  }

  argv.rules = rules;
  verifyRules(argv);
}

function verifyRules(argv: any) {
  const {rules, replicated} = argv;

  const baseRules: linter.YAMLRule[] = replicated ? linter.rules.all : [];

  const schema = replicated ? replicatedYAMLSchema : undefined;
  const extra = rules.map(readExtraRules);
  const rulesToTest: linter.YAMLRule[] = baseRules.concat(...extra);

  if (_.isEmpty(rulesToTest)) {
    console.log(chalk.yellow(`No rules found. Specify one or more rules files with --rules, or use --replicated to test the default rule set.`));
  }

  let failed = 0;
  for (const rule of rulesToTest) {
    const noExamples =
      _.isEmpty(rule.examples) ||
      (_.isEmpty(rule.examples!.right) && _.isEmpty(rule.examples!.wrong));

    if (noExamples) {
      console.log(`WARN rule ${rule.name} has no examples, consider adding some`);
      continue;
    }

    console.log();
    console.log(rule.name);
    console.log(rule.message);
    console.log(`------`);

    for (const example of rule.examples!.right || []) {
      const results = lint(example.yaml, {rules: [rule]});
      if (!_.isEmpty(results)) {
        failed += 1;
        console.log(chalk.red(`✘ ${example.description} found ${results.length} issues:`));
        consoleReporter(example.yaml, [rule], results);
      } else {
        console.log(`${chalk.green("✓")} ${example.description} should pass linting`);
      }
    }

    for (const example of rule.examples!.wrong || []) {
      const results = lint(example.yaml, {rules: [rule], schema});
      if (_.isEmpty(results)) {
        failed += 1;
        console.log(chalk.red(`✘ ${example.description} expected 1 issues but none found`));
      } else {
        console.log(`${chalk.green("✓")} ${example.description} should fail linting`);
      }
    }
  }

  if (failed !== 0) {
    console.log(`${failed} examples failed verification.`);
    process.exit(1);
  }
}
