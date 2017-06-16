import { describe, it } from "mocha";
import { expect } from "chai";
import { TraverseSearcher } from "../traverse";

describe("traverse.searchValues(obj, RegExp)", () => {

  const searcher = new TraverseSearcher();

  it("handles an empty object", () => {
    const obj = {};
    expect(searcher.search(obj, /foo/.test.bind(/foo/))).to.be.empty;
  });
  it("finds the first value", () => {
    const obj = { bar: "foo" };
    expect(searcher.search(obj, /foo/.test.bind(/foo/))).to.deep.equal([
      {
        value: "foo",
        path: "bar",
      },
    ]);
  });
  it("finds deep values", () => {
    const obj = {
      bar: {
        baz: {
          biz: "{{repl ConfigOption \"auth_score\"}}",
        },
      },
    };
    const regex = /{{repl ConfigOption/;
    expect(searcher.search(obj, regex.test.bind(regex))).to.deep.equal([
      {
        value: "{{repl ConfigOption \"auth_score\"}}",
        path: "bar.baz.biz",
      },
    ]);
  });
  it("searches lists", () => {
    const obj = {
      bar: {
        baz: {
          biz: [
            "{{repl ConfigOption \"auth_score\"}}",
            "{{repl ConfigOption \"hostname\"}}",
          ],
        },
      },
    };
    const regex = /{{repl ConfigOption/;
    expect(searcher.search(obj, regex.test.bind(regex))).to.deep.equal([
      {
        value: "{{repl ConfigOption \"auth_score\"}}",
        path: "bar.baz.biz.0",
      },
      {
        value: "{{repl ConfigOption \"hostname\"}}",
        path: "bar.baz.biz.1",
      },
    ]);
  });
});
