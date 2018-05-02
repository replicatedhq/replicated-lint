import { describe, it } from "mocha";
import { expect } from "chai";
import {
  AllOf,
  ArrayMemberFieldsNotUnique,
  Eq,
  Exists,
  Not,
} from "../predicates";

describe("ArrayMemberFieldsNotUnique", () => {
  it("should not match an array with unique `key` elements", () => {
    const obj = [
      { key: "foo" },
      { key: "bar" },
    ];
    const pred = new ArrayMemberFieldsNotUnique("key");

    const result = pred.test(obj);
    expect(result.matched).to.equal(false);
  });

  it("should match an array with non-unique `key` elements", () => {
    const obj = [
      { key: "foo" },
      { key: "bar" },
      { key: "foo" },
    ];
    const pred = new ArrayMemberFieldsNotUnique("key");

    const result = pred.test(obj);
    expect(result.matched).to.equal(true);
    expect(result.paths).to.contain("0.key");
    expect(result.paths).to.contain("2.key");
  });

  it("should handle nested elements", () => {
    const obj = [
      { key: { items: { first: "foo" } } },
      { key: { items: { first: "bar" } } },
      { key: { items: { first: "foo" } } },
    ];
    const pred = new ArrayMemberFieldsNotUnique("key.items.first");

    const result = pred.test(obj);
    expect(result.matched).to.equal(true);
    expect(result.paths).to.contain("0.key.items.first");
    expect(result.paths).to.contain("2.key.items.first");
  });
});

describe("AllOf", () => {
  it("should match an empty list", () => {
    const obj = {
      things: [],
    };
    const pred = new AllOf("things", new Eq("key", "bar"));

    const result = pred.test(obj);
    expect(result.matched).to.equal(true);
  });

  it("should not match a non empty list", () => {
    const obj = {
      things: [
        { key: "foo" },
        { key: "bar" },
      ],
    };
    const pred = new AllOf("things", new Eq("key", "bar"));

    const result = pred.test(obj);
    expect(result.matched).to.equal(false);
  });

  it("should match if all the members match", () => {
    const obj = {
      things: [
        { key: "foo" },
        { key: "foo" },
      ],
    };
    const pred = new AllOf("things", new Eq("key", "foo"));

    const result = pred.test(obj);
    expect(result.matched).to.equal(true);
  });

  it("should positive test the ship lifecycle rule", () => {
    const obj = {
      lifecycle: [
        { message: { contents: "hi" }},
      ],
    };
    const pred = new AllOf("lifecycle", new Not(new Exists("render")));

    const result = pred.test(obj);
    expect(result.matched).to.equal(true);
  });

  it("should negative test the ship lifecycle rule", () => {
    const obj = {
      lifecycle: [
        { message: { contents: "hi" }},
        { render: {}},
      ],
    };
    const pred = new AllOf("lifecycle", new Not(new Exists("render")));

    const result = pred.test(obj);
    expect(result.matched).to.equal(false);
  });

});
