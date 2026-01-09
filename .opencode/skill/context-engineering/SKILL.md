---
description: Use when managing context window, deciding what to load/prune, or understanding AI adoption stages - covers constraint awareness and intent layer principles
---

# Context Engineering Skill

## AI Adoption Stages

OpenCode operates at **Stage 5-6**:

- **Stage 5** (Agentic Verification): Agents run tests and iterate autonomously
- **Stage 6** (Multi-Agent Orchestration): Parallel workstreams with coordination

**Current constraint**: Planning and specification quality. Implementation capacity is not the bottleneck—how well you specify requirements is.

## Autonomous Duration

The key metric: **How long can an agent work before losing the plot?**

Extend autonomous duration by:

- Binding tighter to intent (clear specs, constraints, invariants)
- Providing systematic context (AGENTS.md hierarchy, memory files)
- Verification loops (test → iterate → verify)

## Greenfield vs Legacy

| Type           | Context                    | Agent Performance             |
| -------------- | -------------------------- | ----------------------------- |
| **Greenfield** | Simple, fast prototypes    | Works well immediately        |
| **Legacy**     | Complex, hidden invariants | Needs careful context loading |

Codebase complexity is a primary difficulty knob. Context is how you pay it down.

## Three Context Constraints

1. **Blind spots cause hallucinations** - If agent doesn't see specific context, it fills gaps with generic training priors. You only get the behavior you load.

2. **Everything influences everything** - Noise-to-signal ratio matters. Irrelevant files degrade ALL output quality.

3. **Window is finite** - Performance degrades BEFORE hitting hard token limits. Curate the smallest, highest-signal slice.

## Practical Implications

| Instead of              | Do This                                               |
| ----------------------- | ----------------------------------------------------- |
| Reading entire files    | Use `lsp_lsp_document_symbols` for outline            |
| Loading whole documents | Read specific line ranges                             |
| Flat file loading       | Navigate AGENTS.md hierarchy (progressive disclosure) |
| Keeping completed work  | Prune context aggressively                            |

## Intent Layer Principles

### What Belongs in Each AGENTS.md

- **Purpose & Scope** - What this area does. What it explicitly DOESN'T do.
- **Entry Points & Contracts** - Main APIs, invariants, "all X goes through Y"
- **Usage Patterns** - Canonical examples: "To add a rule, follow this pattern..."
- **Anti-patterns** - Negative examples: "Never call X directly; go through Y"
- **Dependencies & Downlinks** - What it connects to, pointers to child AGENTS.md
- **Pitfalls** - Things that repeatedly confused agents/humans

### Key Mechanics

| Principle                       | Meaning                                                       |
| ------------------------------- | ------------------------------------------------------------- |
| **Hierarchical loading**        | When a node loads, all ancestors load too (T-shaped view)     |
| **Compression, not bloat**      | Good nodes compress code; 10k tokens for 20k code adds weight |
| **Least Common Ancestor (LCA)** | Place shared knowledge at shallowest node covering all paths  |
| **Downlinks for discovery**     | Point to related context without loading everything upfront   |

## Context Budget Guidelines

| Phase             | Target Context | Action                                    |
| ----------------- | -------------- | ----------------------------------------- |
| Starting work     | <50k tokens    | Load only essential AGENTS.md + task spec |
| Mid-task          | 50-100k tokens | Prune completed reads, keep active files  |
| Approaching limit | >100k tokens   | Aggressive pruning, extract key findings  |
| Near capacity     | >150k tokens   | Consider session restart with handoff     |

## Anti-Patterns

❌ Loading "everything that might be relevant"
❌ Keeping old file reads after editing complete
❌ Reading entire files when you only need a function
❌ Ignoring AGENTS.md hierarchy (loading leaf without ancestors)

## Best Practices

✅ Start with minimum viable context
✅ Use LSP tools for targeted information
✅ Prune after each completed sub-task
✅ Trust AGENTS.md hierarchy for discovery
✅ Extract findings before pruning valuable reads
