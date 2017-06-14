import { YAMLRule } from "../lint";

export const notClusteredIfNamedContainer: YAMLRule = {
  name: "prop-component-container-unnamed-when-cluster-true",
  type: "warn",
  message: "If you have clustering turned on, setting `container.name` will prevent multiple instances of the container from being scheduled on a single node",
  test: {
    type: "AnyOf",
    path: "components",
    pred: {
      type: "AnyOf",
      path: "containers",
      pred: {
        type: "And",
        preds: [
          { type: "GT", path: "cluster_instance_count", value: 1 },
          { type: "Exists", path: "name" },
          { type: "Truthy", path: "cluster" },
        ],
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "container in component with `cluster_instance_count: 2` should not have a `name` specified",
        yaml: `
---
components:
- name: DB
  cluster: true
  cluster_host_count:
    min: 1
    max: 4
  containers:
  - source: public
    cluster: true
    cluster_instance_count: 2
    image_name: redis
    name: database
      `,
      },
    ],
    right: [
      {
        description: "container in component with `cluster_instance_count: 2` does not have a `name` specified",
        yaml: `
---
components:
- name: DB
  tags:
  - db
  cluster: true
  cluster_host_count:
    min: 1
    max: 4
  containers:
  - source: public
    cluster_instance_count: 2
    image_name: redis
    version: latest
      `,
      },
    ],
  },
};

export const all: YAMLRule[] = [
  notClusteredIfNamedContainer,
];
