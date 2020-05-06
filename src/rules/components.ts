import { YAMLRule } from "../lint";

export const componentClusterCount: YAMLRule = {
  name: "prop-component-cluster-count",
  type: "info",
  message: "If `cluster_host_count.min` and `cluster_host_count.max` are both set to 1, then it will be impossible to run multiple instances of this container anywhere in the cluster.",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        And: {
          preds: [
            { Truthy: { path: "cluster" } },
            { Exists: { path: "cluster_host_count" } },
            { Eq: { path: "cluster_host_count.min", value: 1 } },
            { Eq: { path: "cluster_host_count.max", value: 1 } },
          ],
        },
      },
    },
  },
  examples: {
    wrong: [{
      description: "`cluster_host_count.min` and `cluster_host_count.max` are both set to 1",
      yaml: `
---
components:
- name: DB
  cluster: true
  tags:
  - db
  cluster_host_count:
    min: 1
    max: 1
  containers:
  - source: public
    image_name: redis
    version: latest
      `,
    }],
    right: [
      {
        description: "`cluster_host_count.min` and `cluster_host_count.max` is a range",
        yaml: `
---
components:
- name: DB
  cluster: true
  tags:
  - db
  cluster_host_count:
    min: 1
    max: 3
  containers:
  - source: public
    image_name: redis
    version: latest
      `,
      },
      {
        description: "`cluster_host_count.min` and `cluster_host_count.max` are unset",
        yaml: `
---
components:
- name: DB
  cluster: true
  tags:
  - db
  containers:
  - source: public
    image_name: redis
    version: latest
      `,
      },
    ],
  },
};

export const componentClusterStrategy: YAMLRule = {
  name: "prop-component-cluster-strategy",
  type: "error",
  message: "A component's cluster `strategy` must be either `random` or `autoscale`",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        And: {
          preds: [
            { Truthy: { path: "cluster" } },
            { Truthy: { path: "cluster_host_count" } },
            { Truthy: { path: "cluster_host_count.strategy" } },
            { Neq: { path: "cluster_host_count.strategy", value: "autoscale" } },
            { Neq: { path: "cluster_host_count.strategy", value: "random" } },
          ],
        },
      },
    },
  },
  examples: {
    wrong: [{
      description: "strategy is set to `all-on-one-host`, which is not a supported clustering strategy",
      yaml: `
---
components:
- name: DB
  cluster: true
  tags:
  - db
  cluster_host_count:
    strategy: all-on-one-host
  containers:
  - source: public
    image_name: redis
    version: latest
      `,
    }],
    right: [
      {
        description: "`strategy` is set to `autoscale`, a supported option",
        yaml: `
---
components:
- name: DB
  cluster: true
  tags:
  - db
  cluster_host_count:
    strategy: autoscale
  containers:
  - source: public
    image_name: redis
    version: latest
      `,
      },
      {
        description: "`strategy` is unset",
        yaml: `
---
components:
- name: DB
  cluster: true
  tags:
  - db
  cluster_host_count: {}
  containers:
  - source: public
    image_name: redis
    version: latest
      `,
      },
    ],
  },
};

export const componentHostVolumePathAbsolute: YAMLRule = {
  name: "prop-component-volume-path-absolute",
  type: "error",
  message: "Component volume's `host_path` must be absolute",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        AnyOf: {
          path: "host_volumes",
          pred: {
            And: {
              preds: [
                { NotMatch: { path: "host_path", pattern: "^/" } },
                { NotMatch: { path: "host_path", pattern: "^{{repl" } },
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
        description: "host path is not absolute",
        yaml: `
---
components:
- name: DB
  host_volumes:
    - host_path: ubuntu/workspace
  containers:
  - source: public
    image_name: mongo
      `,
      },
    ],
    right: [
      {
        description: "host path is absolute",
        yaml: `
---
components:
- name: DB
  host_volumes:
    - host_path: /home/ubuntu/workspace
  containers:
  - source: public
    image_name: mongo
      `,
      },
      {
        description: "host path is a templated field",
        yaml: `
---
components:
- name: DB
  host_volumes:
    - host_path: '{{repl ConfigOption "custom_volume_path" }}'
  containers:
  - source: public
    image_name: mongo
      `,
      },
    ],
  },
};

export const componentClusterBoolstring: YAMLRule = {
  name: "prop-component-cluster-boolstring",
  type: "error",
  message: "`component.cluster` must be a template or a boolean",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        And: {
          preds: [
            { Truthy: { path: "cluster" } },
            { NotBoolString: { path: "cluster" } },
          ],
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "`component.cluster` is not a boolean or template",
        yaml: `
---
components:
- name: DB
  cluster: "yes please"
      `,
      },
    ],
    right: [
      {
        description: "`component.cluster` absent",
        yaml: `
---
components:
- name: DB
      `,
      },
      {
        description: "`component.cluster` boolean",
        yaml: `
---
components:
- name: DB
  cluster: true
      `,
      },
      {
        description: "`component.cluster` string boolean",
        yaml: `
---
components:
- name: DB
  cluster: "false"
      `,
      },
      {
        description: "`component.cluster` == 0 ",
        yaml: `
---
components:
- name: DB
  cluster: "0"
      `,
      },
      {
        description: "`component.cluster` == 1 ",
        yaml: `
---
components:
- name: DB
  cluster: "1"
      `,
      },
      {
        description: "`component.cluster` template",
        yaml: `
---
components:
- name: DB
  cluster: '{{repl ConfigOption "use_cluster"}}'
      `,
      },
    ],
  },
};

export const containerClusterHostCountMinUint: YAMLRule = {
  name: "prop-component-container-host-count-min-uint",
  type: "error",
  message: "Container's cluster_host_count property `min` must be an unsigned integer or template",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        And: {
          preds: [
            {NotUintString: {path: "cluster_host_count.min"}},
            {Exists: {path: "cluster_host_count.min"}},
          ],
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "cluster_host_count.min must be an unsigned integer, and this parses as a negative integer",
        yaml: `
---
components:
- cluster_host_count:
    min: "-2"
      `,
      },
    ],
    right: [
      {
        description: "cluster_host_count.min is an unsigned integer",
        yaml: `
---
components:
- cluster_host_count:
    min: 3
      `,
      },
      {
        description: "cluster_host_count.min is a template",
        yaml: `
---
components:
- cluster_host_count:
    min: '{{repl if LicenseFieldValue "cluster"}}2{{repl else}}0{{repl end}}'
      `,
      },
    ],
  },
};

export const containerClusterHostCountMaxUint: YAMLRule = {
  name: "prop-component-container-host-count-max-uint",
  type: "error",
  message: "Container's cluster_host_count property `max` must be an unsigned integer or template",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        And: {
          preds: [
            {NotUintString: {path: "cluster_host_count.max"}},
            {Exists: {path: "cluster_host_count.max"}},
          ],
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "cluster_host_count.max must be an unsigned integer, and this is a negative integer",
        yaml: `
---
components:
- cluster_host_count:
    max: -10
      `,
      },
    ],
    right: [
      {
        description: "cluster_host_count.max is an unsigned integer",
        yaml: `
---
components:
- cluster_host_count:
    max: 10
      `,
      },
      {
        description: "cluster_host_count.max is a template",
        yaml: `
---
components:
- cluster_host_count:
    max: '{{repl if LicenseFieldValue "cluster"}}3{{repl else}}1{{repl end}}'
      `,
      },
    ],
  },
};

export const containerClusterHostCountHealthyUint: YAMLRule = {
  name: "prop-component-container-host-count-healthy-uint",
  type: "error",
  message: "Container's cluster_host_count property `threshold_healthy` must be an unsigned integer or template",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        And: {
          preds: [
            {NotUintString: {path: "cluster_host_count.threshold_healthy"}},
            {Exists: {path: "cluster_host_count.threshold_healthy"}},
          ],
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "cluster_host_count.threshold_healthy must be an unsigned integer, and this is a string",
        yaml: `
---
components:
- cluster_host_count:
    threshold_healthy: "all"
      `,
      },
    ],
    right: [
      {
        description: "cluster_host_count.threshold_healthy is an unsigned integer",
        yaml: `
---
components:
- cluster_host_count:
    threshold_healthy: 5
      `,
      },
      {
        description: "cluster_host_count.threshold_healthy is a template",
        yaml: `
---
components:
- cluster_host_count:
    threshold_healthy: '{{repl if LicenseFieldValue "cluster"}}3{{repl else}}1{{repl end}}'
      `,
      },
    ],
  },
};

export const containerClusterHostCountDegradedUint: YAMLRule = {
  name: "prop-component-container-host-count-degraded-uint",
  type: "error",
  message: "Container's cluster_host_count property `threshold_degraded` must be an unsigned integer",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        And: {
          preds: [
            {NotUintString: {path: "cluster_host_count.threshold_degraded"}},
            {Exists: {path: "cluster_host_count.threshold_degraded"}},
          ],
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "cluster_host_count.threshold_degraded must be an unsigned integer, and this parses as a float",
        yaml: `
---
components:
- cluster_host_count:
    threshold_degraded: "2.5"
      `,
      },
    ],
    right: [
      {
        description: "cluster_host_count.threshold_degraded is an unsigned integer",
        yaml: `
---
components:
- cluster_host_count:
    threshold_degraded: 2
      `,
      },
      {
        description: "cluster_host_count.threshold_degraded is a template",
        yaml: `
---
components:
- cluster_host_count:
    threshold_degraded: '{{repl if LicenseFieldValue "cluster"}}3{{repl else}}1{{repl end}}'
      `,
      },
    ],
  },
};

export const all: YAMLRule[] = [
  componentClusterCount,
  componentClusterStrategy,
  componentHostVolumePathAbsolute,
  componentClusterBoolstring,
  containerClusterHostCountMinUint,
  containerClusterHostCountMaxUint,
  containerClusterHostCountHealthyUint,
  containerClusterHostCountDegradedUint,
];
