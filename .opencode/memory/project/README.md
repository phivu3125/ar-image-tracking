---
purpose: Persistent project knowledge that survives across sessions
updated: 2024-12-21
---

# Project Memory

This directory stores persistent project knowledge that agents use across sessions.

## Standard Files

| File              | Purpose                                 | Update When             |
| ----------------- | --------------------------------------- | ----------------------- |
| `commands.md`     | Build, test, lint, deploy commands      | Discover new command    |
| `conventions.md`  | Code patterns, commit style, PR process | Learn team pattern      |
| `gotchas.md`      | Footguns, edge cases, warnings          | Hit unexpected behavior |
| `architecture.md` | Key modules, directory structure        | Map new area            |

## File Format

Each file uses YAML frontmatter:

```yaml
---
purpose: How this memory should influence agent behavior
updated: YYYY-MM-DD
---
```

## How Agents Use This

- **Session start**: Agents read relevant memory files for context
- **During work**: Agents update files when learning new information
- **Session end**: Critical learnings persisted here survive context reset

## Integration

### With Commands

- `/implement` - Reads conventions for code style
- `/setup-project` - Populates these files initially
- `/review-codebase` - Checks against conventions

### With Beads

```bash
bd new feature "Add auth" --context .opencode/memory/project/
```

## Philosophy

**Don't rely on implicit learning.** When agents discover:

- Non-obvious behavior → Update `gotchas.md`
- New commands → Update `commands.md`
- Code patterns → Update `conventions.md`
- Architecture insights → Update `architecture.md`

Explicit memory beats hoping the agent remembers.
