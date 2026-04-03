---
name: careful
description: Activate safety guardrails — pause before destructive actions, scope blast radius, require rollback plan
argument-hint: "[optional: specific area to guard e.g. 'terraform' or 'db']"
---

# careful

Activates explicit safety guardrails for a session involving destructive or high-risk operations.

Note: basic safety rules are always active via `careful.mdc` (alwaysApply: true). This skill activates heightened caution for sessions involving infra, DB migrations, or production changes.

## Hard stops (always require confirmation)
- Terraform apply/destroy
- kubectl delete, helm uninstall
- DROP TABLE, TRUNCATE, schema migrations
- rm -rf, force push to main
- Disabling auth

## What it adds
- States blast radius before every action
- Requires explicit rollback path before any change
- Narrates planned actions before executing
- Flags "production data is disposable" assumptions

## When to invoke explicitly
```
@careful "about to run DB migration in production"
@careful "terraform changes touching prod VPC"
```
