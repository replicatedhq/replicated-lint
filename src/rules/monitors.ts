import { YAMLRule } from "../lint";

export const cpuMonitorContainerExists: YAMLRule = {
  name: "prop-monitors-cpuacct-container-exists",
  type: "error",
  message: "Entries in `monitors.cpuacct` must have matching component+container or the scheduler must be swarm",
  test: {
    And: {
      preds: [
        { MonitorContainerMissing: { monitorPath: "monitors.cpuacct"} },
        {
          And: {
            preds: [
              { Not: { pred: { Exists: { path: "swarm"} } } },
              { IsNotScheduler: { scheduler: "swarm"} },
            ],
          },
        },
      ],
    },
  },
  examples: {
    wrong: [
      {
        description: "`cpuacct` monitor references a component that does not exist",
        yaml: `
---
components:
  - name: Kibana
    containers:
      - image_name: quay.io/getelk/logstash
        version: latest
        source: public
monitors:
  cpuacct:
    - Logstash,quay.io/getelk/logstash
    `,
      },
      {
        description: "`cpuacct` monitor references a container that does not exist",
        yaml: `
---
components:
  - name: Logstash
    containers:
      - image_name: quay.io/getelk/elasticsearch
        version: latest
        source: public
monitors:
  cpuacct:
    - Logstash,quay.io/getelk/logstash
    `,
      },
      {
        description: "`cpuacct` monitor references a component that does not exist and no scheduler specified",
        yaml: `
---
monitors:
  cpuacct:
    - swarmstash
      `,
        scheduler: "",
      },
    ],
    right: [{
        description: "All `cpuacct` monitors reference existing containers",
        yaml: `
---
components:
  - name: Logstash
    containers:
      - image_name: quay.io/getelk/logstash
        version: latest
        source: public
monitors:
  cpuacct:
    - Logstash,quay.io/getelk/logstash
      `,
      },
      {
        description: "All `cpuacct` monitors are valid if the swarm path exists",
        yaml: `
---
monitors:
  cpuacct:
    - swarmstash
swarm:
  minimum_node_count: "1"
      `,
      },
      {
        description: "All `cpuacct` monitors are valid if the scheduler is specified as swarm",
        yaml: `
---
monitors:
  cpuacct:
    - swarmstash
      `,
        scheduler: "swarm",
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
  message: "Entries in `monitors.memory` must have matching component+container or the scheduler must be swarm",
  test: {
    And: {
      preds: [
        { MonitorContainerMissing: { monitorPath: "monitors.memory"} },
        {
          And: {
            preds: [
              { Not: { pred: { Exists: { path: "swarm"} } } },
              { IsNotScheduler: { scheduler: "swarm"} },
            ],
          },
        },
      ],
    },
  },
  examples: {
    wrong: [
      {
        description: "`memacct` monitor references a component that does not exist",
        yaml: `
---
components:
  - name: Kibana
    containers:
      - image_name: quay.io/getelk/logstash
        version: latest
        source: public
monitors:
  memory:
    - Logstash,quay.io/getelk/logstash
    `,
      },
      {
        description: "`memacct` monitor references a container that does not exist",
        yaml: `
---
components:
  - name: Logstash
    containers:
      - image_name: quay.io/getelk/elasticsearch
        version: latest
        source: public
monitors:
  memory:
    - Logstash,quay.io/getelk/logstash
    `,
      },
      {
        description: "`memacct` monitor references a component that does not exist and no scheduler specified",
        yaml: `
---
monitors:
  memory:
    - swarmstash
      `,
        scheduler: "",
      },
    ],
    right: [
      {
        description: "All `memacct` monitors reference existing containers",
        yaml: `
---
components:
  - name: Logstash
    containers:
      - image_name: quay.io/getelk/logstash
        version: latest
        source: public
monitors:
  memory:
    - Logstash,quay.io/getelk/logstash
      `,
      },
      {
        description: "All `memacct` monitors are valid if the scheduler is swarm",
        yaml: `
---
monitors:
  memory:
    - swarmstash
swarm:
  minimum_node_count: "1"
      `,
      },
      {
        description: "All `cpuacct` monitors are valid if the scheduler is specified as swarm",
        yaml: `
---
monitors:
  memory:
    - swarmstash
      `,
        scheduler: "swarm",
      },
    ],
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
      target: ""
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
        version: latest
        source: public
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
        description: "custom monitor has invalid `stroke_color`",
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
        description: "custom monitor has invalid `fill_color`",
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
        source: public
        version: latest
monitors:
  custom:
    - name: whenever
      target: stats.gauges.myapp100.ping.*
    - name: whatever
      targets:
        - stats.gauges.myapp100.ping.*
        - movingAverage(stats.gauges.myapp100.ping.*,60)
        - movingAverage(stats.gauges.myapp100.ping.*,600)
      display:
        fill_color: '#44BB66'
        stroke_color: '#444444'
      `,
    }],
  },
};

export const statsdPortValid: YAMLRule = {
  name: "prop-statsd-port-valid",
  type: "error",
  message: "If specified, `statsd.port` must be a valid TCP port",
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
        description: "`statsd.port` is negative",
        yaml: `
---
statsd:
  port: -100
    `,
      },
      {
        description: "`statsd.port` is above the maximum tcp port range",
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
  message: "If specified, `graphite.port` must be a valid TCP port",
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
        description: "`graphite.port` is negative",
        yaml: `
---
graphite:
  port: -100
    `,
      },
      {
        description: "`graphite.port` is above the maximum tcp port range",
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

export const carbonPlaintextPortValid: YAMLRule = {
  name: "prop-carbon-plaintext-port-valid",
  type: "error",
  message: "If specified, `carbon.plaintext_port` must be a valid TCP port",
  test: {
    Dot: {
      path: "carbon",
      pred: {
        And: {
          preds: [
            { Truthy: { path: "plaintext_port" } },
            {
              Or: {
                preds: [
                  { GT: { path: "plaintext_port", value: 65535 } },
                  { LT: { path: "plaintext_port", value: 0 } },
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
        description: "`carbon.plaintext_port` is negative",
        yaml: `
---
carbon:
  port: -100
    `,
      },
      {
        description: "`carbon.plaintext_port` is above the maximum tcp port range",
        yaml: `
---
carbon:
  plaintext_port: 100000
    `,
      },
    ],
    right: [
      {
        description: "carbon plaintext port valid",
        yaml: `
---
carbon:
  plaintext_port: 43221
      `,
      },
      {
        description: "carbon plaintext port not specified",
        yaml: `
---
carbon: {}
      `,
      },
    ],
  },
};

export const carbonPicklePortValid: YAMLRule = {
  name: "prop-carbon-pickle-port-valid",
  type: "error",
  message: "If specified, `carbon.pickle_port` must be a valid TCP port",
  test: {
    Dot: {
      path: "carbon",
      pred: {
        And: {
          preds: [
            { Truthy: { path: "pickle_port" } },
            {
              Or: {
                preds: [
                  { GT: { path: "pickle_port", value: 65535 } },
                  { LT: { path: "pickle_port", value: 0 } },
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
        description: "`carbon.pickle_port` is negative",
        yaml: `
---
carbon:
  port: -100
    `,
      },
      {
        description: "`carbon.pickle_port` is above the maximum tcp port range",
        yaml: `
---
carbon:
  pickle_port: 100000
    `,
      },
    ],
    right: [
      {
        description: "carbon pickle port valid",
        yaml: `
---
carbon:
  pickle_port: 43221
      `,
      },
      {
        description: "carbon pickle port not specified",
        yaml: `
---
carbon: {}
      `,
      },
    ],
  },
};

export const graphiteRetentionValid: YAMLRule = {
  name: "prop-custommetric-retention-valid",
  type: "error",
  message: "If specified, a custom_metric's `retention` must be in a valid format, e.g.`15s:7d,1m:21d,15m:5y`",
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
      }],
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

export const graphiteAggregationValid: YAMLRule = {
  name: "prop-custommetric-aggregation-valid",
  type: "error",
  message: "If specified, a `custom_metric`'s aggregation must one of `average`, `sum`, `min`, `max`, `last`",
  test: {
    AnyOf: {
      path: "custom_metrics",
      pred: {
        And: {
          preds: [
            { Truthy: { path: "aggregation_method" } },
            { NotMatch: { path: "aggregation_method", pattern: "^(average|sum|min|max|last)$" } },
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
      }],
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
        description: "aggregation == `sum`",
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
        description: "aggregation == `average`",
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
        description: "aggregation == `max`",
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
        description: "aggregation == `min`",
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
        description: "aggregation == `last`",
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

export const customMonitorDisplayLabelScale: YAMLRule = {
  name: "prop-monitors-custom-display-labelscale-valid",
  type: "error",
  message: "If specified, a custom monitor's `display.label_scale` must be one of `metric`, `none` or a parseable `float`",
  test: {
    AnyOf: {
      path: "monitors.custom",
      pred: {
        And: {
          preds: [
            { Truthy: { path: "display.label_scale" } },
            { NotMatch: { path: "display.label_scale", pattern: "^(metric|none|[-+]?[0-9]*\\.?[0-9]+)$" } },
          ],
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "`label_scale` == `kfbr392`, not a valid float",
        yaml: `
---
monitors:
  custom:
    - target: stats.gauges.kfbr392.*
      display:
        label_scale: kfbr392
    `,
      },
      {
        description: "`label_scale` == `1.1.02`, not a valid float",
        yaml: `
---
monitors:
  custom:
    - target: stats.gauges.kfbr392.*
      display:
        label_scale: 1.1.02
    `,
      },
    ],
    right: [
      {
        description: "`label_scale` == `metric`",
        yaml: `
---
monitors:
  custom:
    - target: stats.gauges.kfbr392.*
      display:
        label_scale: metric
    `,
      },
      {
        description: "`label_scale` == `none`",
        yaml: `
---
monitors:
  custom:
    - target: stats.gauges.kfbr392.*
      display:
        label_scale: none
    `,
      },
      {
        description: "`label_scale` == `1.84`",
        yaml: `
---
monitors:
  custom:
    - target: stats.gauges.kfbr392.*
      display:
        label_scale: 1.84
    `,
      },
      {
        description: "`label_scale` == `.1`",
        yaml: `
---
monitors:
  custom:
    - target: stats.gauges.kfbr392.*
      display:
        label_scale: .1
    `,
      },
      {
        description: "`label_scale` == `12`",
        yaml: `
---
monitors:
  custom:
    - target: stats.gauges.kfbr392.*
      display:
        label_scale: 12
    `,
      },
      {
        description: "`label_scale` == `-12.23131131`",
        yaml: `
---
monitors:
  custom:
    - target: stats.gauges.kfbr392.*
      display:
        label_scale: -12.23131131
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
  customMonitorDisplayLabelScale,
];
