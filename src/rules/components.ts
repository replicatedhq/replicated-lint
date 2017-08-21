import { YAMLRule } from "../lint";

export const componentClusterCount: YAMLRule = {
  name: "prop-component-cluster-count",
  type: "info",
  message: "If cluster_host_count.min and cluster_host_count.max are both set to 1, then it be impossible to run multiple instances of this container anywhere in the cluster.",
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
      description: "cluster_host_count.min and cluster_host_count.max are both set to 1",
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
        description: "cluster_host_count.min and cluster_host_count.max is a range",
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
        description: "cluster_host_count.min and cluster_host_count.max are unset",
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
        description: "strategy is set to `autoscale`, a supported option",
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
        description: "strategy is unset",
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
        description: "host path is not absolue",
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
  message: "`component.cluster` be a template or a boolean",
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
        description: "component.cluster is not a boolean or template",
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
        description: "component.cluster absent",
        yaml: `
---
components:
- name: DB
      `,
      },
      {
        description: "component.cluster boolean",
        yaml: `
---
components:
- name: DB
  cluster: true
      `,
      },
      {
        description: "component.cluster string boolean",
        yaml: `
---
components:
- name: DB
  cluster: "false"
      `,
      },
      {
        description: "component.cluster == 0 ",
        yaml: `
---
components:
- name: DB
  cluster: "0"
      `,
      },
      {
        description: "component.cluster == 1 ",
        yaml: `
---
components:
- name: DB
  cluster: "1"
      `,
      },
      {
        description: "component.cluster template",
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

export const all: YAMLRule[] = [
  componentClusterCount,
  componentClusterStrategy,
  componentHostVolumePathAbsolute,
  componentClusterBoolstring,
];
