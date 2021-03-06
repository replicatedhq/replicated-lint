import { YAMLRule } from "../lint";

export const notClusteredIfNamedContainer: YAMLRule = {
  name: "prop-component-container-unnamed-when-cluster-true",
  type: "warn",
  message: "With clustering turned on, setting `container.name` will prevent multiple instances of the container from being scheduled on a single node",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        AnyOf: {
          path: "containers",
          pred: {
            And: {
              preds: [
                { GT: { path: "cluster_instance_count", value: 1 } },
                { Exists: { path: "name" } },
                { Truthy: { path: "cluster" } },
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
        description: "container in component with `cluster_instance_count: 2` should not have a `name` specified",
        yaml: `
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
      `,
      },
    ],
    right: [
      {
        description: "container in component with `cluster_instance_count: 2` does not have a `name` specified",
        yaml: `
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
      `,
      },
    ],
  },
};

export const eventSubscriptionContainerExists: YAMLRule = {
  name: "prop-component-container-event-subscription-container-exists",
  type: "error",
  message: "Container event subscriptions must reference an existing component/container",
  test: { EventSubscriptionContainerMissing: {} },
  examples: {
    wrong: [
      {
        description: "container `redis` has a `publish_event` that references missing container `Pipeline/logstash`",
        yaml: `
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
      `,
      },
      {
        description: "container `redis` has a `publish_event` that references missing container `Pipeline/logstash`",
        yaml: `
---
components:
- name: DB
  containers:
  - source: public
    image_name: mongo
    version: latest
  - source: public
    image_name: logstash
    version: latest
  - source: public
    image_name: redis
    version: latest
    publish_events:
      - name: event
        subscriptions:
        - component: Pipeline
          container: logstash
          action: start
      `,
      },
    ],
    right: [
      {
        description: "All containers referenced in `publish_events` have a matching component/container definition",
        yaml: `
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
      `,
      },
    ],
  },
};

export const containerVolumeModes: YAMLRule = {
  name: "prop-component-container-volume-modes-valid",
  type: "error",
  message: "Container volume must not specify conflicting options",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        AnyOf: {
          path: "containers",
          pred: {
            AnyOf: {
              path: "volumes",
              pred: {
                Dot: {
                  path: "options",
                  pred: {
                    Or: {
                      preds: [
                        { MoreThan: { limit: 1, values: ["rw", "ro"] } },
                        { MoreThan: { limit: 1, values: ["z", "Z"] } },
                        { MoreThan: { limit: 1, values: ["nocopy"] } },
                        {
                          MoreThan: {
                            limit: 1,
                            values: ["shared", "slave", "private", "rshared", "rslave", "rprivate"],
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "volume options contains conflicting options `rw` and `ro`",
        yaml: `
---
components:
- name: DB
  containers:
  - source: public
    image_name: mongo
    version: latest
    volumes:
      - host_path: /tmp
        container_path: /tmp
        options:
          - rw
          - ro
      `,
      },
      {
        description: "volume options contains conflicting options `z` and `Z`",
        yaml: `
---
components:
- name: DB
  containers:
  - source: public
    image_name: mongo
    version: latest
    volumes:
      - host_path: /tmp
        container_path: /tmp
        options:
          - z
          - Z
      `,
      },
      {
        description: "volume options contains conflicting options `rshared` and `private`",
        yaml: `
---
components:
- name: DB
  containers:
  - source: public
    image_name: mongo
    version: latest
    volumes:
      - host_path: /tmp
        container_path: /tmp
        options:
          - rshared
          - private
      `,
      },
      {
        description: "volume options contains duplicated option `nocopy`",
        yaml: `
---
components:
- name: DB
  containers:
  - source: public
    image_name: mongo
    version: latest
    volumes:
      - host_path: /tmp
        container_path: /tmp
        options:
          - nocopy
          - nocopy
      `,
      },
    ],
    right: [
      {
        description: "no volumes are defined",
        yaml: `
---
components:
- name: DB
  containers:
  - source: public
    image_name: redis
    version: latest
      `,
      },
      {
        description: "no volume options are defined",
        yaml: `
---
components:
- name: DB
  containers:
  - source: public
    image_name: redis
    version: latest
    volumes:
      - host_path: /tmp
        container_path: /tmp
      `,
      },
      {
        description: "No conflicting volume options are defined",
        yaml: `
---
components:
- name: DB
  containers:
  - source: public
    image_name: redis
    version: latest
    volumes:
      - host_path: /tmp
        container_path: /tmp
        options:
          - rw
          - Z
          - rshared
          - nocopy
      `,
      },
    ],
  },
};

export const volumeContainerPathAbsoulte: YAMLRule = {
  name: "prop-component-container-volume-path-absolute",
  type: "error",
  message: "Container volume's `container_path` must be absolute",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        AnyOf: {
          path: "containers",
          pred: {
            AnyOf: {
              path: "volumes",
              pred: {
                And: {
                  preds: [
                    { NotMatch: { path: "container_path", pattern: "^/" } },
                    { NotMatch: { path: "container_path", pattern: "^{{repl" } },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "container path is not absolute",
        yaml: `
---
components:
- name: DB
  containers:
  - source: public
    image_name: mongo
    version: latest
    volumes:
      - host_path: /tmp
        container_path: ubuntu/workspace
      `,
      },
    ],
    right: [
      {
        description: "container path is absolute",
        yaml: `
---
components:
- name: DB
  containers:
  - source: public
    image_name: mongo
    version: latest
    volumes:
      - host_path: /tmp
        container_path: /home/ubuntu/workspace
      `,
      },
      {
        description: "container path is a templated field",
        yaml: `
---
components:
- name: DB
  containers:
  - source: public
    image_name: redis
    version: latest
    volumes:
      - host_path: /tmp
        container_path: '{{repl ConfigOption "mount_path"}}'
      `,
      },
    ],
  },
};

export const containerContentTrustValid: YAMLRule = {
  name: "prop-component-container-contenttrust-fingerprint-valid",
  type: "error",
  message: "A container's content_trust.`public_key_fingerprint` must be a valid RFC4716 fingerprint, e.g. `cb:69:19:cd:76:1f:17:54:92:a4:fc:a9:6f:a5:57:72`",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        AnyOf: {
          path: "containers",
          pred: {
            And: {
              preds: [
                { Truthy: { path: "content_trust.public_key_fingerprint" } },
                {
                  NotMatch: {
                    path: "content_trust.public_key_fingerprint",
                    pattern: "[0-9a-f]{2}(:[0-9a-f]{2}){15}",
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
    wrong: [
      {
        description: "invalid `public_key_fingerprint`",
        yaml: `
---
components:
  - name: DB
    containers:
    - source: public
      name: redis
      image_name: redis
      version: 3.2.1
      content_trust:
        public_key_fingerprint: flksdjflkds
    `,
      },
    ],
    right: [
      {
        description: "valid fingerprint",
        yaml: `
components:
  - name: DB
    containers:
    - source: public
      name: redis
      image_name: redis
      version: 3.2.1
      content_trust:
        public_key_fingerprint: cb:69:19:cd:76:1f:17:54:92:a4:fc:a9:6f:a5:57:72
    - source: public
      name: redis
      image_name: redis
      version: 3.2.1
      content_trust:
        public_key_fingerprint: aa:9c:75:89:de:46:3a:92:08:c7:ba:9a:29:fb:12:cc
    `,
      },
    ],
  },
};

export const containerVolumesFromExists: YAMLRule = {
  name: "prop-component-container-volumesfrom-exists",
  type: "error",
  message: "A container's `volumes_from` must reference an existing container's `name` field",
  test: { ContainerVolumesFromMissing: {}},
  examples: {
    wrong: [
      {
        description: "`volumes_from` references own container",
        yaml: `
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
    `,
      },
      {
        description: "`volumes_from` references non-existing container",
        yaml: `
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
    `,
      },
    ],
    right: [
      {
        description: "valid `volumes_from` reference",
        yaml: `
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
    `,
      },
    ],
  },
};

export const containerNamesUnique: YAMLRule = {
  name: "prop-component-container-names-unique",
  type: "error",
  message: "A component's container's must have unique `name` entries",
  test: { ContainerNamesNotUnique: {}},
  examples: {
    wrong: [
      {
        description: "duplicated names in single component",
        yaml: `
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
    `,
      },
      {
        description: "duplicated names across components",
        yaml: `
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
    `,
      },
    ],
    right: [
      {
        description: "no duplicated names",
        yaml: `
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
    `,
      },
    ],
  },
};

export const containerClusterInstanceCountInitialUint: YAMLRule = {
  name: "prop-component-container-instance-count-initial-uint",
  type: "error",
  message: "Container's cluster_instance_count property `initial` must be an unsigned integer or a template",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        AnyOf: {
          path: "containers",
          pred: {
            And: {
              preds: [
                {NotUintString: {path: "cluster_instance_count.initial"}},
                {Exists: {path: "cluster_instance_count.initial"}},
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
        description: "cluster_instance_count.initial must be an unsigned integer, and this is a float",
        yaml: `
---
components:
- containers:
  - cluster_instance_count:
      initial: 3.5
    image_name: redis
    version: latest
    source: public
      `,
      },
      {
        description: "cluster_instance_count.initial must be an unsigned integer, and this parses as a negative integer",
        yaml: `
---
components:
- containers:
  - cluster_instance_count:
      initial: "-2"
    image_name: redis
    version: latest
    source: public
      `,
      },
      {
        description: "cluster_instance_count.initial must be an unsigned integer, and this is not even numeric",
        yaml: `
---
components:
- containers:
  - cluster_instance_count:
      initial: "abc"
    image_name: redis
    version: latest
    source: public
      `,
      },
    ],
    right: [
      {
        description: "cluster_instance_count.initial is an unsigned integer",
        yaml: `
---
components:
- containers:
  - cluster_instance_count:
      initial: 3
    image_name: redis
    version: latest
    source: public
      `,
      },
      {
        description: "cluster_instance_count.initial is a template",
        yaml: `
---
components:
- containers:
  - cluster_instance_count:
      initial: '{{repl GiveMeAValue}}'
    image_name: redis
    version: latest
    source: public
      `,
      },
    ],
  },
};

export const containerClusterInstanceCountMaxUint: YAMLRule = {
  name: "prop-component-container-instance-count-max-uint",
  type: "error",
  message: "Container's cluster_instance_count property `max` must be an unsigned integer or a template",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        AnyOf: {
          path: "containers",
          pred: {
            And: {
              preds: [
                {NotUintString: {path: "cluster_instance_count.max"}},
                {Exists: {path: "cluster_instance_count.max"}},
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
        description: "cluster_instance_count.max must be an unsigned integer, and this is a negative integer",
        yaml: `
---
components:
- containers:
  - cluster_instance_count:
      max: -10
    image_name: redis
    version: latest
    source: public
      `,
      },
    ],
    right: [
      {
        description: "cluster_instance_count.max is an unsigned integer",
        yaml: `
---
components:
- containers:
  - cluster_instance_count:
      max: 10
    image_name: redis
    version: latest
    source: public
      `,
      },
      {
        description: "cluster_instance_count.max is a template",
        yaml: `
---
components:
- containers:
  - cluster_instance_count:
      max: '{{repl GiveMeAValue}}'
    image_name: redis
    version: latest
    source: public
      `,
      },
    ],
  },
};

export const containerClusterInstanceCountDegradedUint: YAMLRule = {
  name: "prop-component-container-instance-count-degraded-uint",
  type: "error",
  message: "Container's cluster_instance_count property `threshold_degraded` must be an unsigned integer or a template",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        AnyOf: {
          path: "containers",
          pred: {
            And: {
              preds: [
                {NotUintString: {path: "cluster_instance_count.threshold_degraded"}},
                {Exists: {path: "cluster_instance_count.threshold_degraded"}},
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
        description: "cluster_instance_count.threshold_degraded must be an unsigned integer, and this parses as a float",
        yaml: `
---
components:
- containers:
  - cluster_instance_count:
      threshold_degraded: "2.8"
    image_name: redis
    version: latest
    source: public
      `,
      },
    ],
    right: [
      {
        description: "cluster_instance_count.threshold_degraded is an unsigned integer",
        yaml: `
---
components:
- containers:
  - cluster_instance_count:
      threshold_degraded: "2"
    image_name: redis
    version: latest
    source: public
      `,
      },
      {
        description: "cluster_instance_count.threshold_degraded is a template",
        yaml: `
---
components:
- containers:
  - cluster_instance_count:
      threshold_degraded: '{{repl GiveMeAValue}}'
    image_name: redis
    version: latest
    source: public
      `,
      },
    ],
  },
};

export const containerClusterInstanceCountHealthyUint: YAMLRule = {
  name: "prop-component-container-instance-count-healthy-uint",
  type: "error",
  message: "Container's cluster_instance_count property `threshold_healthy` must be an unsigned integer or a template",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        AnyOf: {
          path: "containers",
          pred: {
            And: {
              preds: [
                {NotUintString: {path: "cluster_instance_count.threshold_healthy"}},
                {Exists: {path: "cluster_instance_count.threshold_healthy"}},
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
        description: "cluster_instance_count.threshold_healthy must be an unsigned integer, and this is a string",
        yaml: `
---
components:
- containers:
  - cluster_instance_count:
      threshold_healthy: "all"
    image_name: redis
    version: latest
    source: public
      `,
      },
    ],
    right: [
      {
        description: "cluster_instance_count.threshold_healthy is an unsigned integer",
        yaml: `
---
components:
- containers:
  - cluster_instance_count:
      threshold_healthy: "5"
    image_name: redis
    version: latest
    source: public
      `,
      },
      {
        description: "cluster_instance_count.threshold_healthy is a template",
        yaml: `
---
components:
- containers:
  - cluster_instance_count:
      threshold_healthy: '{{repl GiveMeAValue}}'
    image_name: redis
    version: latest
    source: public
      `,
      },
    ],
  },
};

export const containerVolumesSubscriptionExists: YAMLRule = {
  name: "prop-component-container-volumesfrom-subscription-exists",
  type: "error",
  message: "A container's `volumes_from` must reference a container that subscribes to it",
  test: { ContainerVolumesFromSubscription: {}},
  examples: {
    wrong: [
      {
        description: "`volumes_from` references container that does not exist",
        yaml: `
---
components:
- name: DB
  containers:
  - name: notalpha
    image_name: redis
    version: latest
    source: public
    publish_events:
    - subscriptions:
      - component: DB
        container: beta
  - image_name: beta
    volumes_from:
    - alpha
    version: latest
    source: public
    `,
      },
      {
        description: "`volumes_from` references container that does not subscribe to it",
        yaml: `
---
components:
- name: DB
  containers:
  - name: alpha
    publish_events:
    - subscriptions:
      - component: DB
        container: notalpine
    image_name: redis
    version: latest
    source: public
  - volumes_from:
    - alpha
    image_name: alpine
    version: latest
    source: public
    `,
      },
      {
        description: "`volumes_from` references multiple containers, of which one is not valid",
        yaml: `
---
components:
- name: DB
  containers:
  - name: alpha
    image_name: alpha
    version: latest
    source: public
    publish_events:
    - subscriptions:
      - component: DB
        container: beta
  - image_name: beta
    volumes_from:
    - alpha
    - gamma
    version: latest
    source: public
    `,
      },
      {
        description: "`volumes_from` references itself",
        yaml: `
---
components:
- name: DB
  containers:
  - name: alphaname
    image_name: alpha
    version: latest
    source: public
    volumes_from:
    - alpha
    publish_events:
    - subscriptions:
      - component: DB
        container: alphaname
    `,
      },
    ],
    right: [
      {
        description: "valid `volumes_from` reference",
        yaml: `
---
components:
- name: DB
  containers:
  - name: alpha
    image_name: irrelevant
    version: latest
    source: public
    publish_events:
    - subscriptions:
      - component: DB
        container: beta
  - image_name: beta
    volumes_from:
    - alpha
    version: latest
    source: public
    `,
      },
      {
        description: "multiple valid `volumes_from` references",
        yaml: `
---
components:
- name: DB
  containers:
  - name: alpha
    image_name: irrelevant
    version: latest
    source: public
    publish_events:
    - subscriptions:
      - component: DB
        container: beta
      - component: DB
        container: gamma
  - image_name: gamma
    volumes_from:
    - alpha
    version: latest
    source: public
  - image_name: beta
    volumes_from:
    - alpha
    version: latest
    source: public
    `,
      },
      {
        description: "Chained dependency for `volumes_from` across components",
        yaml: `
---
components:
- name: DB
  containers:
  - name: alpha
    image_name: irrelevant
    version: latest
    source: public
    publish_events:
    - subscriptions:
      - component: DB2
        container: gamma
  - image_name: beta
    volumes_from:
    - alpha
    version: latest
    source: public
- name: DB2
  containers:
  - image_name: gamma
    version: latest
    source: public
    publish_events:
    - subscriptions:
      - component: DB
        container: beta
    `,
      },
    ],
  },
};

export const containerVolumeEphemeralTypeCheck: YAMLRule = {
  name: "prop-component-container-volume-ephemeral-type-check",
  type: "error",
  message: "is_ephemeral must be a bool string, boolean literal, or template function",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        AnyOf: {
          path: "containers",
          pred: {
            AnyOf: {
              path: "volumes",
              pred: {
                And: {
                  preds: [
                    { Exists: { path: "is_ephemeral" } },
                    { NotBoolString: { path: "is_ephemeral" } },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "`yes` is not a valid value for `is_ephemeral`",
        yaml: `
---
components:
- containers:
  - volumes:
    - is_ephemeral: "yes"
    image_name: redis
    version: latest
    source: public
      `,
      },
    ],
    right: [
      {
        description: "`\"true\"`, `true`, `\"false\"` and `false` are all valid values for `is_ephemeral`",
        yaml: `
---
components:
- containers:
  - volumes:
    - is_ephemeral: "true"
    - is_ephemeral: "false"
    - is_ephemeral: true
    - is_ephemeral: false
    image_name: redis
    version: latest
    source: public
      `,
      },
      {
        description: "`{{repl AppID}}` is a valid template function and is thus a valid if questionable value for `is_ephemeral`",
        yaml: `
---
components:
- containers:
  - volumes:
    - is_ephemeral: "{{repl AppID}}"
    image_name: redis
    version: latest
    source: public
      `,
      },
    ],
  },
};

export const containerVolumeExcludedTypeCheck: YAMLRule = {
  name: "prop-component-container-volume-excluded-type-check",
  type: "error",
  message: "is_excluded_from_backup must be a bool string, boolean literal, or template function",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        AnyOf: {
          path: "containers",
          pred: {
            AnyOf: {
              path: "volumes",
              pred: {
                And: {
                  preds: [
                    { Exists: { path: "is_excluded_from_backup" } },
                    { NotBoolString: { path: "is_excluded_from_backup" } },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "`yes` is not a valid value for `is_excluded_from_backup`",
        yaml: `
---
components:
- containers:
  - volumes:
    - is_excluded_from_backup: "yes"
    image_name: redis
    version: latest
    source: public
      `,
      },
    ],
    right: [
      {
        description: "`\"true\"`, `true`, `\"false\"` and `false` are all valid values for `is_excluded_from_backup`",
        yaml: `
---
components:
- containers:
  - volumes:
    - is_excluded_from_backup: "true"
    - is_excluded_from_backup: "false"
    - is_excluded_from_backup: true
    - is_excluded_from_backup: false
    image_name: redis
    version: latest
    source: public
      `,
      },
      {
        description: "`{{repl AppID}}` is a valid template function and is thus a valid value for `is_excluded_from_backup`",
        yaml: `
---
components:
- containers:
  - volumes:
    - is_excluded_from_backup: "{{repl AppID}}"
    image_name: redis
    version: latest
    source: public
      `,
      },
    ],
  },
};

export const containerEnvvarsStaticvalDeprecated: YAMLRule = {
  name: "prop-component-container-envvars-staticval-deprecated",
  type: "warn",
  message: "`static_val` is deprecated, use `value` instead",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        AnyOf: {
          path: "containers",
          pred: {
            AnyOf: {
              path: "env_vars",
              pred: {
                And: {
                  preds: [
                    { Exists: { path: "static_val" } },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "`static_val` deprecated",
        yaml: `
---
components:
- containers:
  - env_vars:
    - static_val: blah
      value: blah
    image_name: redis
    version: latest
    source: public
      `,
      },
      {
        description: "`static_val` deprecated empty",
        yaml: `
---
components:
- containers:
  - env_vars:
    - static_val: ""
      value: blah
    image_name: redis
    version: latest
    source: public
      `,
      },
    ],
    right: [
      {
        description: "`value` preferred over `static_val`",
        yaml: `
---
components:
- containers:
  - name: first
    env_vars:
    - value: "blah"
    image_name: redis
    version: latest
    source: public
      `,
      },
    ],
  },
};

export const containerEnvvarsExcludedTypeCheck: YAMLRule = {
  name: "prop-component-container-envvars-excluded-type-check",
  type: "error",
  message: "is_excluded_from_support must be a bool string, boolean literal, or template function",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        AnyOf: {
          path: "containers",
          pred: {
            AnyOf: {
              path: "env_vars",
              pred: {
                And: {
                  preds: [
                    { Exists: { path: "is_excluded_from_support" } },
                    { NotBoolString: { path: "is_excluded_from_support" } },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
  examples: {
    wrong: [
      {
        description: "`yes` is not a valid value for `is_excluded_from_support`",
        yaml: `
---
components:
- containers:
  - env_vars:
    - is_excluded_from_support: "yes"
    image_name: redis
    version: latest
    source: public
      `,
      },
    ],
    right: [
      {
        description: "`\"true\"`, `true`, `\"false\"` and `false` are all valid values for `is_excluded_from_support`",
        yaml: `
---
components:
- containers:
  - env_vars:
    - is_excluded_from_support: "true"
    - is_excluded_from_support: "false"
    - is_excluded_from_support: true
    - is_excluded_from_support: false
    image_name: redis
    version: latest
    source: public
      `,
      },
      {
        description: "`{{repl AppID}}` is a valid template function and is thus a valid value for `is_excluded_from_support`",
        yaml: `
---
components:
- containers:
  - env_vars:
    - is_excluded_from_support: "{{repl AppID}}"
    image_name: redis
    version: latest
    source: public
      `,
      },
    ],
  },
};

export const containerShmSizeUInt: YAMLRule = {
  name: "prop-component-container-shm-size-uint",
  type: "error",
  message: "Container's shm_size property must be an unsigned integer or a template",
  test: {
    AnyOf: {
      path: "components",
      pred: {
        AnyOf: {
          path: "containers",
          pred: {
            And: {
              preds: [
                {NotUintString: {path: "shm_size"}},
                {Exists: {path: "shm_size"}},
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
        description: "shm_size must be an unsigned integer, and this is a negative integer",
        yaml: `
---
components:
- containers:
  - shm_size: -10
    image_name: redis
    version: latest
    source: public
      `,
      },
      {
        description: "shm_size must be an unsigned integer, and this is not even numeric",
        yaml: `
---
components:
- containers:
  - shm_size: "abc"
    image_name: redis
    version: latest
    source: public
      `,
      },
    ],
    right: [
      {
        description: "shm_size is an unsigned integer",
        yaml: `
---
components:
- containers:
  - shm_size: 10
    image_name: redis
    version: latest
    source: public
      `,
      },
      {
        description: "shm_size is a template",
        yaml: `
---
components:
- containers:
  - shm_size: '{{repl GiveMeAValue}}'
    image_name: redis
    version: latest
    source: public
      `,
      },
    ],
  },
};

export const all: YAMLRule[] = [
  notClusteredIfNamedContainer,
  eventSubscriptionContainerExists,
  containerVolumeModes,
  volumeContainerPathAbsoulte,
  containerContentTrustValid,
  containerVolumesFromExists,
  containerNamesUnique,
  containerClusterInstanceCountInitialUint,
  containerClusterInstanceCountMaxUint,
  containerClusterInstanceCountDegradedUint,
  containerClusterInstanceCountHealthyUint,
  containerVolumesSubscriptionExists,
  containerVolumeEphemeralTypeCheck,
  containerVolumeExcludedTypeCheck,
  containerEnvvarsStaticvalDeprecated,
  containerEnvvarsExcludedTypeCheck,
  containerShmSizeUInt,
];
