# Boundaries: When to Use bd\_\* vs TodoWrite

Decision criteria for choosing between beads tools and TodoWrite.

## The Core Question

**"Could I resume this work after 2 weeks away?"**

- If beads would help you resume → **use bd\_\***
- If markdown skim would suffice → **TodoWrite is fine**

## Decision Matrix

### Use bd\_\* for:

**Multi-Session Work**

- Strategic document development
- Feature implementation across sessions
- Bug investigation over time
- Architecture design iterations

**Complex Dependencies**

- OAuth integration requiring DB, endpoints, frontend
- Research with parallel investigation threads
- Refactoring with dependencies between areas
- Migration requiring sequential steps

**Knowledge Work**

- Architecture decisions requiring research
- API design with multiple options
- Performance optimization experiments
- Documentation requiring system understanding

**Side Quests**

- Found better pattern during feature work
- Noticed architectural issue while debugging
- Identified improvement during code review
- Edge case requiring research during tests

**Multi-Agent Coordination**

- Multiple agents editing same codebase
- File locking needed
- Cross-team communication

### Use TodoWrite for:

**Single-Session Tasks**

- Implementing single function from spec
- Fixing bug with known root cause
- Adding unit tests for existing code
- Updating documentation

**Linear Execution**

- Database migration with clear sequence
- Deployment checklist
- Code style cleanup
- Dependency updates

**Immediate Context**

- User provides complete spec
- Bug report with reproduction and fix
- Refactoring with clear before/after
- Config changes from preferences

**Simple Tracking**

- Breaking down implementation
- Showing validation progress
- Demonstrating systematic approach

## Detailed Comparison

| Aspect           | bd\_\*                            | TodoWrite              |
| ---------------- | --------------------------------- | ---------------------- |
| **Persistence**  | Git-backed, survives compaction   | Session-only           |
| **Dependencies** | Graph-based, auto ready detection | Manual                 |
| **File Locking** | Yes, prevents conflicts           | No                     |
| **Multi-Agent**  | Yes, coordination tools           | No                     |
| **Visibility**   | Background structure              | Visible in chat        |
| **Best for**     | Complex, multi-session            | Simple, single-session |

## Integration Patterns

### Pattern 1: bd\_\* as Strategic, TodoWrite as Tactical

```
bd task: "Implement user authentication" (epic)
  ├─ Child: "Create login endpoint"
  ├─ Child: "Add JWT validation"  ← Currently working
  └─ Child: "Implement logout"

TodoWrite (for JWT validation):
- [ ] Install JWT library
- [ ] Create validation middleware
- [ ] Add tests for expiry
- [ ] Update docs
```

### Pattern 2: TodoWrite as Working Copy

```
Session start:
- bd_claim() gets "Add JWT validation"
- Extract acceptance criteria into TodoWrite
- Work through TodoWrite items
- Update bd notes as you learn
- bd_done() when TodoWrite complete
```

### Pattern 3: Transition Mid-Session

**From TodoWrite to bd\_\*:**

Trigger signals:

- Discovering blockers or dependencies
- Work won't complete this session
- Finding side quests
- Need to pause and resume later

**How to transition:**

```
1. bd_add() with current TodoWrite content
2. Note: "Discovered multi-session work"
3. Add dependencies as discovered
4. Keep TodoWrite for current session
5. Update bd notes before session ends
```

## Common Mistakes

### Mistake 1: TodoWrite for Multi-Session Work

**What happens:**

- Next session, forget what was done
- Scroll history to reconstruct
- Lose design decisions
- Duplicate work

**Solution:** Use bd\_\* instead.

### Mistake 2: bd\_\* for Simple Linear Tasks

**What happens:**

- Overhead not justified
- User can't see progress
- Extra tool use for no benefit

**Solution:** Use TodoWrite.

### Mistake 3: Not Transitioning When Complexity Emerges

**What happens:**

- Start with TodoWrite
- Discover blockers mid-way
- Keep using TodoWrite despite poor fit
- Lose context when session ends

**Solution:** Transition to bd\_\* when complexity appears.

### Mistake 4: Creating Too Many bd Issues

**What happens:**

- Every tiny task gets an issue
- Database cluttered
- Hard to find meaningful work

**Solution:** Use 2-week test. Would bd help after 2 weeks? If no, skip.

## The Transition Point

**Transition signals:**

- "This is taking longer than expected"
- "I've discovered a blocker"
- "This needs more research"
- "I should investigate X first"
- "User might not continue today"
- "Found three related issues"

When you notice these: Create bd issue, preserve context.

## Summary Heuristics

**Time horizon:**

- Same session → TodoWrite
- Multiple sessions → bd\_\*

**Dependency structure:**

- Linear steps → TodoWrite
- Blockers/prerequisites → bd\_\*

**Scope clarity:**

- Well-defined → TodoWrite
- Exploratory → bd\_\*

**Multi-agent:**

- Single agent → Either
- Multiple agents → bd\_\*

**When in doubt:** Use the 2-week test.
