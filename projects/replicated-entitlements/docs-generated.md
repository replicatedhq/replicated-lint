
## `spec-prop-unique-keys`

Entitleemnt Spec keys must be unique





#### Examples:

*Incorrect*: spec has duplicated keys

```yaml---
- name: My Field
  key: my_field
  description: My cool field
  type: string
- name: My Other Field
  key: my_field
  description: some other field
  type: number

```



*Correct*: Spec keys have unique names

```yaml---
- name: My Field
  key: my_field
  description: My cool field
  type: string
- name: My Other Field
  key: my_other_field
  description: some other field
  type: number

```


    



*Generated at Sun Jan 14 2018 11:57:40 GMT-0800 (PST)*

