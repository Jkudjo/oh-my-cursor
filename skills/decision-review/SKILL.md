---
name: decision-review
description: Audit the quality of reasoning, not just code — problem framing, hypothesis quality, risk estimation
argument-hint: "<task or session to review>"
---

# decision-review

Reviews the thinking process that led to the code, not the code itself.

## What it scores (1–5 each)
- **Problem framing** — was the right problem solved?
- **Hypothesis quality** — were alternatives considered before committing?
- **Risk estimation** — were risks accurately scoped?
- **Decision under uncertainty** — was overconfidence present?
- **Verification quality** — was success defined before starting?

## Why it exists

`@review` checks correctness. `@decision-review` checks judgment.

A system that only checks correctness will repeat the same reasoning failures. A system that checks judgment improves over time.

Patterns are persisted to memory and can be encoded into rules.

## Example
```
@decision-review "the auth middleware incident from this session"
```
