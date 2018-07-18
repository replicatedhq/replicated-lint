import { JSONSchema4 } from "json-schema";

export const schema: JSONSchema4 = {
  "$schema": "http://json-schema.org/schema#",
  "type": "object",
  "properties": {
    "admin_commands": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "alias": {
            "type": "string",
          },
          "command": {
            "type": "array",
            "items": {
              "type": "string",
            },
          },
          "run_type": {
            "type": "string",
          },
          "component": {
            "type": "string",
          },
          "container": {
            "type": "string",
          },
          "image": {
            "type": "object",
            "properties": {
              "image_name": {
                "type": "string",
              },
              "version": {
                "type": ["number", "string"],
              },
            },
          },
          "kubernetes": {
            "type": "object",
            "properties": {
              "container": {
                "type": "string",
              },
              "selector": {
                "type": "object",
                "patternProperties": {
                  ".*": {
                    "type": "string",
                  },
                },
              },
              "selectors": {
                "type": "object",
                "patternProperties": {
                  ".*": {
                    "type": "string",
                  },
                },
              },
            },
          },
          "replicated": {
            "type": "object",
            "properties": {
              "component": {
                "type": "string",
              },
              "container": {
                "type": "string",
              },
            },
          },
          "selector": {
            "type": "object",
            "patternProperties": {
              ".*": {
                "type": "string",
              },
            },
          },
          "selectors": {
            "type": "object",
            "patternProperties": {
              ".*": {
                "type": "string",
              },
            },
          },
          "service": {
            "type": "string",
          },
          "source": {
            "type": "object",
            "properties": {
              "kubernetes": {
                "type": "object",
                "properties": {
                  "container": {
                    "type": "string",
                  },
                  "selector": {
                    "type": "object",
                    "patternProperties": {
                      ".*": {
                        "type": "string",
                      },
                    },
                  },
                  "selectors": {
                    "type": "object",
                    "patternProperties": {
                      ".*": {
                        "type": "string",
                      },
                    },
                  },
                },
              },
              "replicated": {
                "type": "object",
                "properties": {
                  "component": {
                    "type": "string",
                  },
                  "container": {
                    "type": "string",
                  },
                },
              },
              "swarm": {
                "type": "object",
                "properties": {
                  "container": {
                    "type": "string",
                  },
                  "service": {
                    "type": "string",
                  },
                },
              },
            },
          },
          "swarm": {
            "type": "object",
            "properties": {
              "container": {
                "type": "string",
              },
              "service": {
                "type": "string",
              },
            },
          },
          "timeout": {
            "type": "integer",
          },
          "when": {
            "type": ["string", "boolean"],
          },
        },
      },
    },
    "backup": {
      "type": "object",
      "properties": {
        "enabled": {
          "type": ["string", "boolean"],
        },
        "hidden": {
          "type": ["string", "boolean"],
        },
        "kubernetes": {
          "type": "object",
          "properties": {
            "pvc_names": {
              "type": "array",
              "items": {
                "type": "string",
              },
            },
          },
        },
        "pause_all": {
          "type": "boolean",
        },
        "pause_containers": {
          "type": "string",
        },
        "exclude_registry_data": {
          "type": ["string", "boolean"],
        },
        "disable_deduplication": {
          "type": ["string", "boolean"],
        },
        "script": {
          "type": "string",
        },
        "swarm": {
          "type": "object",
          "properties": {
            "volumes": {
              "type": "array",
              "items": {
                "type": "string",
              },
            },
          },
        },
        "strategies": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
              },
              "description": {
                "type": "string",
              },
              "manual": {
                "type": ["string", "boolean"],
              },
              "exclude_app_data": {
                "type": ["string", "boolean"],
              },
              "exclude_replicated_data": {
                "type": ["string", "boolean"],
              },
              "exclude_registry_data": {
                "type": ["string", "boolean"],
              },
              "disable_deduplication": {
                "type": ["string", "boolean"],
              },
              "enabled": {
                "type": ["string", "boolean"],
              },
              "pause_containers": {
                "type": ["string", "boolean"],
              },
              "script": {
                "type": "string",
              },
              "kubernetes": {
                "type": "object",
                "properties": {
                  "pvc_names": {
                    "type": "array",
                    "items": {
                      "type": "string",
                    },
                  },
                },
              },
              "swarm": {
                "type": "object",
                "properties": {
                  "volumes": {
                    "type": "array",
                    "items": {
                      "type": "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "cmds": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "args": {
            "type": "array",
            "items": {
              "type": "string",
            },
          },
          "cmd": {
            "type": "string",
          },
          "name": {
            "type": "string",
          },
        },
      },
    },
    "components": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "cluster": {
            "type": ["string", "boolean"],
          },
          "cluster_host_count": {
            "type": "object",
            "properties": {
              "max": {
                "type": ["string", "number"],
              },
              "min": {
                "type": ["string", "number"],
              },
              "strategy": {
                "type": "string",
              },
              "threshold_degraded": {
                "type": ["string", "number"],
              },
              "threshold_healthy": {
                "type": ["string", "number"],
              },
            },
          },
          "conflicts": {
            "type": "array",
            "items": {
              "type": "string",
            },
          },
          "containers": {
            "type": "array",
            "items": {
              "type": "object",
              "required": [
                "source",
                "image_name",
              ],
              "properties": {
                "allocate_tty": {
                  "type": "string",
                },
                "cluster": {
                  "type": ["string", "boolean"],
                },
                "cluster_instance_count": {
                  "type": "object",
                  "properties": {
                    "initial": {
                      "type": ["string", "number"],
                    },
                    "max": {
                      "type": ["string", "number"],
                    },
                    "threshold_degraded": {
                      "type": ["string", "number"],
                    },
                    "threshold_healthy": {
                      "type": ["string", "number"],
                    },
                  },
                },
                "cmd": {
                  "type": "string",
                },
                "config_files": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "contents": {
                        "type": "string",
                      },
                      "file_mode": {
                        "type": "string",
                      },
                      "file_owner": {
                        "type": "string",
                      },
                      "filename": {
                        "type": "string",
                      },
                      "owner": {
                        "type": "string",
                      },
                      "path": {
                        "type": "string",
                      },
                      "ref": {
                        "type": "string",
                      },
                      "repo": {
                        "type": "string",
                      },
                      "source": {
                        "type": "string",
                      },
                    },
                  },
                },
                "content_trust": {
                  "type": "object",
                  "properties": {
                    "public_key_fingerprint": {
                      "type": "string",
                    },
                  },
                },
                "cpu_shares": {
                  "type": "string",
                },
                "customer_files": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "file_mode": {
                        "type": "string",
                      },
                      "file_owner": {
                        "type": "string",
                      },
                      "filename": {
                        "type": "string",
                      },
                      "name": {
                        "type": "string",
                      },
                      "when": {
                        "type": ["string", "boolean"],
                      },
                    },
                  },
                },
                "display_name": {
                  "type": "string",
                },
                "dynamic": {
                  "type": ["string", "boolean"],
                },
                "entrypoint": {
                  "type": "array",
                  "items": {
                    "type": "string",
                  },
                },
                "env_vars": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "is_excluded_from_support": {
                        "type": ["string", "boolean"],
                      },
                      "name": {
                        "type": "string",
                      },
                      "value": {
                        "type": "string",
                      },
                      "static_val": {
                        "type": "string",
                      },
                      "when": {
                        "type": ["string", "boolean"],
                      },
                    },
                  },
                },
                "ephemeral": {
                  "type": "boolean",
                },
                "hostname": {
                  "type": "string",
                },
                "extra_hosts": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "address": {
                        "type": "string",
                      },
                      "hostname": {
                        "type": "string",
                      },
                      "when": {
                        "type": ["string", "boolean"],
                      },
                    },
                  },
                },
                "image_name": {
                  "type": "string",
                },
                "labels": {
                  "type": "array",
                  "items": {
                    "type": "string",
                  },
                },
                "logs": {
                  "type": "object",
                  "properties": {
                    "max_files": {
                      "type": "string",
                    },
                    "max_size": {
                      "type": "string",
                    },
                  },
                },
                "memory_limit": {
                  "type": "string",
                },
                "memory_swap_limit": {
                  "type": "string",
                },
                "name": {
                  "type": "string",
                },
                "network_mode": {
                  "type": "string",
                },
                "pid_mode": {
                  "type": "string",
                },
                "ports": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "interface": {
                        "type": "string",
                      },
                      "port_type": {
                        "type": "string",
                      },
                      "private_port": {
                        "type": ["string", "number"],
                      },
                      "public_port": {
                        "type": ["string", "number"],
                      },
                      "when": {
                        "type": ["string", "boolean"],
                      },
                    },
                  },
                },
                "privileged": {
                  "type": "boolean",
                },
                "publish_events": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "args": {
                        "type": "array",
                        "items": {
                          "type": "string",
                        },
                      },
                      "data": {
                        "type": "string",
                      },
                      "name": {
                        "type": "string",
                      },
                      "subscriptions": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "action": {
                              "type": "string",
                            },
                            "component": {
                              "type": "string",
                            },
                            "container": {
                              "type": "string",
                            },
                          },
                        },
                      },
                      "timeout": {
                        "type": "integer",
                      },
                      "trigger": {
                        "type": "string",
                      },
                    },
                  },
                },
                "restart": {
                  "type": "object",
                  "properties": {
                    "max": {
                      "type": "integer",
                    },
                    "policy": {
                      "type": "string",
                    },
                  },
                },
                "security_cap_add": {
                  "type": "array",
                  "items": {
                    "type": "string",
                  },
                },
                "security_options": {
                  "type": "array",
                  "items": {
                    "type": "string",
                  },
                },
                "shm_size": {
                  "type": "integer",
                },
                "source": {
                  "type": "string",
                },
                "support_commands": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "command": {
                        "type": "array",
                        "items": {
                          "type": "string",
                        },
                      },
                      "filename": {
                        "type": "string",
                      },
                    },
                  },
                },
                "support_files": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "filename": {
                        "type": "string",
                      },
                    },
                  },
                },
                "suppress_restart": {
                  "type": "array",
                  "items": {
                    "type": "string",
                  },
                },
                "ulimits": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "hard": {
                        "type": "string",
                      },
                      "name": {
                        "type": "string",
                      },
                      "soft": {
                        "type": "string",
                      },
                    },
                  },
                },
                "version": {
                    "type": ["number", "string"],
                },
                "volumes": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "container_path": {
                        "type": "string",
                      },
                      "host_path": {
                        "type": "string",
                      },
                      "is_ephemeral": {
                        "type": ["string", "boolean"],
                      },
                      "is_excluded_from_backup": {
                        "type": ["string", "boolean"],
                      },
                      "options": {
                        "type": "array",
                        "items": {
                          "type": "string",
                        },
                      },
                      "owner": {
                        "type": "string",
                      },
                      "permission": {
                        "type": "string",
                      },
                    },
                  },
                },
                "volumes_from": {
                  "type": "array",
                  "items": {
                    "type": "string",
                  },
                },
                "when": {
                  "type": ["string", "boolean"],
                },
              },
            },
          },
          "host_requirements": {
            "type": "object",
            "properties": {
              "cpu_cores": {
                "type": "integer",
              },
              "cpu_mhz": {
                "type": "integer",
              },
              "disk_space": {
                "type": "string",
              },
              "docker_version": {
                "type": "string",
              },
              "memory": {
                "type": "string",
              },
              "replicated_version": {
                "type": "string",
              },
            },
          },
          "host_volumes": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "host_path": {
                  "type": "string",
                },
                "is_ephemeral": {
                  "type": "string",
                },
                "is_excluded_from_backup": {
                  "type": "string",
                },
                "min_disk_space": {
                  "type": "string",
                },
                "owner": {
                  "type": "string",
                },
                "permission": {
                  "type": "string",
                },
              },
            },
          },
          "logs": {
            "type": "object",
            "properties": {
              "max_files": {
                "type": "string",
              },
              "max_size": {
                "type": "string",
              },
            },
          },
          "name": {
            "type": "string",
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string",
            },
          },
        },
      },
    },
    "config": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "description": {
            "type": "string",
          },
          "filters": {
            "type": "array",
            "items": {
              "type": "string",
            },
          },
          "items": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "affix": {
                  "type": "string",
                },
                "data_cmd": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                    },
                    "value_at": {
                      "type": "integer",
                    },
                  },
                },
                "default": {
                  "type": ["string", "number"],
                },
                "default_cmd": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                    },
                    "value_at": {
                      "type": "integer",
                    },
                  },
                },
                "filters": {
                  "type": "array",
                  "items": {
                    "type": "string",
                  },
                },
                "help_text": {
                  "type": "string",
                },
                "hidden": {
                  "type": "boolean",
                },
                "is_excluded_from_support": {
                  "type": "boolean",
                },
                "items": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "default": {
                        "type": "string",
                      },
                      "name": {
                        "type": "string",
                      },
                      "recommended": {
                        "type": "boolean",
                      },
                      "title": {
                        "type": "string",
                      },
                      "value": {
                        "type": ["string", "number"],
                      },
                    },
                  },
                },
                "multi_value": {
                  "type": "array",
                  "items": {
                    "type": "string",
                  },
                },
                "multiple": {
                  "type": "boolean",
                },
                "name": {
                  "type": "string",
                },
                "props": {
                  "type": "object",
                  "additionalProperties": true,
                },
                "readonly": {
                  "type": "boolean",
                },
                "recommended": {
                  "type": "boolean",
                },
                "required": {
                  "type": "boolean",
                },
                "test_proc": {
                  "type": "object",
                  "properties": {
                    "arg_fields": {
                      "type": "array",
                      "items": {
                        "type": "string",
                      },
                    },
                    "args": {
                      "type": "array",
                      "items": {
                        "type": "string",
                      },
                    },
                    "command": {
                      "type": "string",
                    },
                    "display_name": {
                      "type": "string",
                    },
                    "run_on_save": {
                      "type": ["string", "boolean"],
                    },
                    "timeout": {
                      "type": "integer",
                    },
                  },
                },
                "title": {
                  "type": "string",
                },
                "type": {
                  "type": "string",
                },
                "value": {
                  "type": ["string", "number"],
                },
                "value_cmd": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                    },
                    "value_at": {
                      "type": "integer",
                    },
                  },
                },
                "when": {
                  "type": ["string", "boolean"],
                },
              },
            },
          },
          "name": {
            "type": "string",
          },
          "test_proc": {
            "type": "object",
            "properties": {
              "arg_fields": {
                "type": "array",
                "items": {
                  "type": "string",
                },
              },
              "args": {
                "type": "array",
                "items": {
                  "type": "string",
                },
              },
              "command": {
                "type": "string",
              },
              "display_name": {
                "type": "string",
              },
              "run_on_save": {
                "type": ["string", "boolean"],
              },
              "timeout": {
                "type": "integer",
              },
            },
          },
          "title": {
            "type": "string",
          },
          "when": {
            "type": ["string", "boolean"],
          },
        },
      },
    },
    "console_support_markdown": {
      "type": "string",
    },
    "custom_metrics": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "aggregation_method": {
            "type": "string",
          },
          "reported": {
            "type": "string",
          },
          "retention": {
            "type": "string",
          },
          "target": {
            "type": "string",
          },
          "xfiles_factor": {
            "type": "number",
          },
        },
      },
    },
    "custom_requirements": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "command": {
            "type": "object",
            "properties": {
              "data": {
                "type": ["any", "object"],
                "properties": {},
                "additionalProperties": true,
              },
              "id": {
                "type": "string",
              },
              "timeout": {
                "type": "integer",
              },
            },
          },
          "details": {
            "type": ["object", "string"],
            "properties": {
              "args": {
                "type": "object",
                "additionalProperties": true,
              },
              "default_message": {
                "type": "string",
              },
              "id": {
                "type": "string",
              },
            },
          },
          "id": {
            "type": "string",
          },
          "message": {
            "type": ["object", "string"],
            "properties": {
              "args": {
                "type": "object",
                "additionalProperties": true,
              },
              "default_message": {
                "type": "string",
              },
              "id": {
                "type": "string",
              },
            },
          },
          "results": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "condition": {
                  "type": "object",
                  "properties": {
                    "bool_expr": {
                      "type": "string",
                    },
                    "error": {
                      "type": "boolean",
                    },
                    "status_code": {
                      "type": "integer",
                    },
                  },
                },
                "message": {
                  "type": ["object", "string"],
                  "properties": {
                    "args": {
                      "type": "object",
                      "additionalProperties": true,
                    },
                    "default_message": {
                      "type": "string",
                    },
                    "id": {
                      "type": "string",
                    },
                  },
                },
                "status": {
                  "type": "string",
                },
              },
            },
          },
          "when": {
            "type": ["string", "boolean"],
          },
        },
      },
    },
    "graphite": {
      "type": "object",
      "properties": {
        "port": {
          "type": "integer",
        },
      },
    },
    "host_requirements": {
      "type": "object",
      "properties": {
        "cpu_cores": {
          "type": "integer",
        },
        "cpu_mhz": {
          "type": "integer",
        },
        "disk_space": {
          "type": "string",
        },
        "docker_version": {
          "type": "string",
        },
        "memory": {
          "type": "string",
        },
        "replicated_version": {
          "type": "string",
        },
      },
    },
    "identity": {
      "type": "object",
      "properties": {
        "enabled": {
          "type": "string",
        },
        "provisioner": {
          "type": "string",
        },
        "sources": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "enabled": {
                "type": "string",
              },
              "source": {
                "type": "string",
              },
            },
          },
        },
      },
    },
    "images": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "content_trust": {
            "type": "object",
            "properties": {
              "public_key_fingerprint": {
                "type": "string",
              },
            },
          },
          "name": {
            "type": "string",
          },
          "source": {
            "type": "string",
          },
          "tag": {
            "type": ["string", "number"],
          },
        },
      },
    },
    "kubernetes": {
      "type": "object",
      "properties": {
        "Config": {
          "type": "string",
        },
        "persistent_volume_claims": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "access_modes": {
                "type": "array",
                "items": {
                  "type": "string",
                },
              },
              "name": {
                "type": "string",
              },
              "storage": {
                "type": "string",
              },
            },
          },
        },
        "requirements": {
          "type": "object",
          "properties": {
            "api_versions": {
              "type": "array",
              "items": {
                "type": "string",
              },
            },
            "cluster_size": {
              "type": "string",
            },
            "server_version": {
              "type": "string",
            },
            "total_cores": {
              "type": "string",
            },
            "total_memory": {
              "type": "string",
            },
          },
        },
      },
    },
    "localization": {
      "type": "object",
      "properties": {
        "enabled": {
          "type": "boolean",
        },
        "locales": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "tag": {
                "type": "string",
              },
              "translations": {
                "type": "object",
                "patternProperties": {
                  ".*": {
                    "type": "string",
                  },
                },
              },
            },
          },
        },
        "locales_enabled": {
          "type": "array",
          "items": {
            "type": "string",
          },
        },
      },
    },
    "monitors": {
      "type": "object",
      "properties": {
        "cpuacct": {
          "type": "array",
          "items": {
            "type": "string",
          },
        },
        "custom": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "dashboard": {
                "type": "string",
              },
              "display": {
                "type": "object",
                "properties": {
                  "css_class_name": {
                    "type": "string",
                  },
                  "fill_color": {
                    "type": "string",
                  },
                  "label_count": {
                    "type": "integer",
                  },
                  "label_max": {
                    "type": "number",
                  },
                  "label_min": {
                    "type": "number",
                  },
                  "label_range_override": {
                    "type": "boolean",
                  },
                  "label_scale": {
                    "type": ["string", "number"],
                  },
                  "label_unit": {
                    "type": "string",
                  },
                  "stroke_color": {
                    "type": "string",
                  },
                },
              },
              "from": {
                "type": "string",
              },
              "name": {
                "type": "string",
              },
              "target": {
                "type": "string",
              },
              "targets": {
                "type": "array",
                "items": {
                  "type": "string",
                },
              },
              "until": {
                "type": "string",
              },
            },
          },
        },
        "memory": {
          "type": "array",
          "items": {
            "type": "string",
          },
        },
      },
    },
    "name": {
      "type": "string",
    },
    "properties": {
      "type": "object",
      "properties": {
        "app_url": {},
        "bypass_local_registry": {
          "type": "boolean",
        },
        "console_title": {
          "type": "string",
        },
        "logo_url": {
          "type": "string",
        },
        "shell_alias": {
          "type": "string",
        },
      },
    },
    "release_notes": {
      "type": "string",
    },
    "replicated_api_version": {
      "type": "string",
    },
    "state": {
      "type": "object",
      "properties": {
        "ready": {
          "type": "object",
          "properties": {
            "args": {
              "type": "array",
              "items": {
                "type": "string",
              },
            },
            "command": {
              "type": "string",
            },
            "timeout": {
              "type": "integer",
            },
          },
        },
      },
    },
    "statsd": {
      "type": "object",
      "properties": {
        "port": {
          "type": "integer",
        },
      },
    },
    "support": {
      "type": "object",
      "properties": {
        "commands": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "command": {
                "type": "array",
                "items": {
                  "type": "string",
                },
              },
              "filename": {
                "type": "string",
              },
              "selector": {
                "type": "object",
                "patternProperties": {
                  ".*": {
                    "type": "string",
                  },
                },
              },
              "selectors": {
                "type": "object",
                "patternProperties": {
                  ".*": {
                    "type": "string",
                  },
                },
              },
              "source": {
                "type": "object",
                "properties": {
                  "kubernetes": {
                    "type": "object",
                    "properties": {
                      "container": {
                        "type": "string",
                      },
                      "selector": {
                        "type": "object",
                        "patternProperties": {
                          ".*": {
                            "type": "string",
                          },
                        },
                      },
                      "selectors": {
                        "type": "object",
                        "patternProperties": {
                          ".*": {
                            "type": "string",
                          },
                        },
                      },
                    },
                  },
                  "replicated": {
                    "type": "object",
                    "properties": {
                      "component": {
                        "type": "string",
                      },
                      "container": {
                        "type": "string",
                      },
                    },
                  },
                  "swarm": {
                    "type": "object",
                    "properties": {
                      "container": {
                        "type": "string",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        "files": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "filename": {
                "type": "string",
              },
              "component": {
                "type": "string",
              },
              "container": {
                "type": "string",
              },
              "selector": {
                "type": "object",
                "patternProperties": {
                  ".*": {
                    "type": "string",
                  },
                },
              },
              "selectors": {
                "type": "object",
                "patternProperties": {
                  ".*": {
                    "type": "string",
                  },
                },
              },
              "source": {
                "type": "object",
                "properties": {
                  "kubernetes": {
                    "type": "object",
                    "properties": {
                      "container": {
                        "type": "string",
                      },
                      "selector": {
                        "type": "object",
                        "patternProperties": {
                          ".*": {
                            "type": "string",
                          },
                        },
                      },
                      "selectors": {
                        "type": "object",
                        "patternProperties": {
                          ".*": {
                            "type": "string",
                          },
                        },
                      },
                    },
                  },
                  "replicated": {
                    "type": "object",
                    "properties": {
                      "component": {
                        "type": "string",
                      },
                      "container": {
                        "type": "string",
                      },
                    },
                  },
                  "swarm": {
                    "type": "object",
                    "properties": {
                      "container": {
                        "type": "string",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        "timeout": {
          "type": ["string", "number"],
        },
      },
    },
    "swarm": {
      "type": "object",
      "properties": {
        "minimum_node_count": {
          "type": ["string", "number"],
        },
        "nodes": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "host_requirements": {
                "type": "object",
                "properties": {
                  "cpu_cores": {
                    "type": "integer",
                  },
                  "cpu_mhz": {
                    "type": "integer",
                  },
                  "disk_space": {
                    "type": "string",
                  },
                  "docker_version": {
                    "type": "string",
                  },
                  "memory": {
                    "type": "string",
                  },
                  "replicated_version": {
                    "type": "string",
                  },
                },
              },
              "labels": {
                "type": "object",
                "patternProperties": {
                  ".*": {
                    "type": ["string", "null"],
                  },
                },
              },
              "minimum_count": {
                "type": ["string", "number"],
              },
              "role": {
                "type": "string",
              },
            },
          },
        },
        "secrets": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "labels": {
                "type": "object",
                "patternProperties": {
                  ".*": {
                    "type": ["string", "null"],
                  },
                },
              },
              "name": {
                "type": "string",
              },
              "value": {
                "type": "string",
              },
            },
          },
        },
        "configs": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "labels": {
                "type": "object",
                "patternProperties": {
                  ".*": {
                    "type": ["string", "null"],
                  },
                },
              },
              "name": {
                "type": "string",
              },
              "value": {
                "type": "string",
              },
            },
          },
        },
      },
    },
    "version": {
      "type": "string",
    },
  },
};

export default schema;
