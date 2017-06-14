import * as _ from "lodash";
import { Predicate, RuleMatchedAt, YAMLRule } from "../lint";
import * as engine from "../engine";

interface InvalidMontior {
  index: number;
  path: string;
}

class MonitorContainerExists implements Predicate<any> {
  public static fromJson(self: any): MonitorContainerExists {
    return new MonitorContainerExists(self.monitorPath);
  }
  constructor(private readonly monitorPath: string) {
  }

  public test(root: any): RuleMatchedAt {
    if (!_.has(root, this.monitorPath)) {
      return { matched: false };
    }

    if (_.isEmpty(_.get(root, "components"))) {
      return { matched: true, paths: [this.monitorPath] };
    }

    const monitors: string[] = _.get(root, this.monitorPath) as string[];

    if (_.isEmpty(monitors)) {
      return { matched: false };
    }

    const violations: InvalidMontior[] = _.filter(_.map(monitors, (monitor, index) => {
      return this.checkMonitor(root.components, monitor, index);
    })) as any;

    if (_.isEmpty(violations)) {
      return { matched: false };
    }

    return {
      matched: true,
      paths: [
        ..._.map(violations, v => `${this.monitorPath}.${v.index}`),
        ..._.map(violations, v => v.path),
      ],
    };
  }

  private checkMonitor(components: any[], monitor: string, index: number): InvalidMontior | undefined {
    const [name, image] = monitor.split(",");

    // fail if component missing
    const componentIndex: any = _.findIndex(components, { name });
    if (componentIndex === -1) {
      return { index, path: "components" };
    }

    // fail if container missing
    const container = _.find(components[componentIndex].containers, { image_name: image });
    if (!container) {
      return { index, path: `components.${componentIndex}` };
    }
  }
}

engine.register(MonitorContainerExists);

export const cpuMonitorContainerExists: YAMLRule = {
  name: "prop-monitors-cpuacct-container-exists",
  type: "error",
  message: "monitors.cpuacct entries must have matching component+container",
  test: {
    type: "MonitorContainerExists",
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
  name: "prop-monitors-memacct-container-exists",
  type: "error",
  message: "monitors.memacct entries must have matching component+container",
  test: {
    type: "MonitorContainerExists",
    monitorPath: "monitors.memacct",
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
  memacct:
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
  memacct:
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
  memacct:
    - Logstash,quay.io/getelk/logstash
      `,
    }],
  },
};

export const all: YAMLRule[] = [
  cpuMonitorContainerExists,
  memMonitorContainerExists,
];
