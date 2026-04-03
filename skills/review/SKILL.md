---
name: review
description: Code review checklist — catch bugs, security issues, and design problems before merging
argument-hint: "<what to review, e.g. 'the auth PR' or 'recent changes to src/api/'>"
---

# review

Invoke this skill to run a structured code review pass on changed code.

## When to use

- Before merging a PR or branch
- After implementing a feature with @ralph or @autopilot
- When you want a second-opinion pass on changed code

## What it does

1. Reads the diff or specified files
2. Reviews against this checklist:
   - **Correctness** — does it do what it claims?
   - **Security** — SQL injection, XSS, auth bypasses, secrets in code
   - **Edge cases** — nulls, empty inputs, concurrent access, large inputs
   - **Error handling** — are failures caught and handled properly?
   - **Tests** — are new code paths covered?
   - **Breaking changes** — does it break existing callers or contracts?
   - **Naming & clarity** — is the intent clear without comments?
3. Reports: PASS / PASS WITH NOTES / FAIL with specific line references
4. Saves review summary to memory key `last-review`

## Example

```
@review "the changes to src/auth/ in this PR"
```
