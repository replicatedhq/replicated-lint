import { YAMLRule } from "../lint";

export const cpuMonitorContainerExists: YAMLRule = {
  name: "prop-monitors-cpuacct-container-exists",
  type: "error",
  message: "Entries in `monitors.cpuacct` must have matching component+container",
  test: {
    type: "MonitorContainerMissing",
    monitorPath: "monitors.cpuacct",
  },
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
  test: {
    type: "MonitorContainerMissing",
    monitorPath: "monitors.memory",
  },
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

export const all: YAMLRule[] = [
  cpuMonitorContainerExists,
  memMonitorContainerExists,
];
