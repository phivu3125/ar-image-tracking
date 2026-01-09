---
description: Comprehensive project and session status dashboard
argument-hint: "[--full] [--health] [--sessions] [--git]"
agent: explore
subtask: true
---

# Status Dashboard

## Load Beads Skill

```typescript
skill({ name: "beads" });
```

Generate a comprehensive project status report covering tasks, sessions, git state, and system health.

## Phase 1: Gather All State (Parallel)

Run all status checks simultaneously:

```
# Beads CLI commands
!`bd status`
!`bd list --status in_progress --limit 10`
!`bd list --status ready --limit 10`

# Git state
!`git status --porcelain`
!`git branch --show-current`
!`git log --oneline -5`
```

```typescript
// Custom tools (message inbox, locks)
bd - inbox({ n: 5, unread: true, to: "all" });
bd - release(); // Lists active locks when called with no args

// Built-in tools
list_sessions({ project: "current", since: "today", limit: 5 });
```

````

## Phase 2: Health Score Calculation

Calculate overall project health (0-100):

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      HEALTH SCORE FORMULA                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Health = Base(60) + Bonuses - Penalties                                │
│                                                                         │
│  BONUSES (up to +40)                                                    │
│  ├── Database healthy:           +10                                    │
│  ├── No SLA breaches:            +10                                    │
│  ├── All P0/P1 assigned:         +10                                    │
│  └── CI passing:                 +10                                    │
│                                                                         │
│  PENALTIES (uncapped)                                                   │
│  ├── Per SLA breach:             -5                                     │
│  ├── Per unread urgent msg:      -3                                     │
│  ├── Per stale task (>7d):       -2                                     │
│  ├── Database issues:            -20                                    │
│  └── Per circular dependency:    -10                                    │
│                                                                         │
│  GRADES                                                                 │
│  ├── 90-100: 🟢 EXCELLENT                                               │
│  ├── 75-89:  🟢 GOOD                                                    │
│  ├── 60-74:  🟡 FAIR                                                    │
│  ├── 40-59:  🟠 NEEDS ATTENTION                                         │
│  └── 0-39:   🔴 CRITICAL                                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Phase 3: Generate Dashboard

```
╔══════════════════════════════════════════════════════════════════════════╗
║                         PROJECT STATUS                                   ║
║                         [Project Name]                                   ║
║                         [Timestamp]                                      ║
╠══════════════════════════════════════════════════════════════════════════╣

HEALTH: 🟢 85/100 GOOD
━━━━━━━━━━━━━━━━━━━━━━

[████████████████████████░░░░░░] 85%

Database: ✓ OK
CI:       ✓ Passing
SLA:      ✓ No breaches
Agents:   3 active


TASK OVERVIEW
━━━━━━━━━━━━━
┌────────────────────────────────────────────────────┐
│                                                    │
│   Open: 12    In Progress: 3    Ready: 5           │
│   ├── P0: 0   ├── P0: 1         ├── Blocked: 2     │
│   ├── P1: 2   ├── P1: 1         └── Unblocked: 3   │
│   ├── P2: 5   └── P2: 1                            │
│   └── P3+: 5                                       │
│                                                    │
│   Closed Today: 4    This Week: 18                 │
│                                                    │
└────────────────────────────────────────────────────┘


IN PROGRESS
━━━━━━━━━━━
ID       │ Priority │ Title                    │ Agent    │ Age
─────────┼──────────┼──────────────────────────┼──────────┼────────
bd-abc12 │ P0       │ Fix auth regression      │ build    │ 2h
bd-def34 │ P1       │ Add user dashboard       │ build    │ 1d
bd-ghi56 │ P2       │ Refactor logging         │ build    │ 3h


READY TO START
━━━━━━━━━━━━━━
ID       │ Priority │ Title                    │ Blocked By
─────────┼──────────┼──────────────────────────┼───────────
bd-xyz11 │ P1       │ Add notifications        │ -
bd-xyz22 │ P2       │ Update API docs          │ -
bd-xyz33 │ P2       │ Add analytics            │ bd-abc12


MESSAGES
━━━━━━━━
[If unread messages exist:]
📬 3 unread messages

From        │ Subject                          │ Time
────────────┼──────────────────────────────────┼────────
build-1     │ Need API spec for dashboard      │ 2h ago
review      │ Tests failing on staging         │ 4h ago
build-2     │ Migration complete               │ 1d ago

[If no messages:]
📭 No unread messages


FILE LOCKS
━━━━━━━━━━
[If locks exist:]
🔒 2 active locks

Path                           │ Owner     │ Expires
───────────────────────────────┼───────────┼─────────
src/auth/service.ts            │ build     │ 8m
src/components/Dashboard.tsx   │ build     │ 15m

[If no locks:]
🔓 No active file locks


GIT STATUS
━━━━━━━━━━
Branch: feature/auth-refactor
Ahead:  2 commits
Behind: 0 commits

[If changes:]
Modified: 3 files
Staged:   1 file
Untracked: 2 files

[If clean:]
Working tree clean ✓


RECENT COMMITS
━━━━━━━━━━━━━━
abc1234 - fix: auth token validation (2h ago)
def5678 - feat: add dashboard skeleton (5h ago)
ghi9012 - refactor: extract user service (1d ago)


SESSIONS TODAY
━━━━━━━━━━━━━━
Session     │ Time     │ Messages │ Files │ Focus
────────────┼──────────┼──────────┼───────┼──────────────────
ses_abc123  │ 2:30 PM  │ 45       │ 12    │ Auth refactor
ses_def456  │ 11:00 AM │ 28       │ 8     │ Dashboard setup
ses_ghi789  │ 9:15 AM  │ 15       │ 3     │ Bug triage

Total: 3 sessions, 88 messages, 23 files modified


TASK COMPLIANCE
━━━━━━━━━━━━━━━
[Check .beads/artifacts/<id>/ for each in-progress task]

Complete (spec + plan):
✓ bd-abc12: Fix auth regression
✓ bd-def34: Add user dashboard

Incomplete:
⚠ bd-ghi56: Missing plan.md

Compliance: 2/3 (67%)


CONTEXT STATUS
━━━━━━━━━━━━━━
Current Session: ses_xyz999
Token Usage:     ~85,000 (estimated)
Status:          🟡 Consider pruning soon

Recommendation: Prune completed tool outputs before next major task


REQUIRED ACTIONS
━━━━━━━━━━━━━━━━
Priority │ Action                              │ Command
─────────┼─────────────────────────────────────┼────────────────────
HIGH     │ Reply to build-1 question          │ bd-msg --to "build-1" --subj "Re:" --body "..."
HIGH     │ Add plan for bd-ghi56               │ /plan bd-ghi56
MEDIUM   │ Review 2 stale tasks                │ /triage --stale
LOW      │ Push 2 local commits                │ git push

╚══════════════════════════════════════════════════════════════════════════╝
```

## Phase 4: Trend Analysis (--full mode)

If `--full` flag, add historical comparison:

```
TRENDS (7 days)
━━━━━━━━━━━━━━━
                    This Week    Last Week    Change
────────────────────────────────────────────────────
Tasks Completed     18           12           +50% ↑
Avg Cycle Time      2.3 days     3.1 days     -26% ↑
SLA Compliance      95%          88%          +7%  ↑
Throughput/Day      2.6          1.7          +53% ↑

Velocity Chart:
Mon ████████  8
Tue ██████    6
Wed ████      4
Thu ██████    6
Fri ██████████ 10
    └──────────────────→
```

## Phase 5: Session Insights

### Context Health

```typescript
// Estimate current context usage
const contextWarnings = [];

if (estimatedTokens > 120000) {
  contextWarnings.push("⚠️ High token usage - consider new session");
}

if (sessionDuration > 3 * 60 * 60 * 1000) {
  // 3 hours
  contextWarnings.push("⚠️ Long session - context may be degraded");
}

if (toolCallCount > 200) {
  contextWarnings.push("⚠️ Many tool calls - prune old outputs");
}
```

### Incomplete Sessions

```typescript
// Check for sessions with incomplete work
const incompleteSessions = recentSessions.filter(
  (s) => !s.hasHandoff && !s.summary?.includes("completed"),
);

if (incompleteSessions.length > 0) {
  console.log("Incomplete work from previous sessions:");
  for (const s of incompleteSessions) {
    console.log(`- ${s.id}: ${s.lastMessage}`);
  }
}
```

## Phase 6: CI/CD Status (if available)

```
# GitHub Actions
!`gh run list --limit 3 --json status,conclusion,name,createdAt`

# Or check for common CI files
!`ls .github/workflows/ 2>/dev/null`
!`cat .github/workflows/*.yml | grep -A5 "name:"`
```

**Output:**

```
CI/CD STATUS
━━━━━━━━━━━━
Pipeline        │ Status    │ Time
────────────────┼───────────┼─────────
main            │ ✓ Passing │ 15m ago
feature/auth    │ ✗ Failed  │ 2h ago
staging-deploy  │ ✓ Passing │ 1d ago

Failed Check: feature/auth
  └── Jest tests: 2 failures in auth.test.ts
  └── Fix: /implement bd-abc12 (related task)
```

## Examples

```bash
/status                # Quick overview
/status --full         # Include trends and history
/status --health       # Focus on health metrics
/status --sessions     # Focus on session activity
/status --git          # Focus on git state
```

## Integration

Based on status, suggest next actions:

```
RECOMMENDED NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━

Based on current status:

1. High Priority Messages:
   → Reply to build-1: bd-msg --to "build-1" --subj "Re: API spec" --body "..."

2. Continue In-Progress Work:
   → /implement bd-abc12  (P0, 2h old)

3. Start Ready Tasks:
   → /start bd-xyz11  (P1, unblocked)

4. Session Maintenance:
   → Consider /handoff if switching tasks
   → Prune old tool outputs to reduce context
```

## Caching

For performance, cache expensive checks:

```typescript
// Cache health check for 5 minutes
const healthCacheKey = `health_${(Date.now() / (5 * 60 * 1000)) | 0}`;

// Cache CI status for 10 minutes
const ciCacheKey = `ci_${(Date.now() / (10 * 60 * 1000)) | 0}`;
```

## Error States

Handle gracefully:

```
[If beads unavailable:]
⚠️ Beads database not initialized
   Run: bd status to check connection

[If git not available:]
⚠️ Not a git repository
   Run: git init

[If CI check fails:]
⚠️ CI status unavailable
   Check: GitHub Actions permissions
```
````
