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
                      { Truthy: { path: "fill_color" } },
                      { NotMatch: { path: "fill_color", pattern: hexcolorRegexString } },
                      { NotMatch: { path: "fill_color", pattern: rgbRegexString } },
                      { NotMatch: { path: "fill_color", pattern: rgbaRegexString } },
                    ],
                  },
                },
                {
                  And: {
                    preds: [
                      { Truthy: { path: "stroke_color" } },
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

export const statsdPortValid: YAMLRule = {
  name: "prop-statsd-port-valid",
  type: "error",
  message: "If specified, statsd.port must be a valid TCP port",
  test: {
    Dot: {
      path: "statsd",
      pred: {
        And: {
          preds: [
            { Truthy: { path: "port" } },
            {
              Or: {
                preds: [
                  { GT: { path: "port", value: 65535 } },
                  { LT: { path: "port", value: 0 } },
                ],
              },
            },
          ],
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "statsd.port is not an integer",
        yaml: `
---
statsd:
  port: foo
    `,
      },
      {
        description: "statsd.port is negative",
        yaml: `
---
statsd:
  port: -100
    `,
      },
      {
        description: "statsd.port is above the maximum tcp port range",
        yaml: `
---
statsd:
  port: 100000
    `,
      },
    ],
    right: [
      {
        description: "statsd port valid",
        yaml: `
---
statsd:
  port: 43221
      `,
      },
      {
        description: "statsd port not specified",
        yaml: `
---
statsd: {}
      `,
      },
    ],
  },
};

export const graphitePortValid: YAMLRule = {
  name: "prop-graphite-port-valid",
  type: "error",
  message: "If specified, graphite.port must be a valid TCP port",
  test: {
    Dot: {
      path: "graphite",
      pred: {
        And: {
          preds: [
            { Truthy: { path: "port" } },
            {
              Or: {
                preds: [
                  { GT: { path: "port", value: 65535 } },
                  { LT: { path: "port", value: 0 } },
                ],
              },
            },
          ],
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "graphite.port is not an integer",
        yaml: `
---
graphite:
  port: foo
    `,
      },
      {
        description: "graphite.port is negative",
        yaml: `
---
graphite:
  port: -100
    `,
      },
      {
        description: "graphite.port is above the maximum tcp port range",
        yaml: `
---
graphite:
  port: 100000
    `,
      },
    ],
    right: [
      {
        description: "graphite port valid",
        yaml: `
---
graphite:
  port: 43221
      `,
      },
      {
        description: "graphite port not specified",
        yaml: `
---
graphite: {}
      `,
      },
    ],
  },
};

export const graphiteRetentionValid: YAMLRule = {
  name: "prop-custommetric-retention-valid",
  type: "error",
  message: "If specified, a custom_metric's retention must be in a valid format, e.g.`15s:7d,1m:21d,15m:5y`",
  test: {
    AnyOf: {
      path: "custom_metrics",
      pred: {
        And: {
          preds: [
            { Truthy: { path: "retention" } },
            { NotMatch: { path: "retention", pattern: "^(\\d+[smhdy]:\\d+[smhdy],?\\s?){1,}$" } },
          ],
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "retention invalid",
        yaml: `
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: 15 second resolution for  10 days
    aggregation_method: "average"
    xfiles_factor: 0.3
    `,
      } ],
    right: [
      {
        description: "no custom metrics",
        yaml: `
---
custom_metrics: []
      `,
      },
      {
        description: "custom retention not specified",
        yaml: `
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    aggregation_method: "average"
    xfiles_factor: 0.3

      `,
      },
      {
        description: "minimal valid retention",
        yaml: `
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: 15s:7d
    aggregation_method: "average"
    xfiles_factor: 0.3

      `,
      },
      {
        description: "valid retention with spaces",
        yaml: `
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: 15s:7d, 1m:22d, 15m:2h
    aggregation_method: "average"
    xfiles_factor: 0.3

      `,
      },
      {
        description: "valid retention 1",
        yaml: `
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: 15s:7d,1m:21d,15m:5y
    aggregation_method: "average"
    xfiles_factor: 0.3

      `,
      },
      {
        description: "valid retention 2",
        yaml: `
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: "1m:1h,1h:7d,1d:90d"
    aggregation_method: "average"
    xfiles_factor: 0.3

      `,
      },
      {
        description: "valid retention 3",
        yaml: `
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: "1s:10m,1m:4h,1h:30d"
    aggregation_method: "average"
    xfiles_factor: 0.3

      `,
      },
      {
        description: "valid retention 4",
        yaml: `
---
custom_metrics:
  - target: stats.gauges.myapp100.ping.*
    retention: "10s:10m,1m:20m,1h:30d"
    aggregation_method: "average"
    xfiles_factor: 0.3

      `,
      },
    ],
  },
};

// case "average", "sum", "min", "max", "last":
export const graphiteAggregationValid: YAMLRule = {
  name: "prop-custommetric-aggregation-valid",
  type: "error",
  message: "If specified, a custom_metric's aggregation must one of `average`, `sum`, `min`, `max`, `last`",
  test: {
    AnyOf: {
      path: "custom_metrics",
      pred: {
        And: {
          preds: [
            { Truthy: { path: "aggregation_method" } },
            { NotMatch: { path: "aggregation_method", pattern: "^average|sum|min|max|last$" } },
          ],
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "aggregation invalid",
        yaml: `
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: 15s:7d,1m:14d,15m:1y
    aggregation_method: "middle-out"
    xfiles_factor: 0.3
    `,
      } ],
    right: [
      {
        description: "no custom metrics",
        yaml: `
---
custom_metrics: []
      `,
      },
      {
        description: "custom aggregation not specified",
        yaml: `
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*

      `,
      },
      {
        description: "aggregation == sum",
        yaml: `
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: 15s:7d
    aggregation_method: "sum"
    xfiles_factor: 0.3

      `,
      },
      {
        description: "aggregation == average",
        yaml: `
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: 15s:7d, 1m:22d, 15m:2h
    aggregation_method: "average"
    xfiles_factor: 0.3

      `,
      },
      {
        description: "aggregation == max",
        yaml: `
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: 15s:7d,1m:21d,15m:5y
    aggregation_method: "max"
    xfiles_factor: 0.3

      `,
      },
      {
        description: "aggregation == min",
        yaml: `
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: "1m:1h,1h:7d,1d:90d"
    aggregation_method: "min"
    xfiles_factor: 0.3

      `,
      },
      {
        description: "aggregation == last",
        yaml: `
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: "1s:10m,1m:4h,1h:30d"
    aggregation_method: "last"
    xfiles_factor: 0.3
      `,
      },
    ],
  },
};

export const all: YAMLRule[] = [
  cpuMonitorContainerExists,
  memMonitorContainerExists,
  customMonitorsHaveAtLeastOneTarget,
  customMonitorColorValid,
  statsdPortValid,
  graphitePortValid,
  graphiteRetentionValid,
  graphiteAggregationValid,
];
