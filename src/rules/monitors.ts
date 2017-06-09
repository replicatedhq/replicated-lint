import * as _ from "lodash";
import { Predicate, RuleMatched, YAMLRule } from "../lint";

class Tester implements Predicate<any> {
  public test(root: any): RuleMatched {
    if (!_.has(root, "monitors.cpuacct")) {
      return { matched: false };
    }

    if (_.isEmpty(_.get(root, "components"))) {
      return { matched: true, paths: ["monitors.cpuacct"] };
    }

    const cpuaccts: string[] = root.monitors.cpuacct;

    if (_.isEmpty(cpuaccts)) {
      return { matched: false };
    }

    const violations = _.filter(_.map(cpuaccts, (cpuacct, index) => {
      const [name, image] = cpuacct.split(",");

      const componentIndex: any = _.findIndex(root.components, { name });
      if (componentIndex === -1) {
        return { cpuacct, index, path: "components" };
      }

      const container = _.find(root.components[componentIndex].containers, { image_name: image });
      if (!container) {
        return { cpuacct, index, path: `components.${componentIndex}` };
      }
    }));

    if (_.isEmpty(violations)) {
      return { matched: false };
    }

    return {
      matched: true,
      paths: [
        ..._.map(violations, v => `monitors.cpuacct.${v!.index}`),
        ..._.map(violations, v => v!.path),
      ],
    };

  }
}

export const cpuMonitorContainerExists: YAMLRule = {
  name: "CPUMonitorContainerExists",
  type: "error",
  message: "monitors.cpuacct entries must have matching component+container",
  test: new Tester(),
};

export const all: YAMLRule[] = [
  cpuMonitorContainerExists,
];
