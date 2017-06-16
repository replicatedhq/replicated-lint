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
