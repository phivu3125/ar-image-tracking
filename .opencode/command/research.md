---
description: Research a topic or bead before implementation
argument-hint: "<bead-id> [--quick|--thorough]"
agent: scout
subtask: true
---

# Research: $ARGUMENTS

You're gathering information before implementation. Find answers, document findings, stop when done.

## Depth Levels

- `--quick` (~10 tool calls): Single question, API syntax lookup
- Default (~30 tool calls): Moderate exploration, verify patterns
- `--thorough` (~100+ tool calls): Comprehensive analysis, new domain

## Load Context

### Get Quick Codebase Overview

First, understand the codebase structure:

```typescript
// Quick overview of relevant directories
repo-map({ path: "src", format: "compact", maxDepth: 3 });
```

This helps identify relevant directories and files before diving deeper.

### Load Bead Details

!`bd show $ARGUMENTS`
!`cat .beads/artifacts/$ARGUMENTS/spec.md`

Extract questions that need answering from spec.

## Check For Previous Research

!`search_session({ query: "[topic keywords]" })`
!`list_sessions({ project: "current", since: "this week", limit: 5 })`

Extract the questions that need answering from the spec.

## Check Memory First (Semantic Search)

Before hitting external sources, search what we already know:

```typescript
// Search past research and observations on similar topics
memory -
  search({
    query: "[research question/topic]",
    mode: "semantic",
    limit: 5,
  });

// Search for related gotchas and learnings
memory -
  search({
    query: "[topic keywords]",
    mode: "semantic",
    type: "observation",
    limit: 3,
  });
```

**If memory has high-confidence answers, you may skip external research.**

Review findings for:

- Previous research on this exact topic
- Related patterns and decisions
- Known gotchas to avoid

If memory search fails (Ollama not running), continue to external sources.

## Source Priority

1. **Codebase patterns** (highest trust) - How does this project already do it?
2. **Official docs** (high trust) - What does the library documentation say?
3. **Context7** (high trust) - API usage and examples
4. **Source code** (high trust) - Library implementation (use `source-code-research` skill)
5. **GitHub examples** (medium trust) - Real-world patterns via codesearch/gh_grep
6. **Web search** (lower trust) - Only if tiers 1-5 don't answer

## Research

### Internal Codebase - Get Quick Overview

First, generate a compact repository map to understand the codebase structure:

```typescript
// Quick overview of relevant directories
repo-map({ path: "src", format: "compact", maxDepth: 3 });

// For specific feature area
repo-map({ path: "src/commands", format: "tree", maxDepth: 2 });
```

**Use repo-map when:**

- Starting research on a new area of the codebase
- Need to understand file organization before diving deep
- Looking for relevant files to investigate
- Want quick symbol overview for a directory

### Deep Dive

```typescript
// Find similar patterns
ast - grep({ pattern: "<code pattern>" });
grep({ pattern: "<text pattern>", include: "*.ts" });

// Understand types
lsp_lsp_hover({ filePath: "<file>", line: N, character: N });
lsp_lsp_find_references({ filePath: "<file>", line: N, character: N });
```

### External Docs

```typescript
context7_resolve_library_id({ libraryName: "<lib>", query: "<question>" });
context7_query_docs({ libraryId: "<id>", query: "<specific question>" });
```

### Source Code (When Docs Insufficient)

**Use the `source-code-research` skill when:**

- Documentation doesn't explain behavior clearly
- Need to understand edge cases or internals
- Library behaving unexpectedly
- Evaluating library quality/fit

```bash
# Fetch package source code
npx opensrc <package>              # npm package
npx opensrc <package>@<version>    # specific version
npx opensrc pypi:<package>         # Python
npx opensrc <owner>/<repo>         # GitHub repo
```

```typescript
// Then analyze the source
glob({ pattern: "opensrc/**/src/**/*.ts" });
grep({ pattern: "<function-name>", path: "opensrc/" });
read({ filePath: "opensrc/repos/.../file.ts" });
```

**See:** `skill({ name: "source-code-research" })` for complete workflow.

### Code Examples

```typescript
codesearch({ query: "<API usage pattern>", tokensNum: 5000 });
gh_grep_searchGitHub({ query: "<code pattern>", language: ["TypeScript"] });
```

## Validate Findings

For each finding:

- Within spec scope?
- Follows project constraints?
- Uses allowed libs?
- Matches existing codebase patterns?

**Confidence levels:**

- **High**: Multiple authoritative sources agree, verified in codebase
- **Medium**: Single good source, plausible but unverified
- **Low**: Conflicting info, speculation

Discard low-confidence findings without corroboration.

## Stop When

- All spec questions answered with medium+ confidence
- Tool budget exhausted
- Last 5 tool calls yielded no new insights
- Blocked and need human input

## Document Findings

Write `.beads/artifacts/$ARGUMENTS/research.md`:

```markdown
# Research: [Title]

**Bead:** $ARGUMENTS
**Depth:** [quick|medium|thorough]
**Tool calls:** [N]

## Questions

1. [Question] → Answered (High)
2. [Question] → Partial (Medium)
3. [Question] → Unanswered

## Key Findings

### [Topic 1]

**Confidence:** High
**Sources:** `src/utils/auth.ts:42`, Context7 /vercel/next.js

[Finding with code example]

---

### [Topic 2]

**Confidence:** Medium
[Finding]

---

## Recommendation

[Approach based on findings]

## Open Items

- [Remaining question] - needs: [what would resolve it]
```

## Output

```
Research: $ARGUMENTS

Depth: [quick|medium|thorough]
Tool calls: [N]

Questions:
• [Q1] → Answered (High)
• [Q2] → Partial (Medium)

Key insights:
• [insight 1]
• [insight 2]

Open items: [N]

Next: /plan $ARGUMENTS
```
