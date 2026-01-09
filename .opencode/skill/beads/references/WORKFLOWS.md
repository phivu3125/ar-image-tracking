# Workflows and Checklists

Detailed step-by-step workflows for common beads usage patterns.

## Session Start Workflow

**Every session when beads is available:**

```
Session Start:
- [ ] bd_init({ team: "project", role: "fe" })
- [ ] bd_claim() to get ready work
- [ ] If none ready, bd_ls({ status: "open" })
- [ ] bd_show({ id }) for full context
- [ ] bd_reserve({ paths }) before editing
```

## Compaction Survival

**Critical**: After compaction, conversation history is deleted but beads state persists.

**Post-compaction recovery:**

```
After Compaction:
- [ ] bd_ls({ status: "in_progress" }) to see active work
- [ ] bd_show({ id }) for each in_progress task
- [ ] Read notes: COMPLETED, IN PROGRESS, BLOCKERS, KEY DECISIONS
- [ ] Reconstruct TodoWrite from notes if needed
```

**Writing notes for compaction survival:**

**Good note (enables recovery):**

```
COMPLETED: User auth - JWT tokens with 1hr expiry, refresh endpoint.
IN PROGRESS: Password reset flow. Email service working.
NEXT: Add rate limiting to reset endpoint.
KEY DECISION: Using bcrypt 12 rounds per OWASP.
```

**Bad note:**

```
Working on auth. Made some progress.
```

## Discovery Workflow

**When encountering new work during implementation:**

```
Discovery:
- [ ] Notice bug, improvement, or follow-up
- [ ] Assess: blocker or deferrable?
- [ ] bd_add({ title, desc, pri })
- [ ] If blocker: pause and switch
- [ ] If deferrable: continue current work
```

## Epic Planning

**For complex multi-step features, think in Ready Fronts.**

A **Ready Front** is the set of tasks with all dependencies satisfied.

**Walk backward from goal:**

```
"What's the final deliverable?"
  ↓
"Integration tests passing" → task-integration
  ↓
"What does that need?"
  ↓
"Streaming support" → task-streaming
"Header display" → task-header
  ↓
"What do those need?"
  ↓
"Message rendering" → task-messages
  ↓
"Buffer layout" → task-buffer (foundation)
```

**Example: OAuth Integration**

```typescript
// Create epic
bd_add({ title: "OAuth integration", type: "epic" });

// Walk backward: What does OAuth need?
bd_add({ title: "Login/logout endpoints", parent: "oauth-abc" });
bd_add({ title: "Token storage and refresh", parent: "oauth-abc" });
bd_add({ title: "Authorization code flow", parent: "oauth-abc" });
bd_add({ title: "OAuth client credentials", parent: "oauth-abc" }); // foundation
```

## Side Quest Handling

```
Side Quest:
- [ ] During main work, discover problem
- [ ] bd_add() for side quest
- [ ] Assess: blocker or deferrable?
- [ ] If blocker: bd_release(), switch to side quest
- [ ] If deferrable: note it, continue main work
```

## Session Handoff

**At Session End:**

```
Session End:
- [ ] Work reaching stopping point
- [ ] Update notes with COMPLETED/IN PROGRESS/NEXT
- [ ] bd_done() if task complete
- [ ] Otherwise leave in_progress with notes
- [ ] RESTART SESSION
```

**At Session Start:**

```
Session Start with in_progress:
- [ ] bd_ls({ status: "in_progress" })
- [ ] bd_show({ id }) for each
- [ ] Read notes field
- [ ] Continue from notes context
```

## Unblocking Work

**When ready list is empty:**

```
Unblocking:
- [ ] bd_ls({ status: "open" }) to see all tasks
- [ ] bd_blocked() to find blocked tasks
- [ ] Identify blocker tasks
- [ ] Work on blockers first
- [ ] Closing blocker unblocks dependent work
```

## Integration with TodoWrite

**Using both tools:**

```
Hybrid:
- [ ] bd_claim() for high-level task
- [ ] Create TodoWrite from acceptance criteria
- [ ] Work through TodoWrite items
- [ ] Update bd notes as you learn
- [ ] When TodoWrite complete, bd_done()
```

**Why hybrid**: bd provides persistent structure, TodoWrite provides visible progress.

## Common Patterns

### Systematic Exploration

```
1. Create research task
2. Update notes with findings
3. bd_add() for discoveries
4. Close research with conclusion
```

### Bug Investigation

```
1. Create bug task
2. Reproduce: note steps
3. Investigate: track hypotheses in notes
4. Fix: implement solution
5. Close with root cause explanation
```

### Refactoring with Dependencies

```
1. Create tasks for each step
2. Work through in dependency order
3. bd_claim() shows next step
4. Each completion unblocks next
```

## Checklist Templates

### Starting Any Session

```
- [ ] bd_init()
- [ ] bd_claim() or bd_ls()
- [ ] bd_show() for context
- [ ] bd_reserve() files
- [ ] Begin work
```

### Creating Tasks During Work

```
- [ ] Notice new work needed
- [ ] bd_add() with clear title
- [ ] Add context in desc
- [ ] Assess blocker vs deferrable
- [ ] Update statuses
```

### Completing Work

```
- [ ] Implementation done
- [ ] Tests passing
- [ ] bd_done() with summary
- [ ] bd_claim() for next work
- [ ] RESTART SESSION
```
