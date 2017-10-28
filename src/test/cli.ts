import {afterEach, beforeEach, describe, it} from "mocha";
import {expect} from "chai";
import {spawnSync} from "child_process";
import * as stripAnsi from "strip-ansi";
import * as tmp from "tmp";
import * as fs from "fs";
import * as path from "path";

describe("replicated-lint", () => {
  describe("validate", () => {
    describe("--reporter console", () => {

      it("writes results to stdout for valid yaml", async () => {
        const {status, stdout} = spawnSync("bin/replicated-lint", [
          "validate", "-f", "docs/yamls/correct-native.yml",
        ]);
        expect(status).to.equal(0);
        expect(stdout.toString()).to.contain("All clear!");
      });

      it("writes an error to stdout for invalid yaml", async () => {
        const {status, stdout} = spawnSync("bin/replicated-lint", ["validate", "-f", "-"], {
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

      it("writes xml to a specified output directory", async () => {
        const {status, stdout} = spawnSync("bin/replicated-lint", [
          "validate", "-f", "docs/yamls/correct-native.yml",
          "--reporter", "junit",
          "--outputDir", tmpdir.name,
        ]);
        expect(status).to.equal(0);
        expect(stdout.toString()).to.contain("All clear!");
        const resultsXML = fs.readFileSync(path.join(tmpdir.name, "replicated-lint-results.xml"));

        expect(resultsXML.toString()).to.contain("<testsuite name=\"replicated-lint\"");
      });

      it("exits with a non-zero exit code if yaml is invalid", async () => {
        const {status, stdout} = spawnSync("bin/replicated-lint", [
          "validate", "-f", "-",
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

      it("Should only run the two syntax checks", async () => {
        const {status, stdout} = spawnSync("bin/replicated-lint", [
          "validate", "--excludeDefaults", "--infile", "docs/yamls/correct-native.yml",
        ], {});
        expect(status).to.equal(0);
        expect(stdout.toString()).to.contain("2/2");
        expect(stdout.toString()).to.contain("All clear!");
      });
      it("writes an error to stdout for invalid yaml", async () => {
        const {status, stdout} = spawnSync("bin/replicated-lint", [
          "validate", "--excludeDefaults", "-f", "-",
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
  });
});
