---
description: AI-powered task triage, prioritization, and workload analysis
argument-hint: "[--quick] [--auto-assign] [--sla] [--bottleneck]"
agent: build
---

# Triage

## Load Beads Skill

```typescript
skill({ name: "beads" });
```

Analyze open tasks and optimize prioritization using dependency graph analysis, SLA tracking, and multi-agent coordination.

## Quick Mode

If `--quick` flag is passed, skip deep analysis and provide immediate actionable output:

```bash
bd ready --json
bd list --status=in_progress --json
```

**Quick Output:**

```
Quick Triage
━━━━━━━━━━━━

Ready to start:
• bd-abc12: "Task title" (P1)
• bd-def34: "Task title" (P2)

In progress:
• bd-ghi56: "Task title" - claimed by [agent]

Next: /start <bead-id>
```

Then stop. Don't run full analysis phases.

## Full Triage (Default)

## Phase 1: Health Check

Run `bd doctor` to ensure database integrity (recommended weekly):

```bash
bd doctor --fix 2>/dev/null || bd doctor
```

This detects and auto-fixes:

- Orphaned issues (work committed but issue not closed)
- Database/JSONL sync issues
- Migration updates

## Phase 2: Initialize Beads Connection

!`bd status`

## Phase 3: Gather Workspace State

Run in parallel:

!`bd status`
!`bd list --status open --limit 50`

```typescript
// Custom tools (not shell commands)
bd - release(); // Lists active locks when called with no args
bd - inbox({ n: 10, unread: true, to: "all" });

// Search for past discussions on recurring issues
search_session({ query: "blocked OR regression OR urgent", limit: 10 });
```

Capture:

- Total open tasks
- In-progress count
- Active agents
- File locks
- Pending messages
- Past context on recurring issues

## Phase 4: Analyze Dependencies

Use `bd dep tree` to understand blocking relationships:

!`bd dep tree <task-id>`

This provides:

- **Bottlenecks**: Tasks blocking the most downstream work
- **Keystones**: High-impact tasks that unlock multiple paths
- **Cycles**: Circular dependencies (must break)

## Phase 5: Priority Classification

### Priority Matrix

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        URGENCY                                          │
│              High                           Low                         │
│  ┌─────────────────────────────┬─────────────────────────────┐          │
│  │ P0 - CRITICAL               │ P1 - HIGH                   │  High   │
│  │ • Production down           │ • Major feature blocked     │         │
│  │ • Security vulnerability    │ • Customer escalation       │  I      │
│  │ • Data loss risk            │ • Sprint commitment         │  M      │
│  │                             │                             │  P      │
│  │ SLA: 4 hours                │ SLA: 24 hours               │  A      │
│  ├─────────────────────────────┼─────────────────────────────┤  C      │
│  │ P2 - MEDIUM                 │ P3 - LOW                    │  T      │
│  │ • Feature enhancement       │ • Tech debt                 │         │
│  │ • Non-blocking bugs         │ • Nice-to-have              │  Low    │
│  │ • Performance improvement   │ • Documentation             │         │
│  │                             │                             │         │
│  │ SLA: 1 week                 │ SLA: 2 weeks                │         │
│  └─────────────────────────────┴─────────────────────────────┘          │
│                                                                         │
│  P4 - BACKLOG: No SLA, review monthly                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Impact Scoring Formula

```
Impact Score = (Downstream Count × 2) + (Priority Weight × 3)

Where Priority Weight:
  P0 = 5, P1 = 4, P2 = 3, P3 = 2, P4 = 1
```

### SLA Tracking

For each open task, calculate:

```typescript
const now = new Date();
const created = new Date(task.created_at);
const ageHours = (now - created) / (1000 * 60 * 60);

const slaByPriority = { 0: 4, 1: 24, 2: 168, 3: 336, 4: Infinity };
const slaHours = slaByPriority[task.priority];
const slaRemaining = slaHours - ageHours;
const slaStatus =
  slaRemaining < 0
    ? "BREACHED"
    : slaRemaining < slaHours * 0.2
      ? "AT_RISK"
      : "OK";
```

## Phase 6: Bottleneck Analysis

Identify blocking patterns:

### Critical Bottlenecks

Tasks where:

- `downstream_count >= 3` (blocks 3+ tasks)
- `priority >= 2` (medium or higher)
- `status = open` (not started)

```
BOTTLENECK ALERT
━━━━━━━━━━━━━━━━

🔴 bd-abc12: "Database migration"
   Blocks: bd-def34, bd-ghi56, bd-jkl78, bd-mno90
   Impact Score: 24
   Age: 3 days (SLA: AT_RISK)

   Recommendation: Assign immediately to unblock 4 tasks
```

### Dependency Cycles

If cycles detected:

```
⚠️  CIRCULAR DEPENDENCY DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

bd-abc12 → bd-def34 → bd-ghi56 → bd-abc12

Resolution Options:
1. Remove weakest dependency (bd-ghi56 → bd-abc12)
2. Merge tasks into single unit
3. Split one task to break cycle

Run: bd update <id> --remove-dep <dep-id>
```

## Phase 7: Generate Triage Report

```
╔══════════════════════════════════════════════════════════════════════════╗
║                           TRIAGE REPORT                                  ║
║                           [timestamp]                                    ║
╠══════════════════════════════════════════════════════════════════════════╣

SUMMARY
━━━━━━━
Open: XX | In Progress: XX | Blocked: XX | Ready: XX

SLA STATUS
━━━━━━━━━━
🔴 BREACHED: X tasks
🟡 AT RISK:  X tasks
🟢 ON TRACK: X tasks

BOTTLENECKS (Top 3)
━━━━━━━━━━━━━━━━━━━
1. bd-abc12 - "Database migration" - blocks 4 tasks
2. bd-def34 - "API authentication" - blocks 3 tasks
3. bd-ghi56 - "Config refactor" - blocks 2 tasks

PRIORITY ORDER
━━━━━━━━━━━━━━
Priority │ ID       │ Title                    │ Impact │ SLA
─────────┼──────────┼──────────────────────────┼────────┼────────
P0       │ bd-abc12 │ Database migration       │ 24     │ AT_RISK
P1       │ bd-def34 │ API authentication       │ 18     │ OK
P2       │ bd-ghi56 │ Config refactor          │ 12     │ OK

READY TASKS
━━━━━━━━━━━
bd-xyz11 - "Frontend auth" - can start now
bd-xyz22 - "API endpoints" - can start now
bd-xyz33 - "Config update" - blocked by bd-abc12

AGENT WORKLOAD
━━━━━━━━━━━━━━
Agent     │ Active │ Completed │ Load
──────────┼────────┼───────────┼──────
build-1   │ 2      │ 8         │ HIGH
build-2   │ 1      │ 12        │ MEDIUM
review    │ 0      │ 5         │ LOW

RECOMMENDATIONS
━━━━━━━━━━━━━━━
1. 🔴 URGENT: bd-abc12 is blocking 4 tasks - assign to build agent
2. 🟡 REBALANCE: build-1 has high load - redistribute to review agent
3. 🟢 PARALLEL: Start Track A and B simultaneously
4. ⚠️  STALE: bd-old99 has no activity for 7 days - review or close

╚══════════════════════════════════════════════════════════════════════════╝
```

## Phase 8: Auto-Assignment (Optional)

If `--auto-assign` flag:

### Assignment Rules

```typescript
const assignmentRules = {
  // All implementation work goes to build agents
  "frontend|ui|css|react|vue": "build",
  "backend|api|database|server": "build",
  "deploy|ci|docker|infra": "build",
  "mobile|ios|android|react-native": "build",
  // Review/QA work goes to review agent
  "test|qa|e2e|integration": "review",
};

// Load balancing: prefer agent with lowest active count
function selectAgent(role: string, agents: Agent[]): Agent {
  return agents
    .filter((a) => a.role === role)
    .sort((a, b) => a.activeCount - b.activeCount)[0];
}
```

### Execute Assignments

```typescript
// For each unassigned high-priority ready task
for (const task of readyTasks.filter((t) => !t.assignee && t.priority <= 2)) {
  const role = detectRole(task);
  // Use bd CLI to update assignment
  // bd update <task.id> --assignee <role>
}
```

**Output:**

```
AUTO-ASSIGNMENTS
━━━━━━━━━━━━━━━━

✓ bd-abc12 → build (detected: backend, API)
✓ bd-def34 → build (detected: frontend, React)
✓ bd-ghi56 → build (detected: infrastructure)

Skipped:
- bd-xyz99: Already assigned to review agent
- bd-old88: No matching role detected (manual assignment needed)
```

## Phase 9: Batch Operations

### Bulk Priority Update

```bash
# Escalate all breached SLA tasks
for each breached task:
  bd update <task-id> --priority <new-priority>
```

### Stale Task Cleanup

```typescript
// Find tasks with no activity > 14 days
const staleTasks = openTasks.filter(
  (t) => daysSince(t.updated_at) > 14 && t.status === "open",
);

// Prompt for action
console.log(`Found ${staleTasks.length} stale tasks. Options:`);
console.log("1. Close all as 'wontfix'");
console.log("2. Move to P4 backlog");
console.log("3. Review individually");
```

### Database Cleanup (Weekly Maintenance)

Keep database small for performance (target: under 200-500 issues):

```bash
bd cleanup --days 7  # Remove closed issues older than 7 days
bd list --status=closed --json | wc -l  # Check closed count
```

**Best Practice (from Steve Yegge):** Run `bd cleanup` every few days to prevent database bloat.

## Phase 10: Check Memory Health

```typescript
memory - index({ action: "status" });
```

If documents count is low or index is stale:

```
⚠️  Vector store may be stale.
Run: memory-index rebuild
```

Optionally trigger background reindex if many observations were created recently.

## Phase 11: Sync and Notify

```typescript

```

```typescript
bd sync

# Broadcast triage summary if significant changes
if assignments or priority changes:
  bd-msg --subj "Triage Complete" --body "Assigned X tasks, updated Y priorities" --to "all" --importance normal
```

## Alternative: Manual Triage

If automated tools unavailable:

### Step 1: List and Sort

```bash
bd list --status=open --sort=priority
```

### Step 2: Identify Dependencies

```bash
bd show <id>  # Check "Blocks" and "Blocked By" fields
```

### Step 3: Manual Assignment

```bash
bd update <id> --assign=@username
bd update <id> --priority=1
```

## Examples

```bash
/triage                     # Full triage report
/triage --auto-assign       # Auto-assign ready tasks
/triage --sla               # Focus on SLA status
/triage --bottleneck        # Focus on blocking tasks
/triage --stale             # Review stale tasks
```

## Integration

After triage:

```
Recommended Next Commands:
━━━━━━━━━━━━━━━━━━━━━━━━━

/implement bd-abc12    # Start highest priority task
/start bd-def34        # Begin planning next task
/status                # Verify changes applied
```

## Metrics to Track

Over time, monitor:

- **Throughput**: Tasks completed per week
- **Cycle Time**: Average time from open → closed
- **SLA Compliance**: % of tasks within SLA
- **Bottleneck Frequency**: How often same tasks block
- **Agent Utilization**: Balance across team
