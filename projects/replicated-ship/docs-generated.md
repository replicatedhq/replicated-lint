
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


    



*Generated at Fri Dec 07 2018 10:42:41 GMT-0800 (Pacific Standard Time)*

