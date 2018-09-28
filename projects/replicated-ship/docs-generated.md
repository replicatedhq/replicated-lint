
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

assets require a test script in `scripts/test.sh`





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


*Correct*: Includes a test script

```yaml---
assets:
  v1:
    - inline:
        contents: echo "running tests"
        dest: ./scripts/test.sh

```


    

## `assets-require-install-script`

assets require an install script in `scripts/install.sh`





#### Examples:

*Incorrect*: Missing install script

```yaml---
assets:
  v1:
    - inline:
        contents: echo "running tests"
        dest: scripts/test.sh

```



*Correct*: Includes an install script

```yaml---
assets:
  v1:
    - inline:
        contents: echo "running installs"
        dest: scripts/install.sh

```


*Correct*: Includes an install script

```yaml---
assets:
  v1:
    - inline:
        contents: echo "running installs"
        dest: ./scripts/install.sh

```


    

## `terraform-asset-requires-terraform-lifecycle`

lifecycle should include a `terraform` step when a `terraform` asset is defined





#### Examples:

*Incorrect*: terraform asset without terraform lifecycle step

```yaml---
assets:
  v1:
    - terraform:
        inline: provider "google" {}
lifecycle:
  v1:
    - render: {}

```


*Incorrect*: terraform lifecycle step without terraform asset

```yaml---
assets:
  v1: {}
lifecycle:
  v1:
    - terraform: {}

```



*Correct*: terraform asset and terraform lifecycle step

```yaml---
assets:
  v1:
    - terraform:
        inline: provider "google" {}
lifecycle:
  v1:
    - terraform: {}

```


    



*Generated at Fri Sep 28 2018 17:03:22 GMT-0700 (PDT)*

