
## `spec-analyze-tip`

By adding an `analyze` section, you can customize what kinds of insights to surface from your support bundle.



#### More Info:

- https://help.replicated.com/docs/troubleshoot/analyzers/creating-analyzers/

#### Examples:

*Incorrect*: Spec has no `analyze`

```yaml---

```


*Incorrect*: Spec `analyze` is empty

```yaml---
analyze: []

```



*Correct*: Spec has a `analyze` specified

```yaml---
analyze:
- name: processes.configmanagement.puppet
  insight:
    primary: Managed By Puppet
    detail: This server is running a Puppet agent
    severity: info

```


    



*Generated at Fri Jun 07 2019 11:59:00 GMT-0700 (PDT)*

