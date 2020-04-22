import { YAMLRule } from "../lint";

export const kubernetesServerVersionValid: YAMLRule = {
  name: "prop-kubernetes-requirements-version-valid",
  type: "error",
  message: "`kubernetes.requirements.server_version` must be a valid semver specification",
  test: { SemverRange: { path: "kubernetes.requirements.server_version", required: false } },
  examples: {
    wrong: [
      {
        description: "`server_version` is not valid semver",
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
        description: "valid version `1.5.3`",
        yaml: `
---
kubernetes:
  requirements:
    server_version: 1.5.3
      `,
      },
      {
        description: "valid version `<=1.5.3 >1.5.x`",
        yaml: `
---
kubernetes:
  requirements:
    server_version: '<=1.5.3 >1.5.x'
      `,
      },
      {
        description: "valid version `1.x`",
        yaml: `
---
kubernetes:
  requirements:
    server_version: '1.x'
      `,
      },
      {
        description: "valid version `=1.x`",
        yaml: `
---
kubernetes:
  requirements:
    server_version: '=1.x'
      `,
      },
      {
        description: "valid version `>=1.4 <1.7`",
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

export const kubernetesTotalMemoryValidation: YAMLRule = {
  name: "prop-kubernetes-total-memory-valid",
  type: "error",
  message: "`kubernetes.requirements.total_memory` must be expressed as a plain integer, a fixed-point integer, or the power-of-two equivalent (e.g. 128974848, 129e6, 129M, 123Mi)",
  test: {
    And: {
      preds: [
          { IsNotBytesCount: { path: "kubernetes.requirements.total_memory" } },
          { IsNotRAMCount: { path: "kubernetes.requirements.total_memory" } },
          { IsNotKubernetesQuantity: { path: "kubernetes.requirements.total_memory" } },
          { Exists: { path: "kubernetes.requirements.total_memory" } },
      ],
    },
  },
  examples: {
    wrong: [
      {
        description: "Invalid memory size, too many digits past the decimal point",
        yaml: `
---
kubernetes:
  requirements:
    total_memory: 0.0625TB
      `,
      },
    ],
    right: [
      {
        description: "Valid memory size, 2.0TB",
        yaml: `
---
kubernetes:
  requirements:
    total_memory: 2.0TB
      `,
      },
      {
        description: "Valid memory size, 128KB",
        yaml: `
---
kubernetes:
  requirements:
    total_memory: 128KB
      `,
      },
      {
        description: "Valid binary memory size, 128KiB",
        yaml: `
---
kubernetes:
  requirements:
    total_memory: 128KiB
      `,
      },
      {
        description: "Valid kubernetes memory size, 128",
        yaml: `
---
kubernetes:
  requirements:
    total_memory: "128"
      `,
      },
      {
        description: "Valid kubernetes memory size, 129e6",
        yaml: `
---
kubernetes:
  requirements:
    total_memory: "129e6"
      `,
      },
    ],
  },
};

export const kubernetesPersistentStorageValidation: YAMLRule = {
  name: "prop-kubernetes-persistent-storage-valid",
  type: "error",
  message: "`kubernetes.persistent_volume_claims.storage` must be expressed as a plain integer, a fixed-point integer, or the power-of-two equivalent (e.g. 128974848, 129e6, 129M, 123Mi)",
  test: {
    AnyOf: {
      path: "kubernetes.persistent_volume_claims",
      pred: {
        And: {
          preds: [
              { IsNotBytesCount: { path: "storage" } },
              { IsNotKubernetesQuantity: { path: "storage" } },
              { Exists: { path: "storage" } },
          ],
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "Invalid storage size, too many digits past the decimal point",
        yaml: `
---
kubernetes:
  persistent_volume_claims:
  - storage: 0.0625TB
      `,
      },
    ],
    right: [
      {
        description: "Valid storage size, 2.0TB",
        yaml: `
---
kubernetes:
  persistent_volume_claims:
  - storage: 2.0TB
      `,
      },
      {
        description: "Valid storage size, 128KB",
        yaml: `
---
kubernetes:
  persistent_volume_claims:
  - storage: 128KB
      `,
      },
      {
        description: "Valid kubernetes storage size, 128",
        yaml: `
---
kubernetes:
  persistent_volume_claims:
  - storage: "128"
      `,
      },
      {
        description: "Valid kubernetes storage size, 129e6",
        yaml: `
---
kubernetes:
  persistent_volume_claims:
  - storage: "129e6"
      `,
      },
      {
        description: "No storage size given",
        yaml: `
---
kubernetes:
  persistent_volume_claims: []
      `,
      },
    ],
  },
};

export const kubernetesSharedFSEnabledValid: YAMLRule = {
  name: "prop-kubernetes-shared-fs-enabled-valid",
  type: "error",
  message: "`kubernetes.shared_fs.enabled` must be a template or a boolean",
  test: {
    And: {
      preds: [
        { NotBoolString: { path: "kubernetes.shared_fs.enabled" } },
        { Exists: { path: "kubernetes.shared_fs.enabled" } },
      ],
    },
  },
  examples: {
    wrong: [],
    right: [
      {
        description: "`kubernetes.shared_fs.enabled` == true",
        yaml: `
---
kubernetes:
  shared_fs:
    enabled: true
      `,
      },
      {
        description: "`kubernetes.shared_fs.enabled` == false",
        yaml: `
---
kubernetes:
  shared_fs:
    enabled: false
      `,
      },
      {
        description: "`kubernetes.shared_fs.enabled` == 0 ",
        yaml: `
---
kubernetes:
  shared_fs:
    enabled: "0"
      `,
      },
      {
        description: "`kubernetes.shared_fs.enabled` == 1 ",
        yaml: `
---
kubernetes:
  shared_fs:
    enabled: "1"
      `,
      },
      {
        description: "`kubernetes.shared_fs.enabled` template",
        yaml: `
---
kubernetes:
  shared_fs:
    enabled: '{{repl ConfigOption "use_shared_fs"}}'
      `,
      },
    ],
  },
};
export const all: YAMLRule[] = [
  kubernetesServerVersionValid,
  kubernetesTotalMemoryValidation,
  kubernetesPersistentStorageValidation,
  kubernetesSharedFSEnabledValid,
];
