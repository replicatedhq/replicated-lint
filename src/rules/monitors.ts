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
    },
      {
        description: "No monitors, no containers",
        yaml: `
---
monitors:
  cpuacct: []
      `,
      },
    ],
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
      pred: {
        And: {
          preds: [
            { IsEmpty: { path: "targets" } },
            { IsEmpty: { path: "target" } },
          ],
        },
      },
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
        description: "single target is empty",
        yaml: `
---
monitors:
  custom:
    - name: whatever
      target: 
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
    - name: whenever
      target: stats.gauges.myapp100.ping.*
    - name: whatever
      targets: 
        - stats.gauges.myapp100.ping.*
        - movingAverage(stats.gauges.myapp100.ping.*,60)
        - movingAverage(stats.gauges.myapp100.ping.*,600)
      `,
    }],
  },
};

// thanks validator! gopkg.in/go-playground/validator.v8
const hexcolorRegexString = "^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$";
const rgbRegexString = "^rgb\\(\\s*(?:(?:0|[1-9]\\d?|1\\d\\d?|2[0-4]\\d|25[0-5])\\s*,\\s*(?:0|[1-9]\\d?|1\\d\\d?|2[0-4]\\d|25[0-5])\\s*,\\s*(?:0|[1-9]\\d?|1\\d\\d?|2[0-4]\\d|25[0-5])|(?:0|[1-9]\\d?|1\\d\\d?|2[0-4]\\d|25[0-5])%\\s*,\\s*(?:0|[1-9]\\d?|1\\d\\d?|2[0-4]\\d|25[0-5])%\\s*,\\s*(?:0|[1-9]\\d?|1\\d\\d?|2[0-4]\\d|25[0-5])%)\\s*\\)$";
const rgbaRegexString = "^rgba\\(\\s*(?:(?:0|[1-9]\\d?|1\\d\\d?|2[0-4]\\d|25[0-5])\\s*,\\s*(?:0|[1-9]\\d?|1\\d\\d?|2[0-4]\\d|25[0-5])\\s*,\\s*(?:0|[1-9]\\d?|1\\d\\d?|2[0-4]\\d|25[0-5])|(?:0|[1-9]\\d?|1\\d\\d?|2[0-4]\\d|25[0-5])%\\s*,\\s*(?:0|[1-9]\\d?|1\\d\\d?|2[0-4]\\d|25[0-5])%\\s*,\\s*(?:0|[1-9]\\d?|1\\d\\d?|2[0-4]\\d|25[0-5])%)\\s*,\\s*(?:(?:0.[1-9]*)|[01])\\s*\\)$";

export const customMonitorColorValid: YAMLRule = {
  name: "prop-monitors-custom-has-target",
  type: "error",
  message: "Entries in `monitors.custom` have valid color specifications",
  test: {
    AnyOf: {
      path: "monitors.custom",
      pred: {
        Dot: {
          path: "display", pred: {
            Or: {
              preds: [
                {
                  And: {
                    preds: [
                      { Truthy: { path: "fill_color"} },
                      { NotMatch: { path: "fill_color", pattern: hexcolorRegexString } },
                      { NotMatch: { path: "fill_color", pattern: rgbRegexString } },
                      { NotMatch: { path: "fill_color", pattern: rgbaRegexString } },
                    ],
                  },
                },
                {
                  And: {
                    preds: [
                      { Truthy: { path: "stroke_color"} },
                      { NotMatch: { path: "stroke_color", pattern: hexcolorRegexString } },
                      { NotMatch: { path: "stroke_color", pattern: rgbRegexString } },
                      { NotMatch: { path: "stroke_color", pattern: rgbaRegexString } },
                    ],
                  },
                },
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
        description: "custom monitor has invalid stroke_color",
        yaml: `
---
monitors:
  custom:
    - name: whatever
      targets: [stats.mystat.*]
      display:
        stroke_color: blue
    `,
      },
      {
        description: "custom monitor has invalid fill_color",
        yaml: `
---
monitors:
  custom:
    - name: whatever
      targets: [stats.mystat.*]
      display:
        fill_color: blue
    `,
      },
    ],
    right: [{
      description: "custom monitor has valid color specs",
      yaml: `
---
components:
  - name: Logstash
    containers:
      - image_name: quay.io/getelk/logstash
monitors:
  custom:
    - name: whenever
      target: stats.gauges.myapp100.ping.*
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
  customMonitorColorValid,
];
