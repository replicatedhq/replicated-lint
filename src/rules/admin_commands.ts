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

export const adminCommandShellAlias: YAMLRule = {
  name: "prop-admincommand-shellalias-valid",
  type: "error",
  message: "An admin command's `alias` must be a valid shell alias",
  test: {
    AnyOf: {
      path: "admin_commands",
      pred: {
        And: {
          preds: [
            { Truthy: { path: "alias" } },
            { NotMatch: { path: "alias", pattern: "^[a-zA-Z0-9_\\-]*$" } },
          ],
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "admin command's alias contains invalid character `&`",
        yaml: `
---
admin_commands:
- alias: exec&echo
  command: ["echo"]
  run_type: exec
  component: DB
  container: redis
      `,
      },
      {
        description: "admin command's alias contains invalid character `*`",
        yaml: `
---
admin_commands:
- alias: exec**echo
  command: ["echo"]
  run_type: exec
  component: DB
  container: redis
      `,
      },
    ],
    right: [
      {
        description: "valid alias",
        yaml: `
---
admin_commands:
- alias: redis_echo-command--
  command: ["echo"]
  run_type: exec
  component: DB
  container: redis
      `,
      },
    ],
  },
};

export const all: YAMLRule[] = [
  adminCommandComponentExists,
  adminCommandShellAlias,
];
