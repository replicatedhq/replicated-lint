import { describe, it } from "mocha";
import { expect } from "chai";
import { lint } from "../lint";

describe("lint with inline rules", () => {
  it("should error when foo.bar is baz ", () => {
    expect(lint(`
---
foo:
  bar: baz
      `, [{
        test: { Eq: { path: "foo.bar", value: "baz" } },
        type: "error",
        name: "foo-dot-bar-not-baz",
        message: "foo.bar can't be baz!",
        links: ["some-link-to-docs"],
      }])).to.deep.equal([{
        type: "error",
        positions: [{
          path: "foo.bar",
          start: {
            position: 12,
            line: 3,
            column: 2,
          },
          end: {
            position: 20,
            line: 3,
            column: 10,
          },
        }],
        received: "baz",
        rule: "foo-dot-bar-not-baz",
        message: "foo.bar can't be baz!",
        links: ["some-link-to-docs"],
      }]);

    it("should not error when foo.bar is not baz ", () => {
      expect(lint(`
---
foo:
  bar: quux
      `, [{
          test: { Eq: { path: "foo.bar", value: "baz" } },
          type: "error",
          name: "foo-dot-bar-not-baz",
          message: "foo.bar can't be baz!",
        }])).to.be.empty;
    });
  });
});
