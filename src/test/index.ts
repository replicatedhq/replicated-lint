import { describe, it } from "mocha";
import { expect } from "chai";
import { RulerPredicate, lint, lintMultidoc } from "../lint";

describe("lint", () => {
  describe("Passing valid yaml", () => {
    it("should return not warnings", () => {
      expect(lint("{}")).to.be.empty;
    });
  });

  const emptyCases: any[][] = [
    [undefined, [{
      type: "warn",
      rule: "notEmpty",
      received: undefined,
      message: "No document provided",
    }]],
    [null, [{
      type: "warn",
      rule: "notEmpty",
      received: null,
      message: "No document provided",
    }]],
    ["", [{
      type: "warn",
      rule: "notEmpty",
      received: "",
      message: "No document provided",
    }]],
  ];

  emptyCases.forEach(([input, expected]) => {
    it("should return a error when passed" + input, () => {
      expect(lint(input)).to.deep.equal(expected);
    });
  });

  describe("Passing invalid yaml", () => {
    it("should return a error panic warning with the failed indices", () => {
      expect(lint(`
---
foo: }`)).to.deep.equal([{
        type: "error",
        rule: "validYaml",
        positions: [{
          start: {
            column: 5,
            line: 2,
            position: 10,
          },
        }],
        received: `
---
foo: }`,
        message: `end of the stream or a document separator is expected at line 3, column 6:\n    foo: }\n         ^`,
      }]);
    });
  });

});

describe("lintMultidoc", () => {
  it("should handle multidoc yaml", () => {
    expect(lintMultidoc(`---
foo: {}
---
bar: {}`)).to.deep.equal([{
      index: 0,
      findings: [],
    }, {
      index: 1,
      findings: [],
    }]);
  });
  it("should give global indices for multidoc failures", () => {
    let inYaml = `


# nothing to see here

---
foo: {}
---

# lol


---
fdfsjl: ]
---
bar: {}
`;
    expect(lintMultidoc(inYaml)).to.deep.equal([{
      index: 0,
      findings: [],
    }, {
      index: 1,
      findings: [{
        type: "warn",
        rule: "notEmpty",
        received: "\n\n# lol\n\n\n",
        message: "No document provided",
      }],
    }, {
      index: 2,
      findings: [
        {
          message: "end of the stream or a document separator is expected at line 2, column 9:\n    fdfsjl: ]\n            ^",
          positions: [
            {
              start: {
                column: 8,
                line: 13,
                position: 63,
              },
            },
          ],
          received: "\nfdfsjl: ]\n",
          rule: "validYaml",
          type: "error",
        },
      ],
    }, {
      index: 3,
      findings: [],
    }]);
  });
});

describe("lint with rules", () => {
  describe("'not' rules", () => {
    it("should error when foo.bar is baz ", () => {
      expect(lint(`
---
foo:
  bar: baz
      `, [{
        test: new RulerPredicate({
          comparator: "not",
          path: "foo.bar",
          value: "baz",
        }),
        type: "error",
        name: "foo-dot-bar-not-baz",
        message: "foo.bar can't be baz!",
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
      }]);

      it("should not error when foo.bar is not baz ", () => {
        expect(lint(`
---
foo:
  bar: boz
      `, [{
          test: new RulerPredicate({
            comparator: "not",
            path: "foo.bar",
            value: "baz",
          }),
          type: "error",
          name: "foo-dot-bar-not-baz",
          message: "foo.bar can't be baz!",
        }])).to.be.empty;
      });
    });
  });
});
