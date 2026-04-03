# Contributing to oh-my-cursor

## Ways to contribute

- **New skills** — add a `skills/<name>/SKILL.md` + `rules/<name>.mdc`
- **Improve existing skills** — deepen protocols, fix edge cases
- **Bug reports** — open an issue with steps to reproduce
- **Feature requests** — open an issue describing the use case

## Adding a skill

1. Create `skills/<name>/SKILL.md` with frontmatter:
   ```markdown
   ---
   name: skill-name
   description: One-line description shown in `omc skills`
   argument-hint: "<what the argument should be>"
   ---
   ```

2. Create `rules/<name>.mdc` with frontmatter:
   ```markdown
   ---
   description: Same one-liner
   globs:
   alwaysApply: false
   ---
   ```

3. Add the rule name to the `requiredRules` array in `src/cli/doctor.ts`.

4. Run `npm run build` and test with `omc doctor`.

## Development setup

```bash
git clone https://github.com/YOUR_USERNAME/oh-my-cursor
cd oh-my-cursor
npm install
npm run build
npm link    # makes `omc` point to your local build
```

## Skill quality bar

A good skill has:
- Clear trigger conditions (when to use / when not to)
- Explicit phases with MCP tool calls at each phase
- A concrete output format
- Rules that prevent common mistakes

Look at `rules/deep-interview.mdc` and `rules/ultrawork.mdc` as reference quality.

## Commit style

Use conventional commits:
- `feat: add @skill-name skill`
- `fix: deep-interview ambiguity scoring off-by-one`
- `docs: update team mode instructions`
- `chore: bump dependencies`

## Code style

- TypeScript strict mode
- No external runtime dependencies beyond `@modelcontextprotocol/sdk` and `zod`
- State files go in `src/state/`, CLI commands in `src/cli/`, MCP tools in `src/mcp/server.ts`
