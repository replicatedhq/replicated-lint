import { describe, it } from "mocha";
import { expect } from "chai";
import { ArrayMemberFieldsNotUnique } from "../predicates";

describe("ArrayMemberFieldsNotUnique", () => {
  it("should not match an array with unique `key` elements", () => {
    const obj = [
      {key: "foo"},
      {key: "bar"},
    ];
    const pred = new ArrayMemberFieldsNotUnique("key");

    const result = pred.test(obj);
    expect(result.matched).to.equal(false);
  });

  it("should match an array with non-unique `key` elements", () => {
    const obj = [
      {key: "foo"},
      {key: "bar"},
      {key: "foo"},
    ];
    const pred = new ArrayMemberFieldsNotUnique("key");

    const result = pred.test(obj);
    expect(result.matched).to.equal(true);
    expect(result.paths).to.contain("0.key");
    expect(result.paths).to.contain("2.key");
  });

  it("should handle nested elements", () => {
    const obj = [
      {key: {items: { first: "foo"}}},
      {key: {items: { first: "bar"}}},
      {key: {items: { first: "foo"}}},
    ];
    const pred = new ArrayMemberFieldsNotUnique("key.items.first");

    const result = pred.test(obj);
    expect(result.matched).to.equal(true);
    expect(result.paths).to.contain("0.key.items.first");
    expect(result.paths).to.contain("2.key.items.first");
  });
});
