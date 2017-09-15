#!/usr/bin/env node

import * as _ from "lodash";
import * as linter from "../";
import * as util from "util";
import * as pad from "pad";
import * as chalk from "chalk";
import * as lineColumn from "line-column";

const startBuffer = 100;
const endBuffer = 300;
process.stdin.resume();
process.stdin.setEncoding("utf8");

let data = "";

process.stdin.on("data", (chunk) => {
  data += chunk;
});

process.stdin.on("end", () => {
  const results: linter.RuleTrigger[] = linter.defaultLint(data);
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
        } catch (err) { /* ignore */ }

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

});
