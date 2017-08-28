import { YAMLRule } from "../lint";

export const apiVersion: YAMLRule = {
  name: "prop-replicated-api-version-present",
  type: "error",
  message: "`replicated_api_version` must be present and be a valid Semver specification",
  test: { Semver: { path: "replicated_api_version", required: true } },
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

export const imageContentTrustValid: YAMLRule = {
  name: "prop-image-contenttrust-fingerprint-valid",
  type: "error",
  message: "An image's content_trust.public_key_fingerprint must be a valid RFC4716 fingerprint, e.g. `cb:69:19:cd:76:1f:17:54:92:a4:fc:a9:6f:a5:57:72`",
  test: {
    AnyOf: {
      path: "images",
      pred: {
        And: {
          preds: [
            { Truthy: { path: "content_trust.public_key_fingerprint" } },
            {
              NotMatch: {
                path: "content_trust.public_key_fingerprint",
                pattern: "[1-9a-f]{2}(:[1-9a-f]{2}){15}",
              },
            },
          ],
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "",
        yaml: `
---
images:
  - source: public
    name: redis
    tag: 3.2.1
    content_trust:
      public_key_fingerprint: flksdjflkds
    `,
      },
    ],
    right: [
      {
        description: "valid fingerprint",
        yaml: `
---
images:
  - source: public
    name: redis
    tag: 3.2.1
    content_trust:
      public_key_fingerprint: cb:69:19:cd:76:1f:17:54:92:a4:fc:a9:6f:a5:57:72
    `,
      },
    ],
  },
};

export const propertiesShellAlias: YAMLRule = {
  name: "prop-properties-shellalias-valid",
  type: "error",
  message: "`properties.shell_alias` must be a valid shell alias",
  test: {
    And: {
      preds: [
        { Truthy: { path: "properties.shell_alias" } },
        { NotMatch: { path: "properties.shell_alias", pattern: "^[a-zA-Z0-9_\\-]*$" } },
      ],
    },
  },
  examples: {
    wrong: [
      {
        description: "alias contains invalid character `&`",
        yaml: `
---
properties:
  shell_alias: exec&echo
      `,
      },
      {
        description: "admin command contains invalid character `*`",
        yaml: `
---
properties:
  shell_alias: exec**echo
      `,
      },
    ],
    right: [
      {
        description: "valid alias",
        yaml: `
---
properties:
  shell_alias: do_a-replicated_thing---plz
      `,
      },
    ],
  },
};

export const propertiesLogoURLValid: YAMLRule = {
  name: "prop-properties-logourl-valid",
  type: "error",
  message: "Logo URL must be a valid http or https URL",
  test: {
    And: {
      preds: [
        { Truthy: { path: "properties.logo_url" } },
        { InvalidURL: { path: "properties.logo_url" } },
      ],
    },
  },
  examples: {
    wrong: [
      {
        description: "protocol not in [http, https]",
        yaml: `
---
properties:
  logo_url: yo://mylogo.com/logo.png
      `,
      },
      {
        description: "invalid url",
        yaml: `
---
properties:
  logo_url: kfbr392
      `,
      },
      {
        description: "invalid url",
        yaml: `
---
properties:
  logo_url: http://i.goo gr.com/rnZ3Ftf.png
      `,
      },
    ],
    right: [
      {
        description: "valid url",
        yaml: `
---
properties:
  logo_url: http://x.y+a.com:3000/b/c
      `,
      },
    ],
  },
};

export const all: YAMLRule[] = [
  apiVersion,
  imageContentTrustValid,
  propertiesShellAlias,
  propertiesLogoURLValid,
];
