
## `spec-require-render`

lifecycle should include at least one `render` step





#### Examples:

*Incorrect*: lifecycle is empty

```yaml---
lifecycle: []

```


*Incorrect*: lifecycle has no render step

```yaml---
lifecycle:
  - message:
      contents: welcome to ship!

```



*Correct*: lifecycle has a render step

```yaml---
lifecycle:
  render: {}

```


*Correct*: lifecycle has a render step with customization

```yaml---
lifecycle:
  render:
    skip_plan: true

```


    



*Generated at Tue May 01 2018 16:07:55 GMT-0700 (PDT)*

