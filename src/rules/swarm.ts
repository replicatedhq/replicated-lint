import { YAMLRule } from "../lint";

export const swarmSecretNameValue: YAMLRule = {
  name: "prop-swarm-sectet-name-value",
  type: "error",
  message: "Swarm secrets require both a `name` and a `value` to function.",
  test: {
    AnyOf: {
      path: "swarm",
      pred: {
        AnyOf: {
          path: "secrets",
          pred: {
            Or: {
              preds: [
                { IsEmpty: { path: "name"} },
                { IsEmpty: { path: "value"} },
                { Eq: { path: "name", value: ""} },
                { Eq: { path: "value", value: ""} },
              ],
            },
          },
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "A swarm secret must contain a `name` and a `value`",
        yaml: `
---
replicated_api_version: "2.7.0"
swarm:
- secrets:
  - name: foo
        `,
      },
      {
        description: "A swarm secret must contain a `name` and a `value`",
        yaml: `
---
replicated_api_version: "2.7.0"
swarm:
- secrets:
  - name: 
    value: bar 
        `,
      },
      {
        description: "A swarm secret must contain a `name` and a `value` even when labels exist",
        yaml: `
---
replicated_api_version: "2.7.0"
swarm:
- secrets:
  - name:
    value: bar
    labels:
      alpha: beta
        `,
      },
    ],
    right: [
      {
        description: "A swarm secret must contain a `name` and a `value`",
        yaml: `
---
replicated_api_version: "2.7.0"
swarm:
- secrets:
  - name: foo
    value: bar
        `,
      },
    ],
  },
};

export const swarmSecretLabelKeys: YAMLRule = {
  name: "prop-swarm-sectet-name-value",
  type: "error",
  message: "Labels within a swarm secret must have keys.",
  test: {
    AnyOf: {
      path: "swarm",
      pred: {
        AnyOf: {
          path: "secrets",
          pred: {
            AnyOf: {
              path: "labels",
              pred: {
                Exists: {path: ""},
              },
            },
          },
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "Swarm secret labels must not be the empty string",
        yaml: `
---
replicated_api_version: "2.7.0"
swarm:
- secrets:
  - name: foo
    value: bar
    labels:
    - alpha: beta
      "": wrong
        `,
      },
    ],
    right: [
      {
        description: "Swarm secret labels must not be the empty string",
        yaml: `
---
replicated_api_version: "2.7.0"
swarm:
- secrets:
  - name: foo
    value: bar
    labels:
    - alpha: beta
      gamma: delta
        `,
      },
    ],
  },
};

export const all: YAMLRule[] = [
  swarmSecretNameValue,
  swarmSecretLabelKeys,
];
