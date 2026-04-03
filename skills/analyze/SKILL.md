---
name: analyze
description: Deep codebase analysis — complexity, coupling, dead code, tech debt hotspots
argument-hint: "<area or question to analyze, e.g. 'auth module' or 'why is startup slow'>"
---

# analyze

Invoke this skill for a structured analytical deep-dive into a codebase area.

## When to use

- Before a large refactor — understand what you're dealing with
- Investigating performance issues
- Finding tech debt hotspots
- Understanding why something is complex or fragile

## Analysis dimensions

- **Complexity** — functions > 40 lines, deeply nested logic, cyclomatic complexity hotspots
- **Coupling** — what depends on what, blast radius of changes
- **Dead code** — unused exports, unreachable branches, zombie files
- **Tech debt** — TODO/FIXME/HACK comments, workarounds, legacy patterns
- **Test coverage** — which paths have no tests
- **Dependencies** — outdated packages, circular imports, unnecessary deps

## Output

```markdown
## Analysis: {area}

### Summary
[3-sentence overview]

### Hotspots
- `file:line` — issue and why it matters

### Dependency map
[key relationships]

### Recommended actions
Priority 1: ...
Priority 2: ...
```

Saves to memory key `analyze-{area}` and artifact type=`specs`.
