import { YAMLRule } from "../lint";

export const cpuMonitorContainerExists: YAMLRule = {
  name: "prop-monitors-cpuacct-container-exists",
  type: "error",
  message: "Entries in `monitors.cpuacct` must have matching component+container",
  test: { MonitorContainerMissing: { monitorPath: "monitors.cpuacct" } },
  examples: {
    wrong: [
      {
        description: "cpuacct monitor references a component that does not exist",
        yaml: `
---
components:
  - name: Kibana
    containers:
      - image_name: quay.io/getelk/logstash
monitors:
  cpuacct:
    - Logstash,quay.io/getelk/logstash
    `,
      },
      {
        description: "cpuacct monitor references a container that does not exist",
        yaml: `
---
components:
  - name: Logstash
    containers:
      - image_name: quay.io/getelk/elasticsearch
monitors:
  cpuacct:
    - Logstash,quay.io/getelk/logstash
    `,
      },
    ],
    right: [{
      description: "All cpuacct monitors reference existing containers",
      yaml: `
---
components:
  - name: Logstash
    containers:
      - image_name: quay.io/getelk/logstash
monitors:
  cpuacct:
    - Logstash,quay.io/getelk/logstash
      `,
    }],
  },
};

export const memMonitorContainerExists: YAMLRule = {
  name: "prop-monitors-memory-container-exists",
  type: "error",
  message: "Entries in `monitors.memory` must have matching component+container",
  test: { MonitorContainerMissing: { monitorPath: "monitors.memory" } },
  examples: {
    wrong: [
      {
        description: "memacct monitor references a component that does not exist",
        yaml: `
---
components:
  - name: Kibana
    containers:
      - image_name: quay.io/getelk/logstash
monitors:
  memory:
    - Logstash,quay.io/getelk/logstash
    `,
      },
      {
        description: "memacct monitor references a container that does not exist",
        yaml: `
---
components:
  - name: Logstash
    containers:
      - image_name: quay.io/getelk/elasticsearch
monitors:
  memory:
    - Logstash,quay.io/getelk/logstash
    `,
      },
    ],
    right: [{
      description: "All memacct monitors reference existing containers",
      yaml: `
---
components:
  - name: Logstash
    containers:
      - image_name: quay.io/getelk/logstash
monitors:
  memory:
    - Logstash,quay.io/getelk/logstash
      `,
    }],
  },
};

export const customMonitorsHaveAtLeastOneTarget: YAMLRule = {
  name: "prop-monitors-custom-has-target",
  type: "error",
  message: "Entries in `monitors.custom` must have at least one target",
  test: {
    AnyOf: {
      path: "monitors.custom",
      pred: { IsEmpty: { path: "targets" } },
    },
  },
  examples: {
    wrong: [
      {
        description: "custom monitor has no targets",
        yaml: `
---
monitors:
  custom:
    - name: whatever
      targets: []
    `,
      },
      {
        description: "custom monitor has null targets",
        yaml: `
---
monitors:
  custom:
    - name: whatever
    `,
      },
    ],
    right: [{
      description: "All custom monitors have at least one target",
      yaml: `
---
components:
  - name: Logstash
    containers:
      - image_name: quay.io/getelk/logstash
monitors:
  custom:
    - name: whatever
      targets: 
        - stats.gauges.myapp100.ping.*
        - movingAverage(stats.gauges.myapp100.ping.*,60)
        - movingAverage(stats.gauges.myapp100.ping.*,600)
      `,
    }],
  },
};

export const all: YAMLRule[] = [
  cpuMonitorContainerExists,
  memMonitorContainerExists,
  customMonitorsHaveAtLeastOneTarget,
];
