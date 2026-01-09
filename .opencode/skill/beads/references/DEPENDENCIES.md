# Dependency Types Guide

Beads supports task dependencies for ordering work.

## Overview

Dependencies affect what work is "ready" - tasks with unmet dependencies won't appear in `bd_claim()` results.

## Creating Dependencies

```typescript
bd_add({
  title: "Implement API endpoint",
  deps: ["task:setup-db"], // depends on setup-db task
});
```

## Dependency Patterns

### Sequential Work

```
setup-db → implement-api → add-tests → deploy
```

Each task depends on the previous. `bd_claim()` shows only the current step.

### Parallel Then Merge

```
research-a ─┐
research-b ─┼→ decision
research-c ─┘
```

Multiple parallel tasks, then one that needs all of them.

### Foundation First

```
setup ─┬→ feature-a
       ├→ feature-b
       └→ feature-c
```

One foundational task blocks multiple features.

## Epic with Children

```typescript
// Create epic
bd_add({ title: "OAuth Integration", type: "epic" });
// Returns: { id: "oauth-abc" }

// Create children with parent
bd_add({ title: "Setup credentials", parent: "oauth-abc" });
bd_add({
  title: "Implement flow",
  parent: "oauth-abc",
  deps: ["task:credentials"],
});
bd_add({ title: "Add UI", parent: "oauth-abc", deps: ["task:flow"] });
```

## Automatic Unblocking

When you close a task that's blocking others:

```
1. bd_done({ id: "setup-db" })
2. Beads automatically updates: implement-api is now ready
3. bd_claim() returns implement-api
4. No manual unblocking needed
```

## Common Mistakes

### Using Dependencies for Preferences

**Wrong:**

```
docs depends on feature  // "prefer to update docs after"
```

**Problem:** Documentation doesn't actually need feature complete.

**Right:** Only use dependencies for actual blockers.

### Wrong Direction

**Wrong:**

```
bd_add({ title: "API", deps: ["task:tests"] })  // API depends on tests?
```

**Problem:** Usually tests depend on API, not the other way.

**Right:** Think "X needs Y complete first" → X depends on Y.

### Over-Using Dependencies

**Problem:** Everything depends on everything. No parallel work possible.

**Right:** Only add dependencies for actual technical blockers.

## Decision Guide

**Add dependency when:**

- Task literally cannot start without other task complete
- Code won't compile/run without prerequisite
- Data/schema must exist first

**Skip dependency when:**

- Just a preference for order
- Both can proceed independently
- Just want to note relationship

## Viewing Dependencies

```typescript
bd_show({ id: "task-abc" });
// Shows what blocks this task and what this task blocks

bd_blocked();
// Shows all blocked tasks across project
```
