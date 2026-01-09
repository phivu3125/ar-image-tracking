---
purpose: Key modules, directory structure, architectural decisions
updated: 2025-01-06
---

# Project Architecture

## Directory Structure

```
src/
  index.ts              # CLI entry point (cac-based)
  commands/
    init.ts             # ock init - scaffolds .opencode/
    agent.ts            # ock agent - manage agents
    skill.ts            # ock skill - manage skills
    config.ts           # ock config - edit opencode.json
    upgrade.ts          # ock upgrade - update templates
    menu.ts             # Interactive menu, doctor, status
    completion.ts       # Shell completions
  utils/
    logger.ts           # Logging utilities
    errors.ts           # Error handling
    safe-prompts.ts     # @clack/prompts wrappers

dist/
  index.js              # Built CLI bundle
  template/.opencode/   # Template files copied during init

.opencode/              # OpenCode configuration (source of truth)
  agent/                # Agent definitions
  command/              # Workflow commands
  skills/               # Skills library
  tool/                 # Custom tools (memory-*, bd-*)
  plugin/               # OpenCode plugins
  memory/               # Persistent knowledge

.beads/                 # Task tracking database
```

## Key Modules

### CLI (src/index.ts)

Entry point using `cac` library. Registers commands, parses args, handles errors.

### Init Command (src/commands/init.ts)

Core command - copies `.opencode/` template from dist to target project.

### Build Process

1. `bun build` bundles src/index.ts → dist/index.js
2. rsync copies .opencode/ → dist/template/.opencode/
3. Published package includes dist/ only

## Data Flow

```
User runs: npx opencodekit init
  → dist/index.js executes
  → init command copies dist/template/.opencode/ to ./.opencode/
  → User has full OpenCode setup
```

## External Dependencies

- **cac**: CLI framework
- **@clack/prompts**: Interactive prompts
- **zod**: Schema validation
- **beads-village**: Task tracking integration
- **@opencode-ai/plugin**: Plugin SDK

## Architectural Decisions

1. **Bun-first**: Uses Bun for speed, but builds to Node-compatible output
2. **Template bundling**: .opencode/ copied at build time, not runtime
3. **No transpilation**: TypeScript bundled directly by Bun
4. **Colocated tests**: Tests live next to source files (*.test.ts)
