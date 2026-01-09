---
purpose: Build, test, lint, deploy commands discovered for this project
updated: 2025-01-06
---

# Project Commands

## Build

```bash
npm run build       # Bundles src/index.ts + copies .opencode/ to dist/template/
npm run typecheck   # TypeScript type checking only (no emit)
```

## Test

```bash
bun test                        # Run all tests
bun test src/commands/init.ts   # Run single test file
bun test --watch                # Watch mode
```

## Lint

```bash
npm run lint        # Check with Biome
npm run lint:fix    # Auto-fix issues
```

## Development

```bash
bun run src/index.ts            # Run CLI directly
npm run dev                     # Same as above
bun build src/index.ts --compile --outfile ock  # Compile to binary
```

## Beads (Task Tracking)

```bash
bd ready                              # Find unblocked tasks
bd list --status=open                 # All open issues
bd show <id>                          # Full details
bd create "Title" -t task -p 2        # Create task
bd update <id> --status in_progress   # Claim work
bd close <id> --reason "Done"         # Complete
bd sync                               # Sync with git (always run at session end)
```

## CI/CD

- GitHub Actions workflow at `.github/workflows/opencode.yml`
- Triggered by `/oc` or `/opencode` comments on issues/PRs
