---
description: Use when choosing between search tools (LSP, ast-grep, grep, glob) or need tool reference - covers when to use each tool and detailed syntax
---

# Tool Priority Skill

## Priority Order

**LSP tools → AST-grep → Built-in tools**

1. **LSP tools** - Semantic code intelligence (10 tools)
2. `ast-grep` - Code search/replace (functions, patterns, imports, hooks)
3. `grep` - Text search (logs, config, non-code files, simple strings)
4. `glob` - File discovery by name pattern
5. `read`, `edit`, `write` - File operations

**Rule**: Always `read` before `edit` to verify content.

## Choosing the Right Tool

Ask: **"Am I looking for code structure or just text?"**

| Need              | Tool                      | Example                               |
| ----------------- | ------------------------- | ------------------------------------- |
| Function calls    | `ast-grep`                | `pattern="fetchUser($$$)"`            |
| Hook usage        | `ast-grep`                | `pattern="useState($$$)"`             |
| Import statements | `ast-grep`                | `pattern="import { $$ } from '$MOD'"` |
| Error messages    | `grep`                    | `pattern="FATAL\|ERROR"`              |
| Config values     | `grep`                    | `pattern="API_KEY"`                   |
| TODO comments     | `grep`                    | `pattern="TODO\|FIXME"`               |
| Symbol type info  | `lsp_lsp_hover`           | Type signature at cursor              |
| Definition jump   | `lsp_lsp_goto_definition` | Source location                       |
| All usages        | `lsp_lsp_find_references` | Before refactoring                    |
| Safe rename       | `lsp_lsp_rename`          | All references updated                |

## LSP Tools Reference

Semantic code intelligence via Language Server Protocol. **Uses `lsp_lsp_*` prefix** (built-in experimental).

### Navigation & Understanding

| Tool                                                 | Purpose                               | When to Use                       |
| ---------------------------------------------------- | ------------------------------------- | --------------------------------- |
| `lsp_lsp_hover(filePath, line, character)`           | Type info and docs at cursor          | "What type is this variable?"     |
| `lsp_lsp_goto_definition(filePath, line, character)` | Jump to where symbol is defined       | "Where is this function defined?" |
| `lsp_lsp_find_references(filePath, line, character)` | Find all usages of a symbol           | "What uses this function?"        |
| `lsp_lsp_document_symbols(filePath)`                 | File outline (classes, functions)     | "What's in this file?"            |
| `lsp_lsp_workspace_symbols(query, filePath)`         | Fuzzy search symbols across workspace | "Where is UserService defined?"   |

### Diagnostics

| Tool                                       | Purpose                              | When to Use              |
| ------------------------------------------ | ------------------------------------ | ------------------------ |
| `lsp_lsp_diagnostics(filePath, severity?)` | Errors/warnings from language server | "Are there type errors?" |

### Refactoring

| Tool                                                                     | Purpose                       | When to Use                        |
| ------------------------------------------------------------------------ | ----------------------------- | ---------------------------------- |
| `lsp_lsp_rename(filePath, line, character, newName)`                     | Rename symbol across codebase | "Rename this function safely"      |
| `lsp_lsp_code_actions(filePath, startLine, startChar, endLine, endChar)` | Get available refactorings    | "What refactorings are available?" |
| `lsp_lsp_code_action_apply(...)`                                         | Apply a specific code action  | Execute chosen refactoring         |
| `lsp_lsp_organize_imports(filePath)`                                     | Clean up and sort imports     | "Fix imports"                      |

**Caveat**: LSP tools modify files directly. Re-read files before further edits.

## AST-Grep Reference

Semantic code operations - smarter than regex.

### Pattern Syntax

- `$NAME` - Matches any single AST node (identifier, expression, etc.)
- `$$$` - Matches zero or more nodes (for arguments, statements, etc.)

### Search Examples

```bash
# Find all console.log calls
ast-grep pattern="console.log($$$)"

# Find async functions
ast-grep pattern="async function $NAME($$$) { $$$ }"

# Find React hooks
ast-grep pattern="const [$S, $SET] = useState($$$)"

# Find try-catch blocks
ast-grep pattern="try { $$$ } catch ($E) { $$$ }"

# Find class definitions
ast-grep pattern="class $NAME { $$$ }"

# Find import statements
ast-grep pattern="import { $$ } from '$MOD'"
```

### Replace Examples

```bash
# Rename function (dry run)
ast-grep pattern="oldFunc($$$)" rewrite="newFunc($$$)" dryRun=true

# Add await (apply)
ast-grep pattern="fetch($URL)" rewrite="await fetch($URL)" dryRun=false
```

## Research Tools

| Tool           | Use When                                                |
| -------------- | ------------------------------------------------------- |
| **context7**   | Library docs (try first). Fast, external APIs.          |
| **websearch**  | Docs not in Context7, recent releases, troubleshooting. |
| **codesearch** | Real implementation patterns from GitHub.               |
| **webfetch**   | Specific URL user provided.                             |
