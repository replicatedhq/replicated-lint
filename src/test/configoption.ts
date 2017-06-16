import { describe, it } from "mocha";
import { expect } from "chai";
import { lint } from "../lint";
import { configOptionExists } from "../rules/configoption";

describe("config-option-exists", () => {
  it("passes if ConfigOptions are present", () => {

    const inYaml = `
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

components:
- name: App
  cluster: false
  containers:
  - source: public
    image_name: wlaoh/counter
    version: signed
    cmd: ""
    name: '{{repl ConfigOption "hostname" }}'
`;

    expect(lint(inYaml, [configOptionExists]))
      .to.deep.equal([]);
  });

  it("fails if a ConfigOption is absent", () => {

    const inYaml = `
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

components:
- name: App
  cluster: false
  containers:
  - source: public
    image_name: wlaoh/counter
    version: signed
    cmd: '{{repl ConfigOption "hostname" }}'
    name: '{{repl ConfigOption "not_existent" }}'
`;

    expect(lint(inYaml, [configOptionExists],
    )).to.deep.equal([
      {
        "message": "Options referenced with `{{repl ConfigOption }}` must be present in the `config` section",
        "positions": [
          {
            "end": {
              "column": 49,
              "line": 28,
              "position": 551,
            },
            "path": "components.0.containers.0.name",
            "start": {
              "column": 4,
              "line": 28,
              "position": 506,
            },
          },
        ],
        "received": "{{repl ConfigOption \"not_existent\" }}",
        "rule": "config-option-exists",
        "type": "warn",
      },
    ]);
  });
});
