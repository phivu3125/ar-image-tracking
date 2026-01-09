# Handoff Bundles

This directory stores handoff bundles created by the `/handoff` command.

## What is a Handoff?

A handoff bundle is a portable context snapshot that enables clean phase transitions in your workflow (Research → Planning → Implementation → Review).

## Structure

Each handoff bundle contains:

- **Summary**: What was accomplished in the current phase
- **Relevant Files**: @-mentions of files needed for next phase
- **Key Decisions**: Architectural choices and constraints
- **Next Instructions**: Clean prompt for the next agent

## Usage

### Create a Handoff

```bash
/handoff "design the system based on research"
```

This creates: `.opencode/memory/handoffs/YYYY-MM-DD-{phase-name}.md`

### Use a Handoff

**Option 1: Manual Reference**

```bash
# In new thread
@.opencode/memory/handoffs/2025-11-17-planning.md
```

**Option 2: With opencode-sessions Plugin**

```typescript
// Create new session with handoff context
session({
  mode: "new",
  agent: "plan",
  text: "Continue from handoff: @.opencode/memory/handoffs/2025-11-17-planning.md",
});

// Or collaborate in same session
session({
  mode: "message",
  agent: "plan",
  text: "Review this handoff and provide feedback",
});
```

### List Available Handoffs

```bash
ls -lt .opencode/memory/handoffs/
```

Or use the `/handoff-list` command (if available).

## Benefits

- **Clean Context**: No bleed between phases
- **Portable**: Share across workspaces/teams
- **Auditable**: Track phase transitions
- **Reusable**: Learn from past handoffs

## Integration with opencode-sessions

The `opencode-sessions` plugin provides programmatic session management:

- `mode: "new"` - Fresh session for clean phase transition (like Amp's handoff)
- `mode: "message"` - Turn-based agent collaboration
- `mode: "compact"` - Compress context before handoff
- `mode: "fork"` - Parallel exploration of approaches

See plugin documentation: https://github.com/malhashemi/opencode-sessions

---

_Handoff bundles are the bridge between phases - keep them minimal and actionable._
