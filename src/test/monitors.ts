import { describe, it } from "mocha";
import { expect } from "chai";
import { lint } from "../lint";
import { cpuMonitorContainerExists } from "../rules/monitors";

describe("cpuMonitorContainerExists", () => {
  it("passes if cpuacct matches a component container", () => {

    let inYaml = `
# GetELK

---
# kind: replicated
replicated_api_version: 2.8.0
name: GetELK
components:
  - name: Logstash
    containers:
      - image_name: quay.io/getelk/logstash
monitors:
  cpuacct: 
    - Logstash,quay.io/getelk/logstash
`;

    expect(lint(inYaml, [cpuMonitorContainerExists],
    )).to.be.empty;
  });

  it("passes if no cpuacct monitors are present", () => {

    let inYaml = `
# GetELK

---
# kind: replicated
replicated_api_version: 2.8.0
name: GetELK
components:
  - name: Logstash
    containers:
      - image_name: quay.io/getelk/logstash
`;

    expect(lint(inYaml, [cpuMonitorContainerExists],
    )).to.be.empty;
  });

  it("errors if monitors exists but components is empty", () => {

    let inYaml = `
# GetELK

---
# kind: replicated
replicated_api_version: 2.8.0
name: GetELK
monitors:
  cpuacct: 
    - "Logstash,quay.io/getelk/logstash:latest"
`;

    expect(lint(inYaml, [cpuMonitorContainerExists],
    )).to.deep.equal([
      {
        "message": "monitors.cpuacct entries must have matching component+container",
        "type": "error",
        "positions": [
          {
            "path": "monitors.cpuacct",
            "end": {
              "column": -1,
              "line": -1,
              "position": 147,
            },
            "start": {
              "column": 2,
              "line": 8,
              "position": 89,
            },
          },
        ],
        "received": [
          "Logstash,quay.io/getelk/logstash:latest",
        ],
        "rule": "CPUMonitorContainerExists",
      },
    ]);
  });

  it("errors if cpuacct missing from components", () => {

    let inYaml = `
# GetELK

---
# kind: replicated
replicated_api_version: 2.8.0
name: GetELK
components:
  - name: Elasticsearch
monitors:
  cpuacct: 
    - "Logstash,quay.io/getelk/logstash:latest"
`;

    expect(lint(inYaml, [cpuMonitorContainerExists],
    )).to.deep.equal([
      {
        "message": "monitors.cpuacct entries must have matching component+container",
        "type": "error",
        "positions": [
          {
            "path": "monitors.cpuacct.0",
            "end": {
              "column": 47,
              "line": 11,
              "position": 182,
            },
            "start": {
              "column": 6,
              "line": 11,
              "position": 141,
            },
          },
          {
            "path": "components",
            "end": {
              "column": 0,
              "line": 9,
              "position": 113,
            },
            "start": {
              "column": 0,
              "line": 7,
              "position": 77,
            },
          },
        ],
        "received": "Logstash,quay.io/getelk/logstash:latest",
        "rule": "CPUMonitorContainerExists",
      },
    ]);
  });

  it("errors if cpuacct missing from component containers ", () => {

    let inYaml = `
# GetELK

---
# kind: replicated
replicated_api_version: 2.8.0
name: GetELK
components:
  - name: Logstash
    containers:
      - image_name: quay.io/getelk/collector
monitors:
  cpuacct: 
    - Logstash,quay.io/getelk/logstash
`;

    expect(lint(inYaml, [cpuMonitorContainerExists],
    )).to.deep.equal([
      {
        "message": "monitors.cpuacct entries must have matching component+container",
        "type": "error",
        "positions": [
          {
            "path": "monitors.cpuacct.0",
            "end": {
              "column": 38,
              "line": 13,
              "position": 229,
            },
            "start": {
              "column": 6,
              "line": 13,
              "position": 197,
            },
          },
          {
            "path": "components.0",
            "end": {
              "column": 0,
              "line": 11,
              "position": 169,
            },
            "start": {
              "column": 4,
              "line": 8,
              "position": 93,
            },
          },
        ],
        "received": "Logstash,quay.io/getelk/logstash",
        "rule": "CPUMonitorContainerExists",
      },
    ]);
  });
});
