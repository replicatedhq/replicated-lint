import { describe, it } from "mocha";
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";

import { defaultLint } from "../lint";

interface GoodExample {
  name: string;
  yaml: string;
}

interface BadExample extends GoodExample {
  errPath?: string;
}

interface WarningExample extends BadExample {
  rule: string;
}

const good: GoodExample[] = [
  {
    name: "api version present",
    yaml: `
---
replicated_api_version: "2.10.1"
        `,
  },
  {
    name: "big, correct yaml -- native",
    yaml: fs.readFileSync(path.join("docs", "yamls", "correct-native.yml"), "utf8"),
  },
  {
    name: "big, correct yaml -- swarm",
    yaml: fs.readFileSync(path.join("docs", "yamls", "correct-swarm.yml"), "utf8"),
  },

];

const goodWithInfo: WarningExample[] = [
  {
    name: "big, correct yaml -- kubernetes",
    yaml: fs.readFileSync(path.join("docs", "yamls", "correct-kubernetes.yml"), "utf8"),
    rule: "prop-support-bundle",
    errPath: "support",
  },
];

const bad: BadExample[] = [
  {
    name: "unknown property",
    yaml: `
---
replicated_api_version: "2.10.1"
deploy_this_great_app: plz&thx
        `,
    errPath: "deploy_this_great_app",
  },
  {
    name: "api version malformed",
    yaml: `
---
replicated_api_version: 2101
        `,
    errPath: "replicated_api_version",
  },
];

describe("integration", () => {

  for (const example of good) {

    describe(example.name, () => {
      it("should pass linting", () => {
        const result = defaultLint(example.yaml);
        expect(result).to.deep.equal([]);
      });
    });
  }

  for (const example of goodWithInfo) {

    const { name, yaml, errPath, rule: exampleRule } = example;

    describe(name, () => {
      it("should inform with info", () => {
        const result = defaultLint(yaml);
        expect(result).to.have.lengthOf(1);

        const [{ rule, type, positions }] = result;
        expect(rule).to.equal(exampleRule);
        expect(type).to.equal("info");

        if (errPath) {
          expect(positions).to.have.deep.property("0.path", errPath);
        }
      });
    });
  }

  for (const example of bad) {

    describe(example.name, () => {
      it("should fail linting", () => {
        const result = defaultLint(example.yaml);
        expect(result).to.have.deep.property("[0].rule", "prop-schema-valid");
        expect(result).to.have.deep.property("[0].type", "error");
        if (example.errPath) {
          expect(result).to.have.deep.property("[0].positions.0.path", example.errPath);
        }
      });
    });
  }
});
