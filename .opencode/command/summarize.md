---
description: Generate AI summary of sessions for quick context recovery
argument-hint: "[session_reference] [--compare] [--focus=<topic>]"
agent: explore
subtask: true
---

# Summarize

Generate AI-powered summaries of previous sessions to quickly understand what happened without loading full context.

## Phase 1: Resolve Session Reference

### Parse Argument

```typescript
const ref = "$ARGUMENTS" || "last";

const parseReference = (ref: string) => {
  // Direct session ID
  if (ref.startsWith("ses_")) return { type: "id", value: ref };

  // Relative references
  if (ref === "last") return { type: "relative", offset: 0 };
  if (ref.match(/^\d+ ago$/))
    return { type: "relative", offset: parseInt(ref) };

  // Time-based
  if (ref === "today") return { type: "time", period: "today" };
  if (ref === "yesterday") return { type: "time", period: "yesterday" };
  if (ref.match(/^\d{4}-\d{2}-\d{2}$/)) return { type: "date", value: ref };

  // Bead-based
  if (ref.startsWith("bd-")) return { type: "bead", id: ref };

  return { type: "unknown", value: ref };
};
```

### List Available Sessions (if needed)

```typescript
list_sessions({ project: "current", limit: 10, _: true });
```

**If no argument provided, show picker:**

```
RECENT SESSIONS
━━━━━━━━━━━━━━━

#  │ ID          │ Time         │ Messages │ Focus
───┼─────────────┼──────────────┼──────────┼─────────────────────
1  │ ses_abc123  │ Today 2:30pm │ 45       │ Auth implementation
2  │ ses_def456  │ Today 11am   │ 28       │ Dashboard setup
3  │ ses_ghi789  │ Yesterday    │ 62       │ Bug triage
4  │ ses_jkl012  │ 2 days ago   │ 34       │ API refactor
5  │ ses_mno345  │ 3 days ago   │ 19       │ Documentation

Select session (1-5) or enter session ID: _
```

## Phase 2: Generate AI Summary

```typescript
summarize_session({ session_id: resolvedSessionId });
```

This triggers the compaction model to:

1. Analyze all messages in the session
2. Extract key actions, decisions, and outcomes
3. Identify files modified and their changes
4. Note blockers and unresolved items
5. Generate structured summary

## Phase 3: Display Summary

### Summary Format

```
╔══════════════════════════════════════════════════════════════════════════╗
║                         SESSION SUMMARY                                  ║
╠══════════════════════════════════════════════════════════════════════════╣

SESSION INFO
━━━━━━━━━━━━
ID:        ses_abc123
Date:      2024-01-15 2:30 PM - 4:15 PM (1h 45m)
Messages:  45
Tokens:    ~78,000
Project:   my-project


FOCUS
━━━━━
Primary: Implementing JWT authentication for API endpoints
Related Beads: bd-auth01, bd-api02


WHAT WAS ACCOMPLISHED
━━━━━━━━━━━━━━━━━━━━━
✓ Created AuthMiddleware class with token validation
✓ Added JWT signing and verification utilities
✓ Implemented login and logout endpoints
✓ Set up refresh token rotation
✗ Rate limiting (deferred to next session)


KEY DECISIONS
━━━━━━━━━━━━━
1. Used RS256 algorithm for JWT (asymmetric keys)
   Reason: Allows token verification without sharing secret

2. Refresh tokens stored in Redis with 7-day TTL
   Reason: Balance between security and user convenience

3. Access tokens expire in 15 minutes
   Reason: Minimize window for stolen token abuse


FILES MODIFIED
━━━━━━━━━━━━━━
src/
├── auth/
│   ├── middleware.ts    (+124/-0)  NEW - Auth middleware
│   ├── jwt.ts           (+89/-0)   NEW - JWT utilities
│   └── types.ts         (+34/-0)   NEW - Auth types
├── routes/
│   └── auth.ts          (+67/-12)  Added login/logout
└── config/
    └── auth.ts          (+23/-5)   JWT configuration

Total: +337/-17 across 5 files


TESTS
━━━━━
Added: 8 tests in auth.test.ts
Status: 7 passing, 1 skipped
Coverage: 84% for auth module


BLOCKERS ENCOUNTERED
━━━━━━━━━━━━━━━━━━━━
1. Redis connection timeout during testing
   Resolution: Added retry logic with exponential backoff

2. TypeScript error with jwt library types
   Resolution: Added @types/jsonwebtoken


UNRESOLVED ITEMS
━━━━━━━━━━━━━━━━
- Rate limiting not implemented (moved to bd-rate01)
- Need to add CORS configuration for refresh endpoint
- API documentation needs update


WHERE WORK STOPPED
━━━━━━━━━━━━━━━━━━
File: src/auth/middleware.ts
Line: 45
Context: "Adding rate limiting check before token validation"

Handoff created: Yes
Branch: feature/auth
Last commit: abc1234 "feat: add JWT auth with refresh tokens"


CONTEXT FOR NEXT SESSION
━━━━━━━━━━━━━━━━━━━━━━━━
To continue this work:
1. Load handoff: /resume bd-auth01
2. Focus on: Rate limiting implementation
3. Read first: src/auth/middleware.ts:45

╚══════════════════════════════════════════════════════════════════════════╝
```

## Phase 4: Focus Mode (--focus)

If `--focus=<topic>` specified, filter summary:

```bash
/summarize last --focus=decisions      # Only decisions made
/summarize last --focus=files          # Only file changes
/summarize last --focus=blockers       # Only blockers
/summarize last --focus=code           # Code snippets written
```

**Example: Focus on Decisions**

```
DECISIONS FROM ses_abc123
━━━━━━━━━━━━━━━━━━━━━━━━━

1. JWT Algorithm: RS256
   Context: Discussed HS256 vs RS256
   Conclusion: RS256 for microservices (can verify without secret)
   Files affected: src/auth/jwt.ts

2. Token Expiry: 15 min access, 7 day refresh
   Context: Security vs UX tradeoff
   Conclusion: Short access + long refresh with rotation
   Files affected: src/config/auth.ts

3. Storage: Redis for refresh tokens
   Context: Considered PostgreSQL, decided Redis for TTL support
   Conclusion: Redis with automatic expiration
   Files affected: src/auth/token-store.ts
```

## Phase 5: Compare Mode (--compare)

Compare two sessions:

```bash
/summarize ses_abc123 --compare ses_def456
```

**Comparison Output:**

```
SESSION COMPARISON
━━━━━━━━━━━━━━━━━━

                    │ ses_abc123      │ ses_def456
────────────────────┼─────────────────┼─────────────────
Date                │ Jan 15, 2:30pm  │ Jan 14, 11:00am
Duration            │ 1h 45m          │ 2h 10m
Messages            │ 45              │ 62
Files Modified      │ 5               │ 8
Tests Added         │ 8               │ 3
Decisions           │ 3               │ 1


COMMON THREADS
━━━━━━━━━━━━━━
- Both sessions worked on auth module
- ses_def456 laid groundwork that ses_abc123 built upon
- Same bead: bd-auth01


PROGRESSION
━━━━━━━━━━━
ses_def456 (earlier):
  └── Set up auth module structure
  └── Created base types and interfaces

ses_abc123 (later):
  └── Implemented JWT logic on top of structure
  └── Added endpoints and middleware
```

## Phase 6: Bead-Focused Summary

If argument is a bead ID, find all related sessions:

```bash
/summarize bd-auth01
```

**Output:**

```
BEAD HISTORY: bd-auth01
━━━━━━━━━━━━━━━━━━━━━━━

Title: Implement JWT Authentication
Status: In Progress
Created: 2024-01-12


RELATED SESSIONS
━━━━━━━━━━━━━━━━

Session 1: ses_xyz789 (Jan 12)
├── Duration: 30 min
├── Focus: Initial planning and spec creation
└── Output: spec.md created

Session 2: ses_def456 (Jan 14)
├── Duration: 2h 10m
├── Focus: Research and architecture
└── Output: research.md, plan.md created

Session 3: ses_abc123 (Jan 15)
├── Duration: 1h 45m
├── Focus: Core implementation
└── Output: 5 files, 8 tests

Session 4: ses_ghi012 (Jan 16)  ← LATEST
├── Duration: 45 min
├── Focus: Rate limiting (incomplete)
└── Output: Handoff created


TOTAL EFFORT
━━━━━━━━━━━━
Sessions: 4
Total Time: 5h 10m
Messages: 156
Files Modified: 12
Tests: 11

Progress: 80% complete (per plan.md)


NEXT SESSION SHOULD
━━━━━━━━━━━━━━━━━━━
1. Resume from handoff
2. Complete rate limiting
3. Run full test suite
4. Create PR
```

## Examples

```bash
/summarize                          # Summarize last session
/summarize last                     # Same as above
/summarize 2 ago                    # 2nd most recent session
/summarize ses_abc123               # Specific session
/summarize today                    # First session today
/summarize yesterday                # Most recent yesterday
/summarize 2024-01-15               # Sessions from date
/summarize bd-auth01                # All sessions for bead
/summarize last --focus=decisions   # Only decisions
/summarize last --focus=files       # Only file changes
/summarize a --compare b            # Compare two sessions
```

## When to Use

| Scenario                   | Command                            |
| -------------------------- | ---------------------------------- |
| Resuming after break       | `/summarize last` then `/resume`   |
| Understanding old work     | `/summarize <session_id>`          |
| Handoff to teammate        | `/summarize --focus=decisions`     |
| Finding where you left off | `/summarize <bead-id>`             |
| Comparing approaches       | `/summarize a --compare b`         |
| Context triage             | `/summarize` before `read_session` |

## Integration with Other Commands

```
Workflow: Efficient Context Loading
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. List sessions
   list_sessions(project="current", limit=5)

2. Summarize promising ones (cheap)
   /summarize ses_abc123
   /summarize ses_def456

3. Load full context only for the right one (expensive)
   read_session("ses_abc123")

4. Resume work
   /resume bd-auth01

Result: Saved ~50k tokens by not loading wrong sessions
```

## Output Caching

Summaries are cached with the session:

```typescript
// First call generates summary
summarize_session("ses_abc123"); // ~5 seconds, API call

// Subsequent calls use cached summary
summarize_session("ses_abc123"); // Instant, cached
```

To regenerate:

```bash
/summarize ses_abc123 --regenerate
```

## Error Handling

```
[If session not found:]
ERROR: Session 'ses_xyz' not found

Recent sessions:
- ses_abc123 (today)
- ses_def456 (yesterday)

Check: list_sessions(limit=20)


[If summary generation fails:]
WARNING: AI summary unavailable

Falling back to basic metadata:
- Messages: 45
- Duration: 1h 45m
- Files: 5 modified

Try: read_session("ses_abc123") for full context


[If no sessions exist:]
No sessions found for this project.

This may be a new project or sessions were cleared.
```
