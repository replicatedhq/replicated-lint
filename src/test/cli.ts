import { afterEach, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import { spawnSync } from "child_process";
import * as stripAnsi from "strip-ansi";
import * as tmp from "tmp";
import * as fs from "fs";
import * as path from "path";

const timeout = process.env.CLI_TEST_TIMEOUT || 5000;

describe("replicated-lint", () => {
  describe("validate", () => {
    describe("--reporter console", () => {

      it("writes results to stdout for valid yaml", function() {
        this.timeout(timeout);
        const {status, stdout} = spawnSync("node", [
          "-r", "ts-node/register", "src/cmd/index.ts", "validate", "-f", "docs/yamls/correct-native.yml",
        ]);
        expect(status).to.equal(0, `${{stdout: stdout.toString()}}`);
        expect(stdout.toString()).to.contain("All clear!");
      });

      it("writes an error to stdout for invalid yaml", function() {
        this.timeout(timeout);
        const {status, stdout} = spawnSync("node", ["-r", "ts-node/register", "src/cmd/index.ts", "validate", "-f", "-"], {
          input: "",
        });
        expect(status).to.equal(1);
        expect(stripAnsi(stdout.toString())).to.contain(`{ type: 'error',
  rule: 'mesg-yaml-not-empty',
  message: 'Document must not be empty' }
`);
      });
    });
    describe("--reporter junit", () => {
      let tmpdir;
      beforeEach(() => {
        tmpdir = tmp.dirSync({unsafeCleanup: true});
      });
      afterEach(() => {
        tmpdir.removeCallback();
      });

      it("writes xml to a specified output directory", function() {
        this.timeout(timeout);
        const {status, stdout} = spawnSync("node", [
          "-r", "ts-node/register", "src/cmd/index.ts", "validate", "-f", "docs/yamls/correct-native.yml",
          "--reporter", "junit",
          "--outputDir", tmpdir.name,
        ]);
        expect(status).to.equal(0, `${{stdout: stdout.toString()}}`);
        expect(stdout.toString()).to.contain("All clear!");
        const resultsXML = fs.readFileSync(path.join(tmpdir.name, "replicated-lint-results.xml"));

        expect(resultsXML.toString()).to.contain("<testsuite name=\"replicated-lint\"");
      });

      it("exits with a non-zero exit code if yaml is invalid", function() {
        this.timeout(timeout);
        const {status, stdout} = spawnSync("node", [
          "-r", "ts-node/register", "src/cmd/index.ts", "validate", "-f", "-",
          "--reporter", "junit",
          "--outputDir", tmpdir.name,
        ], {
          input: "",
        });
        expect(status).to.equal(1);
        expect(stripAnsi(stdout.toString())).to.contain("Found 1 issues.");

        const resultsXML = fs.readFileSync(path.join(tmpdir.name, "replicated-lint-results.xml"));
        expect(resultsXML.toString()).to.contain("<testsuite name=\"replicated-lint\"");
        expect(resultsXML.toString()).to.contain("<failure");
      });
    });
    describe("--excludeDefaults", () => {

      it("Should only run the two syntax checks", function() {
        this.timeout(timeout);
        const {status, stdout} = spawnSync("node", [
          "-r", "ts-node/register", "src/cmd/index.ts", "validate", "--excludeDefaults", "--infile", "docs/yamls/correct-native.yml",
        ], {});
        expect(status).to.equal(0, `${{stdout: stdout.toString()}}`);
        expect(stdout.toString()).to.contain("2/2");
        expect(stdout.toString()).to.contain("All clear!");
      });
      it("writes an error to stdout for invalid yaml", function() {
        this.timeout(timeout);
        const {status, stdout} = spawnSync("node", [
          "-r", "ts-node/register", "src/cmd/index.ts", "validate", "--excludeDefaults", "-f", "-",
        ], {
          input: "]]]:",
        });
        expect(status).to.equal(1);
        expect(stripAnsi(stdout.toString())).to.contain("{ type: 'error',\n" +
          "  rule: 'mesg-yaml-valid',\n" +
          "  message: 'end of the stream or a document separator is expected at line 1, column 1:\\n    ]]]:\\n    ^',\n" +
          "  positions: [] }\n",
        );
      });
    });
    describe("--multidocIndex", () => {
      it("0 Should select the first doc from multidoc yaml", () => {
        const {status, stdout, stderr} = spawnSync("node", [
          "-r", "ts-node/register", "src/cmd/index.ts", "validate", "-f", "-", "--multidocIndex", "0",
        ], {
          input: `
---
# kind: replicated
replicated_api_version: 2.25.0
---
# kind: scheduler-kubernetes
apiVersion: v1
kind: Pod
# ...
        `,
        });

        const message = `\n${stdout.toString()}\n${stderr.toString()}`;

        expect(status).to.equal(0, message);
        expect(stdout.toString()).to.contain("64/64 checks passed", message);
        expect(stdout.toString()).to.contain("All clear!", message);
      });
      it("1 Should select the second doc from multidoc yaml (and fail because the k8s doc is missing `replicated_api_version`)", () => {
        const {status, stdout, stderr} = spawnSync("node", [
          "-r", "ts-node/register", "src/cmd/index.ts", "validate", "-f", "-", "--multidocIndex", "1",
        ], {
          input: `
---
# kind: replicated
replicated_api_version: 2.25.0
---
# kind: scheduler-kubernetes
apiVersion: v1
kind: Pod
# ...
        `,
        });

        const message = `\n${stdout.toString()}\n${stderr.toString()}`;

        expect(status).to.equal(1, message);
        expect(stdout.toString()).to.contain("prop-replicated-api-version-present", message);
      });
    });
  });
});
