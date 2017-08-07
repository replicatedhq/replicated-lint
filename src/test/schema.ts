import { describe, it } from "mocha";
import { expect } from "chai";
import { parsed as schema } from "../schemas";
import * as fs from "fs";
import * as path from "path";

import { lint } from "../lint";

interface GoodExample {
    name: string;
    yaml: string;
}

interface BadExample extends GoodExample {
    errPath?: string;
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
        name: "big, correct yaml",
        yaml: fs.readFileSync(path.join("docs", "yamls", "correct.yml"), "utf8"),
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

describe("schema validation", () => {

    for (const example of good) {

        describe(example.name, () => {
            it("should pass linting", () => {
                expect(lint(example.yaml, { schema })).to.deep.equal([]);
            });
        });
    }

    for (const example of bad) {

        describe(example.name, () => {
            it("should fail linting", () => {
                expect(lint(example.yaml, { schema })).to.have.deep.property("[0].rule", "prop-schema-valid");
                expect(lint(example.yaml, { schema })).to.have.deep.property("[0].type", "error");
                if (example.errPath) {
                    expect(lint(example.yaml, { schema })).to.have.deep.property("[0].positions.0.path", example.errPath);
                }
            });
        });
    }
});
