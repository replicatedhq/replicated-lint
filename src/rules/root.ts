import { RulerPredicate, YAMLRule } from "../lint";

export const apiVersion: YAMLRule = {
  name: "ReplicatedAPIVersion",
  type: "error",
  message: "replicated_api_version must be present",
  test: new RulerPredicate({
    path: "replicated_api_version",
    comparator: "exists",
  }),
};

export const all: YAMLRule[] = [
  apiVersion,
];
