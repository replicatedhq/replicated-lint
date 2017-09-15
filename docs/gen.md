
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


*Incorrect*: Config Section `when` field references non-existent option `auth`

```yaml
---
config:
- name: database
  title: Database
  when: auth=config
  items:
  - name: database_use_ssl
    title: Use SSL
    type: bool
    default: ""
      
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
    cluster_instance_count: 2
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
    cluster_instance_count: 2
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
      version: 3.2
    
```


    

## `prop-monitors-cpuacct-container-exists`

Entries in `monitors.cpuacct` must have matching component+container





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


*Correct*: No monitors, no containers

```yaml
---
monitors:
  cpuacct: []
      
```


    

## `prop-monitors-memory-container-exists`

Entries in `monitors.memory` must have matching component+container





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
      target: 
    
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

*Incorrect*: `statsd.port` is not an integer

```yaml
---
statsd:
  port: foo
    
```


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

*Incorrect*: `graphite.port` is not an integer

```yaml
---
graphite:
  port: foo
    
```


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


    

## `prop-admincommand-component-exists`

Admin commands must reference an existing component and container





#### Examples:

*Incorrect*: admin command but no containers

```yaml
---
admin_commands:
- alias: aliasecho
  command: ["echo"]
  run_type: exec
  component: DB
  container: redis
      
```


*Incorrect*: Admin command but no matching containers

```yaml
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
  command: ["echo"]
  run_type: exec
  component: DB
  container: redis

components:
  - name: DB
    containers:
    - image_name: redis
      
```


*Correct*: Admin command has `service`, so we're probably in swarm

```yaml
---
admin_commands:
- alias: aliasecho
  command: ["echo"]
  run_type: exec
  service: database
      
```


*Correct*: Admin command has `selector`, so we're probably in kubernetes

```yaml
---
admin_commands:
- alias: aliasecho
  command: ["echo"]
  run_type: exec
  selector:
    - tier: database
      
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


    

## `mesg-yaml-valid`

Document must be valid YAML. This could occur for many reasons, consult individual error details for more info.



#### More Info:

- http://yaml.org/spec/
- http://docs.ansible.com/ansible/latest/YAMLSyntax.html





    

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
replicated_api_version: "2.10.1"
deploy_this_great_app: plz&thx
            
```


*Incorrect*: Property `replicated_api_version` is not of correct type, should be `string`, but `2.11` is parsed as type `float`

```yaml
---
replicated_api_version: 2.11
            
```




    



Autogenerated reference documentation for [Replicated YAML Linter](https://github.com/replicatedhq/replicated-lint)
*Generated at Fri Sep 15 2017 17:54:54 GMT-0700 (PDT)*

