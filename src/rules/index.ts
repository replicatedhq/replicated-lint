import * as components from "./components";
import * as configoption from "./configoption";
import * as containers from "./containers";
import * as monitors from "./monitors";
import * as root from "./root";
import * as testproc from "./testproc";
import * as hostreq from "./host_requirements";
import { YAMLRule } from "../lint";

export const all: YAMLRule[] = [
  ...components.all,
  ...configoption.all,
  ...containers.all,
  ...monitors.all,
  ...root.all,
  ...testproc.all,
  ...hostreq.all,
];

export { root, monitors, configoption, testproc };
