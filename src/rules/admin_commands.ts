import { YAMLRule } from "../lint";

export const adminCommandComponentExists: YAMLRule = {
  name: "prop-admincommand-component-exists",
  type: "error",
  message: "Admin commands must have matching component and container",
  test: { AdminCommandContainerMissing: {} },
  examples: {
    wrong: [
      {
        description: "admin command but no containers",
        yaml: `
---
admin_commands:
- alias: aliasecho
  command: ["echo"]
  run_type: exec
  component: DB
  container: redis
      `,
      },
      {
        description: "Admin command but no matching containers",
        yaml: `
---
admin_commands:
- alias: aliasecho
  command: ["echo"]
  run_type: exec
  component: DB
  container: redis

components:
  - name: DB
    containers:
    - image_name: postgres
      `,
      },
    ],
    right: [

      {
        description: "No commands, no containers",
        yaml: `
---
admin_commands: []
components: []
      `,
      },
      {
        description: "Admin command with matching container",
        yaml: `
---
admin_commands:
- alias: aliasecho
  command: ["echo"]
  run_type: exec
  component: DB
  container: redis

components:
  - name: DB
    containers:
    - image_name: redis
      `,
      },
      {
        description: "Admin command has service, so we're probably in swarm",
        yaml: `
---
admin_commands:
- alias: aliasecho
  command: ["echo"]
  run_type: exec
  service: database
      `,
      },
      {
        description: "Admin command has selector, so we're probably in kubernetes",
        yaml: `
---
admin_commands:
- alias: aliasecho
  command: ["echo"]
  run_type: exec
  selector:
    - tier: database
      `,
      },
    ],
  },
};

export const all: YAMLRule[] = [
  adminCommandComponentExists,
];
