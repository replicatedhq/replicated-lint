
## `spec-prop-unique-keys`

Entitlement Spec keys must be unique





#### Examples:

*Incorrect*: spec has duplicated key `my_field`

```yaml---
- name: My Field
  type: string
  description: My cool field
  key: my_field
- name: My Other Field
  type: number
  description: some other field
  key: my_field

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


    



*Generated at Mon Mar 13 2023 23:21:27 GMT+0000 (Coordinated Universal Time)*


## `spec-prop-unique-keys`

Entitlement Spec keys must be unique





#### Examples:

*Incorrect*: spec has duplicated key `my_field`

```yaml---
- name: My Field
  type: string
  description: My cool field
  key: my_field
- name: My Other Field
  type: number
  description: some other field
  key: my_field

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


    



*Generated at Mon Mar 13 2023 23:21:27 GMT+0000 (Coordinated Universal Time)*

