---
description: Brainstorm and explore ideas with structured ideation
argument-hint: "<topic or bead-id> [--quick]"
agent: planner
subtask: true
---

# Brainstorm: $ARGUMENTS

## Load Beads Skill

```typescript
skill({ name: "beads" });
```

## Options

- `--quick`: 15-minute time box (default: 30 minutes)

## Phase 1: Load Context

**Load skill:**

```typescript
skill({ name: "brainstorming" });
```

**Check for bead context:**

If `$ARGUMENTS` is a bead ID:

!`bd show $ARGUMENTS`

Load constraints from `.beads/artifacts/<bead-id>/spec.md` if it exists.

**Check for prior thinking (Semantic Search):**

```typescript
// Search for related ideas and past brainstorms
memory -
  search({
    query: "[topic keywords]",
    mode: "semantic",
    limit: 5,
  });

// Find related observations
memory -
  search({
    query: "[topic]",
    mode: "semantic",
    type: "observation",
    limit: 3,
  });
```

Review findings for:

- Previous brainstorms on similar topics
- Related decisions and patterns
- Ideas that were considered before

If memory search fails (Ollama not running), continue without it.

## Phase 2: Set Boundaries

Before brainstorming, establish:

```
Brainstorm Session: $ARGUMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Topic: [what we're exploring]
Goal: [what decision/outcome we need]
Constraints: [hard limits from spec or user]
Time box: [15/30 minutes]

Out of scope:
- [what we're NOT considering]
```

## Phase 3: Diverge (Generate Ideas)

**Goal:** Quantity over quality. No evaluation yet.

Generate 5-10 ideas rapidly:

```
Ideas:
━━━━━━

1. [Idea name]
   Brief: [1-2 sentences]

2. [Idea name]
   Brief: [1-2 sentences]

3. [Idea name]
   Brief: [1-2 sentences]

... continue to 5-10 ideas
```

**Techniques:**

- **Inversion:** What's the opposite approach?
- **Analogy:** How do others solve similar problems?
- **Constraint removal:** What if [constraint] didn't exist?
- **Combination:** Can we merge two partial solutions?
- **Extreme:** What's the simplest? Most complex?

## Phase 4: Explore Codebase

Validate feasibility against existing code:

```typescript
// Find related patterns
grep({ pattern: "[related concept]", include: "*.ts" });
ast - grep({ pattern: "[code pattern]" });

// Understand existing architecture
lsp_lsp_document_symbols({ filePath: "<relevant file>" });
```

For each promising idea, note:

- Existing code that supports it
- Existing code that conflicts
- New code required

## Phase 5: Converge (Evaluate Ideas)

Rate each idea on 4 dimensions:

| Idea | Feasibility | Impact | Effort | Risk  | Score  |
| ---- | ----------- | ------ | ------ | ----- | ------ |
| 1    | H/M/L       | H/M/L  | S/M/L  | H/M/L | [1-10] |
| 2    | H/M/L       | H/M/L  | S/M/L  | H/M/L | [1-10] |
| ...  |             |        |        |       |        |

**Scoring guide:**

- **Feasibility:** Can we actually build this? (H=easy, L=very hard)
- **Impact:** How much value does this deliver? (H=high value)
- **Effort:** How much work? (S=small, L=large)
- **Risk:** What could go wrong? (H=high risk)

**Score formula:** (Feasibility × Impact) / (Effort × Risk)

## Phase 6: Deep Dive Top 3

For the top 3 scoring ideas:

### Idea [N]: [Name]

**Approach:**
[2-3 sentence description]

**How it works:**

1. [Step 1]
2. [Step 2]
3. [Step 3]

**Pros:**

- [Advantage 1]
- [Advantage 2]

**Cons:**

- [Disadvantage 1]
- [Disadvantage 2]

**Code sketch:**

```typescript
// Quick pseudocode or structure
```

**Open questions:**

- [Uncertainty 1]
- [Uncertainty 2]

## Phase 7: Prototype (Optional)

For the most promising idea, create a quick spike:

```
Prototype Goal:
━━━━━━━━━━━━━━━

Question to answer: [what are we validating?]
Time limit: 15 minutes
Success criteria: [how we know it works]
```

Create throwaway code to validate:

```bash
# Create spike branch
git checkout -b spike/brainstorm-$ARGUMENTS
```

Build minimal proof of concept. Delete or keep based on learnings.

## Phase 8: Capture Decision

Save brainstorm results:

**If bead exists:**

Write to `.beads/artifacts/<bead-id>/brainstorm.md`:

```markdown
# Brainstorm: [Topic]

**Date:** [date]
**Duration:** [N] minutes
**Bead:** <bead-id>

## Goal

[What we were exploring]

## Ideas Considered

| Idea | Feasibility | Impact | Effort | Risk | Score |
| ---- | ----------- | ------ | ------ | ---- | ----- |
| [1]  | H           | H      | M      | L    | 8     |
| [2]  | M           | H      | S      | M    | 6     |
| [3]  | L           | M      | L      | H    | 2     |

## Recommendation

**Chosen approach:** [Idea N]

**Rationale:** [Why this approach]

## Next Steps

- [ ] [Action 1]
- [ ] [Action 2]
```

**Create observation for reusable insights:**

```typescript
observation({
  type: "discovery",
  title: "Brainstorm: [topic]",
  content: `
## Key Insight
[What we learned]

## Approach Chosen
[Brief description]

## Why Others Rejected
[Brief notes on alternatives]
  `,
  concepts: "[topic keywords]",
  bead_id: "<bead-id>",
});
```

## Phase 9: Create Follow-up Beads

For promising ideas that need more work:

```bash
bd create "[Idea name]" -t task -p 2
```

## Output

```
Brainstorm Complete: $ARGUMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Duration: [N] minutes
Ideas generated: [N]
Ideas evaluated: [N]

Top 3:
1. [Idea 1] - Score: [N]
2. [Idea 2] - Score: [N]
3. [Idea 3] - Score: [N]

Recommendation: [Chosen approach]
Confidence: [High/Medium/Low]

Artifacts:
- .beads/artifacts/<bead-id>/brainstorm.md (if bead)
- Observation created ✓

Follow-up beads: [N] created
```

**Next steps:**

```
If ready to proceed:
  /research <bead-id>   # Validate approach
  /plan <bead-id>       # Create implementation plan

If need more exploration:
  /brainstorm <new-aspect>   # Continue ideation
```

## Anti-Patterns

- ❌ **Evaluating during divergence** - Generate first, judge later
- ❌ **Falling in love with first idea** - Explore alternatives
- ❌ **Infinite brainstorming** - Time box and decide
- ❌ **No decision** - Brainstorming must produce a recommendation
- ❌ **No capture** - Undocumented ideas are lost ideas
