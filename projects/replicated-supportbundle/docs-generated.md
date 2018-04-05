
## `spec-lifecycle-tip`

Did you know you can create custom, interactive workflows and messaging for your end customer by defining a lifecycle?



#### More Info:

- https://help.replicated.com/api/support-bundle-yaml-lifecycle/root

#### Examples:

*Incorrect*: Spec has no `lifecycle`

```yaml---
specs: []
lifecycle:

```


*Incorrect*: Spec `lifecycle` is empty

```yaml---
specs: []
lifecycle: []

```



*Correct*: Spec has a `lifecycle` specified

```yaml---
specs: []
lifecycle:
  - message:
      contents: generating bundle...
  - generate: {}

```


*Correct*: Spec has a `lifecycle` specified and includes the default files

```yaml---
specs: []
lifecycle:
  - message:
      contents: generating bundle...
  - generate:
      use_defaults: true

```


*Correct*: Spec has a `lifecycle` specified and explicitly does not include the default files

```yaml---
specs: []
lifecycle:
  - message:
      contents: generating bundle...
  - generate:
      use_defaults: false

```


    

## `spec-specs-tip`

By adding a `specs` section, you can customize what kinds of diagnostic information is collected about your application.



#### More Info:

- https://help.replicated.com/api/support-bundle-yaml-specs/shared

#### Examples:

*Incorrect*: Spec has no `specs`

```yaml---
lifecycle:
  - message:
      contents: "Collecting..."

```


*Incorrect*: Spec `specs` is empty

```yaml---
specs: []
lifecycle:
  - message:
      contents: "Collecting..."

```



*Correct*: Spec has a `specs` specified

```yaml---
specs:
  - os.read-file:
      filepath: "/etc/hosts"
      output_dir: /etc/hosts

```


    



*Generated at Thu Apr 05 2018 11:51:44 GMT-0700 (DST)*

