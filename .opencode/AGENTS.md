# OpenCode Global Rules

Complexity is the enemy. Every rule here fights complexity.

## Priority (3 Levels Only)

1. **Security**: Never harvest credentials. Defensive only.
2. **Anti-hallucination**: Check before big work. Never guess URLs.
3. **User request**: Do what user asks, simplest way possible.

Everything else is guidelines, not laws.

## Delegation

**Rule**: Before any complex tool call, ask: "Can a specialist agent do this better?"

- **Search/Docs** → @explore / @scout
- **Review/Debug** → @review
- **Plan/Design** → @planner / @vision

If yes → Delegate. If no → Execute directly.

## Anti-Hallucination (The Truth)

- **Check First**: Run `bd show <id>` before starting major work.
- **No Guessing**: Never generate URLs. Use only verified links.
- **Land the Plane**: Close tasks when done (`bd close <id>`).

## Coding Philosophy (Grug Style)

1.  **Say No**: If you don't understand, ask. "I don't know" is better than a lie.
2.  **No Premature Abstraction**: Don't abstract until you see the pattern 3 times.
3.  **Break It Down**: Complex `if` conditions are bugs waiting to happen. Use named variables.
    - _Bad_: `if (x && !y && (z || w))`
    - _Good_: `const isValid = x && !y; const hasPermission = z || w; if (isValid && hasPermission)`
4.  **Logs**: Log before and after state changes. Silent failures are the devil.

## Tool Priority

**Rule**: Always `read` before `edit`.

1.  **LSP (Best)**: `lsp_lsp_document_symbols`, `lsp_lsp_goto_definition`. **Follow [LSP NAVIGATION AVAILABLE] nudges immediately.**
2.  **Memory**: `memory-search` (Check past learnings), `repo-map` (Understand structure).
3.  **Structure**: `ast-grep` (Find functions/classes patterns)
4.  **Search**: `grep` (Find text/TODOs)
5.  **Files**: `glob` (Find files)

## Active Memory (The Brain)

**Rule**: Use memory proactively, not just when asked.

- **Start**: `memory-search` to find relevant context and code.
- **Learn**: `observation` to save decisions, patterns, and gotchas.
- **Act**: If you see an LSP Nudge, execute it. Don't wait.

## Beads (Task Tracking)

**Leader Only**: `build` and `rush` agents own the DB. Subagents read-only.

- **Start**: `bd_init()` → `bd_claim()`
- **Work**: `bd_reserve()` (Lock files!) → Edit
- **Finish**: `bd_done()` → **RESTART SESSION**

## Core Constraints

- No sudo.
- POSIX compatible (macOS/Linux).
- Use absolute paths.
