---
description: Create custom skills for agents using TDD-driven approach
argument-hint: "<skill-name> [--from-observation] [--template=<type>]"
agent: build
---

# Create Skill: $ARGUMENTS

Create a new reusable skill that agents can load to handle specific scenarios.

## What is a Skill?

Skills are process instructions that:

- Guide agents through complex multi-step workflows
- Encode hard-won knowledge that prevents common mistakes
- Provide guardrails that resist agent rationalization
- Can be loaded on-demand when relevant scenarios arise

## Prerequisites

Load the skill-writing skill first:

```typescript
skill({ name: "writing-skills" });
```

This provides the TDD framework for skill creation.

## Phase 1: Define the Problem

### Identify the Trigger

When should this skill be loaded? Define clear trigger conditions:

```markdown
**Use this skill when:**

- [Specific scenario 1]
- [Specific scenario 2]
- [Observable condition]

**Do NOT use when:**

- [Exception 1]
- [Exception 2]
```

### Document the Pain Point

What goes wrong without this skill?

```
PROBLEM STATEMENT
━━━━━━━━━━━━━━━━━

Without guidance, agents typically:
1. [Common mistake 1]
2. [Common mistake 2]
3. [Rationalization pattern]

This leads to:
- [Bad outcome 1]
- [Bad outcome 2]
- [Wasted effort]
```

### Define Success Criteria

What does correct behavior look like?

```
SUCCESS CRITERIA
━━━━━━━━━━━━━━━━

An agent following this skill will:
✓ [Correct behavior 1]
✓ [Correct behavior 2]
✓ [Verification step]

Observable outputs:
- [Artifact 1]
- [Artifact 2]
```

## Phase 2: Design the Skill Structure

### Skill Anatomy

```
.opencode/skill/$ARGUMENTS/
├── SKILL.md              # Main skill file (loaded by skill tool)
├── instructions.md       # Detailed step-by-step instructions
├── examples/             # Example scenarios
│   ├── good-example.md   # What correct execution looks like
│   └── bad-example.md    # What to avoid (anti-patterns)
└── tests/                # Test scenarios for validation
    ├── scenario-1.md     # Test case 1
    └── scenario-2.md     # Test case 2
```

### SKILL.md Template

```markdown
---
name: $ARGUMENTS
description: [One-line description]
trigger: [When to use this skill]
agent: build
mcp_servers: [] # Optional: MCP servers to connect
---

# $ARGUMENTS

[Brief description of what this skill does and why it exists]

## When to Use

Use this skill when:

- [Condition 1]
- [Condition 2]

Do NOT use when:

- [Exception 1]

## Quick Start

[3-5 step summary of the core workflow]

## Detailed Instructions

See: [instructions.md](./instructions.md)

## Anti-Patterns

❌ **[Bad Pattern Name]**
[Description of what NOT to do]

❌ **[Another Bad Pattern]**
[Description]

## Verification

Before completing, verify:

- [ ] [Checklist item 1]
- [ ] [Checklist item 2]
- [ ] [Checklist item 3]
```

### Instructions.md Template

````markdown
# $ARGUMENTS: Detailed Instructions

## Phase 1: [Setup/Initialization]

### Step 1.1: [Action]

[Detailed instructions]

```typescript
// Code example if relevant
```
````

### Step 1.2: [Action]

[Detailed instructions]

**Expected Output:**

```
[What the agent should see]
```

## Phase 2: [Core Workflow]

### Step 2.1: [Action]

[Instructions with rationale - WHY this step matters]

⚠️ **Common Mistake:** [What agents often do wrong here]

✅ **Correct Approach:** [What to do instead]

### Step 2.2: [Action]

[Instructions]

## Phase 3: [Verification]

### Step 3.1: Verify Results

[How to confirm success]

### Step 3.2: Clean Up

[Any cleanup steps]

## Troubleshooting

### [Common Issue 1]

**Symptom:** [What you observe]
**Cause:** [Why it happens]
**Solution:** [How to fix]

### [Common Issue 2]

**Symptom:** [What you observe]
**Cause:** [Why it happens]
**Solution:** [How to fix]

````

## Phase 3: Write Tests First (TDD)

### Create Test Scenario

```markdown
# Test: $ARGUMENTS - [Scenario Name]

## Setup
[Initial state before skill execution]

## Input
[What triggers the skill]

## Expected Behavior
1. Agent should [action 1]
2. Agent should [action 2]
3. Agent should NOT [anti-pattern]

## Expected Output
[Artifacts or changes]

## Verification
[How to confirm correct behavior]
````

### Run Baseline Test (RED)

Test without the skill to confirm the problem exists:

```typescript
task({
  subagent_type: "build",
  description: "Baseline test for skill",
  prompt: `
    [Scenario that triggers the skill need]
    
    DO NOT load any skills. Just attempt the task naturally.
    
    Report what you did and any issues encountered.
  `,
});
```

**Expected Result:** Agent makes the mistakes the skill prevents.

## Phase 4: Write the Skill (GREEN)

### Core Principles

1. **Be Prescriptive, Not Descriptive**
   - ❌ "Consider checking for errors"
   - ✅ "MUST run `npm test` before proceeding. If tests fail, STOP."

2. **Close Rationalization Loopholes**
   - ❌ "Usually you should..."
   - ✅ "ALWAYS do X. NO EXCEPTIONS."

3. **Add Verification Gates**
   - After each major step, require observable verification
   - "Run [command] and confirm output contains [pattern]"

4. **Include Anti-Patterns**
   - Explicitly state what NOT to do
   - Agents are more likely to avoid named anti-patterns

5. **Provide Escape Hatches**
   - Define what to do when skill doesn't apply
   - "If [condition], exit this skill and [alternative]"

### Write SKILL.md

Create the main skill file with:

- Clear trigger conditions
- Step-by-step workflow
- Verification checklist
- Anti-patterns section

### Write instructions.md

Create detailed instructions with:

- Numbered phases and steps
- Code examples where helpful
- Common mistakes highlighted
- Troubleshooting section

## Phase 5: Test the Skill (GREEN → PASSING)

```typescript
task({
  subagent_type: "build",
  description: "Test skill execution",
  prompt: `
    Load the skill: skill({ name: "$ARGUMENTS" })
    
    Then attempt this scenario:
    [Same scenario as baseline]
    
    Follow the skill instructions exactly.
    Report each step you take and verification results.
  `,
});
```

**Expected Result:** Agent follows skill correctly, avoids mistakes.

## Phase 6: Iterate (REFACTOR)

### Identify Gaps

Review test results for:

- Steps that were unclear
- Rationalizations that slipped through
- Missing edge cases
- Overly verbose instructions

### Tighten the Skill

```
COMMON REFINEMENTS
━━━━━━━━━━━━━━━━━━

1. Add MUST/NEVER language where agents deviated
2. Remove ambiguous "usually" or "typically" phrases
3. Add specific commands instead of "check that..."
4. Include exact error messages to look for
5. Add more anti-patterns based on observed failures
```

### Re-Test

Run test scenarios again until skill guides behavior correctly.

## Phase 7: Document Examples

### Good Example

```markdown
# Example: $ARGUMENTS - Correct Execution

## Scenario

[What triggered the skill]

## Execution Trace

1. Loaded skill
2. Checked [precondition] ✓
3. Ran [step 1]
   Output: [what was observed]
4. Ran [step 2]
   Output: [what was observed]
5. Verified [condition] ✓

## Result

[Successful outcome]
```

### Bad Example

```markdown
# Anti-Example: $ARGUMENTS - What NOT to Do

## Scenario

[Same trigger]

## What Went Wrong

❌ Skipped step 2 because "it seemed unnecessary"
❌ Didn't verify before proceeding
❌ Assumed X instead of checking

## Consequence

[What broke]

## Lesson

[Why the skill step matters]
```

## Phase 8: Finalize and Register

### File Structure Check

!`ls -la .opencode/skill/$ARGUMENTS/`

Expected:

```
SKILL.md
instructions.md
examples/
  good-example.md
  bad-example.md
tests/
  scenario-1.md
```

### Test Loading

```typescript
skill({ name: "$ARGUMENTS" });
```

Verify:

- Skill loads without error
- Instructions are clear when displayed
- Agent can follow the workflow

## Optional: Share Upstream

If this skill is generally useful:

```typescript
skill({ name: "sharing-skills" });
```

This guides contributing the skill back to the skills repository.

## Templates

### Quick Templates

```bash
/skill-create debugging --template=debugging
/skill-create deployment --template=deployment
/skill-create code-review --template=review
/skill-create migration --template=migration
```

### Template Types

| Template      | Best For                     |
| ------------- | ---------------------------- |
| `debugging`   | Root cause analysis skills   |
| `deployment`  | Release and deploy workflows |
| `review`      | Code review checklists       |
| `migration`   | Data or schema migrations    |
| `security`    | Security audit workflows     |
| `testing`     | Test creation patterns       |
| `refactoring` | Safe refactoring steps       |

## From Observation

If creating from an existing observation:

```bash
/skill-create my-skill --from-observation
```

1. Search observations for patterns
2. Extract relevant learnings
3. Pre-populate skill with discovered knowledge

```typescript
memory_search({ query: "$ARGUMENTS", type: "observations" });
```

## Success Criteria

The skill is ready when:

- [ ] Baseline test (no skill) shows the problem
- [ ] Skill test shows correct behavior
- [ ] Instructions are unambiguous
- [ ] Anti-patterns are documented
- [ ] At least one good and one bad example
- [ ] Loads without error via `skill()` tool
- [ ] Verified by independent subagent test

## Output

```
SKILL CREATED: $ARGUMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━

Location: .opencode/skill/$ARGUMENTS/

Files:
✓ SKILL.md (main definition)
✓ instructions.md (detailed steps)
✓ examples/good-example.md
✓ examples/bad-example.md
✓ tests/scenario-1.md

Usage:
  skill({ name: "$ARGUMENTS" })

Next Steps:
  - Test with more scenarios
  - Share upstream: skill({ name: "sharing-skills" })
  - Add to relevant command files
```
