import { YAMLRule } from "../lint";

export const supportBundle: YAMLRule = {
  name: "prop-support-bundle",
  type: "info",
  message: "For customers using Version 2 of the support bundle, custom files and commands can be configured in Replicated Console.",
  links: ["https://console.replicated.com/troubleshoot"],
  test: {
    Exists: {
      path: "support",
    },
  },
  examples: {
    right: [
      {
        description: "`support` key not detected",
        yaml: `
---
  replicated_api_version: "2.10.1"
`,
      },
    ],
    wrong: [
      {
        description: "`support` key detected",
        yaml: `
support:
  commands:
    - filename: output.txt
      command: ["sleep", "10"]
      source:
        replicated:
          component: LB
          container: wlaoh/nginx
    - filename: output.txt
      command: ["echo", "Hello World!"]
      source:
        replicated:
          component: LB
          container: wlaoh/nginx
  files:
    - filename: output.txt
      source:
        replicated:
          component: LB
          container: wlaoh/nginx
        `,
      },
    ],
  },
};

export const all: YAMLRule[] = [
  supportBundle,
];
