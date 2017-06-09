# replicated-lint

Yaml Linting Tools for Replicated yaml

## Usage


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
