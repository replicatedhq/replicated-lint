import { YAMLRule } from "../lint";

export const adminCommandComponentExists: YAMLRule = {
  name: "prop-admincommand-component-exists",
  type: "error",
  message: "Admin commands must reference an existing component and container",
  test: { AdminCommandContainerMissing: {} },
  examples: {
    wrong: [
      {
        description: "admin command but no containers",
        yaml: `
---
admin_commands:
- alias: aliasecho
  command: [echo]
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
  command: [echo]
  component: DB
  container: redis

components:
- name: DB
  containers:
  - image_name: postgres
      `,
      },
      {
        description: "Old style admin command but no matching containers",
        yaml: `
---
admin_commands:
- alias: aliasecho
  command: [echo]
  component: DB
  image:
    image_name: redis

components:
- name: DB
  containers:
  - image_name: postgres
      `,
      },
      {
        description: "Admin multi command but no matching containers",
        yaml: `
---
admin_commands:
- alias: aliasecho
  command: [echo]
  replicated:
    component: DB
    container: redis
  swarm:
    service: myapp
  kubernetes:
    selector:
      tier: backend
      app: mine
    container: node

components:
- name: DB
  containers:
  - image_name: postgres
      `,
      },
      {
        description: "Admin source multi command but no matching containers",
        yaml: `
---
admin_commands:
- alias: aliasecho
  command: [echo]
  source:
    replicated:
      component: DB
      container: redis
    swarm:
      service: myapp
    kubernetes:
      selector:
        tier: backend
        app: mine
      container: node

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
  command: [echo]
  component: DB
  container: redis

components:
- name: DB
  containers:
  - image_name: redis
      `,
      },
      {
        description: "Admin command has `service`, so this is probably a swarm command and thus is not tested here",
        yaml: `
---
admin_commands:
- alias: aliasecho
  command: [echo]
  service: database
      `,
      },
      {
        description: "Admin command has `selector`, so this is probably a kubernetes command and thus is not tested here",
        yaml: `
---
admin_commands:
- alias: aliasecho
  command: [echo]
  selector:
    - tier: database
      `,
      },
      {
        description: "Old style admin command with a matching container",
        yaml: `
---
admin_commands:
- alias: aliasecho
  command: [echo]
  component: DB
  image:
    image_name: redis

components:
- name: DB
  containers:
  - image_name: redis
      `,
      },
      {
        description: "Admin multi command with matching container",
        yaml: `
---
admin_commands:
- alias: aliasecho
  command: [echo]
  replicated:
    component: DB
    container: redis
  swarm:
    service: myapp
  kubernetes:
    selector:
      tier: backend
      app: mine
    container: node

components:
- name: DB
  containers:
  - image_name: redis
      `,
      },
      {
        description: "Admin source multi command with matching container",
        yaml: `
---
admin_commands:
- alias: aliasecho
  command: [echo]
  source:
    replicated:
      component: DB
      container: redis
    swarm:
      service: myapp
    kubernetes:
      selector:
        tier: backend
        app: mine
      container: node

components:
- name: DB
  containers:
  - image_name: redis
      `,
      },
    ],
  },
};

export const adminVerifyRequirementsPresent: YAMLRule = {
  name: "prop-admincommand-requirements-present",
  type: "error",
  message: "Basic requirements for an admin command must be present - an `alias` and a `command`",
  test: {
    AnyOf: {
      path: "admin_commands",
      pred: {
        Or: {
          preds: [
            {
              Not: { pred: { Exists: { path: "alias"} } },
            },
            {
              Not: { pred: { Exists: { path: "command"} } },
            },
          ],
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "`alias` missing",
        yaml: `
---
admin_commands:
- command: [echo]
  component: DB
  container: redis
      `,
      },
      {
        description: "`command` missing",
        yaml: `
---
admin_commands:
- alias: echo
  component: DB
  container: redis
      `,
      },
    ],
    right: [
      {
        description: "Valid new-style replicated command",
        yaml: `
---
admin_commands:
- alias: echo
  command: [echo]
  component: DB
  container: redis
      `,
      },
    ],
  },
};

export const adminVerifyOldRequirementsPresent: YAMLRule = {
  name: "prop-admincommand-old-style-requirements-present",
  type: "error",
  message: "`image_name` must be present within `admin_commands.image` and `admin_commands.component` must exist if `admin_commands.image` is present",
  test: {
    AnyOf: {
      path: "admin_commands",
      pred: {
        Or: {
          preds: [
            {
              And: {
                preds: [
                  { Exists: { path: "image" } },
                  { Not: { pred: { Exists: { path: "image.image_name"} } } },
                ],
              },
            },
            {
              And: {
                preds: [
                  { Exists: { path: "image" } },
                  { Not: { pred: { Exists: { path: "component"} } } },
                ],
              },
            },
          ],
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "`image` is present, but not `image.image_name`",
        yaml: `
---
admin_commands:
- alias: echo
  command: [echo]
  component: alpha
  image:
    number: 5
      `,
      },
      {
        description: "`image` is present, but not `component`",
        yaml: `
---
admin_commands:
- alias: echo
  command: [echo]
  image:
    image_name: redis
      `,
      },
    ],
    right: [
      {
        description: "Valid old-style (depreciated) command",
        yaml: `
---
admin_commands:
- alias: echo
  command: [echo]
  component: DB
  image:
    image_name: redis
      `,
      },
    ],
  },
};

export const adminVerifyMultiRequirementsPresent: YAMLRule = {
  name: "prop-admincommand-multi-requirements-present",
  type: "error",
  message: "`container` and `component` must both be present within `admin_commands.replicated` if it is present",
  test: {
    AnyOf: {
      path: "admin_commands",
      pred: {
        Or: {
          preds: [
            {
              And: {
                preds: [
                  { Exists: { path: "replicated" } },
                  { Not: { pred: { Exists: { path: "replicated.component"} } } },
                ],
              },
            },
            {
              And: {
                preds: [
                  { Exists: { path: "replicated" } },
                  { Not: { pred: { Exists: { path: "replicated.container"} } } },
                ],
              },
            },
          ],
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "`replicated` is present, but not `replicated.component`",
        yaml: `
---
admin_commands:
- alias: echo
  command: [echo]
  replicated:
    container: redis
  swarm:
    service: myapp
      `,
      },
      {
        description: "`replicated` is present, but not `replicated.container`",
        yaml: `
---
admin_commands:
- alias: echo
  command: [echo]
  replicated:
    component: DB
  swarm:
    service: myapp
      `,
      },
    ],
    right: [
      {
        description: "Valid admin multi command",
        yaml: `
---
admin_commands:
- alias: echo
  command: [echo]
  replicated:
    component: DB
    container: redis
  swarm:
    service: myapp
      `,
      },
    ],
  },
};

export const adminVerifyVerboseRequirementsPresent: YAMLRule = {
  name: "prop-admincommand-verbose-requirements-present",
  type: "error",
  message: "`container` and `component` must both be present within `admin_commands.source.replicated` if it is present",
  test: {
    AnyOf: {
      path: "admin_commands",
      pred: {
        Or: {
          preds: [
            {
              And: {
                preds: [
                  { Exists: { path: "source" } },
                  { Exists: { path: "source.replicated" } },
                  { Not: { pred: { Exists: { path: "source.replicated.component"} } } },
                ],
              },
            },
            {
              And: {
                preds: [
                  { Exists: { path: "source" } },
                  { Exists: { path: "source.replicated" } },
                  { Not: { pred: { Exists: { path: "source.replicated.container"} } } },
                ],
              },
            },
          ],
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "`source.replicated` is present, but not `source.replicated.component`",
        yaml: `
---
admin_commands:
- alias: echo
  command: [echo]
  source:
    replicated:
      container: redis
    swarm:
      service: myapp
      `,
      },
      {
        description: "`source.replicated` is present, but not `source.replicated.container`",
        yaml: `
---
admin_commands:
- alias: echo
  command: [echo]
  source:
    replicated:
      component: redis
    swarm:
      service: myapp
      `,
      },
    ],
    right: [
      {
        description: "Valid verbose admin multi command",
        yaml: `
---
admin_commands:
- alias: echo
  command: [echo]
  source:
    replicated:
      component: DB
      container: redis
    swarm:
      service: myapp
      `,
      },
    ],
  },
};

export const adminVerifyOneTypePresent: YAMLRule = {
  name: "prop-admincommand-one-present",
  type: "error",
  message: "Admin command must use one of several methods to identify the relevant container",
  test: {
    AnyOf: {
      path: "admin_commands",
      pred: {
        Not: {
          pred: {
            Or: {
              preds: [
                {
                  And: {
                    preds: [
                      { Exists: { path: "component" } },
                      { Exists: { path: "container" } },
                    ],
                  },
                },
                { Exists: { path: "image" } },
                { Exists: { path: "service" } },
                { Exists: { path: "selector" } },
                { Exists: { path: "selectors" } },
                { Exists: { path: "replicated" } },
                { Exists: { path: "kubernetes" } },
                { Exists: { path: "swarm" } },
                { Exists: { path: "source" } },
              ],
            },
          },
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "None of the options are present",
        yaml: `
---
admin_commands:
- alias: echo
  command: [echo]
      `,
      },
    ],
    right: [
      {
        description: "Valid new-style replicated command",
        yaml: `
---
admin_commands:
- alias: echo
  command: [echo]
  component: DB
  container: redis
      `,
      },
      {
        description: "Valid old-style (depreciated) admin command",
        yaml: `
---
admin_commands:
- alias: echo
  command: [echo]
  component: DB
  image:
    image_name: redis
      `,
      },
      {
        description: "Valid admin multi command",
        yaml: `
---
admin_commands:
- alias: echo
  command: [echo]
  replicated:
    component: DB
    container: redis
  swarm:
    service: myapp
      `,
      },
      {
        description: "Valid verbose admin multi command",
        yaml: `
---
admin_commands:
- alias: echo
  command: [echo]
  source:
    replicated:
      component: DB
      container: redis
    swarm:
      service: myapp
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
        description: "admin command's `alias` contains invalid character `&`",
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
        description: "admin command's `alias` contains invalid character `*`",
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
        description: "valid `alias`",
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
  adminVerifyRequirementsPresent,
  adminVerifyOldRequirementsPresent,
  adminVerifyMultiRequirementsPresent,
  adminVerifyVerboseRequirementsPresent,
  adminVerifyOneTypePresent,
];
