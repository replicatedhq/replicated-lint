import { YAMLRule } from "../lint";

export const swarmSecretNameValue: YAMLRule = {
  name: "prop-swarm-secret-name-value",
  type: "error",
  message: "Swarm secrets require both a `name` and a `value` to function.",
  test: {
    AnyOf: {
      path: "swarm.secrets",
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
  examples: {
    wrong: [
      {
        description: "A swarm secret must contain a `name` and a `value`, and this only has a `name`",
        yaml: `
---
replicated_api_version: "2.7.0"
swarm:
  secrets:
  - name: foo
        `,
      },
      {
        description: "A swarm secret must contain a `name` and a `value`, and this `name` is empty",
        yaml: `
---
replicated_api_version: "2.7.0"
swarm:
  secrets:
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
  secrets:
  - name:
    value: bar
    labels:
      alpha: beta
        `,
      },
    ],
    right: [
      {
        description: "This swarm secret contains a `name` and a `value`",
        yaml: `
---
replicated_api_version: "2.7.0"
swarm:
  secrets:
  - name: foo
    value: bar
        `,
      },
    ],
  },
};

export const swarmSecretLabelKeys: YAMLRule = {
  name: "prop-swarm-secret-label-key",
  type: "error",
  message: "Labels within a swarm secret must have keys.",
  test: {
    AnyOf: {
      path: "swarm.secrets",
      pred: {
        Exists: {path: "labels."},
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
  secrets:
  - name: foo
    value: bar
    labels:
      alpha: beta
      "": delta
        `,
      },
    ],
    right: [
      {
        description: "These swarm secret labels are not the empty string",
        yaml: `
---
replicated_api_version: "2.7.0"
swarm:
  secrets:
  - name: foo
    value: bar
    labels:
      alpha: beta
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
