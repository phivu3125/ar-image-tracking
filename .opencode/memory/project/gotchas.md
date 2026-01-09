---
purpose: Footguns, edge cases, and "don't forget this" warnings
updated: 2025-01-05
---

# Project Gotchas

## Configuration Quirks

### DCP v1.1.3 Schema Breaking Changes

1. **Legacy `strategies.onIdle` removed**: v1.1.2+ no longer supports this field
   - Error: `Unknown keys: strategies.onIdle`
   - Fix: Remove the entire `onIdle` block from `dcp.jsonc`

2. **Permission model changed**: v1.1.1+ deprecated legacy `tools: { write: true }` boolean syntax
   - Old: Global `tools: {}` with booleans
   - New: `permission: {}` with `"allow"` / `"ask"` / `"deny"` actions
   - Both still work for backwards compatibility, but new syntax preferred

### OpenCode v1.1.2 New Features

- `compaction.auto` and `compaction.prune` are NEW - enable both for long sessions
- `experimental.continue_loop_on_deny` - controls agent behavior after permission denial
- `cargo-fmt` formatter support added for Rust projects

## Non-Obvious Dependencies

### LSP Tool Naming Convention

- OpenCode built-in LSP uses `lsp_lsp_*` prefix (e.g., `lsp_lsp_rename`, `lsp_lsp_hover`)
- Requires `experimental.lsp: true` in opencode.json
- **This project uses built-in LSP** (custom plugin removed for simplicity)
- Custom plugins would use `lsp_*` prefix - avoid mixing both

### Protected Tools in DCP

v1.1.3 recognizes more tool variants. Ensure these are protected:

- `lsp_lsp_find_references`, `lsp_lsp_goto_definition` (plugin-specific naming)
- `memory-search`, `skill_mcp`, `bd_sync` (often forgotten)

## Time Wasters

### Debugging DCP Errors

If DCP plugin throws "Unknown keys" errors:

1. Check OpenCode version (`opencode --version`)
2. Compare against [DCP schema](https://github.com/opencode/dcp) for your version
3. Remove deprecated fields - don't try to "fix" them

### Permission Debugging

If tools are unexpectedly blocked:

1. Check global config: `~/.config/opencode/opencode.json`
2. Check project config: `.opencode/opencode.json`
3. Project config takes precedence
4. Use `"*": "ask"` as base rule to debug which pattern is matching

## Beads Gotchas

### Architecture: CLI + Custom Tools

**Beads CLI** (`bd`) handles all issue tracking natively with `--json` output.

**Custom Tools** (`.opencode/tool/bd-*.ts`) provide agent-specific features NOT in CLI:

| Tool         | Purpose                           |
| ------------ | --------------------------------- |
| `bd-reserve` | Atomic file locking (mkdir-based) |
| `bd-release` | Release locks / list active locks |
| `bd-msg`     | Send messages to other agents     |
| `bd-inbox`   | Read messages, mark as read       |

### CLI for Everything Else

Use bash tool with `bd` CLI directly:

```bash
bd ready --json              # Find unblocked tasks
bd create "Title" -p 2       # Create task
bd update bd-xxx --status in_progress  # Claim
bd close bd-xxx --reason "Done"        # Complete
bd sync                      # Push to git
```

### Agent Workflow Pattern

```bash
# 1. Find work
bd ready --json

# 2. Claim task
bd update bd-xxx --status in_progress

# 3. Lock files (custom tool)
bd-reserve({ paths: ["src/foo.ts"] })

# 4. Do work...

# 5. Release + close + sync
bd-release({ paths: ["src/foo.ts"] })
bd close bd-xxx --reason "Completed: description"
bd sync
```

### Hash-Based IDs Prevent Collisions

Beads uses hash IDs (`bd-a3f8`) not sequential IDs (`bd-1`, `bd-2`). This eliminates merge conflicts when multiple agents create issues on different branches.

Don't assume sequential IDs. Always use `bd show` to get exact IDs.

### `bd ready` Is Your Friend

`bd ready` shows tasks with NO unresolved blockers. Use it to find work instead of `bd list`.

### Dependencies Block Work

```bash
bd dep add bd-child bd-parent --type blocks
```

Now `bd-child` won't appear in `bd ready` until `bd-parent` closes. Check `bd blocked` to see what's waiting.

### Git Is The Coordination Layer

No central server. Agents coordinate via:

1. Issue status (in_progress = claimed)
2. Git branches
3. `bd sync` to push/pull changes

### Sandbox Environments (Claude Code, etc.)

Daemon can't be killed by sandbox. Use:

```bash
bd --sandbox ready
# Or: bd --no-daemon --no-auto-flush --no-auto-import list
```

### 30-Second Debounce

Rapid operations get batched into single JSONL flush after 30s. Force immediate sync:

```bash
bd sync
```
