import { describe, it } from "mocha";
import { expect } from "chai";
import { ValueTraverser, TraverseSearcher } from "../traverse";

describe("TraverseSearcher#searchMatch(obj, RegExp)", () => {

  const searcher = new TraverseSearcher(new ValueTraverser());

  it("handles an empty object", () => {
    const obj = {};
    expect(searcher.searchMatch(obj, /foo/.test.bind(/foo/))).to.be.empty;
  });
  it("finds the first value", () => {
    const obj = { bar: "foo" };
    expect(searcher.searchMatch(obj, /foo/.test.bind(/foo/))).to.deep.equal([
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
    expect(searcher.searchMatch(obj, regex.test.bind(regex))).to.deep.equal([
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
    expect(searcher.searchMatch(obj, regex.test.bind(regex))).to.deep.equal([
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
