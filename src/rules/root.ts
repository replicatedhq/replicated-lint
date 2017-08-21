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

export const all: YAMLRule[] = [
  apiVersion,
  imageContentTrustValid,
];
