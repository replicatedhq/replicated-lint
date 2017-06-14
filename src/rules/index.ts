import * as root from "./root";
import * as monitors from "./monitors";
import * as configoption from "./configoption";
import { YAMLRule } from "../lint";

export const all: YAMLRule[] = [
  ...root.all,
  ...monitors.all,
  ...configoption.all,
];

export { root, monitors, configoption };
