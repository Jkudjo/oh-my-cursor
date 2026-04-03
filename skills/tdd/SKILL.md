---
name: tdd
description: Test-driven development — write failing tests first, then implement to make them pass
argument-hint: "<feature or function to build with TDD>"
---

# tdd

Invoke this skill to follow a strict red-green-refactor TDD cycle.

## When to use

- Building a new function, module, or feature from scratch
- When you want tests to define the contract before implementation
- Fixing a bug (write a failing test that reproduces it first)

## What it does

### Red phase
1. Read the clarified scope (from memory key `clarified-scope` if available)
2. Write failing tests that define the expected behavior:
   - Happy path
   - Edge cases
   - Error conditions
3. Run the tests — verify they ALL fail (red)
4. Do NOT write any implementation yet

### Green phase
5. Write the minimum implementation to make tests pass
6. Run tests — iterate until all pass (green)
7. No over-engineering — minimum code only

### Refactor phase
8. Clean up the implementation without changing behavior
9. Run tests again — must still be green
10. Commit: "test: add tests for X" then "feat: implement X"

## Rules

- Tests are written before implementation — always
- Green phase: minimum code, no extras
- Refactor phase: never change observable behavior
- Never delete or weaken tests to make them pass
