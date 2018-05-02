
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


    



*Generated at Tue May 01 2018 17:39:51 GMT-0700 (PDT)*

