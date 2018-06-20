import { YAMLRule } from "../lint";

export const configitemTestprocRunOnSave: YAMLRule = {
  name: "prop-configitem-testproc-run-on-save",
  type: "info",
  message: "If a config item's `test_proc.run_on_save` is not set to `true`, test_proc's will not be checked automatically. Consider setting to `true` to automatically validate inputs",
  links: [
    "https://www.replicated.com/docs/packaging-an-application/test-procs/",
  ],
  test: {
    AnyOf: {
      path: "config",
      pred: {
        Or: {
          preds: [
            {
              FalseyIfPresent: { path: "test_proc", field: "run_on_save" },
            },
            {
              AnyOf: {
                path: "items",
                pred: {
                  FalseyIfPresent: { path: "test_proc", field: "run_on_save" },
                },
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
        description: "A config item's `test_proc.run_on_save` set to `false`",
        yaml: `
---
config:
- name: configs
  title: Configuration
  items:
  - name: phone_number
    type: text
    test_proc:
      display_name: Is this a Phone Number?
      command: regex_match
      run_on_save: false
      args:
      - "([0-9]{3})[-]([0-9]{3})[-]([0-9]{4})$"
      - "That doesn't seem to be a phone number!"
    `,
      },
      {
        description: "A config groups's `test_proc.run_on_save` set to `false`",
        yaml: `
---
config:
- name: configs
  title: Configuration
  test_proc:
    display_name: Is this a Phone Number?
    command: regex_match
    run_on_save: false
    args:
    - "([0-9]{3})[-]([0-9]{3})[-]([0-9]{4})$"
    - "That doesn't seem to be a phone number!"
  items:
  - name: phone_number
    type: text
    `,
      },
    ],
    right: [
      {
        description: "All `test_procs` have `run_on_save` == `true`",
        yaml: `
---
config:
- name: configs
  title: Configuration
  items:
  - name: phone_number
    type: text
    test_proc:
      display_name: Is this a Phone Number?
      command: regex_match
      run_on_save: true
      args:
      - "([0-9]{3})[-]([0-9]{3})[-]([0-9]{4})$"
      - "That doesn't seem to be a phone number!"
      `,
      },
      {
        description: "No config items have test procs",
        yaml: `
---
config:
- name: configs
  title: Configuration
  items:
  - name: phone_number
    type: text
      `,
      },
    ],
  },
};

export const testProcValidCommand: YAMLRule = {
  name: "prop-configitem-testproc-command-valid",
  type: "error",
  message: "A `test_proc`'s command entry must be a valid command.",
  links: [
    "https://www.replicated.com/docs/packaging-an-application/test-procs/",
  ],
  test: {
    AnyOf: {
      path: "config",
      pred: {
        Or: {
          preds: [
            {
              And: {
                preds: [
                  {
                    Truthy: { path: "test_proc" },
                  },
                  {
                    NotMatch: {
                      path: "test_proc.command",
                      pattern: "^(regex_match|validate_json|ldap_auth|ldap_config_validate|file_exists|smtp_auth|certificate_verify|aws_auth|github_app_auth|resolve_host)$",
                    },
                  },
                ],
              },
            },
            {
              AnyOf: {
                path: "items",
                pred: {
                  And: {
                    preds: [
                      { Truthy: { path: "test_proc" } },
                      {
                        NotMatch: {
                          path: "test_proc.command",
                          pattern: "^(regex_match|validate_json|ldap_auth|ldap_config_validate|file_exists|smtp_auth|certificate_verify|aws_auth|github_app_auth|resolve_host)$",
                        },
                      },
                    ],
                  },
                },
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
        description: "config item's `test_proc.command` is set to `json_is_good`, which is not a supported Test Proc command",
        yaml: `
---
config:
- name: configs
  title: Configuration
  items:
  - name: phone_number
    type: text
    test_proc:
      display_name: Is the json good?
      command: json_is_good
    `,
      },
      {
        description: "config group's `test_proc.command` is set to `all_the_json_is_good`, which is not a supported Test Proc command",
        yaml: `
---
config:
- name: configs
  title: Configuration
  test_proc:
    display_name: Is the json good?
    command: all_the_json_is_good
  items:
  - name: phone_number
    type: text
    `,
      },
    ],
    right: [
      {
        description: "item and group's `test_proc.command`s are set to `resolve_host` and `smtp_auth`, both supported Test Proc commands",
        yaml: `
---
config:
- name: configs
  title: Configuration
  test_proc:
    display_name: Is docs.replicated.com reachable?
    command: smtp_auth
  items:
  - name: docs_host
    type: text
    test_proc:
      display_name: Is docs.replicated.com reachable?
      command: resolve_host
      args:
      - docs.replicated.com`,
      },
      {
        description: "item's `test_proc.command` is set to `resolve_host`",
        yaml: `
---
config:
- name: hostname
  title: Hostname
  description: Ensure this domain name is routable on your network.
  items:
  - name: hostname
    title: Hostname
    value: '{{repl ConsoleSetting "tls.hostname"}}'
    type: text
    test_proc:
      display_name: Check DNS
      command: resolve_host
      `,
      },
      {
        description: "no test procs specified",
        yaml: `
---
config:
- name: configs
  title: Configuration
  items:
  - name: docs_host
    type: text
      `,
      },
    ],
  },
};

export const all: YAMLRule[] = [
  configitemTestprocRunOnSave,
  testProcValidCommand,
];
