import {Test, YAMLRule} from "../lint";

// These "Rules" are special -- they get detected before any regular rules are evaluated,
// so they just get this placeholder test.
const placeholderAlwaysFalse: Test = {Truthy: {path: "__empty"}};

export const yamlValid: YAMLRule = {
  name: "mesg-yaml-valid",
  test: placeholderAlwaysFalse,
  type: "error",
  message: "Document must be valid YAML. This could occur for many reasons, consult individual error details for more info.",
  links: [
    "http://yaml.org/spec/",
    "http://docs.ansible.com/ansible/latest/YAMLSyntax.html",
  ],
  examples: {
    wrong: [
      {
        description: "Document must have valid syntax",
        yaml: `
---
}}{{}}{{
          `,
      },
    ],
    right: [],
  },
};
export const yamlNotEmpty: YAMLRule = {
  name: "mesg-yaml-not-empty",
  test: placeholderAlwaysFalse,
  type: "error",
  message: "Document must not be empty",
  examples: {
    wrong: [
      {
        description: "Document may not be empty",
        yaml: `
---
          `,
      },
    ],
    right: [],
  },
};

export const schemaValid: YAMLRule = {
  name: "prop-schema-valid",
  test: placeholderAlwaysFalse,
  type: "error",
  message: "Document must conform to the Replicated YAML document schema",
  links: ["https://help.replicated.com/api/yaml#Schema"],
  examples: {
    wrong: [
      {
        description: "Property `deploy_this_great_app` is not present in the schema",
        yaml: `
---
deploy_this_great_app: plz&thx
          `,
      },
      {
        description: "Property `replicated_api_version` is not of correct type, should be `string`, but `2.11` is parsed as type `float`",
        yaml: `
---
replicated_api_version: 2.11
          `,
      },
      {
        description: "`2` is not a valid value for `is_ephemeral`",
        yaml: `
---
components:
- containers:
- volumes:
  - is_ephemeral: 2
    `,
      },
      {
        description: "`1` is not a valid value for `is_ephemeral`, though `\"1\"` is",
        yaml: `
---
components:
- containers:
- volumes:
  - is_ephemeral: 1
    `,
      },
      {
        description: "`2` is not a valid value for `is_excluded_from_backup`",
        yaml: `
---
components:
- containers:
- volumes:
  - is_excluded_from_backup: 2
    `,
      },
      {
        description: "`1` is not a valid value for `is_excluded_from_backup`, though `\"1\"` is",
        yaml: `
---
components:
- containers:
- volumes:
  - is_excluded_from_backup: 1
    `,
      },
      {
        description: "`statsd.port` is not an integer",
        yaml: `
---
statsd:
port: foo
  `,
      },
      {
        description: "`graphite.port` is not an integer",
        yaml: `
---
graphite:
port: foo
  `,
      },
      {
        description: "cluster_host_count.min must be an unsigned integer, and this is a boolean",
        yaml: `
---
components:
- cluster_host_count:
  min: false
    `,
      },
    ],
    right: [
      {
        description: "container.version can be a string or a number",
        yaml: `
---
components:
- containers:
  - image_name: kfbr
    version: 392
  - image_name: redis
    version: latest
    `,
      },

    ],
  },
};

export const all: YAMLRule[] = [
  yamlValid,
  yamlNotEmpty,
  schemaValid,
];
