# replicated-lint

[![CircleCI](https://circleci.com/gh/replicatedhq/replicated-lint/tree/master.svg?style=svg&circle-token=9ae2573df7075cff352d329eb7f88d52037872b5)](https://circleci.com/gh/replicatedhq/replicated-lint/tree/master)
[![Code Climate](https://codeclimate.com/github/replicatedhq/replicated-lint/badges/gpa.svg)](https://codeclimate.com/github/replicatedhq/replicated-lint) 
[![Test Coverage](https://codeclimate.com/github/replicatedhq/replicated-lint/badges/coverage.svg)](https://codeclimate.com/github/replicatedhq/replicated-lint) 

YAML linting tools for Replicated applications.

This feature is in *alpha*, APIs and behaviors are subject to change without notice.

## Usage

```
npm install --save replicated-lint
```

```typescript
import * as linter from "replicated-lint";

const yaml = `
---
replicated_api_version: 2.8.0
components: 
  - name: ELK
    containers: 
      - image: getelk/search`;


const ruleViolations = linter.lint(yaml, linter.rules.all);
console.log(ruleViolations); // []

```
### Custom Rule Sets

`linter.rules.all` can be substituted or extended with custom rule
definitions. A rule's `test` field should return `{ matched: true }` 
when the rule is triggered by invalid JSON.

```typescript
import * as linter from "replicated-lint"; 

const yaml = `
---
foo:
  bar: baz`;

const testSpec: any = {
  type: "Or",
  preds: [
    {type: "Eq", path: "foo.bar", value: "baz"},
    {type: "Eq", path: "foo.bar", value: "boz"},
  ],
}

const rules: linter.YAMLRule[] = [
  {
    name: "foo-bar-neq-baz",
    message: "foo.bar can't be baz!",
    test: testSpec,
    type: "error",
  }
];

const ruleViolations = linter.lint(yaml, rules);
console.log(ruleViolations);  /*
[{
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
        rule: "foo-bar-neq-baz",
        message: "foo.bar can't be baz!",
}]
*/
```

Register new rules with `linter.enginer.register`. Rules should implement `JSONReadable<Predicate<any>>`, usually as a static method

```typescript
import * as linter from "replicated-lint"; 

const yaml = `
---
spam: eggs`;

// rule MyRule checks if root object has property "spam" equal to "eggs"
class MyRule implements linter.Predicate<any> {
  public static fromJson(obj: any, registry: linter.engine.Registry) {
    return {
      test(obj: any) {
        const matched = obj.spam !== "eggs"; // fail when spam != eggs
        const paths = ["spam"];
        return { matched, paths };
      }
    };
  }
  
}

linter.engine.register(MyRule);

const testSpec: any = { type: "MyRule" };

const rules: linter.YAMLRule[] = [
  {
    name: "spam-eq-eggs",
    message: "spam must be equal to eggs!",
    test: testSpec,
    type: "error",
  }
];

const ruleViolations = linter.lint(yaml, rules); 
console.log(ruleViolations); // []
```

Custom implementations of `engine.Registry` can also be passed as a third argument to `linter.lint`, otherwise a default 
registry will be used.
