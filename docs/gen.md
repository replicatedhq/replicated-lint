
## `prop-admincommand-component-exists`

Admin commands must reference an existing component and container





#### Examples:

*Incorrect*: admin command but no containers

```yaml
---
admin_commands:
- alias: aliasecho
  command: [echo]
  component: DB
  container: redis
      
```


*Incorrect*: Admin command but no matching containers

```yaml
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
      
```


*Incorrect*: Old style admin command but no matching containers

```yaml
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
      
```


*Incorrect*: Admin multi command but no matching containers

```yaml
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
      
```


*Incorrect*: Admin source multi command but no matching containers

```yaml
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
      
```



*Correct*: No commands, no containers

```yaml
---
admin_commands: []
components: []
      
```


*Correct*: Admin command with matching container

```yaml
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
      
```


*Correct*: Admin command has `service`, so this is probably a swarm command and thus is not tested here

```yaml
---
admin_commands:
- alias: aliasecho
  command: [echo]
  service: database
      
```


*Correct*: Admin command has `selector`, so this is probably a kubernetes command and thus is not tested here

```yaml
---
admin_commands:
- alias: aliasecho
  command: [echo]
  selector:
    tier: database
      
```


*Correct*: Old style admin command with a matching container

```yaml
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
      
```


*Correct*: Admin multi command with matching container

```yaml
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
      
```


*Correct*: Admin source multi command with matching container

```yaml
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
      
```


    

## `prop-admincommand-shellalias-valid`

An admin command's `alias` must be a valid shell alias





#### Examples:

*Incorrect*: admin command's `alias` contains invalid character `&`

```yaml
---
admin_commands:
- alias: exec&echo
  command: ["echo"]
  run_type: exec
  component: DB
  container: redis
      
```


*Incorrect*: admin command's `alias` contains invalid character `*`

```yaml
---
admin_commands:
- alias: exec**echo
  command: ["echo"]
  run_type: exec
  component: DB
  container: redis
      
```



*Correct*: valid `alias`

```yaml
---
admin_commands:
- alias: redis_echo-command--
  command: ["echo"]
  run_type: exec
  component: DB
  container: redis
      
```


    

## `prop-admincommand-requirements-present`

Basic requirements for an admin command must be present - an `alias` and a `command`





#### Examples:

*Incorrect*: `alias` missing

```yaml
---
admin_commands:
- command: [echo]
  component: DB
  container: redis
      
```


*Incorrect*: `command` missing

```yaml
---
admin_commands:
- alias: echo
  component: DB
  container: redis
      
```



*Correct*: Valid new-style replicated command

```yaml
---
admin_commands:
- alias: echo
  command: [echo]
  component: DB
  container: redis
      
```


    

## `prop-admincommand-old-style-requirements-present`

`image_name` must be present within `admin_commands.image` and `admin_commands.component` must exist if `admin_commands.image` is present





#### Examples:

*Incorrect*: `image` is present, but not `image.image_name`

```yaml
---
admin_commands:
- alias: echo
  command: [echo]
  component: alpha
  image: {}
      
```


*Incorrect*: `image` is present, but not `component`

```yaml
---
admin_commands:
- alias: echo
  command: [echo]
  image:
    image_name: redis
      
```



*Correct*: Valid old-style (depreciated) command

```yaml
---
admin_commands:
- alias: echo
  command: [echo]
  component: DB
  image:
    image_name: redis
      
```


    

## `prop-admincommand-multi-requirements-present`

`container` and `component` must both be present within `admin_commands.replicated` if it is present





#### Examples:

*Incorrect*: `replicated` is present, but not `replicated.component`

```yaml
---
admin_commands:
- alias: echo
  command: [echo]
  replicated:
    container: redis
  swarm:
    service: myapp
      
```


*Incorrect*: `replicated` is present, but not `replicated.container`

```yaml
---
admin_commands:
- alias: echo
  command: [echo]
  replicated:
    component: DB
  swarm:
    service: myapp
      
```



*Correct*: Valid admin multi command

```yaml
---
admin_commands:
- alias: echo
  command: [echo]
  replicated:
    component: DB
    container: redis
  swarm:
    service: myapp
      
```


    

## `prop-admincommand-verbose-requirements-present`

`container` and `component` must both be present within `admin_commands.source.replicated` if it is present





#### Examples:

*Incorrect*: `source.replicated` is present, but not `source.replicated.component`

```yaml
---
admin_commands:
- alias: echo
  command: [echo]
  source:
    replicated:
      container: redis
    swarm:
      service: myapp
      
```


*Incorrect*: `source.replicated` is present, but not `source.replicated.container`

```yaml
---
admin_commands:
- alias: echo
  command: [echo]
  source:
    replicated:
      component: redis
    swarm:
      service: myapp
      
```



*Correct*: Valid verbose admin multi command

```yaml
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
      
```


    

## `prop-admincommand-one-present`

Admin command must use one of several methods to identify the relevant container





#### Examples:

*Incorrect*: None of the options are present

```yaml
---
admin_commands:
- alias: echo
  command: [echo]
      
```



*Correct*: Valid new-style replicated command

```yaml
---
admin_commands:
- alias: echo
  command: [echo]
  component: DB
  container: redis
      
```


*Correct*: Valid old-style (depreciated) admin command

```yaml
---
admin_commands:
- alias: echo
  command: [echo]
  component: DB
  image:
    image_name: redis
      
```


*Correct*: Valid admin multi command

```yaml
---
admin_commands:
- alias: echo
  command: [echo]
  replicated:
    component: DB
    container: redis
  swarm:
    service: myapp
      
```


*Correct*: Valid verbose admin multi command

```yaml
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
      
```


    

## `prop-component-cluster-count`

If `cluster_host_count.min` and `cluster_host_count.max` are both set to 1, then it will be impossible to run multiple instances of this container anywhere in the cluster.





#### Examples:

*Incorrect*: `cluster_host_count.min` and `cluster_host_count.max` are both set to 1

```yaml
---
components:
- name: DB
  cluster: true
  tags:
  - db
  cluster_host_count:
    min: 1
    max: 1
  containers:
  - source: public
    image_name: redis
    version: latest
      
```



*Correct*: `cluster_host_count.min` and `cluster_host_count.max` is a range

```yaml
---
components:
- name: DB
  cluster: true
  tags:
  - db
  cluster_host_count:
    min: 1
    max: 3
  containers:
  - source: public
    image_name: redis
    version: latest
      
```


*Correct*: `cluster_host_count.min` and `cluster_host_count.max` are unset

```yaml
---
components:
- name: DB
  cluster: true
  tags:
  - db
  containers:
  - source: public
    image_name: redis
    version: latest
      
```


    

## `prop-component-cluster-strategy`

A component's cluster `strategy` must be either `random` or `autoscale`





#### Examples:

*Incorrect*: strategy is set to `all-on-one-host`, which is not a supported clustering strategy

```yaml
---
components:
- name: DB
  cluster: true
  tags:
  - db
  cluster_host_count:
    strategy: all-on-one-host
  containers:
  - source: public
    image_name: redis
    version: latest
      
```



*Correct*: `strategy` is set to `autoscale`, a supported option

```yaml
---
components:
- name: DB
  cluster: true
  tags:
  - db
  cluster_host_count:
    strategy: autoscale
  containers:
  - source: public
    image_name: redis
    version: latest
      
```


*Correct*: `strategy` is unset

```yaml
---
components:
- name: DB
  cluster: true
  tags:
  - db
  cluster_host_count: {}
  containers:
  - source: public
    image_name: redis
    version: latest
      
```


    

## `prop-component-volume-path-absolute`

Component volume's `host_path` must be absolute





#### Examples:

*Incorrect*: host path is not absolue

```yaml
---
components:
- name: DB
  host_volumes:
    - host_path: ubuntu/workspace
  containers:
  - source: public
    image_name: mongo
      
```



*Correct*: host path is absolute

```yaml
---
components:
- name: DB
  host_volumes:
    - host_path: /home/ubuntu/workspace
  containers:
  - source: public
    image_name: mongo
      
```


*Correct*: host path is a templated field

```yaml
---
components:
- name: DB
  host_volumes:
    - host_path: '{{repl ConfigOption "custom_volume_path" }}'
  containers:
  - source: public
    image_name: mongo
      
```


    

## `prop-component-cluster-boolstring`

`component.cluster` must be a template or a boolean





#### Examples:

*Incorrect*: `component.cluster` is not a boolean or template

```yaml
---
components:
- name: DB
  cluster: "yes please"
      
```



*Correct*: `component.cluster` absent

```yaml
---
components:
- name: DB
      
```


*Correct*: `component.cluster` boolean

```yaml
---
components:
- name: DB
  cluster: true
      
```


*Correct*: `component.cluster` string boolean

```yaml
---
components:
- name: DB
  cluster: "false"
      
```


*Correct*: `component.cluster` == 0 

```yaml
---
components:
- name: DB
  cluster: "0"
      
```


*Correct*: `component.cluster` == 1 

```yaml
---
components:
- name: DB
  cluster: "1"
      
```


*Correct*: `component.cluster` template

```yaml
---
components:
- name: DB
  cluster: '{{repl ConfigOption "use_cluster"}}'
      
```


    

## `prop-port-min-api-version`

The minimum Replicated API version to use container.ports.public_port is 2.8.0





#### Examples:

*Incorrect*: public_port used and replicated api version set to 2.7.0

```yaml
---
replicated_api_version: "2.7.0"
components:
- name: DB
  containers:
    - source: public
      ports:
        - public_port: "10000"

      
```


*Incorrect*: public_port used and replicated api version set to 1.8.5

```yaml
---
replicated_api_version: "1.8.5"
components:
- name: DB
  containers:
    - source: public
      ports:
        - public_port: "10000"

      
```



*Correct*: public_port used and replicated api version set to 2.8.0

```yaml
---
replicated_api_version: "2.8.0"
components:
- name: DB
  containers:
    - source: public
      ports:
        - public_port: "10000"

      
```


*Correct*: public_port used and replicated api version set to 2.8.1

```yaml
---
replicated_api_version: "2.8.1"
components:
- name: DB
  containers:
    - source: public
      ports:
        - public_port: "10000"

      
```


    

## `prop-component-container-host-count-min-uint`

Container's cluster_host_count property `min` must be an unsigned integer





#### Examples:

*Incorrect*: cluster_host_count.min must be an unsigned integer, and this parses as a negative integer

```yaml
---
components:
- cluster_host_count:
    min: "-2"
      
```



*Correct*: cluster_host_count.min is an unsigned integer

```yaml
---
components:
- cluster_host_count:
    min: 3
      
```


    

## `prop-component-container-host-count-max-uint`

Container's cluster_host_count property `max` must be an unsigned integer





#### Examples:

*Incorrect*: cluster_host_count.max must be an unsigned integer, and this is a negative integer

```yaml
---
components:
- cluster_host_count:
    max: -10
      
```



*Correct*: cluster_host_count.max is an unsigned integer

```yaml
---
components:
- cluster_host_count:
    max: 10
      
```


    

## `prop-component-container-host-count-healthy-uint`

Container's cluster_host_count property `threshold_healthy` must be an unsigned integer





#### Examples:

*Incorrect*: cluster_host_count.threshold_healthy must be an unsigned integer, and this is a string

```yaml
---
components:
- cluster_host_count:
    threshold_healthy: "all"
      
```



*Correct*: cluster_host_count.threshold_healthy is an unsigned integer

```yaml
---
components:
- cluster_host_count:
    threshold_healthy: 5
      
```


    

## `prop-component-container-host-count-degraded-uint`

Container's cluster_host_count property `threshold_degraded` must be an unsigned integer





#### Examples:

*Incorrect*: cluster_host_count.threshold_degraded must be an unsigned integer, and this parses as a float

```yaml
---
components:
- cluster_host_count:
    threshold_degraded: "2.5"
      
```



*Correct*: cluster_host_count.threshold_degraded is an unsigned integer

```yaml
---
components:
- cluster_host_count:
    threshold_degraded: 2
      
```


    

## `prop-cluster-size-public-port`

If using container.ports.public_port, cluster must be disabled or cluster size must be 1





#### Examples:

*Incorrect*: public_port used and cluster_instance_count.max is not 1

```yaml
---
components:
- name: DB
  containers:
  - cluster_instance_count:
      max: 2
    cluster: "true"
    ports:
    - public_port: "10000"
      
```


*Incorrect*: public_port used and cluster_instance_count.max is not 1

```yaml
---
components:
- name: DB
  containers:
  - cluster_instance_count:
      max: "0"
    cluster: true
    ports:
    - public_port: "10000"
      
```



*Correct*: public_port used and cluster_instance_count.max is 1

```yaml
---
components:
- name: DB
  containers:
  - cluster_instance_count:
      max: 1
    cluster: true
    ports:
    - public_port: "10000"
      
```


*Correct*: public_port used and cluster_instance_count.initial is 1

```yaml
---
components:
- name: DB
  containers:
  - cluster_instance_count:
      initial: "1"
    cluster: true
    ports:
    - public_port: "10000"
      
```


*Correct*: public_port used and cluster is set to false

```yaml
---
components:
- name: DB
  containers:
  - cluster: false
    ports:
    - public_port: "10000"
      
```


*Correct*: public_port used and cluster is not set

```yaml
---
components:
- name: DB
  containers:
  - ports:
    - public_port: "10000"
      
```


    

## `tmpl-configoption-exists`

Options referenced with `{{repl ConfigOption }}` must be present in the `config` section





#### Examples:

*Incorrect*: Config Option `not_existent` is not defined in `config` section

```yaml
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
      
```



*Correct*: All uses of `repl ConfigOption` reference defined Config Options

```yaml
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
      
```


    

## `prop-configitem-type-password`

It looks like this Config Option may contain sensitive data -- consider setting `type: password`





#### Examples:

*Incorrect*: Config Option with name `database_password` should have `type: password`

```yaml
---
config:
- name: database
  title: Database
  items:
  - name: database_password
    title: Password
    type: text
    default: ""
      
```



*Correct*: Config Option with name `database_password` correctly has `type: password`

```yaml
---
config:
- name: database
  title: Database
  items:
  - name: database_password
    title: Password
    type: password
    default: ""
      
```


    

## `tmpl-configoption-not-circular`

A Config Options's fields may not reference the Config Option they describe





#### Examples:

*Incorrect*: Config Option `circular` references `{{repl ConfigOption "circular" }}` in it's `when` field

```yaml
---
config:
- name: hostname
  title: Hostname
  items:
  - name: circular
    title: A Circle
    type: text
    when: '{{ repl ConfigOptionEquals "circular" "I heard you liked circles" }}'
      
```



*Correct*: No config options reference themselves

```yaml
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
      
```


    

## `prop-configitem-type-valid`

A Config Item must have a valid type





#### Examples:

*Incorrect*: Config Option type `image_upload` is not valid

```yaml
---
config:
- name: images
  title: Images
  items:
  - name: cat_picture
    title: Cat Picture
    type: image_upload
    default: ""
      
```



*Correct*: All config options have valid types

```yaml
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
      
```


    

## `prop-configitem-when-valid`

A Config Item's when clause must be either empty, a template, a boolean literal, or reference a valid config option with `=` or `!=`





#### Examples:

*Incorrect*: Config Option `when` field references non-existent option `ssl_is_good`

```yaml
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
      
```


*Incorrect*: Config Option `when` field references non-existent option `ssl_is_bad`

```yaml
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
      
```


*Incorrect*: Config Section `when` uses unsupported `<` operator on option `auth_source`

```yaml
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
      
```



*Correct*: All config options have valid `when` clauses

```yaml
---
config:
- name: database
  title: Database
  items:
  - name: database_use_ssl
    title: Use SSL
    type: bool
    default: ""
    when: ""

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

      
```


*Correct*: Config option group's `when` clause references a valid multi-select option

```yaml
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
      
```


    

## `prop-component-container-names-unique`

Custom requirements must have unique ids





#### Examples:

*Incorrect*: duplicated ids

```yaml
---
custom_requirements:
- id: alpha
  message: beta
- id: alpha
  message: delta
    
```


*Incorrect*: separated duplicated ids

```yaml
---
custom_requirements:
- id: alpha
  message: beta
- id: gamma
  message: delta
- id: alpha
  message: zeta
    
```



*Correct*: no duplicated ids

```yaml
---
custom_requirements:
- id: alpha
  message: beta
- id: gamma
  message: delta
    
```


    

## `prop-component-container-unnamed-when-cluster-true`

With clustering turned on, setting `container.name` will prevent multiple instances of the container from being scheduled on a single node





#### Examples:

*Incorrect*: container in component with `cluster_instance_count: 2` should not have a `name` specified

```yaml
---
components:
- name: DB
  cluster: true
  cluster_host_count:
    min: 1
    max: 4
  containers:
  - source: public
    cluster: true
    cluster_instance_count:
      initial: 2
    image_name: redis
    name: database
      
```



*Correct*: container in component with `cluster_instance_count: 2` does not have a `name` specified

```yaml
---
components:
- name: DB
  tags:
  - db
  cluster: true
  cluster_host_count:
    min: 1
    max: 4
  containers:
  - source: public
    cluster_instance_count:
     initial: 2
    image_name: redis
    version: latest
      
```


    

## `prop-component-container-event-subscription-container-exists`

Container event subscriptions must reference an existing component/conatiner





#### Examples:

*Incorrect*: container `redis` has a `publish_event` that references missing container `Pipeline/logstash`

```yaml
---
components:
- name: DB
  containers:
  - source: public
    image_name: mongo
  - source: public
    image_name: redis
    publish_events:
      - name: event
        subscriptions:
        - component: Pipeline
          container: logstash
          action: start
      
```


*Incorrect*: container `redis` has a `publish_event` that references missing container `Pipeline/logstash`

```yaml
---
components:
- name: DB
  containers:
  - source: public
    image_name: mongo
  - source: public
    image_name: logstash
  - source: public
    image_name: redis
    publish_events:
      - name: event
        subscriptions:
        - component: Pipeline
          container: logstash
          action: start
      
```



*Correct*: All containers referenced in `publish_events` have a matching component/container definition

```yaml
---
components:
- name: DB
  containers:
  - source: public
    image_name: mongo
  - source: public
    image_name: redis
    publish_events:
      - name: event
        subscriptions:
        - component: Pipeline
          container: logstash
          action: start
- name: Pipeline
  containers:
  - source: public
    image_name: logstash
      
```


    

## `prop-component-container-volume-modes-valid`

Container volume must not specify conflicting options





#### Examples:

*Incorrect*: volume options contains conflicting options `rw` and `ro`

```yaml
---
components:
- name: DB
  containers:
  - source: public
    image_name: mongo
    volumes:
      - host_path: /tmp
        container_path: /tmp
        options:
          - rw
          - ro
      
```


*Incorrect*: volume options contains conflicting options `z` and `Z`

```yaml
---
components:
- name: DB
  containers:
  - source: public
    image_name: mongo
    volumes:
      - host_path: /tmp
        container_path: /tmp
        options:
          - z
          - Z
      
```


*Incorrect*: volume options contains conflicting options `rshared` and `private`

```yaml
---
components:
- name: DB
  containers:
  - source: public
    image_name: mongo
    volumes:
      - host_path: /tmp
        container_path: /tmp
        options:
          - rshared
          - private
      
```


*Incorrect*: volume options contains duplicated option `nocopy`

```yaml
---
components:
- name: DB
  containers:
  - source: public
    image_name: mongo
    volumes:
      - host_path: /tmp
        container_path: /tmp
        options:
          - nocopy
          - nocopy
      
```



*Correct*: no volumes are defined

```yaml
---
components:
- name: DB
  containers:
  - source: public
    image_name: redis
      
```


*Correct*: no volume options are defined

```yaml
---
components:
- name: DB
  containers:
  - source: public
    image_name: redis
    volumes:
      - host_path: /tmp
        container_path: /tmp
      
```


*Correct*: No conflicting volume options are defined

```yaml
---
components:
- name: DB
  containers:
  - source: public
    image_name: redis
    volumes:
      - host_path: /tmp
        container_path: /tmp
        options:
          - rw
          - Z
          - rshared
          - nocopy
      
```


    

## `prop-component-container-volume-path-absolute`

Container volume's `container_path` must be absolute





#### Examples:

*Incorrect*: container path is not absolue

```yaml
---
components:
- name: DB
  containers:
  - source: public
    image_name: mongo
    volumes:
      - host_path: /tmp
        container_path: ubuntu/workspace
      
```



*Correct*: container path is absolute

```yaml
---
components:
- name: DB
  containers:
  - source: public
    image_name: mongo
    volumes:
      - host_path: /tmp
        container_path: /home/ubuntu/workspace
      
```


*Correct*: container path is a templated field

```yaml
---
components:
- name: DB
  containers:
  - source: public
    image_name: redis
    volumes:
      - host_path: /tmp
        container_path: '{{repl ConfigOption "mount_path"}}'
      
```


    

## `prop-component-container-contenttrust-fingerprint-valid`

A container's content_trust.`public_key_fingerprint` must be a valid RFC4716 fingerprint, e.g. `cb:69:19:cd:76:1f:17:54:92:a4:fc:a9:6f:a5:57:72`





#### Examples:

*Incorrect*: invalid `public_key_fingerprint`

```yaml
---
components:
  - name: DB
    containers:
    - source: public
      name: redis
      version: 3.2.1
      content_trust:
        public_key_fingerprint: flksdjflkds
    
```



*Correct*: valid fingerprint

```yaml
components:
  - name: DB
    containers:
    - source: public
      name: redis
      version: 3.2.1
      content_trust:
        public_key_fingerprint: cb:69:19:cd:76:1f:17:54:92:a4:fc:a9:6f:a5:57:72
    - source: public
      name: redis
      version: 3.2.1
      content_trust:
        public_key_fingerprint: aa:9c:75:89:de:46:3a:92:08:c7:ba:9a:29:fb:12:cc
    
```


    

## `prop-component-container-volumesfrom-exists`

A container's `volumes_from` must reference an existing container's `name` field





#### Examples:

*Incorrect*: `volumes_from` references own container

```yaml
---
components:
  - name: DB
    containers:
    - source: public
      image_name: redis
      name: redis
      version: 3.2.1
      volumes_from:
        - redis
    
```


*Incorrect*: `volumes_from` references non-existing container

```yaml
---
components:
  - name: DB
    containers:
    - source: public
      image_name: redis
      name: redis
      version: 3.2.1
      volumes_from:
        - mongo
    
```



*Correct*: valid `volumes_from` reference

```yaml
components:
  - name: DB
    containers:
    - source: public
      image_name: redis
      name: redis
      version: 3.2.1
      volumes_from:
        - mongo
    - source: public
      image_name: mongo
      name: mongo
      version: 3.2.1
    
```


    

## `prop-component-container-names-unique`

A component's container's must have unique `name` entries





#### Examples:

*Incorrect*: duplicated names in single component

```yaml
---
components:
  - name: DB
    containers:
    - source: public
      image_name: redis
      name: db
      version: 3.2.1
    - source: public
      image_name: mongo
      name: db
      version: latest
    
```


*Incorrect*: duplicated names across components

```yaml
---
components:
  - name: DB
    containers:
    - source: public
      image_name: redis
      name: db
      version: 3.2.1
  - name: MoreDB
    containers:
    - source: public
      image_name: mongo
      name: db
      version: latest
    
```



*Correct*: no duplicated names

```yaml
components:
  - name: UI
    containers:
    - source: public
      image_name: nginx
      name: ui
      version: 1.10.2
  - name: DB
    containers:
    - source: public
      image_name: redis
      name: redis
      version: 3.2.1
    - source: public
      image_name: mongo
      name: mongo
      version: "3.2"
    
```


    

## `prop-component-container-instance-count-initial-uint`

Container's cluster_instance_count property `initial` must be an unsigned integer





#### Examples:

*Incorrect*: cluster_instance_count.initial must be an unsigned integer, and this is a float

```yaml
---
components:
- containers:
  - cluster_instance_count:
      initial: 3.5
      
```


*Incorrect*: cluster_instance_count.initial must be an unsigned integer, and this parses as a negative integer

```yaml
---
components:
- containers:
  - cluster_instance_count:
      initial: "-2"
      
```



*Correct*: cluster_instance_count.initial is an unsigned integer

```yaml
---
components:
- containers:
  - cluster_instance_count:
      initial: 3
      
```


    

## `prop-component-container-instance-count-max-uint`

Container's cluster_instance_count property `max` must be an unsigned integer





#### Examples:

*Incorrect*: cluster_instance_count.max must be an unsigned integer, and this is a negative integer

```yaml
---
components:
- containers:
  - cluster_instance_count:
      max: -10
      
```



*Correct*: cluster_instance_count.max is an unsigned integer

```yaml
---
components:
- containers:
  - cluster_instance_count:
      max: 10
      
```


    

## `prop-component-container-instance-count-degraded-uint`

Container's cluster_instance_count property `threshold_degraded` must be an unsigned integer





#### Examples:

*Incorrect*: cluster_instance_count.threshold_degraded must be an unsigned integer, and this parses as a float

```yaml
---
components:
- containers:
  - cluster_instance_count:
      threshold_degraded: "2.8"
      
```



*Correct*: cluster_instance_count.threshold_degraded is an unsigned integer

```yaml
---
components:
- containers:
  - cluster_instance_count:
      threshold_degraded: "2"
      
```


    

## `prop-component-container-instance-count-healthy-uint`

Container's cluster_instance_count property `threshold_healthy` must be an unsigned integer





#### Examples:

*Incorrect*: cluster_instance_count.threshold_healthy must be an unsigned integer, and this is a string

```yaml
---
components:
- containers:
  - cluster_instance_count:
      threshold_healthy: "all"
      
```



*Correct*: cluster_instance_count.threshold_healthy is an unsigned integer

```yaml
---
components:
- containers:
  - cluster_instance_count:
      threshold_healthy: "5"
      
```


    

## `prop-component-container-volumesfrom-subscription-exists`

A container's `volumes_from` must reference a container that subscribes to it





#### Examples:

*Incorrect*: `volumes_from` references container that does not exist

```yaml
---
components:
- name: DB
  containers:
  - name: notalpha
    image_name: irrelevant
    publish_events:
    - subscriptions:
      - component: DB
        container: beta
  - image_name: beta
    volumes_from:
    - alpha
    
```


*Incorrect*: `volumes_from` references container that does not subscribe to it

```yaml
---
components:
- name: DB
  containers:
  - name: alpha
    image_name: irrelevant
    publish_events:
    - subscriptions:
      - component: DB
        container: notalpine
  - image_name: alpine
    volumes_from:
    - alpha
    
```


*Incorrect*: `volumes_from` references multiple containers, of which one is not valid

```yaml
---
components:
- name: DB
  containers:
  - name: alpha
    image_name: irrelevant
    publish_events:
    - subscriptions:
      - component: DB
        container: beta
  - image_name: beta
    volumes_from:
    - alpha
    - gamma
    
```


*Incorrect*: `volumes_from` references itself

```yaml
---
components:
- name: DB
  containers:
  - name: alphaname
    image_name: alpha
    volumes_from:
    - alpha
    publish_events:
    - subscriptions:
      - component: DB
        container: alphaname
    
```



*Correct*: valid `volumes_from` reference

```yaml
---
components:
- name: DB
  containers:
  - name: alpha
    image_name: irrelevant
    publish_events:
    - subscriptions:
      - component: DB
        container: beta
  - image_name: beta
    volumes_from:
    - alpha
    
```


*Correct*: multiple valid `volumes_from` references

```yaml
---
components:
- name: DB
  containers:
  - name: alpha
    image_name: irrelevant
    publish_events:
    - subscriptions:
      - component: DB
        container: beta
      - component: DB
        container: gamma
  - image_name: gamma
    volumes_from:
    - alpha
  - image_name: beta
    volumes_from:
    - alpha
    
```


*Correct*: Chained dependency for `volumes_from` across components

```yaml
---
components:
- name: DB
  containers:
  - name: alpha
    image_name: irrelevant
    publish_events:
    - subscriptions:
      - component: DB2
        container: gamma
  - image_name: beta
    volumes_from:
    - alpha
- name: DB2
  containers:
  - image_name: gamma
    publish_events:
    - subscriptions:
      - component: DB
        container: beta
    
```


    

## `prop-component-container-volume-ephemeral-type-check`

is_ephemeral must be a bool string, boolean literal, or template function





#### Examples:

*Incorrect*: `yes` is not a valid value for `is_ephemeral`

```yaml
---
components:
- containers:
  - volumes:
    - is_ephemeral: "yes"
      
```



*Correct*: `"true"`, `true`, `"false"` and `false` are all valid values for `is_ephemeral`

```yaml
---
components:
- containers:
  - volumes:
    - is_ephemeral: "true"
    - is_ephemeral: "false"
    - is_ephemeral: true
    - is_ephemeral: false
      
```


*Correct*: `{{repl AppID}}` is a valid template function and is thus a valid if questionable value for `is_ephemeral`

```yaml
---
components:
- containers:
  - volumes:
    - is_ephemeral: "{{repl AppID}}"
      
```


    

## `prop-component-container-volume-excluded-type-check`

is_excluded_from_backup must be a bool string, boolean literal, or template function





#### Examples:

*Incorrect*: `yes` is not a valid value for `is_excluded_from_backup`

```yaml
---
components:
- containers:
  - volumes:
    - is_excluded_from_backup: "yes"
      
```



*Correct*: `"true"`, `true`, `"false"` and `false` are all valid values for `is_excluded_from_backup`

```yaml
---
components:
- containers:
  - volumes:
    - is_excluded_from_backup: "true"
    - is_excluded_from_backup: "false"
    - is_excluded_from_backup: true
    - is_excluded_from_backup: false
      
```


*Correct*: `{{repl AppID}}` is a valid template function and is thus a valid value for `is_excluded_from_backup`

```yaml
---
components:
- containers:
  - volumes:
    - is_excluded_from_backup: "{{repl AppID}}"
      
```


    

## `prop-component-container-envvars-staticval-deprecated`

`static_val` is deprecated, use `value` instead





#### Examples:

*Incorrect*: `static_val` deprecated

```yaml
---
components:
- containers:
  - env_vars:
    - static_val: blah
      value: blah
      
```


*Incorrect*: `static_val` deprecated empty

```yaml
---
components:
- containers:
  - env_vars:
    - static_val: ""
      value: blah
      
```



*Correct*: `value` preferred over `static_val`

```yaml
---
components:
- containers:
  - name: first
    env_vars:
    - value: "blah"
      
```


    

## `prop-component-container-shm-size-uint`

Container's property shm_size must be an unsigned integer





#### Examples:

*Incorrect*: shm_size must be an unsigned integer, and this is a negative integer

```yaml
---
components:
- containers:
  - shm_size: -10
      
```



*Correct*: shm_size is an unsigned integer

```yaml
---
components:
- containers:
  - shm_size: 10
      
```


    

## `prop-hostreq-docker-version-valid`

`host_requirements.docker_version` must be a valid docker version specification





#### Examples:

*Incorrect*: Invalid docker version the.good.one, not semver

```yaml
---
host_requirements:
  docker_version: the.good.one
      
```


*Incorrect*: Invalid docker version `0.1.1`

```yaml
---
host_requirements:
  docker_version: 0.1.1
      
```


*Incorrect*: Invalid docker version `1.09.1`, no leading zeros

```yaml
---
host_requirements:
  docker_version: 1.09.1
      
```


*Incorrect*: Invalid docker version `1.14.1`, never released

```yaml
---
host_requirements:
  docker_version: 1.14.1
      
```


*Incorrect*: Invalid docker version `17.13.1-ce`, 13 is not a valid month

```yaml
---
host_requirements:
  docker_version: 17.13.1-ce
      
```



*Correct*: Valid docker version

```yaml
---
host_requirements:
  docker_version: 17.09.1-ce
      
```


*Correct*: Valid docker version

```yaml
---
host_requirements:
  docker_version: 17.09.1
      
```


*Correct*: Valid docker version

```yaml
---
host_requirements:
  docker_version: 1.12.1
      
```


    

## `prop-hostreq-replicated-version-semver-valid`

`host_requirements.replicated_version` must be a semver range specification





#### Examples:

*Incorrect*: Invalid replicated version `the.good.one`, not semver

```yaml
---
host_requirements:
  replicated_version: the.good.one
      
```


*Incorrect*: Invalid replicated version `alpha-0.1.1`

```yaml
---
host_requirements:
  replicated_version: alpha-0.1.1
      
```



*Correct*: valid version `2.x`

```yaml
---
host_requirements:
    replicated_version: 2.x
      
```


*Correct*: valid version `2.5.3`

```yaml
---
host_requirements:
    replicated_version: 2.5.3
      
```


*Correct*: valid version `<=2.5.3 >2.5.x`

```yaml
---
host_requirements:
    replicated_version: '<=2.5.3 >2.5.x'
      
```


*Correct*: valid version `1.x`

```yaml
---
host_requirements:
    replicated_version: '1.x'
      
```


*Correct*: valid version `=1.x`

```yaml
---
host_requirements:
    replicated_version: '=1.x'
      
```


*Correct*: valid version `>=1.4 <1.7`

```yaml
---
host_requirements:
    replicated_version: '>=1.4 <1.7'
      
```


    

## `prop-hostreq-system-ram-specs-valid`

`host_requirements.memory` must be a positive decimal with a unit of measurement like M, MB, G, or GB





#### Examples:

*Incorrect*: Invalid memory size, not a properly formatted size

```yaml
---
host_requirements:
  memory: "128"
      
```


*Incorrect*: Invalid memory size, too many digits past the decimal point

```yaml
---
host_requirements:
  memory: 0.0625TB
      
```



*Correct*: Valid memory size, 2.0TB

```yaml
---
host_requirements:
  memory: 2.0TB
      
```


*Correct*: Valid memory size, 128KB

```yaml
---
host_requirements:
  memory: 128KB
      
```


    

## `prop-hostreq-system-storage-specs-valid`

`host_requirements.disk_space` be a positive decimal with a unit of measurement like M, MB, G, or GB





#### Examples:

*Incorrect*: Invalid disk size, not a properly formatted size

```yaml
---
host_requirements:
  disk_space: "128"
      
```


*Incorrect*: Invalid disk size, too many digits past the decimal point

```yaml
---
host_requirements:
  disk_space: 0.0625EB
      
```



*Correct*: Valid disk size, 20.0TB

```yaml
---
host_requirements:
  disk_space: 20.0TB
      
```


*Correct*: Valid disk size, 128GB

```yaml
---
host_requirements:
  disk_space: 128GB
      
```


    

## `prop-kubernetes-requirements-version-valid`

`kubernetes.requirements.server_version` must be a valid semver specification





#### Examples:

*Incorrect*: `server_version` is not valid semver

```yaml
---
kubernetes:
  requirements:
    server_version: 17.01.1-ce
      
```



*Correct*: valid version `1.5.3`

```yaml
---
kubernetes:
  requirements:
    server_version: 1.5.3
      
```


*Correct*: valid version `<=1.5.3 >1.5.x`

```yaml
---
kubernetes:
  requirements:
    server_version: '<=1.5.3 >1.5.x'
      
```


*Correct*: valid version `1.x`

```yaml
---
kubernetes:
  requirements:
    server_version: '1.x'
      
```


*Correct*: valid version `=1.x`

```yaml
---
kubernetes:
  requirements:
    server_version: '=1.x'
      
```


*Correct*: valid version `>=1.4 <1.7`

```yaml
---
kubernetes:
  requirements:
    server_version: '>=1.4 <1.7'
      
```


    

## `prop-kubernetes-total-memory-valid`

`kubernetes.requirements.total_memory` must be expressed as a plain integer, a fixed-point integer, or the power-of-two equivalent (e.g. 128974848, 129e6, 129M, 123Mi)





#### Examples:

*Incorrect*: Invalid memory size, too many digits past the decimal point

```yaml
---
kubernetes:
  requirements:
    total_memory: 0.0625TB
      
```



*Correct*: Valid memory size, 2.0TB

```yaml
---
kubernetes:
  requirements:
    total_memory: 2.0TB
      
```


*Correct*: Valid memory size, 128KB

```yaml
---
kubernetes:
  requirements:
    total_memory: 128KB
      
```


*Correct*: Valid kubernetes memory size, 128

```yaml
---
kubernetes:
  requirements:
    total_memory: "128"
      
```


*Correct*: Valid kubernetes memory size, 129e6

```yaml
---
kubernetes:
  requirements:
    total_memory: "129e6"
      
```


    

## `prop-kubernetes-persistent-storage-valid`

`kubernetes.persistent_volume_claims.storage` must be expressed as a plain integer, a fixed-point integer, or the power-of-two equivalent (e.g. 128974848, 129e6, 129M, 123Mi)





#### Examples:

*Incorrect*: Invalid storage size, too many digits past the decimal point

```yaml
---
kubernetes:
  persistent_volume_claims:
  - storage: 0.0625TB
      
```



*Correct*: Valid storage size, 2.0TB

```yaml
---
kubernetes:
  persistent_volume_claims:
  - storage: 2.0TB
      
```


*Correct*: Valid storage size, 128KB

```yaml
---
kubernetes:
  persistent_volume_claims:
  - storage: 128KB
      
```


*Correct*: Valid kubernetes storage size, 128

```yaml
---
kubernetes:
  persistent_volume_claims:
  - storage: "128"
      
```


*Correct*: Valid kubernetes storage size, 129e6

```yaml
---
kubernetes:
  persistent_volume_claims:
  - storage: "129e6"
      
```


*Correct*: No storage size given

```yaml
---
kubernetes:
  persistent_volume_claims: []
      
```


    

## `prop-monitors-cpuacct-container-exists`

Entries in `monitors.cpuacct` must have matching component+container or the scheduler must be swarm





#### Examples:

*Incorrect*: `cpuacct` monitor references a component that does not exist

```yaml
---
components:
  - name: Kibana
    containers:
      - image_name: quay.io/getelk/logstash
monitors:
  cpuacct:
    - Logstash,quay.io/getelk/logstash
    
```


*Incorrect*: `cpuacct` monitor references a container that does not exist

```yaml
---
components:
  - name: Logstash
    containers:
      - image_name: quay.io/getelk/elasticsearch
monitors:
  cpuacct:
    - Logstash,quay.io/getelk/logstash
    
```



*Correct*: All `cpuacct` monitors reference existing containers

```yaml
---
components:
  - name: Logstash
    containers:
      - image_name: quay.io/getelk/logstash
monitors:
  cpuacct:
    - Logstash,quay.io/getelk/logstash
      
```


*Correct*: All `cpuacct` monitors are valid if the scheduler is swarm

```yaml
---
monitors:
  cpuacct:
    - swarmstash
swarm:
  minimum_node_count: "1"
      
```


*Correct*: No monitors, no containers

```yaml
---
monitors:
  cpuacct: []
      
```


    

## `prop-monitors-memory-container-exists`

Entries in `monitors.memory` must have matching component+container or the scheduler must be swarm





#### Examples:

*Incorrect*: `memacct` monitor references a component that does not exist

```yaml
---
components:
  - name: Kibana
    containers:
      - image_name: quay.io/getelk/logstash
monitors:
  memory:
    - Logstash,quay.io/getelk/logstash
    
```


*Incorrect*: `memacct` monitor references a container that does not exist

```yaml
---
components:
  - name: Logstash
    containers:
      - image_name: quay.io/getelk/elasticsearch
monitors:
  memory:
    - Logstash,quay.io/getelk/logstash
    
```



*Correct*: All `memacct` monitors reference existing containers

```yaml
---
components:
  - name: Logstash
    containers:
      - image_name: quay.io/getelk/logstash
monitors:
  memory:
    - Logstash,quay.io/getelk/logstash
      
```


*Correct*: All `memacct` monitors are valid if the scheduler is swarm

```yaml
---
monitors:
  memory:
    - swarmstash
swarm:
  minimum_node_count: "1"
      
```


    

## `prop-monitors-custom-has-target`

Entries in `monitors.custom` must have at least one target





#### Examples:

*Incorrect*: custom monitor has no targets

```yaml
---
monitors:
  custom:
    - name: whatever
      targets: []
    
```


*Incorrect*: single target is empty

```yaml
---
monitors:
  custom:
    - name: whatever
      target: ""
    
```


*Incorrect*: custom monitor has null targets

```yaml
---
monitors:
  custom:
    - name: whatever
    
```



*Correct*: All custom monitors have at least one target

```yaml
---
components:
  - name: Logstash
    containers:
      - image_name: quay.io/getelk/logstash
monitors:
  custom:
    - name: whenever
      target: stats.gauges.myapp100.ping.*
    - name: whatever
      targets:
        - stats.gauges.myapp100.ping.*
        - movingAverage(stats.gauges.myapp100.ping.*,60)
        - movingAverage(stats.gauges.myapp100.ping.*,600)
      
```


    

## `prop-monitors-custom-has-target`

Entries in `monitors.custom` have valid color specifications





#### Examples:

*Incorrect*: custom monitor has invalid `stroke_color`

```yaml
---
monitors:
  custom:
    - name: whatever
      targets: [stats.mystat.*]
      display:
        stroke_color: blue
    
```


*Incorrect*: custom monitor has invalid `fill_color`

```yaml
---
monitors:
  custom:
    - name: whatever
      targets: [stats.mystat.*]
      display:
        fill_color: blue
    
```



*Correct*: custom monitor has valid color specs

```yaml
---
components:
  - name: Logstash
    containers:
      - image_name: quay.io/getelk/logstash
monitors:
  custom:
    - name: whenever
      target: stats.gauges.myapp100.ping.*
    - name: whatever
      targets:
        - stats.gauges.myapp100.ping.*
        - movingAverage(stats.gauges.myapp100.ping.*,60)
        - movingAverage(stats.gauges.myapp100.ping.*,600)
      display:
        fill_color: '#44BB66'
        stroke_color: '#444444'
      
```


    

## `prop-statsd-port-valid`

If specified, `statsd.port` must be a valid TCP port





#### Examples:

*Incorrect*: `statsd.port` is negative

```yaml
---
statsd:
  port: -100
    
```


*Incorrect*: `statsd.port` is above the maximum tcp port range

```yaml
---
statsd:
  port: 100000
    
```



*Correct*: statsd port valid

```yaml
---
statsd:
  port: 43221
      
```


*Correct*: statsd port not specified

```yaml
---
statsd: {}
      
```


    

## `prop-graphite-port-valid`

If specified, `graphite.port` must be a valid TCP port





#### Examples:

*Incorrect*: `graphite.port` is negative

```yaml
---
graphite:
  port: -100
    
```


*Incorrect*: `graphite.port` is above the maximum tcp port range

```yaml
---
graphite:
  port: 100000
    
```



*Correct*: graphite port valid

```yaml
---
graphite:
  port: 43221
      
```


*Correct*: graphite port not specified

```yaml
---
graphite: {}
      
```


    

## `prop-custommetric-retention-valid`

If specified, a custom_metric's `retention` must be in a valid format, e.g.`15s:7d,1m:21d,15m:5y`





#### Examples:

*Incorrect*: retention invalid

```yaml
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: 15 second resolution for  10 days
    aggregation_method: "average"
    xfiles_factor: 0.3
    
```



*Correct*: no custom metrics

```yaml
---
custom_metrics: []
      
```


*Correct*: custom retention not specified

```yaml
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    aggregation_method: "average"
    xfiles_factor: 0.3

      
```


*Correct*: minimal valid retention

```yaml
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: 15s:7d
    aggregation_method: "average"
    xfiles_factor: 0.3

      
```


*Correct*: valid retention with spaces

```yaml
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: 15s:7d, 1m:22d, 15m:2h
    aggregation_method: "average"
    xfiles_factor: 0.3

      
```


*Correct*: valid retention 1

```yaml
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: 15s:7d,1m:21d,15m:5y
    aggregation_method: "average"
    xfiles_factor: 0.3

      
```


*Correct*: valid retention 2

```yaml
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: "1m:1h,1h:7d,1d:90d"
    aggregation_method: "average"
    xfiles_factor: 0.3

      
```


*Correct*: valid retention 3

```yaml
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: "1s:10m,1m:4h,1h:30d"
    aggregation_method: "average"
    xfiles_factor: 0.3

      
```


*Correct*: valid retention 4

```yaml
---
custom_metrics:
  - target: stats.gauges.myapp100.ping.*
    retention: "10s:10m,1m:20m,1h:30d"
    aggregation_method: "average"
    xfiles_factor: 0.3

      
```


    

## `prop-custommetric-aggregation-valid`

If specified, a `custom_metric`'s aggregation must one of `average`, `sum`, `min`, `max`, `last`





#### Examples:

*Incorrect*: aggregation invalid

```yaml
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: 15s:7d,1m:14d,15m:1y
    aggregation_method: "middle-out"
    xfiles_factor: 0.3
    
```



*Correct*: no custom metrics

```yaml
---
custom_metrics: []
      
```


*Correct*: custom aggregation not specified

```yaml
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*

      
```


*Correct*: aggregation == `sum`

```yaml
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: 15s:7d
    aggregation_method: "sum"
    xfiles_factor: 0.3

      
```


*Correct*: aggregation == `average`

```yaml
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: 15s:7d, 1m:22d, 15m:2h
    aggregation_method: "average"
    xfiles_factor: 0.3

      
```


*Correct*: aggregation == `max`

```yaml
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: 15s:7d,1m:21d,15m:5y
    aggregation_method: "max"
    xfiles_factor: 0.3

      
```


*Correct*: aggregation == `min`

```yaml
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: "1m:1h,1h:7d,1d:90d"
    aggregation_method: "min"
    xfiles_factor: 0.3

      
```


*Correct*: aggregation == `last`

```yaml
---
custom_metrics:
  - target: stats.gauges.ping.rtt.*
    retention: "1s:10m,1m:4h,1h:30d"
    aggregation_method: "last"
    xfiles_factor: 0.3
      
```


    

## `prop-monitors-custom-display-labelscale-valid`

If specified, a custom monitor's `display.label_scale` must be one of `metric`, `none` or a parseable `float`





#### Examples:

*Incorrect*: `label_scale` == `kfbr392`, not a valid float

```yaml
---
monitors:
  custom:
    - target: stats.gauges.kfbr392.*
      display:
        label_scale: kfbr392
    
```


*Incorrect*: `label_scale` == `1.1.02`, not a valid float

```yaml
---
monitors:
  custom:
    - target: stats.gauges.kfbr392.*
      display:
        label_scale: 1.1.02
    
```



*Correct*: `label_scale` == `metric`

```yaml
---
monitors:
  custom:
    - target: stats.gauges.kfbr392.*
      display:
        label_scale: metric
    
```


*Correct*: `label_scale` == `none`

```yaml
---
monitors:
  custom:
    - target: stats.gauges.kfbr392.*
      display:
        label_scale: none
    
```


*Correct*: `label_scale` == `1.84`

```yaml
---
monitors:
  custom:
    - target: stats.gauges.kfbr392.*
      display:
        label_scale: 1.84
    
```


*Correct*: `label_scale` == `.1`

```yaml
---
monitors:
  custom:
    - target: stats.gauges.kfbr392.*
      display:
        label_scale: .1
    
```


*Correct*: `label_scale` == `12`

```yaml
---
monitors:
  custom:
    - target: stats.gauges.kfbr392.*
      display:
        label_scale: 12
    
```


*Correct*: `label_scale` == `-12.23131131`

```yaml
---
monitors:
  custom:
    - target: stats.gauges.kfbr392.*
      display:
        label_scale: -12.23131131
    
```


    

## `prop-replicated-api-version-present`

`replicated_api_version` must be present and be a valid Semver specification





#### Examples:

*Incorrect*: `replicated_api_version` is missing

```yaml
---
{}
    
```


*Incorrect*: `replicated_api_version` is not valid semver

```yaml
---
replicated_api_version: kfbr392
    
```



*Correct*: `replicated_api_version` is valid semver

```yaml
---
replicated_api_version: 2.9.0
      
```


    

## `prop-image-contenttrust-fingerprint-valid`

An image's `content_trust.public_key_fingerprint` must be a valid RFC4716 fingerprint, e.g. `cb:69:19:cd:76:1f:17:54:92:a4:fc:a9:6f:a5:57:72`





#### Examples:

*Incorrect*: 

```yaml
---
images:
  - source: public
    name: redis
    tag: 3.2.1
    content_trust:
      public_key_fingerprint: flksdjflkds
    
```



*Correct*: valid fingerprint

```yaml
---
images:
  - source: public
    name: redis
    tag: 3.2.1
    content_trust:
      public_key_fingerprint: cb:69:19:cd:76:1f:17:54:92:a4:fc:a9:6f:a5:57:72
    
```


    

## `prop-properties-shellalias-valid`

`properties.shell_alias` must be a valid shell alias





#### Examples:

*Incorrect*: alias contains invalid character `&`

```yaml
---
properties:
  shell_alias: exec&echo
      
```


*Incorrect*: admin command contains invalid character `*`

```yaml
---
properties:
  shell_alias: exec**echo
      
```



*Correct*: valid alias

```yaml
---
properties:
  shell_alias: do_a-replicated_thing---plz
      
```


    

## `prop-properties-logourl-valid`

Logo URL must be a valid http or https URL





#### Examples:

*Incorrect*: protocol not in [`http`, `https`]

```yaml
---
properties:
  logo_url: yo://mylogo.com/logo.png
      
```


*Incorrect*: invalid url

```yaml
---
properties:
  logo_url: kfbr392
      
```


*Incorrect*: invalid url

```yaml
---
properties:
  logo_url: http://i.goo gr.com/rnZ3Ftf.png
      
```



*Correct*: valid url

```yaml
---
properties:
  logo_url: http://x.y+a.com:3000/b/c
      
```


    

## `mesg-yaml-valid`

Document must be valid YAML. This could occur for many reasons, consult individual error details for more info.



#### More Info:

- http://yaml.org/spec/
- http://docs.ansible.com/ansible/latest/YAMLSyntax.html

#### Examples:

*Incorrect*: Document must have valid syntax

```yaml
---
}}{{}}{{
          
```




    

## `mesg-yaml-not-empty`

Document must not be empty





#### Examples:

*Incorrect*: Document may not be empty

```yaml
---
          
```




    

## `prop-schema-valid`

Document must conform to the Replicated YAML document schema



#### More Info:

- https://help.replicated.com/api/yaml#Schema

#### Examples:

*Incorrect*: Property `deploy_this_great_app` is not present in the schema

```yaml
---
deploy_this_great_app: plz&thx
          
```


*Incorrect*: Property `replicated_api_version` is not of correct type, should be `string`, but `2.11` is parsed as type `float`

```yaml
---
replicated_api_version: 2.11
          
```


*Incorrect*: `2` is not a valid value for `is_ephemeral`

```yaml
---
components:
- containers:
- volumes:
  - is_ephemeral: 2
    
```


*Incorrect*: `1` is not a valid value for `is_ephemeral`, though `"1"` is

```yaml
---
components:
- containers:
- volumes:
  - is_ephemeral: 1
    
```


*Incorrect*: `2` is not a valid value for `is_excluded_from_backup`

```yaml
---
components:
- containers:
- volumes:
  - is_excluded_from_backup: 2
    
```


*Incorrect*: `1` is not a valid value for `is_excluded_from_backup`, though `"1"` is

```yaml
---
components:
- containers:
- volumes:
  - is_excluded_from_backup: 1
    
```


*Incorrect*: `statsd.port` is not an integer

```yaml
---
statsd:
port: foo
  
```


*Incorrect*: `graphite.port` is not an integer

```yaml
---
graphite:
port: foo
  
```


*Incorrect*: cluster_host_count.min must be an unsigned integer, and this is a boolean

```yaml
---
components:
- cluster_host_count:
  min: false
    
```



*Correct*: container.version can be a string or a number

```yaml
---
components:
- containers:
  - image_name: kfbr
    version: 392
  - image_name: redis
    version: latest
    
```


    

## `prop-swarm-secret-name-value`

Swarm secrets require both a `name` and a `value` to function.





#### Examples:

*Incorrect*: A swarm secret must contain a `name` and a `value`, and this only has a `name`

```yaml
---
replicated_api_version: "2.7.0"
swarm:
  secrets:
  - name: foo
        
```


*Incorrect*: A swarm secret must contain a `name` and a `value`, and this `name` is empty

```yaml
---
replicated_api_version: "2.7.0"
swarm:
  secrets:
  - name: ""
    value: bar
        
```


*Incorrect*: A swarm secret must contain a `name` and a `value` even when labels exist

```yaml
---
replicated_api_version: "2.7.0"
swarm:
  secrets:
  - name: ""
    value: bar
    labels:
      alpha: beta
        
```



*Correct*: This swarm secret contains a `name` and a `value`

```yaml
---
replicated_api_version: "2.7.0"
swarm:
  secrets:
  - name: foo
    value: bar
        
```


    

## `prop-swarm-secret-label-key`

Labels within a swarm secret must have keys.





#### Examples:

*Incorrect*: Swarm secret labels must not be the empty string

```yaml
---
replicated_api_version: "2.7.0"
swarm:
  secrets:
  - name: foo
    value: bar
    labels:
      alpha: beta
      "": delta
        
```



*Correct*: These swarm secret labels are not the empty string

```yaml
---
replicated_api_version: "2.7.0"
swarm:
  secrets:
  - name: foo
    value: bar
    labels:
      alpha: beta
      gamma: delta
        
```


    

## `prop-swarm-config-name-value`

Swarm configs require both a `name` and a `value` to function.





#### Examples:

*Incorrect*: A swarm config must contain a `name` and a `value`, and this only has a `name`

```yaml
---
replicated_api_version: "2.7.0"
swarm:
  configs:
  - name: foo
        
```


*Incorrect*: A swarm config must contain a `name` and a `value`, and this `name` is empty

```yaml
---
replicated_api_version: "2.7.0"
swarm:
  configs:
  - name: ""
    value: bar
        
```


*Incorrect*: A swarm config must contain a `name` and a `value` even when labels exist

```yaml
---
replicated_api_version: "2.7.0"
swarm:
  configs:
  - name: ""
    value: bar
    labels:
      alpha: beta
        
```



*Correct*: This swarm config contains a `name` and a `value`

```yaml
---
replicated_api_version: "2.7.0"
swarm:
  configs:
  - name: foo
    value: bar
        
```


    

## `prop-swarm-config-label-key`

Labels within a swarm config must have keys.





#### Examples:

*Incorrect*: Swarm config labels must not be the empty string

```yaml
---
replicated_api_version: "2.7.0"
swarm:
  configs:
  - name: foo
    value: bar
    labels:
      alpha: beta
      "": delta
        
```



*Correct*: These swarm config labels are not the empty string

```yaml
---
replicated_api_version: "2.7.0"
swarm:
  configs:
  - name: foo
    value: bar
    labels:
      alpha: beta
      gamma: delta
        
```


    

## `prop-configitem-testproc-run-on-save`

If a config item's `test_proc.run_on_save` is not set to `true`, test_proc's will not be checked automatically. Consider setting to `true` to automatically validate inputs



#### More Info:

- https://www.replicated.com/docs/packaging-an-application/test-procs/

#### Examples:

*Incorrect*: A config item's `test_proc.run_on_save` set to `false`

```yaml
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
    
```


*Incorrect*: A config groups's `test_proc.run_on_save` set to `false`

```yaml
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
    
```



*Correct*: All `test_procs` have `run_on_save` == `true`

```yaml
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
      
```


*Correct*: No config items have test procs

```yaml
---
config:
- name: configs
  title: Configuration
  items:
  - name: phone_number
    type: text
      
```


    

## `prop-configitem-testproc-command-valid`

A `test_proc`'s command entry must be a valid command.



#### More Info:

- https://www.replicated.com/docs/packaging-an-application/test-procs/

#### Examples:

*Incorrect*: config item's `test_proc.command` is set to `json_is_good`, which is not a supported Test Proc command

```yaml
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
    
```


*Incorrect*: config group's `test_proc.command` is set to `all_the_json_is_good`, which is not a supported Test Proc command

```yaml
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
    
```



*Correct*: item and group's `test_proc.command`s are set to `resolve_host` and `smtp_auth`, both supported Test Proc commands

```yaml
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
      - docs.replicated.com
```


*Correct*: item's `test_proc.command` is set to `resolve_host`

```yaml
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
      
```


*Correct*: no test procs specified

```yaml
---
config:
- name: configs
  title: Configuration
  items:
  - name: docs_host
    type: text
      
```


    



Autogenerated reference documentation for [Replicated YAML Linter](https://github.com/replicatedhq/replicated-lint)
*Generated at Wed Feb 21 2018 11:28:12 GMT-0800 (PST)*

