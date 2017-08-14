import { YAMLRule } from "../lint";

export const kubernetesServerVersionValid: YAMLRule = {
  name: "prop-kubernetes-requirements-version-valid",
  type: "error",
  message: "kubernetes.requirements.server_version must be a valid semver specification",
  test: { SemverRange: { path: "kubernetes.requirements.server_version", required: false } },
  examples: {
    wrong: [
      {
        description: "server_version is not valid semver",
        yaml: `
---
kubernetes:
  requirements:
    server_version: 17.01.1-ce
      `,
      },
    ],
    right: [
      {
        description: "valid version '1.5.3",
        yaml: `
---
kubernetes:
  requirements:
    server_version: 1.5.3
      `,
      },
      {
        description: "valid version '<=1.5.3 >1.5.x'",
        yaml: `
---
kubernetes:
  requirements:
    server_version: '<=1.5.3 >1.5.x'
      `,
      },
      {
        description: "valid version '1.x'",
        yaml: `
---
kubernetes:
  requirements:
    server_version: '1.x'
      `,
      },
      {
        description: "valid version '=1.x'",
        yaml: `
---
kubernetes:
  requirements:
    server_version: '=1.x'
      `,
      },
      {
        description: "valid version '>=1.4 <1.7'",
        yaml: `
---
kubernetes:
  requirements:
    server_version: '>=1.4 <1.7'
      `,
      },
    ],
  },
};

export const all: YAMLRule[] = [
  kubernetesServerVersionValid,
];
