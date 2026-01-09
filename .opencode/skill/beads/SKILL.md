---
name: beads
description: >
  Multi-agent task coordination using Beads Village plugin tools. Use when work spans multiple
  sessions, has dependencies, needs file locking, or requires agent coordination. Covers
  claim/reserve/done cycle, dependency management, hierarchical decomposition, and session protocols.
version: "1.1.0"
license: MIT
---

# Beads Workflow - Multi-Agent Task Coordination

Graph-based task tracker with file locking for multi-agent coordination. Persists across sessions.

## Overview

**Beads plugin tools** (`bd_*`) replace MCP beads-village with native tools for lower token overhead.

**Key Distinction**:

- **bd\_\* tools**: Multi-session work, dependencies, file locking, agent coordination
- **TodoWrite**: Single-session tasks, linear execution, conversation-scoped

**When to Use bd\_\* vs TodoWrite**:

- "Will I need this context in 2 weeks?" → **YES** = bd\_\*
- "Does this have blockers/dependencies?" → **YES** = bd\_\*
- "Multiple agents editing same codebase?" → **YES** = bd\_\*
- "Will this be done in this session?" → **YES** = TodoWrite

**Decision Rule**: If resuming in 2 weeks would be hard without beads, use beads.

## Hierarchical Structure: Epic → Task → Subtask

**Beads supports up to 3 levels of hierarchy using hierarchical IDs:**

```
bd-a3f8        (Epic - parent feature)
├── bd-a3f8.1  (Task - first child)
├── bd-a3f8.2  (Task - second child)
│   ├── bd-a3f8.2.1  (Subtask - child of .2)
│   └── bd-a3f8.2.2  (Subtask - child of .2)
└── bd-a3f8.3  (Task - third child)
```

### When to Decompose

| Scenario                     | Structure                            |
| ---------------------------- | ------------------------------------ |
| Bug fix, config change       | Single bead                          |
| Small feature (1-2 files)    | Single bead                          |
| Feature crossing FE/BE       | Epic + tasks by domain               |
| New system/service           | Epic + tasks by component            |
| Multi-day work               | Epic + tasks for parallelization     |
| Work needing multiple agents | Epic + tasks (agents claim children) |

### Creating Hierarchical Beads

```typescript
// Step 1: Create Epic (parent)
const epic = bd_add({
  title: "User Authentication System",
  type: "epic",
  pri: 1,
  desc: "Complete auth with OAuth, sessions, and protected routes",
  tags: ["epic", "auth"],
});
// Returns: { id: "bd-a3f8" }

// Step 2: Create child tasks with `parent` parameter
const task1 = bd_add({
  title: "Database schema for auth",
  type: "task",
  pri: 2,
  parent: "bd-a3f8", // Links to epic
  desc: "Create user and session tables",
  tags: ["backend", "database"],
});
// Returns: { id: "bd-a3f8.1" }  ← Hierarchical ID!

// Step 3: Create dependent tasks with `deps` parameter
const task2 = bd_add({
  title: "OAuth integration",
  type: "task",
  pri: 2,
  parent: "bd-a3f8",
  deps: ["bd-a3f8.1"], // Blocked until .1 completes
  tags: ["backend"],
});
// Returns: { id: "bd-a3f8.2" }
```

### Dependency Types

Beads supports four dependency types:

| Type              | Meaning                   | Use Case            |
| ----------------- | ------------------------- | ------------------- |
| `blocks`          | Task A blocks Task B      | Sequential work     |
| `related`         | Tasks are connected       | Cross-references    |
| `parent-child`    | Hierarchy (via `parent:`) | Epic → Task         |
| `discovered-from` | Found during work         | New work discovered |

### Parallel Execution with Dependencies

```
bd-a3f8.1 [Database] ──┬──> bd-a3f8.2 [Backend] ──┐
     (READY)           │                          │
                       │                          ▼
                       └──> bd-a3f8.3 [Frontend]  bd-a3f8.5 [Testing]
                       │         │                     ▲
                       └──> bd-a3f8.4 [Docs] ──────────┘

Parallel tracks:
• Agent 1 (backend): .1 → .2
• Agent 2 (frontend): wait for .1, then .3
• Agent 3 (qa): wait for .2 and .3, then .5
```

**Key insight**: After bd-a3f8.1 completes, .2, .3, and .4 all become READY simultaneously. Multiple agents can claim them in parallel.

### Querying Hierarchy

````typescript
// See all children of an epic
bd_ls({ status: "all", limit: 20 });
// Filter by parent prefix in results

// See ready work (unblocked tasks)
bd_ready();
// Returns tasks where all dependencies are closed
```

## Session Start Protocol

**Every session, follow these steps:**

### Step 1: Initialize

```typescript
bd_init({ team: "project", role: "fe" });
````

Joins workspace, enables role-based task filtering. Roles: fe, be, mobile, devops, qa.

### Step 2: Check Health (Weekly)

```typescript
bd_doctor();
```

Repairs database issues. Run at start of week or after sync problems.

### Step 3: Find Ready Work

```typescript
bd_claim();
```

Returns highest priority task with no blockers, marks it in_progress.

If no tasks returned, check all open work:

```typescript
bd_ls({ status: "open" });
```

### Step 4: Get Full Context

```typescript
bd_show({ id: "task-abc" });
```

Shows full description, dependencies, notes, history.

### Step 5: Reserve Files Before Editing

```typescript
bd_reserve({ paths: ["src/auth.ts", "src/types.ts"] });
```

**Critical**: Always reserve before editing. Prevents conflicts with other agents.

Check existing locks first:

```typescript
bd_reservations();
```

### Step 6: Add Notes as You Work

Use `bd_show` output's notes field. Write notes as if explaining to a future agent with zero conversation context.

**Note Format** (best practice):

```
COMPLETED: Specific deliverables (e.g., "implemented JWT refresh endpoint")
IN PROGRESS: Current state + next immediate step
BLOCKERS: What's preventing progress
KEY DECISIONS: Important context or user guidance
```

### Step 7: Complete and Restart

```typescript
bd_done({ id: "task-abc", msg: "Implemented auth with JWT tokens" });
// RESTART SESSION - fresh context
```

Always restart session after `bd_done()`. One task per session.

## Task Creation

### When to Create Tasks

Create tasks when:

- User mentions tracking work across sessions
- User says "we should fix/build/add X"
- Work has dependencies or blockers
- Discovered work while implementing (>2 min effort)

### Basic Task Creation

```typescript
bd_add({
  title: "Fix authentication bug",
  pri: 0, // 0=critical, 1=high, 2=normal, 3=low, 4=backlog
  type: "bug", // task, bug, feature, epic, chore
});
```

### With Description and Tags

```typescript
bd_add({
  title: "Implement OAuth",
  desc: "Add OAuth2 support for Google, GitHub. Use passport.js.",
  pri: 1,
  type: "feature",
  tags: ["be", "security"], // Role tags for assignment
});
```

### Epic with Children

```typescript
// Create parent epic
bd_add({ title: "Epic: OAuth Implementation", pri: 0, type: "epic" });
// Returns: { id: "oauth-abc" }

// Create child tasks with parent
bd_add({ title: "Research OAuth providers", pri: 1, parent: "oauth-abc" });
bd_add({ title: "Implement auth endpoints", pri: 1, parent: "oauth-abc" });
bd_add({ title: "Add frontend login UI", pri: 2, parent: "oauth-abc" });
```

## File Reservation

### Reserve Before Edit

```typescript
bd_reserve({
  paths: ["src/auth.ts", "src/middleware/jwt.ts"],
  reason: "Implementing auth feature",
  ttl: 600, // seconds until expiry (default)
});
```

**Returns**:

```json
{
  "granted": ["src/auth.ts"],
  "conflicts": [{ "path": "src/middleware/jwt.ts", "holder": "agent-xyz" }]
}
```

### Check Active Locks

```typescript
bd_reservations();
```

Shows all locks across workspace with agent IDs and expiry times.

### Handle Conflicts

If file reserved by another agent:

1. **Can wait** → Work on different files first
2. **Urgent** → Message the agent:

```typescript
bd_msg({
  subj: "Need src/middleware/jwt.ts",
  body: "Working on auth, can you release?",
  to: "agent-xyz",
});
```

3. **Alternative** → Refactor to avoid that file

### Release Early

```typescript
bd_release({ paths: ["src/auth.ts"] }); // Specific files
bd_release(); // All your reservations
```

Note: `bd_done()` auto-releases all your reservations.

## Messaging

### Send Message

```typescript
bd_msg({
  subj: "API Ready",
  body: "Auth endpoints deployed to staging",
  to: "all", // or specific agent ID
  importance: "high", // low, normal, high
});
```

### Team Broadcast

```typescript
bd_msg({
  subj: "Breaking Change",
  body: "User schema updated, run migrations",
  to: "all",
  global: true, // Cross-workspace
});
```

### Check Inbox

```typescript
bd_inbox({ unread: true, n: 10 });
```

### Acknowledge Messages

```typescript
bd_ack({ ids: ["msg-abc", "msg-def"] }); // Mark as read
```

## Agent Coordination

### Who's Working on What

```typescript
bd_whois(); // All agents with their files and tasks
bd_whois({ agent: "build-abc" }); // Specific agent lookup
```

## Status and Analysis

### Workspace Overview

```typescript
bd_status({ include_agents: true });
```

Shows ready tasks, in-progress count, active locks, agent info.

### Find Blocked Work

```typescript
bd_blocked();
```

Returns tasks that have unresolved dependencies.

### View Dependencies

```typescript
bd_dep({ action: "tree", child: "<task-id>", type: "blocks" });
```

Shows dependency tree for a specific task.

## Git Sync

### Manual Sync

```typescript
bd_sync();
```

Commits `.beads/` changes, pulls from remote, pushes local commits.

**Use when**: End of session, before handoff, after major progress.

### Cleanup Old Issues

```typescript
bd_cleanup({ days: 7 });
```

Removes closed issues older than N days. Run weekly.

## Error Handling

### Common Issues

**"Call bd_init() first"**

- Always call `bd_init()` at session start

**File conflicts**

- Check `bd_reservations()` before editing
- Message holder or work on other files

**No ready tasks**

- Run `bd_ls({ status: "open" })` to see all tasks
- Some may be blocked - check dependencies

**Sync failures**

- Run `bd_doctor()` to repair database
- Check git remote access

## Examples

### Example 1: Standard Session

```typescript
// 1. Join and claim
bd_init({ team: "project", role: "fe" });
const task = bd_claim();
// { id: "auth-123", t: "Implement login form", p: 1 }

// 2. Get context
bd_show({ id: "auth-123" });

// 3. Reserve files
bd_reserve({ paths: ["src/components/Login.tsx", "src/hooks/useAuth.ts"] });

// 4. Do the work...
// [implementation]

// 5. Complete
bd_done({
  id: "auth-123",
  msg: "Login form with validation, hooks for auth state",
});
// RESTART SESSION
```

### Example 2: Discovered Work

```typescript
// Working on task, found more work
bd_add({
  title: "Fix edge case in validation",
  desc: "Empty strings bypass email check - discovered while implementing login",
  pri: 1,
  type: "bug",
});
// Continue current task, new task tracked for later
```

### Example 3: Blocked Work

```typescript
// API is down, can't continue
bd_release(); // Free files for others

// Message team
bd_msg({
  subj: "Blocked: API 503",
  body: "Auth endpoint returning 503, switching tasks",
  to: "all",
});

// Claim different task
const newTask = bd_claim();
```

### Example 4: Multi-Agent Coordination

```typescript
// Agent A (backend)
bd_init({ team: "project", role: "be" });
bd_reserve({ paths: ["src/api/auth.ts"] });
// ... implements API ...
bd_msg({ subj: "Auth API Ready", to: "all" });
bd_done({ id: "api-task", msg: "Auth endpoints complete" });

// Agent B (frontend) - sees message
bd_inbox({ unread: true });
// { msgs: [{ subj: "Auth API Ready", from: "agent-a" }] }
bd_claim(); // Gets frontend task that was waiting on API
```

## Rules

1. **Always `bd_init()` first** - Required before any other bd\_\* tool
2. **Reserve before edit** - Prevents conflicts with other agents
3. **One task per session** - Restart after `bd_done()`
4. **Write notes for future agents** - Assume zero conversation context
5. **Use `bd_msg(to="all")`** - For team-wide announcements
6. **Sync regularly** - `bd_sync()` at session end

## Best Practices (from Steve Yegge)

### Daily/Weekly Maintenance

| Task         | Frequency      | Command               | Why                                            |
| ------------ | -------------- | --------------------- | ---------------------------------------------- |
| Health check | Weekly         | `bd doctor`           | Repairs database issues, detects orphaned work |
| Cleanup      | Every few days | `bd cleanup --days 7` | Keep DB under 200-500 issues for performance   |
| Upgrade      | Weekly         | `bd upgrade`          | Get latest features and fixes                  |
| Git hooks    | Once per repo  | `bd hooks install`    | Auto-sync on commit/merge/checkout             |

### Key Principles

1. **Plan outside Beads first** - Use planning tools, then import tasks to beads
2. **One task per session, then restart** - Fresh context prevents confusion
3. **File lots of issues** - Any work >2 minutes should be tracked
4. **Use short prefixes** - `bd-`, `vc-`, `wy-` etc.
5. **"Land the plane" = PUSH** - `bd sync` means git push, not "ready when you are"
6. **Include issue ID in commits** - `git commit -m "Fix bug (bd-abc)"`

### Database Health

```bash
# Check database size
bd list --status=all --json | wc -l

# Target: under 200-500 issues
# If over, run cleanup more aggressively:
bd cleanup --days 3
```

### Git Hooks (Essential)

```bash
bd hooks install
```

Installs hooks for:

- **pre-commit**: Sync before commit
- **post-merge**: Import changes after merge
- **pre-push**: Ensure sync before push
- **post-checkout**: Refresh after branch switch

## Quick Reference

```
SESSION START:
  bd_init() → bd_claim() → bd_show() → bd_reserve()

DURING WORK:
  bd_reserve() additional files
  bd_add() for discovered work (>2min)
  bd_msg() to coordinate

SESSION END:
  bd_done() → RESTART SESSION

MAINTENANCE:
  bd_doctor() - weekly health check
  bd_cleanup() - remove old issues
  bd_sync() - git sync
```
