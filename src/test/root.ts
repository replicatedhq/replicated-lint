import { describe, it } from "mocha";
import { expect } from "chai";
import { lint } from "../lint";
import { apiVersion } from "../rules/root";

describe("root", () => {
  it("errors if replicated_api_version is empty", () => {

    let inYaml = `
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
        rule: "ReplicatedAPIVersion",
        type: "error",
        positions: [],
      },
    ]);
  });
});
