import * as _ from "lodash";
import { describe, it } from "mocha";
import { expect } from "chai";

import * as rules from "../rules";
import { lint } from "../lint";

/*
 dynamically parses examples on rules
 to generate test specs. Looks something like:

 linter.rules.all
   prop-replicated-api-version-exists
     `replicated_api_version` is valid semver
       ✓ should pass linting
     `replicated_api_version` is missing
       ✓ should fail linting
     `replicated_api_version` is not valid semver
       ✓ should fail linting
   prop-monitors-cpuacct-container-exists
     All cpuacct monitors reference existing containers
       ✓ should pass linting
     cpuacct monitor references a component that does not exist
       ✓ should fail linting
     cpuacct monitor references a container that does not exist
       ✓ should fail linting
 */
describe("linter.rules.all", () => {

  for (const rule of rules.all) {
    const noExamples =
      _.isEmpty(rule.examples) ||
      (_.isEmpty(rule.examples!.right) && _.isEmpty(rule.examples!.wrong));

    if (noExamples) {
      console.log(`WARN rule ${rule.name} has no examples, consider adding some`);
      continue;
    }

    describe(rule.name, () => {
      for (const example of rule.examples!.right) {
        describe(example.description, () => {
          it("should pass linting", () => {
            expect(lint(example.yaml, [rule])).to.deep.equal([]);
          });
        });
      }

      for (const example of rule.examples!.wrong) {
        describe(`${example.description}`, () => {
          it("should fail linting", () => {
            expect(lint(example.yaml, [rule])).to.have.deep.property("[0].rule", rule.name);
          });
        });
      }
    });
  }
});
