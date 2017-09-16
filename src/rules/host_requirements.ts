import { YAMLRule } from "../lint";

export const dockerVersionValid: YAMLRule = {
  name: "prop-hostreq-docker-version-valid",
  type: "error",
  message: "`host_requirements.docker_version` must be a valid docker version specification",
  test: {
    And: {
      preds: [
        { Truthy: { path: "host_requirements.docker_version" } },
        {
          NotMatch: {
            path: "host_requirements.docker_version",
            pattern: "^1\.([0-9]|(1[0-3]))\.[0-9]+$",
          },
        },
        {
          NotMatch: {
            path: "host_requirements.docker_version",
            pattern: "^[0-9]{2}\.((0[1-9])|(1[0-2]))\.[0-9]+(-(ce|ee))?$",
          },
        },

      ],
    },
  },
  examples: {
    wrong: [
      {
        description: "Invalid docker version the.good.one, not semver",
        yaml: `
---
host_requirements:
  docker_version: the.good.one
      `,
      },
      {
        description: "Invalid docker version `0.1.1`",
        yaml: `
---
host_requirements:
  docker_version: 0.1.1
      `,
      },
      {
        description: "Invalid docker version `1.09.1`, no leading zeros",
        yaml: `
---
host_requirements:
  docker_version: 1.09.1
      `,
      },
      {
        description: "Invalid docker version `1.14.1`, never released",
        yaml: `
---
host_requirements:
  docker_version: 1.14.1
      `,
      },
      {
        description: "Invalid docker version `17.13.1-ce`, 13 is not a valid month",
        yaml: `
---
host_requirements:
  docker_version: 17.13.1-ce
      `,
      },
    ],
    right: [
      {
        description: "Valid docker version",
        yaml: `
---
host_requirements:
  docker_version: 17.09.1-ce
      `,
      },
      {
        description: "Valid docker version",
        yaml: `
---
host_requirements:
  docker_version: 17.09.1
      `,
      },
      {
        description: "Valid docker version",
        yaml: `
---
host_requirements:
  docker_version: 1.12.1
      `,
      },
    ],
  },
};

export const replicatedVersionSemverRange: YAMLRule = {
  name: "prop-hostreq-replicated-version-semver-valid",
  type: "error",
  message: "`host_requirements.replicated_version` must be a semver range specification",
  test: {
    SemverRange: {
      path: "host_requirements.replicated_version",
      required: false,
    },
  },
  examples: {
    wrong: [
      {
        description: "Invalid replicated version `the.good.one`, not semver",
        yaml: `
---
host_requirements:
  replicated_version: the.good.one
      `,
      },
      {
        description: "Invalid replicated version `alpha-0.1.1`",
        yaml: `
---
host_requirements:
  replicated_version: alpha-0.1.1
      `,
      },
    ],
    right: [
      {
        description: "valid version `2.x`",
        yaml: `
---
host_requirements:
    replicated_version: 2.x
      `,
      },
      {
        description: "valid version `2.5.3`",
        yaml: `
---
host_requirements:
    replicated_version: 2.5.3
      `,
      },
      {
        description: "valid version `<=2.5.3 >2.5.x`",
        yaml: `
---
host_requirements:
    replicated_version: '<=2.5.3 >2.5.x'
      `,
      },
      {
        description: "valid version `1.x`",
        yaml: `
---
host_requirements:
    replicated_version: '1.x'
      `,
      },
      {
        description: "valid version `=1.x`",
        yaml: `
---
host_requirements:
    replicated_version: '=1.x'
      `,
      },
      {
        description: "valid version `>=1.4 <1.7`",
        yaml: `
---
host_requirements:
    replicated_version: '>=1.4 <1.7'
      `,
      },
    ],
  },
};

export const all: YAMLRule[] = [
  dockerVersionValid,
  replicatedVersionSemverRange,
];
