import { describe, it } from "mocha";
import { expect } from "chai";
import { lint } from "../lint";
import { apiVersion } from "../rules/root";

describe("replicated-api-version", () => {
  it("errors if replicated_api_version is empty", () => {

    const inYaml = `
# Retraced

---
# kind: replicated
# replicated_api_version: 2.8.0
name: Retraced
`;

    expect(lint(inYaml, [apiVersion],
    )).to.deep.equal([
      {
        message: "replicated_api_version must be present",
        received: undefined,
        rule: "replicated-api-version-present",
        type: "error",
        positions: [],
      },
    ]);
  });
  it("works if replicated_api_version is present", () => {

    const inYaml = `
# Retraced

---
# kind: replicated
replicated_api_version: 2.8.0
name: Retraced
`;

    expect(lint(inYaml, [apiVersion])).to.be.empty;
  });
});
