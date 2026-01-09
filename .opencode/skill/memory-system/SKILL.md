---
name: memory-system
description: Use when persisting learnings, loading previous context, or searching past decisions - covers memory file structure, tools, and when to update each file
---

# Memory System

Persistent context that survives across sessions.

## Directory Structure

```
.opencode/memory/
  _templates/     # Task templates (prd, observation, session-summary)
  handoffs/       # Phase transitions
  research/       # Research findings
  observations/   # Structured observations
  project/        # Persistent project knowledge
    commands.md       # Build, test, lint, deploy commands
    conventions.md    # Code patterns, commit style, PR process
    gotchas.md        # Footguns, edge cases, "don't forget this"
    architecture.md   # Key modules, directory structure
  user.md         # Identity, preferences, communication style
```

## Standard Memory Blocks

| File                      | Purpose                  | Update When                 |
| ------------------------- | ------------------------ | --------------------------- |
| `project/commands.md`     | Build/test/lint commands | Discovering new command     |
| `project/conventions.md`  | Code patterns, style     | Learning team pattern       |
| `project/gotchas.md`      | Footguns, warnings       | Hitting unexpected behavior |
| `project/architecture.md` | Key modules, structure   | Mapping new area            |
| `user.md`                 | Preferences, workflow    | Learning user preference    |

## Explicit Memory Updates

Don't rely on implicit learning. Explicitly persist:

- Non-obvious project behavior → `project/gotchas.md`
- User preferences discovered → `user.md`
- New build/test commands → `project/commands.md`
- Code patterns to follow → `project/conventions.md`

## Memory Tools

### memory-read

Load previous context or templates:

```typescript
memory - read({ file: "project/commands" }); // Load commands
memory - read({ file: "_templates/prd" }); // Load PRD template
memory - read({ file: "handoffs/bd-abc123" }); // Load specific handoff
```

### memory-update

Save learnings or handoffs:

```typescript
memory -
  update({
    file: "project/gotchas",
    content: "### New Gotcha\n\nDescription...",
    mode: "append", // or "replace"
  });
```

### memory-search

Find past decisions, research, or handoffs:

```typescript
memory - search({ query: "authentication" });
memory - search({ query: "bugfix", type: "observations" });
memory - search({ query: "session", type: "handoffs" });
```

## Observations

Record important findings with structured metadata:

```typescript
observation({
  type: "decision", // decision, bugfix, feature, pattern, discovery, learning, warning
  title: "Use JWT auth",
  content: "Decided to use JWT because...",
  concepts: "auth, security",
  files: "src/auth.ts",
  bead_id: "bd-abc123",
});
```

**When to create observations:**

- Major architectural decisions
- Bug root causes discovered
- Patterns worth reusing
- Gotchas and warnings for future

## Best Practices

1. **Read before work** - Check relevant memory files at session start
2. **Update during work** - Don't wait until end; persist incrementally
3. **Be specific** - Include file paths, function names, concrete examples
4. **Keep it actionable** - Future agents should know what to do with the info
