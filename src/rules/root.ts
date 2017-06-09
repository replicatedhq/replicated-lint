import { Exists, YAMLRule } from "../lint";

export const apiVersion: YAMLRule = {
  name: "ReplicatedAPIVersion",
  type: "error",
  message: "replicated_api_version must be present",
  test: new Exists("replicated_api_version"),
};

export const all: YAMLRule[] = [
  apiVersion,
];
