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

export const hostSystemRamSpecsValid: YAMLRule = {
  name: "prop-hostreq-system-ram-specs-valid",
  type: "error",
  message: "`host_requirements.memory` must be a positive decimal with a unit of measurement like M, MB, G, or GB",
  test: {
    And: {
      preds: [
          { IsNotBytesCount: { path: "host_requirements.memory" } },
          { Exists: { path: "host_requirements.memory" } },
      ],
    },
  },
  examples: {
    wrong: [
      {
        description: "Invalid memory size, not a properly formatted size",
        yaml: `
---
host_requirements:
  memory: "128"
      `,
      },
      {
        description: "Invalid memory size, too many digits past the decimal point",
        yaml: `
---
host_requirements:
  memory: 0.0625TB
      `,
      },
    ],
    right: [
      {
        description: "Valid memory size, 2.0TB",
        yaml: `
---
host_requirements:
  memory: 2.0TB
      `,
      },
      {
        description: "Valid memory size, 128KB",
        yaml: `
---
host_requirements:
  memory: 128KB
      `,
      },
    ],
  },
};

export const hostSystemStorageSpecsValid: YAMLRule = {
  name: "prop-hostreq-system-storage-specs-valid",
  type: "error",
  message: "`host_requirements.disk_space` be a positive decimal with a unit of measurement like M, MB, G, or GB",
  test: {
    And: {
      preds: [
          { IsNotBytesCount: { path: "host_requirements.disk_space" } },
          { Exists: { path: "host_requirements.disk_space" } },
      ],
    },
  },
  examples: {
    wrong: [
      {
        description: "Invalid disk size, not a properly formatted size",
        yaml: `
---
host_requirements:
  disk_space: "128"
      `,
      },
      {
        description: "Invalid disk size, too many digits past the decimal point",
        yaml: `
---
host_requirements:
  disk_space: 0.0625EB
      `,
      },
    ],
    right: [
      {
        description: "Valid disk size, 20.0TB",
        yaml: `
---
host_requirements:
  disk_space: 20.0TB
      `,
      },
      {
        description: "Valid disk size, 128GB",
        yaml: `
---
host_requirements:
  disk_space: 128GB
      `,
      },
    ],
  },
};

export const all: YAMLRule[] = [
  dockerVersionValid,
  replicatedVersionSemverRange,
  hostSystemRamSpecsValid,
  hostSystemStorageSpecsValid,
];
