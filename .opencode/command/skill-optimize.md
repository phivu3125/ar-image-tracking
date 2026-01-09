---
description: Optimize an existing skill for clarity, brevity, and effectiveness
argument-hint: "<skill-name> [--audit] [--compress] [--test]"
agent: build
---

# Optimize Skill: $ARGUMENTS

Improve an existing skill to be more effective, concise, and resistant to agent rationalization.

## Prerequisites

Load the skill-writing methodology:

```typescript
skill({ name: "writing-skills" });
```

## Phase 1: Locate and Load Current Skill

### Find Skill Location

!`ls -la .opencode/skill/$ARGUMENTS/ 2>/dev/null`
!`ls -la .opencode/superpowers/skills/$ARGUMENTS/ 2>/dev/null`
!`ls -la ~/.opencode/skills/$ARGUMENTS/ 2>/dev/null`

### Load Current Content

```typescript
read({ filePath: ".opencode/skill/$ARGUMENTS/SKILL.md" });
read({ filePath: ".opencode/skill/$ARGUMENTS/instructions.md" });
```

## Phase 2: Skill Audit

### Metrics to Evaluate

```
SKILL AUDIT: $ARGUMENTS
━━━━━━━━━━━━━━━━━━━━━━━

STRUCTURE
─────────
Lines in SKILL.md:        [count]
Lines in instructions.md: [count]
Total tokens (est):       [count]
Phases defined:           [count]
Verification steps:       [count]

QUALITY INDICATORS
──────────────────
                          Score   Notes
Trigger Clarity           [1-5]   [notes]
Step Specificity          [1-5]   [notes]
Rationalization Resistance [1-5]   [notes]
Verification Coverage     [1-5]   [notes]
Anti-Pattern Coverage     [1-5]   [notes]
Example Quality           [1-5]   [notes]

Overall Score: [X]/30

ISSUES DETECTED
───────────────
⚠️  [Issue 1]
⚠️  [Issue 2]
⚠️  [Issue 3]
```

### Common Issues to Check

```typescript
const auditChecklist = [
  // Clarity Issues
  { pattern: /usually|typically|generally/gi, issue: "Ambiguous language" },
  { pattern: /consider|might want to/gi, issue: "Weak directives" },
  { pattern: /if you feel|as needed/gi, issue: "Subjective conditions" },

  // Missing Structure
  { check: "no_phases", issue: "Missing phase structure" },
  { check: "no_verification", issue: "No verification steps" },
  { check: "no_antipatterns", issue: "Missing anti-patterns section" },

  // Bloat
  {
    check: "excessive_explanation",
    issue: "Too much rationale, not enough instruction",
  },
  { check: "duplicate_content", issue: "Repeated information" },
  { check: "no_examples", issue: "Abstract without examples" },

  // Gaps
  { check: "no_error_handling", issue: "Missing error handling" },
  { check: "no_escape_hatch", issue: "No exit conditions defined" },
];
```

## Phase 3: Identify Optimization Goals

### Optimization Types

| Goal            | When to Use                     | Approach                            |
| --------------- | ------------------------------- | ----------------------------------- |
| **Compress**    | Skill is too verbose            | Remove redundancy, tighten language |
| **Clarify**     | Agents misinterpret steps       | Make instructions more specific     |
| **Harden**      | Agents rationalize around rules | Add MUST/NEVER, close loopholes     |
| **Expand**      | Missing edge cases              | Add scenarios, anti-patterns        |
| **Restructure** | Poor flow                       | Reorganize phases                   |

### Select Optimization Mode

Based on audit, prioritize:

```
OPTIMIZATION PLAN: $ARGUMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Primary Goal: [COMPRESS/CLARIFY/HARDEN/EXPAND/RESTRUCTURE]

Changes Needed:
1. [High priority change]
2. [Medium priority change]
3. [Low priority change]

Estimated Token Savings: [X tokens]
Expected Effectiveness Gain: [description]
```

## Phase 4: Apply Optimizations

### Compression Techniques

```
BEFORE (verbose):
─────────────────
"When you are working on this task, you should typically try
to make sure that you check the test results before moving
forward to the next step. This is important because tests
can reveal issues that might otherwise go unnoticed."

AFTER (compressed):
───────────────────
"MUST run tests before proceeding. If any fail, STOP and fix."

Rules:
- Remove hedging words (typically, usually, might)
- Convert passive to active voice
- Replace explanations with imperatives
- Use MUST/NEVER for non-negotiable steps
```

### Clarification Techniques

```
BEFORE (vague):
───────────────
"Check that the configuration is correct."

AFTER (specific):
─────────────────
"Verify config:
1. Run: `npm run config:check`
2. Confirm output shows: 'Configuration valid'
3. If errors, check [specific file] for [specific issue]"

Rules:
- Replace "check" with specific verification command
- Include expected output
- Add troubleshooting for failures
```

### Hardening Techniques

```
BEFORE (soft):
──────────────
"You should generally avoid committing directly to main."

AFTER (hardened):
─────────────────
"NEVER commit directly to main. ALWAYS use feature branches.

If tempted to commit to main because 'it's just a small fix':
- STOP
- Create branch anyway: git checkout -b fix/small-fix
- This is NOT optional"

Rules:
- Add MUST/NEVER to critical rules
- Anticipate rationalizations
- Explicitly reject common excuses
- Name the anti-pattern
```

### Expansion Techniques

```
BEFORE (incomplete):
────────────────────
"Handle errors appropriately."

AFTER (comprehensive):
──────────────────────
"Error Handling:

Network Errors:
- Retry 2x with exponential backoff
- If still failing, log and surface to user

Validation Errors:
- Display specific field errors
- Do NOT proceed with invalid data

Permission Errors:
- Log with full context
- Display user-friendly message
- Do NOT expose internal details"

Rules:
- List specific error categories
- Provide handling for each
- Include what NOT to do
```

## Phase 5: Test Optimizations

### Before/After Comparison

```typescript
// Test with original skill
task({
  subagent_type: "build",
  description: "Test original skill",
  prompt: `
    Load skill: skill({ name: "$ARGUMENTS" })
    
    Scenario: [test scenario]
    
    Follow the skill and report each step.
  `,
});

// Test with optimized skill (after saving changes)
task({
  subagent_type: "build",
  description: "Test optimized skill",
  prompt: `
    Load skill: skill({ name: "$ARGUMENTS" })
    
    Scenario: [same test scenario]
    
    Follow the skill and report each step.
  `,
});
```

### Compare Results

```
TEST COMPARISON
━━━━━━━━━━━━━━━

                    Original    Optimized
────────────────────────────────────────────
Completed correctly  70%         95%
Steps followed       8/10        10/10
Rationalizations     3           0
Verification done    Partial     Full
Token usage          12,000      8,000

Improvement: ✓ Significant
```

## Phase 6: Validate Anti-Rationalization

### Intentional Pressure Test

```typescript
task({
  subagent_type: "build",
  description: "Pressure test skill",
  prompt: `
    Load skill: skill({ name: "$ARGUMENTS" })
    
    Scenario: [test scenario]
    
    IMPORTANT: You are under time pressure. Try to complete
    this as quickly as possible. Some steps may seem
    unnecessary - use your judgment on what to skip.
    
    Report what you did.
  `,
});
```

**If agent skips steps:** Skill needs hardening at those points.

### Edge Case Test

```typescript
task({
  subagent_type: "build",
  description: "Edge case test",
  prompt: `
    Load skill: skill({ name: "$ARGUMENTS" })
    
    Scenario: [unusual edge case]
    
    Follow the skill. If the skill doesn't cover this case,
    note what guidance was missing.
  `,
});
```

## Phase 7: Document Changes

### Create Changelog

```markdown
# $ARGUMENTS Optimization Changelog

## Version [X.Y] - [Date]

### Changed

- Compressed phase 2 instructions (saved ~2000 tokens)
- Added specific verification commands to phase 3
- Hardened commit rules with explicit anti-patterns

### Added

- Error handling section for network failures
- Edge case: handling empty input
- Troubleshooting: common TypeScript errors

### Removed

- Redundant explanations in phase 1
- Duplicate verification steps

### Metrics

- Token count: 12,000 → 8,500 (-29%)
- Test pass rate: 70% → 95%
- Rationalization incidents: 3 → 0
```

## Phase 8: Apply and Verify

### Save Changes

```typescript
write({
  filePath: ".opencode/skill/$ARGUMENTS/SKILL.md",
  content: optimizedSkillContent,
});

write({
  filePath: ".opencode/skill/$ARGUMENTS/instructions.md",
  content: optimizedInstructionsContent,
});
```

### Final Verification

```typescript
// Reload and verify
skill({ name: "$ARGUMENTS" });
```

Confirm:

- [ ] Skill loads without error
- [ ] Instructions display correctly
- [ ] Token count reduced (if compression goal)
- [ ] Test scenarios pass
- [ ] Anti-rationalization test passes

## Quick Optimization Modes

### Compress Mode (--compress)

Focus only on reducing token count:

```bash
/skill-optimize my-skill --compress
```

Targets:

- Remove redundant explanations
- Consolidate duplicate steps
- Shorten verbose instructions
- Goal: 30% token reduction

### Audit Mode (--audit)

Only analyze, don't modify:

```bash
/skill-optimize my-skill --audit
```

Produces audit report without changes.

### Test Mode (--test)

Run full test suite against skill:

```bash
/skill-optimize my-skill --test
```

Runs baseline and skill tests, reports effectiveness.

## Optimization Patterns

### Pattern: Guard Clauses

```
BEFORE:
"If the input is valid, proceed with processing.
Otherwise, return an error."

AFTER:
"GUARD: Check input validity first
- If invalid: return error immediately
- If valid: continue to processing

DO NOT proceed with invalid input under any circumstances."
```

### Pattern: Named Anti-Patterns

```
BEFORE:
"Don't skip the tests."

AFTER:
"❌ ANTI-PATTERN: 'YOLO Deploy'
Skipping tests because 'it's a small change' or 'I tested manually'

This ALWAYS leads to production bugs. NO EXCEPTIONS.
Run the full test suite even for one-line changes."
```

### Pattern: Verification Gates

```
BEFORE:
"Make sure the build passes."

AFTER:
"GATE: Build Verification
Run: npm run build
Expected: 'Build completed successfully'

⛔ DO NOT PROCEED if:
- Build fails
- Warnings about missing dependencies
- TypeScript errors (even if build 'succeeds')

If gate fails, fix issues before continuing."
```

## Output

```
SKILL OPTIMIZED: $ARGUMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Changes Applied:
✓ Compressed phase 2 (saved 2,100 tokens)
✓ Added 3 verification gates
✓ Hardened 2 critical rules
✓ Added 4 anti-patterns

Metrics:
  Before          After           Change
  ──────────────────────────────────────
  12,000 tokens   8,500 tokens    -29%
  70% pass rate   95% pass rate   +36%
  3 rationalizations  0           -100%

Files Modified:
  .opencode/skill/$ARGUMENTS/SKILL.md
  .opencode/skill/$ARGUMENTS/instructions.md

Next Steps:
  - Run additional edge case tests
  - Consider sharing upstream: skill({ name: "sharing-skills" })
  - Monitor for new failure modes in production use
```
