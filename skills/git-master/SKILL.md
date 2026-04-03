---
name: git-master
description: Git operations — clean commits, branch management, PR prep, conflict resolution
argument-hint: "<operation: 'clean commit', 'prep PR', 'resolve conflicts', 'summarize changes'>"
---

# git-master

Invoke this skill for structured git operations.

## Operations

### clean-commit
- Stage only relevant changes (no debug code, no unrelated files)
- Write a conventional commit message: `type(scope): description`
- Types: feat, fix, refactor, test, docs, chore, perf
- Body: explain why, not what

### prep-pr
- Summarize all commits since the base branch
- Write a PR description: summary, motivation, test plan, screenshots (if UI)
- Check: no secrets, no debug code, no console.logs, tests pass

### resolve-conflicts
- Read all conflicted files
- For each conflict: understand both sides before choosing
- Prefer the intent of both changes when possible — don't just pick one side
- Verify the merged result is coherent

### summarize-changes
- Read git log and diff since a given ref
- Produce a human-readable changelog grouped by: features, fixes, refactors, breaking changes

## Rules

- Never force-push to main/master
- Never commit secrets or credentials
- Always verify tests pass before marking a PR ready
