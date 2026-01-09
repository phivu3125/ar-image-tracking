---
description: Fix TypeScript type errors
argument-hint: "[bead-id] [--strict]"
agent: build
---

# Fix Type Errors

Resolve TypeScript errors without adding `any` everywhere.

## Get Current State

!`npx tsc --noEmit 2>&1 | head -50`
!`npx tsc --noEmit 2>&1 | grep -c "error TS"`

## Use LSP For Context

```typescript
lsp_lsp_diagnostics({ filePath: "<file>", severity: "error" });
lsp_lsp_hover({ filePath: "<file>", line: N, character: N });
```

## Common Fixes

**Missing type:**

```typescript
// Before
function process(data) { ... }
// After
function process(data: InputType): OutputType { ... }
```

**Null handling:**

```typescript
// Before
const name = user.name.toUpperCase();
// After
const name = user?.name?.toUpperCase() ?? "Unknown";
```

**Property doesn't exist:**

```typescript
// Add to interface
interface User {
  name: string;
  email?: string; // Add missing property
}
```

## Rules

- ❌ Never use `any` just to pass type check
- ❌ Never use `// @ts-ignore` without justification
- ❌ Never use `as unknown as T`
- ✅ Prefer proper typing over assertions
- ✅ Prefer narrowing with type guards
- ✅ Prefer `unknown` over `any` when truly unknown

## Iterate Until Clean

```bash
npx tsc --noEmit
```

Repeat until 0 errors. Max 5 passes.

## Verify

```bash
npx tsc --noEmit  # Types
npm test          # Tests still pass
npm run lint      # Lint still passes
```

## Commit

```bash
git add <files>
git commit -m "fix(types): resolve type errors

- Fixed [N] errors
- No 'any' types added"

bd sync
```

## Output

```
Type Errors Fixed

Before: [N] errors
After: 0 errors

Verification:
- Types: ✓
- Tests: ✓
- Lint: ✓

'any' added: 0 ✓
```
