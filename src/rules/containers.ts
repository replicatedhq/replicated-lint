import { YAMLRule } from "../lint";

export const notClusteredIfNamedContainer: YAMLRule = {
  name: "prop-component-container-unnamed-when-cluster-true",
  type: "warn",
  message: "With clustering turned on, setting `container.name` will prevent multiple instances of the container from being scheduled on a single node",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        AnyOf: {
          path: "containers",
          pred: {
            And: {
              preds: [
                { GT: { path: "cluster_instance_count", value: 1 } },
                { Exists: { path: "name" } },
                { Truthy: { path: "cluster" } },
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

export const eventSubscriptionContainerExists: YAMLRule = {
  name: "prop-component-container-event-subscription-container-exists",
  type: "error",
  message: "Container event subscriptions must reference an existing component/conatiner",
  test: { EventSubscriptionContainerMissing: {} },
  examples: {
    wrong: [
      {
        description: "container 'redis' has a publish_event that references missing container `Pipeline/logstash`",
        yaml: `
---
components:
- name: DB
  containers:
  - source: public
    image_name: mongo
  - source: public
    image_name: redis
    publish_events:
      - name: event
        subscriptions:
        - component: Pipeline
          container: logstash
          action: start
      `,
      },
      {
        description: "container 'redis' has a publish_event that references missing container `Pipeline/logstash`",
        yaml: `
---
components:
- name: DB
  containers:
  - source: public
    image_name: mongo
  - source: public
    image_name: logstash
  - source: public
    image_name: redis
    publish_events:
      - name: event
        subscriptions:
        - component: Pipeline
          container: logstash
          action: start
      `,
      },
    ],
    right: [
      {
        description: "All containers referenced in publish_events have a matching component/container definition",
        yaml: `
---
components:
- name: DB
  containers:
  - source: public
    image_name: mongo
  - source: public
    image_name: redis
    publish_events:
      - name: event
        subscriptions:
        - component: Pipeline
          container: logstash
          action: start
- name: Pipeline
  containers:
  - source: public
    image_name: logstash
      `,
      },
    ],
  },
};

export const all: YAMLRule[] = [
  notClusteredIfNamedContainer,
  eventSubscriptionContainerExists,
];
