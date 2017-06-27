import { YAMLRule } from "../lint";

export const apiVersion: YAMLRule = {
  name: "prop-replicated-api-version-present",
  type: "error",
  message: "`replicated_api_version` must be present and be a valid Semver specification",
  test: { type: "Semver", path: "replicated_api_version", required: "true" },
  examples: {
    wrong: [
      {
        description: "`replicated_api_version` is missing",
        yaml: `
---
{}
    `,
      },
      {
        description: "`replicated_api_version` is not valid semver",
        yaml: `
---
replicated_api_version: kfbr392
    `,
      },
    ],
    right: [{
      description: "`replicated_api_version` is valid semver",
      yaml: `
---
replicated_api_version: 2.9.0
      `,
    }],
  },
};

export const all: YAMLRule[] = [
  apiVersion,
];
