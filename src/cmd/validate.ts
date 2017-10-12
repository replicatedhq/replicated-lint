#!/usr/bin/env node

import * as _ from "lodash";
import * as linter from "../";
import * as util from "util";
import * as pad from "pad";
import * as chalk from "chalk";
import * as lineColumn from "line-column";
import * as fs from "fs";

const startBuffer = 100;
const endBuffer = 300;

exports.describe = "validate";
exports.describe = "Lint a yaml document from a file or stdin";
exports.builder = {
  infile: {
    alias: "f",
    "default": "-",
  },
  extraRules: {
    alias: "e",
    describe: "Path to a file containing JSON definitions for additional yaml rules. Can be specified multiple times.",
    type: "array",
  },
};

exports.handler = main;

function main(argv) {
  let extraRules = argv.extraRules;
  if (_.isEmpty(extraRules)) {
    extraRules = [];
  } else if (_.isString(extraRules)) {
    extraRules = [extraRules];
  }
  if (argv.infile !== "-") {
    lint(fs.readFileSync(argv.infile).toString(), extraRules);
  } else {
    readFromStdin().then(d => lint(d, extraRules));
  }
}

function lint(data: string, extraRules: string[]) {

  const extra = (extraRules).map(filePath => JSON.parse(fs.readFileSync(filePath).toString()));
  const opts: linter.LintOpts = {rules: linter.rules.all.concat(...extra)};
  const results: linter.RuleTrigger[] = linter.lint(data, opts);
  let found = 0;
  for (const result of results) {
    if (process.argv.indexOf("-q") !== -1) {
      if (result.type !== "error") {
        continue;
      }
    }

    found += 1;

    console.log(util.inspect(result, false, 100, true));

    if (_.isEmpty(result.positions)) {
      continue;
    }
    for (const pos of result.positions!) {

      const usepos: linter.Position = _.isEmpty(pos.start) ? pos.end! : pos.start!;

      const start = Math.max(0, usepos.position - startBuffer);
      const end = Math.min(data.length, usepos.position + endBuffer);
      const startline = lineColumn(data).fromIndex(start).line - 2;

      const block = data.slice(start, end);
      const trimmed = block.slice(block.indexOf("\n"), block.lastIndexOf("\n"));
      console.log();
      console.log(`# ${result.rule} continued from line ${startline}`);
      let lineno = startline;
      for (const line of trimmed.split("\n")) {
        lineno += 1;
        let color = false;
        try {
          color = lineno === usepos.line!;
        } catch (err) { /* ignore */
        }

        if (color) {
          console.log(`${pad(`${lineno}`, 4)} ${chalk.yellow(line)}`);
        } else {
          console.log(`${pad(`${lineno}`, 4)} ${line}`);
        }
      }
      console.log();
    }

  }
  console.log();
  console.log();

  if (found !== 0) {
    console.log(chalk.yellow(`Found ${found} issues.`));
  } else {
    console.log(chalk.green(`✓ All clear!`));
  }

}

function readFromStdin(): Promise<string> {
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  let data = "";

  process.stdin.on("data", (chunk) => {
    data += chunk;
  });

  return new Promise<string>((resolve) => {
    process.stdin.on("end", () => {
      resolve(data);
    });
  });
}
