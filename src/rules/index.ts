import * as root from "./root";
import * as monitors from "./monitors";
import { YAMLRule } from "../lint";

export const all: YAMLRule[] = [
  ...root.all,
  ...monitors.all,
];

export { root, monitors };
