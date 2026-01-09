---
purpose: Code patterns, commit style, PR process, team conventions
updated: 2025-01-05
---

# Project Conventions

## Code Style

- **TypeScript**: ES2022, ESNext modules, strict disabled, forceConsistentCasing
- **Python**: 3.10+, type hints required, dataclasses for config, pathlib for paths
- **Imports**: Group stdlib, third-party, local imports
- **Naming**: PascalCase classes, snake_case functions/variables, UPPER_CASE constants

## Commit Messages

<!-- Conventional commits? Prefix style? -->

## PR Process

<!-- Review requirements, CI checks, merge strategy -->

## OpenCode Configuration Patterns (v1.1.2+)

### Permission Structure Best Practice

```jsonc
{
  "permission": {
    "bash": {
      "*": "allow", // 1. Base rule first (catch-all)
      "git status*": "allow", // 2. Safe operations whitelisted
      "git diff*": "allow",
      "npm *": "allow",
      "rm*": "deny", // 3. Dangerous operations denied
      "sudo*": "deny",
    },
    "read": {
      ".env": "deny", // 4. Protect secrets
      ".env.example": "allow", //    But allow examples
    },
  },
}
```

### LSP Tool Strategy

**This project uses built-in experimental LSP** (`experimental.lsp: true`).

| Tool                        | Purpose                      |
| --------------------------- | ---------------------------- |
| `lsp_lsp_hover`             | Type info and docs at cursor |
| `lsp_lsp_goto_definition`   | Jump to symbol definition    |
| `lsp_lsp_find_references`   | Find all usages              |
| `lsp_lsp_rename`            | Rename across codebase       |
| `lsp_lsp_code_actions`      | Get available refactorings   |
| `lsp_lsp_code_action_apply` | Apply a code action          |
| `lsp_lsp_diagnostics`       | Get errors/warnings          |
| `lsp_lsp_document_symbols`  | File outline                 |
| `lsp_lsp_workspace_symbols` | Search symbols               |
| `lsp_lsp_organize_imports`  | Clean up imports             |

### DCP Configuration Tiers

| Tier             | Strategies         | nudgeFrequency | turnProtection | Use When                     |
| ---------------- | ------------------ | -------------- | -------------- | ---------------------------- |
| **Aggressive**   | All enabled        | 8              | 3              | Long sessions, context-heavy |
| **Conservative** | Deduplication only | 12+            | 6+             | Safety-first, debugging      |
| **Balanced**     | All enabled        | 10             | 4              | Default, general use         |

### Protected Tools Pattern

Always protect these tools from auto-pruning:

```jsonc
"protectedTools": [
  // State-modifying
  "write", "edit", "skill_mcp", "bd_sync",
  // Metadata
  "memory-search", "memory-update", "observation", "todowrite", "todoread",
  // Task management
  "task", "batch",
  // LSP (if using plugin)
  "lsp_lsp_find_references", "lsp_lsp_goto_definition"
]
```

### Prompt Injection Pattern (Nudges)

Use `chat.message` hook to inject prompts (nudges) based on user triggers:

```typescript
"chat.message": async (input, output) => {
  const { message, parts } = output;
  if (message.role !== "user") return;

  // 1. Detect trigger keywords
  const fullText = parts.map(p => p.text).join(" ");
  if (!fullText.match(/trigger pattern/)) return;

  // 2. Inject synthetic prompt
  parts.push({
    type: "text",
    text: "━━━━━━━━\n[TRIGGER DETECTED]\nAction required: ...\n━━━━━━━━",
    synthetic: true
  });
}
```

This transforms passive detection into active agent behavior (e.g., Memory plugin triggers).

## Agent Behavior Rules

### Active LSP Nudge

When a tool output displays `[LSP NAVIGATION AVAILABLE]`, it means relevant code files were found.
**Rule**: You MUST immediately execute the suggested `lsp_lsp_*` tool calls to retrieve code context without waiting for user instruction. This ensures you always have the latest code context for your implementation.

## Patterns to Avoid

### Anti-Pattern: Mixing LSP Systems

```jsonc
// DON'T: Causes tool duplication and naming confusion
{
  "experimental": { "lsp": true },  // Built-in: lsp_lsp_*
  // AND .opencode/tool/lsp.ts      // Custom: lsp_*
}

// DO: Use built-in only (recommended for this project)
{
  "experimental": { "lsp": true }
}
// Delete any custom .opencode/tool/lsp.ts
```

### Anti-Pattern: Over-Restrictive Permissions

```jsonc
// DON'T: Blocks legitimate workflow
{
  "bash": { "git *": "ask" }  // Every git command asks
}

// DO: Whitelist safe, ask dangerous
{
  "bash": {
    "git status*": "allow",
    "git diff*": "allow",
    "git log*": "allow",
    "git commit*": "ask",
    "git push*": "ask",
    "git reset*": "ask"
  }
}
```
