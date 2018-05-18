
## `spec-require-render`

lifecycle should include at least one `render` step





#### Examples:

*Incorrect*: lifecycle is empty

```yaml---
lifecycle:
  v1: []

```


*Incorrect*: lifecycle has no render step

```yaml---
lifecycle:
  v1:
    - message:
        contents: welcome to ship!
    - message:
        contents: still here

```



*Correct*: lifecycle has a render step

```yaml---
lifecycle:
  v1:
    - message:
        contents: welcome to ship!
    - render: {}

```


*Correct*: lifecycle has a render step with customization

```yaml---
lifecycle:
  v1:
    - message:
        contents: welcome to ship!
    - render:
        skip_plan: true

```


    

## `assets-require-test-script`

assets require a `test` shell script





#### Examples:

*Incorrect*: Missing test script

```yaml---
assets:
  v1:
    - inline:
        contents: echo "installing app"
        dest: scripts/install.sh

```



*Correct*: Includes a test script

```yaml---
assets:
  v1:
    - inline:
        contents: echo "running tests"
        dest: scripts/test.sh

```


    

## `assets-require-install-script`

assets require a `install` shell script





#### Examples:

*Incorrect*: Missing install script

```yaml---
assets:
  v1:
    - inline:
        contents: echo "running tests"
        dest: scripts/test.sh

```



*Correct*: Includes a install script

```yaml---
assets:
  v1:
    - inline:
        contents: echo "running installs"
        dest: scripts/install.sh

```


    



*Generated at Thu May 17 2018 18:11:13 GMT-0700 (PDT)*

