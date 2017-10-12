import {YAMLRule} from "../lint";

export const configOptionExists: YAMLRule = {
  name: "tmpl-configoption-exists",
  type: "warn",
  message: "Options referenced with `{{repl ConfigOption }}` must be present in the `config` section",
  test: {ConfigOptionExists: {}},
  examples: {
    wrong: [{
      description: "Config Option `not_existent` is not defined in `config` section",
      yaml: `
---
config:
- name: settings
  title: Settings
  items:
  - name: hostname
    title: Hostname
    type: text
    default: ""

components:
- name: App
  cluster: false
  containers:
  - image_name: wlaoh/counter
    name: '{{repl ConfigOption "not_existent" }}'
      `,
    }],
    right: [{
      description: "All uses of `repl ConfigOption` reference defined Config Options",
      yaml: `
---
config:
- name: hostname
  title: Hostname
  description: Ensure this domain name is routable on your network.
  items:
  - name: hostname
    title: Hostname
    type: text
    recommended: false
    default: ""
    value_cmd:
      name: host_ip
      value_at: 0
    when: ""
    affix: ""
    required: false
    items: []
  - name: host_count
    title: Host Count
    type: select_many
    items:
      - name: one_host
        default: "0"
      - name: two_hosts
        default: "0"

components:
- name: App
  cluster: false
  containers:
  - source: public
    image_name: wlaoh/counter
    version: signed
    cmd: '{{ repl ConfigOption "one_host" }}'
    name: '{{repl ConfigOption "hostname" }}'
      `,
    }],
  },
};

export const configOptionNotCircular: YAMLRule = {
  name: "tmpl-configoption-not-circular",
  type: "error",
  message: "A Config Options's fields may not reference the Config Option they describe",
  test: {
    AnyOf: {
      path: "config",
      pred: {
        AnyOf: {
          path: "items",
          pred: {ConfigOptionIsCircular: {}},
        },
      },
    },
  },
  examples: {
    wrong: [{
      description: "Config Option `circular` references `{{repl ConfigOption \"circular\" }}` in it's `when` field",
      yaml: `
---
config:
- name: hostname
  title: Hostname
  items:
  - name: circular
    title: A Circle
    type: text
    when: '{{ repl ConfigOptionEquals "circular" "I heard you liked circles" }}'
      `,
    }],
    right: [{
      description: "No config options reference themselves",
      yaml: `
---
config:
- name: hostname
  title: Hostname
  items:
  - name: left
    title: Left
    type: text
    when: '{{ repl ConfigOptionEquals "right" "right option" }}'
  - name: right
    title: Right
    type: text
    when: '{{ repl ConfigOptionEquals "left" "left option" }}'
      `,
    }],
  },
};

export const configOptionPasswordType: YAMLRule = {
  name: "prop-configitem-type-password",
  type: "warn",
  message: "It looks like this Config Option may contain sensitive data -- consider setting `type: password`",
  test: {
    AnyOf: {
      path: "config",
      pred: {
        AnyOf: {
          path: "items",
          pred: {
            And: {
              preds: [
                {Neq: {path: "type", value: "password"}},
                {
                  Match: {
                    path: "name",
                    pattern: "key|password|access|secret|token",
                  },
                },
              ],
            },
          },
        },
      },
    },
  },
  examples: {
    wrong: [{
      description: "Config Option with name `database_password` should have `type: password`",
      yaml: `
---
config:
- name: database
  title: Database
  items:
  - name: database_password
    title: Password
    type: text
    default: ""
      `,
    }],
    right: [{
      description: "Config Option with name `database_password` correctly has `type: password`",
      yaml: `
---
config:
- name: database
  title: Database
  items:
  - name: database_password
    title: Password
    type: password
    default: ""
      `,
    }],
  },
};

export const configOptionTypeValid: YAMLRule = {
  name: "prop-configitem-type-valid",
  type: "error",
  message: "A Config Item must have a valid type",
  test: {
    AnyOf: {
      path: "config",
      pred: {
        AnyOf: {
          path: "items",
          pred: {
            NotMatch: {
              path: "type",
              pattern: "^(text|label|password|file|bool|select_one|select_many|textarea|select|heading)$",
            },
          },
        },
      },
    },
  },
  examples: {
    wrong: [{
      description: "Config Option type `image_upload` is not valid",
      yaml: `
---
config:
- name: images
  title: Images
  items:
  - name: cat_picture
    title: Cat Picture
    type: image_upload
    default: ""
      `,
    }],
    right: [{
      description: "All config options have valid types",
      yaml: `
---
config:
- name: database
  title: Database
  items:
  - name: database_use_ssl
    title: Use SSL
    type: bool
    default: ""
  - name: database_host
    title: Host
    type: text
    default: ""
  - name: database_ssl_cert
    title: SSL Certificate
    type: textarea
    default: ""
      `,
    }],
  },
};

export const configOptionWhenValid: YAMLRule = {
  name: "prop-configitem-when-valid",
  type: "error",
  message: "A Config Item's when clause must be either empty, a template, a boolean literal, or reference a valid config option with `=` or `!=`",
  test: {WhenExpressionConfigInvalid: {}},
  examples: {
    wrong: [
      {
        description: "Config Option `when` field references non-existent option `ssl_is_good`",
        yaml: `
---
config:
- name: database
  title: Database
  items:
  - name: database_use_ssl
    title: Use SSL
    type: bool
    default: ""
  - name: database_ssl_cert
    title: SSL Certificate
    type: textarea
    default: ""
    when: ssl_is_good=1
      `,
      },
      {
        description: "Config Option `when` field references non-existent option `ssl_is_bad`",
        yaml: `
---
config:
- name: database
  title: Database
  items:
  - name: database_use_ssl
    title: Use SSL
    type: bool
    default: ""
  - name: database_ssl_cert
    title: SSL Certificate
    type: textarea
    default: ""
    when: ssl_is_bad!=1
      `,
      },
      {
        description: "Config Section `when` uses unspported `<` operator on option `auth_source`",
        yaml: `
---
config:
- name: auth
  title: Authentication
  description: Where will user accounts be provisioned
  items:
  - name: auth_source
    default: auth_type_internal
    type: select_one
    items:
    - name: auth_type_internal
      title: Built In
    - name: auth_type_ldap
      title: LDAP
    - name: auth_type_ldap_advanced
      title: LDAP Advanced
- name: ldap_settings
  title: LDAP Server Settings
  when: auth_source>auth_type_ldap
  items: []
      `,
      },
    ],
    right: [
        {
      description: "All config options have valid `when` clauses",
      yaml: `
---
config:
- name: database
  title: Database
  items:
  - name: database_use_ssl
    title: Use SSL
    type: bool
    default: ""
    when: null
    
  - name: database_use_ssl_2
    title: Use SSL
    type: bool
    default: ""
    when: ""
    
  - name: database_use_udp
    title: Use UDP 
    type: boolean
    default: ""
    when: false
    
  - name: database_use_tcp
    title: Use UDP 
    type: boolean
    default: ""
    when: true
    
  - name: database_use_index
    title: Use Index?  
    type: boolean
    default: ""
    when: "false"
    
  - name: database_use_btree
    title: Use Btree? 
    type: boolean
    default: ""
    when: "true"
    
  - name: database_ssl_cert
    title: SSL Certificate
    type: textarea
    default: ""
    when: '{{repl ConfigOptionEquals "database_use_ssl" "1"}}'
    
  - name: database_ssl_key
    title: SSL Key
    type: textarea
    default: ""
    when: database_use_ssl=1
    
  - name: database_strong_password
    title: Require strong password
    type: bool
    default: ""
    when: database_use_ssl!=1
    
      `,
    },
      {
        description: "Config option group's `when` clause references a valid multi-select option",
        yaml: `
---
config:
- name: ssl
  title: SSL Configuration
  description: SSL Options
  items:
  - name: ssl_cipher
    default: ssl_cipher_ecdsa
    type: select_one
    items:
    - name: ssl_cipher_ecdsa
      title: ECDSA
    - name: ssl_cipher_rsa
      title: RSA
- name: database
  title: Database
  when: ssl_cipher=ssl_cipher_ecdsa
  items:
  - name: database_use_ssl
    title: Use SSL
    type: bool
      `,
      },
    ],
  },
};

export const customRequirementIdsUnique: YAMLRule = {
  name: "prop-component-container-names-unique",
  type: "error",
  message: "Custom requirements must have unique ids",
  test: {   CustomRequirementsNotUnique : {}},
  examples: {
    wrong: [
      {
        description: "duplicated ids",
        yaml: `
---
custom_requirements:
- id: alpha
  message: beta
- id: alpha
  message: delta
    `,
      },
      {
        description: "separated duplicated ids",
        yaml: `
---
custom_requirements:
- id: alpha
  message: beta
- id: gamma
  message: delta
- id: alpha
  message: zeta
    `,
      },
    ],
    right: [
      {
        description: "no duplicated ids",
        yaml: `
---
custom_requirements:
- id: alpha
  message: beta
- id: gamma
  message: delta
    `,
      },
    ],
  },
};

export const all: YAMLRule[] = [
  configOptionExists,
  configOptionPasswordType,
  configOptionNotCircular,
  configOptionTypeValid,
  configOptionWhenValid,
  customRequirementIdsUnique,
];
