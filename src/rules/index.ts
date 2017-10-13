import * as admin from "./admin_commands";
import * as components from "./components";
import * as configoption from "./configoption";
import * as containers from "./containers";
import * as hostreq from "./host_requirements";
import * as kubernetes from "./kubernetes";
import * as monitors from "./monitors";
import * as root from "./root";
import * as swarm from "./swarm";
import * as testproc from "./testproc";
import { YAMLRule } from "../lint";

export const all: YAMLRule[] = [
  ...admin.all,
  ...components.all,
  ...configoption.all,
  ...containers.all,
  ...hostreq.all,
  ...kubernetes.all,
  ...monitors.all,
  ...root.all,
  ...swarm.all,
  ...testproc.all,
];

export {
  admin,
  components,
  configoption,
  containers,
  hostreq,
  kubernetes,
  monitors,
  root,
  swarm,
  testproc,
};
