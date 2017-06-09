import { describe, it } from "mocha";
import { expect } from "chai";
import { Range } from "../lint";
import * as ast from "yaml-ast-parser";
import * as lineColumn from "line-column";
import { astPosition, findNode, findNodes } from "../ast";

describe("findNode(s)", () => {
  it("handles an empty object", () => {
    const loaded: any = ast.safeLoad(`
---
{}
  `, null);
    expect(findNode(loaded, "foo")).to.be.empty;
  });
  it("handles a missing node", () => {
    const loaded: any = ast.safeLoad(`
---
foo: bar
  `, null);
    expect(findNode(loaded, "spam")).to.be.empty;
  });

  it("finds the root node", () => {
    const loaded: any = ast.safeLoad(`
---
foo: bar
  `, null);
    const node = findNode(loaded, "foo");
    expect(node).to.have.deep.property("key.value", "foo");
    expect(node).to.have.deep.property("kind", 1);
    expect(node).to.have.deep.property("value.value", "bar");
    expect(node).to.have.deep.property("value.kind", 0);
  });
  it("picks a node from two keys", () => {
    const loaded: any = ast.safeLoad(`
---
foo: bar
baz: boz
  `, null);
    const node = findNode(loaded, "baz");
    expect(node).to.have.deep.property("key.value", "baz");
    expect(node).to.have.deep.property("kind", 1);
    expect(node).to.have.deep.property("value.value", "boz");
    expect(node).to.have.deep.property("value.kind", 0);
  });
  it("finds nested values", () => {
    const loaded: any = ast.safeLoad(`
---
foo:
  biz: boz
  bar: baz
  `, null);
    const node = findNode(loaded, "foo.bar");
    expect(node).to.have.deep.property("kind", 1);
    expect(node).to.have.deep.property("key.value", "bar");
    expect(node).to.have.deep.property("value.value", "baz");
    expect(node).to.have.deep.property("value.kind", 0);
  });

  it("handles lists that don't match", () => {
    const loaded: any = ast.safeLoad(`
---
foo:
  - bar: baz
  `, null);
    const node = findNode(loaded, "foo.bar");
    expect(node).to.be.undefined;
  });
  it("finds values in a list", () => {
    const loaded: any = ast.safeLoad(`
---
foo:
  - bar: baz
  `, null);
    const node = findNode(loaded, "foo.*.bar");
    expect(node).to.have.deep.property("kind", 1);
    expect(node).to.have.deep.property("key.value", "bar");
    expect(node).to.have.deep.property("value.value", "baz");
    expect(node).to.have.deep.property("value.kind", 0);
  });
  it("gets a map parent", () => {
    const loaded: any = ast.safeLoad(`
---
foo:
  bar: {}
  `, null);
    const node = findNode(loaded, "foo.bar");
    expect(node).to.have.deep.property("kind", 1);
    expect(node).to.have.deep.property("key.value", "bar");
    expect(node).to.have.deep.property("value.kind", 2);
    expect(node.value.mappings).to.be.empty;
  });
  it("finds many values in a list", () => {
    const loaded: any = ast.safeLoad(`
---
foo:
  - bar: baz
  - bar: boz
  `, null);
    const nodes = findNodes(loaded, "foo.*.bar");
    expect(nodes[0]).to.have.deep.property("kind", 1);
    expect(nodes[0]).to.have.deep.property("key.value", "bar");
    expect(nodes[0]).to.have.deep.property("value.value", "baz");
    expect(nodes[0]).to.have.deep.property("value.kind", 0);

    expect(nodes[1]).to.have.deep.property("kind", 1);
    expect(nodes[1]).to.have.deep.property("key.value", "bar");
    expect(nodes[1]).to.have.deep.property("value.value", "boz");
    expect(nodes[1]).to.have.deep.property("value.kind", 0);
  });

  it("terminates on a list", () => {
    const loaded: any = ast.safeLoad(`
---
foo:
  - baz
  - boz
  `, null);
    const nodes = findNodes(loaded, "foo");
    expect(nodes[0]).to.have.deep.property("value.kind", 3);
    expect(nodes[0]).to.have.deep.property("value.items[0].value", "baz");
    expect(nodes[0]).to.have.deep.property("value.items[1].value", "boz");

  });

  it("terminates on a list wildcard", () => {
    const loaded: any = ast.safeLoad(`
---
foo:
  - baz
  - boz
  `, null);
    const nodes = findNodes(loaded, "foo.*");
    expect(nodes[0]).to.have.deep.property("kind", 0);
    expect(nodes[0]).to.have.deep.property("value", "baz");
    expect(nodes[1]).to.have.deep.property("kind", 0);
    expect(nodes[1]).to.have.deep.property("value", "boz");

  });

  it("terminates on a list index", () => {
    const loaded: any = ast.safeLoad(`
---
foo:
  - baz
  - boz
  `, null);
    const nodes = findNodes(loaded, "foo.1");
    expect(nodes.length).to.equal(1);
    expect(nodes[0]).to.have.deep.property("kind", 0);
    expect(nodes[0]).to.have.deep.property("value", "boz");

  });

  it("recurs on a list index", () => {
    const loaded: any = ast.safeLoad(`
---
foo:
  - baz
  - bar: eggs
  `, null);
    const nodes = findNodes(loaded, "foo.1.bar");
    expect(nodes.length).to.equal(1);
    expect(nodes[0]).to.have.deep.property("value.kind", 0);
    expect(nodes[0]).to.have.deep.property("value.value", "eggs");

  });

  it("handles a big gnarly thing", () => {
    const loaded: any = ast.safeLoad(`
---
app:
  containers:
    - name: c1
      image: redis:3.1.2
      env:
        REDIS_HOST: something
    - name: c2
      image: redis:3.1.3
      env:
        REDIS_HOST: something else
      
      
configItems:
  folks:
    - name: whatever
  `, null);
    const nodes = findNodes(loaded, "app.containers.*.env.REDIS_HOST");
    expect(nodes[0]).to.have.deep.property("kind", 1);
    expect(nodes[0]).to.have.deep.property("key.value", "REDIS_HOST");
    expect(nodes[0]).to.have.deep.property("value.value", "something");
    expect(nodes[0]).to.have.deep.property("value.kind", 0);

    expect(nodes[1]).to.have.deep.property("kind", 1);
    expect(nodes[1]).to.have.deep.property("key.value", "REDIS_HOST");
    expect(nodes[1]).to.have.deep.property("value.value", "something else");
    expect(nodes[1]).to.have.deep.property("value.kind", 0);
  });
});

describe("astPositions", () => {
  it("gets AST positions", () => {
    let doc = `
---
foo: bar
app:
  containers:
    - name: c1
      image: redis:3.1.2
      env:
        REDIS_HOST: something
    - name: c2
      image: redis:3.1.3
      env:
        REDIS_HOST: something else
  config:
    method: drr
      
      
configItems:
  folks:
    - name: whatever
  `;
    const astDoc: any = ast.safeLoad(doc, null);
    const lineCol: any = lineColumn(doc);
    let pos: Range[] = astPosition(astDoc, "foo", lineCol);
    expect(pos.length).to.equal(1);
    expect(pos[0].path).to.equal("foo");
    expect(pos[0].start.position).to.equal(5);
    expect(pos[0].start.line).to.equal(2);

    pos = astPosition(astDoc, "app.config.method", lineCol);
    expect(pos.length).to.equal(1);
    expect(pos[0].path).to.equal("app.config.method");
    expect(pos[0].start.position).to.equal(214);
    expect(pos[0].start.line).to.equal(14);
    expect(pos[0].start.column).to.equal(4);
  });
});
