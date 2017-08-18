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

export const all: YAMLRule[] = [
  componentClusterCount,
  componentClusterStrategy,
];
