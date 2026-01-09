# OpenCode Plugins

TypeScript plugins for extending OpenCode functionality following official best practices.

## Directory Structure

```
plugin/
├── lib/
│   └── notify.ts        # Shared notification utilities
├── injector.ts          # AGENTS.md hierarchy walker
├── compactor.ts         # Context usage warnings
├── enforcer.ts          # TODO completion enforcement
├── notification.ts      # Session completion alerts
├── sessions.ts          # Session management tools
├── truncator.ts         # Output size monitoring
└── README.md
```

## Installed Plugins

### injector.ts

**AGENTS.md hierarchy walker** - solves OpenCode's limitation where findUp only finds the first AGENTS.md match.

- Hooks into `tool.execute.after` for `read` tool
- Walks up from file directory to project root
- Collects ALL AGENTS.md files in the path
- Injects in order: root → specific (T-shaped context loading)
- Caches per session to avoid duplicate injections

**Example:** When reading `src/components/Button.tsx`:

```
Injects:
1. /project/AGENTS.md (root context)
2. /project/src/AGENTS.md (src context)
3. /project/src/components/AGENTS.md (component context)
```

### sessions.ts

**Session management and context transfer** - enables short, focused sessions.

**Tools:**

- `list_sessions(project?, since?, limit?)` - Discover available sessions
- `read_session(session_reference, project?, focus?)` - Load context from previous sessions
- `summarize_session(session_id)` - Generate AI summary of a session

**Workflow pattern:**

```
Session 1: Implementation (80k) → close
Session 2: read_session("last") → Refactor (60k) → close
Session 3: read_session("previous") → Tests (90k) → close
```

### compactor.ts

**Context usage warnings** - notifies at token thresholds before hitting limits.

- Warns at 70% (info), 85% (warn), 95% (critical)
- Sends native notifications at 85%+
- Tracks per-session to avoid duplicate warnings

### enforcer.ts

**TODO completion enforcement** - forces continuation when session idles with incomplete work.

- Tracks TODOs per session via `todo.updated` events
- On `session.idle`, checks for incomplete high-priority or in-progress TODOs
- **ENFORCES** continuation by calling `client.session.promptAsync()` (not just notification)
- Injects prompt: "Continue working on incomplete TODOs: [list]"
- 5-minute cooldown to prevent spam
- Falls back to OS notification if prompt injection fails

**Behavior:**

- High-priority or in-progress TODOs → Inject continuation prompt
- Low-priority pending TODOs → OS notification only (no forced continuation)

### notification.ts

**Session completion alerts** - sends native notifications when AI finishes.

- Extracts session summary from messages
- Cross-platform (macOS, Linux, WSL, Windows)
- Uses shared `lib/notify.ts` utilities

### truncator.ts

**Output size monitoring** - logs warnings for large outputs under context pressure.

- Monitors `tool.execute.after` events
- Warns when outputs exceed thresholds based on context usage
- Note: Actual truncation requires OpenCode core changes; this is observation-only

## Shared Library

### lib/notify.ts

Shared utilities used by multiple plugins:

```typescript
import { notify, THRESHOLDS, getContextPercentage } from "./lib/notify";

// Send cross-platform notification using $ shell API
await notify($, "Title", "Message");

// Context thresholds
THRESHOLDS.MODERATE; // 70%
THRESHOLDS.URGENT; // 85%
THRESHOLDS.CRITICAL; // 95%
```

## Best Practices Applied

### Use `$` Shell API (not `exec`)

```typescript
// ✅ Correct - uses Bun shell from plugin context
export const MyPlugin: Plugin = async ({ $ }) => {
  await $`osascript -e 'display notification "Done!"'`;
};

// ❌ Wrong - manual exec with escaping
import { exec } from "child_process";
exec(`osascript -e '...'`, () => {});
```

### Share Common Code

```typescript
// ✅ Correct - import from shared lib
import { notify } from "./lib/notify";

// ❌ Wrong - copy-paste same code in every plugin
function notify() {
  /* duplicated */
}
```

### Proper Plugin Structure

```typescript
import type { Plugin } from "@opencode-ai/plugin";

export const MyPlugin: Plugin = async ({ client, $ }) => {
  return {
    event: async ({ event }) => {
      /* ... */
    },
    "tool.execute.after": async (input, output) => {
      /* ... */
    },
  };
};
```

## Available Hooks

| Hook                  | Purpose                                                         |
| --------------------- | --------------------------------------------------------------- |
| `event`               | Listen to OpenCode events (session.idle, session.updated, etc.) |
| `tool.execute.before` | Hook before tool execution                                      |
| `tool.execute.after`  | Hook after tool execution (observation only)                    |
| `tool`                | Add custom tools                                                |

## Resources

- [OpenCode Plugin Documentation](https://opencode.ai/docs/plugins/)
- [OpenCode Custom Tools](https://opencode.ai/docs/custom-tools/)
- [Community Examples](https://github.com/sst/opencode/discussions)
