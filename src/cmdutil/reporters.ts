import * as _ from "lodash";
import * as chalk from "chalk";
import * as junitReports from "junit-report-builder";
import * as lineColumn from "line-column";
import * as linter from "../";
import * as pad from "pad";
import * as path from "path";
import * as util from "util";
import * as fs from "fs";
import {ruleTypeLT} from "../lint";

export const readExtraRules = filePath => JSON.parse(fs.readFileSync(filePath).toString());
export const ruleNotifiesAt = threshold => rule => !ruleTypeLT(rule.type, threshold);

export type Reporter = ((yaml: string,
                         rulesUsed: linter.YAMLRule[],
                         results: linter.RuleTrigger[],
                         outputPath?: string) => any);

export const getInvalidYAMLError = (results: any[]) => {
  return _.find(results, r =>
    r.rule === "mesg-yaml-valid" ||
    r.rule === "mesg-yaml-not-empty" ||
    r.rule === "prop-schema-valid",
  );
};

export function junitReporter(__: string, rulesUsed: linter.YAMLRule[], results: linter.RuleTrigger[], outputDir: string) {
  const reportBuilder = junitReports.newBuilder();
  const suite = reportBuilder.testSuite().name("replicated-lint");

  const invalidYAMLError = getInvalidYAMLError(results);

  for (const rule of rulesUsed) {
    const testCase = suite.testCase().className("replicated-lint").name(rule.name);

    if (invalidYAMLError) { // if the yaml was invalid, then all the rules should fail regardless of results
      testCase.failure(invalidYAMLError.message);
      continue;
    }

    const result = _.find(results, r => r.rule === rule.name);
    if (result) {
      testCase.failure(result.message);
    }

  }

  const reportPath = path.join(outputDir || ".", "replicated-lint-results.xml");
  reportBuilder.writeTo(reportPath);
  console.log(`Results written to ${reportPath}`);
  outro(results.length, rulesUsed.length);
}

export function consoleReporter(inYaml: string, rulesUsed: linter.YAMLRule[], results: linter.RuleTrigger[]) {
  const startBuffer = 100;
  const endBuffer = 300;
  for (const result of results) {
    console.log(util.inspect(result, false, 100, true));

    if (_.isEmpty(result.positions)) {
      continue;
    }

    for (const pos of result.positions!) {

      const usepos: linter.Position = _.isEmpty(pos.start) ? pos.end! : pos.start!;

      const start = Math.max(0, usepos.position - startBuffer);
      const end = Math.min(inYaml.length, usepos.position + endBuffer);
      const startline = lineColumn(inYaml).fromIndex(start).line - 2;

      const block = inYaml.slice(start, end);
      const trimmed = block.slice(block.indexOf("\n"), block.lastIndexOf("\n"));
      console.log();
      console.log(`# ${result.rule} continued from line ${Math.max(startline, 0)}`);
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

  outro(results.length, rulesUsed.length);
}

export function outro(numResults: number, numRules: number) {
  if (numResults !== 0) {
    console.log();
    console.log();
    console.log(chalk.yellow(`Found ${numResults} issues.`));
  } else {
    console.log(`${numRules}/${numRules} checks passed.`);
    console.log(chalk.green(`✓ All clear!`));
  }

}
