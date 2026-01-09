/**
 * Memory & Compaction Plugin (Codex-Inspired Continuity)
 *
 * Injects continuity context into session compaction:
 * 1. Load session-context.md (CONTINUITY.md pattern)
 * 2. Load project memory files
 * 3. Inject beads in-progress state
 * 4. Append workflow-specific compaction rules
 *
 * Session context format (agent-maintained via memory-update):
 * - Goal: What we're trying to achieve + success criteria
 * - Constraints: User-specified limits, discovered guardrails
 * - Decisions: Key choices made this session
 * - State: Done/Now/Next
 * - Open Questions: Uncertainties marked UNCONFIRMED
 * - Working Set: Files, bead IDs, branch
 */

import type { Plugin } from "@opencode-ai/plugin";

export const CompactionPlugin: Plugin = async ({ $, directory }) => {
	const MEMORY_DIR = `${directory}/.opencode/memory`;

	return {
		"experimental.session.compacting": async (input, output) => {
			// 1. Load session context (CONTINUITY.md pattern) - HIGHEST PRIORITY
			let sessionContext = "";
			try {
				const sessionFile = `${MEMORY_DIR}/session-context.md`;
				const content = await $`cat ${sessionFile} 2>/dev/null`.text();
				if (content.trim()) {
					sessionContext = `\n## Session Continuity (Compaction-Safe)\n${content}`;
				}
			} catch {
				// No session context yet
			}

			// 2. Load project memory files
			let memoryContext = "";
			try {
				const memoryFiles =
					await $`find ${MEMORY_DIR}/project -name '*.md' -type f 2>/dev/null | head -10`.quiet();
				if (memoryFiles.stdout) {
					const files = memoryFiles.stdout.toString().trim().split("\n");
					for (const file of files) {
						const content = await $`cat ${file}`.text();
						if (content.trim() && !content.includes("<!-- ")) {
							const name = file.split("/").pop()?.replace(".md", "");
							memoryContext += `\n## Project ${name}\n${content}`;
						}
					}
				}
			} catch {
				// Memory dir doesn't exist or other error
			}

			// 3. Inject beads in-progress state
			let beadsContext = "";
			try {
				const result =
					await $`cd ${directory} && bd list --status in_progress --json 2>/dev/null`.quiet();
				if (result.stdout) {
					const inProgress = JSON.parse(result.stdout.toString());
					if (inProgress.length > 0) {
						beadsContext = `\n## Active Beads (In Progress)\n${inProgress.map((b: { id: string; title: string }) => `- ${b.id}: ${b.title}`).join("\n")}`;
					}
				}
			} catch {
				// Beads not available, skip
			}

			// Inject all context - session context FIRST (most important)
			const allContext = [sessionContext, beadsContext, memoryContext]
				.filter(Boolean)
				.join("\n");

			if (allContext) {
				output.context.push(`## Session Context\n${allContext}\n`);
			}

			// Append workflow-specific rules to OpenCode's default prompt
			output.prompt = `${output.prompt}

## Additional Rules for This Workflow

### Session Continuity
Maintain session-context.md via memory-update tool. Format:
\`\`\`
Goal: [What + success criteria]
Constraints: [Limits, mark UNCONFIRMED if inferred]
Decisions: [Key choices this session]
State:
  Done: [Completed]
  Now: [Current focus - ONE thing]
  Next: [Queued]
Open Questions: [Uncertainties - mark UNCONFIRMED]
Working Set: [Files, bead ID, branch]
\`\`\`

Update session-context.md when:
- Goal changes or clarifies
- Key decision made
- State shifts (Done/Now/Next)
- Uncertainty discovered

After compaction: Check session-context.md, ask 1-3 targeted questions if gaps exist.

### Beads Workflow
- PRESERVE: Bead IDs (bd-xxx format), bead states, in-progress task IDs
- DROP: Closed/completed beads (already tracked in git)

### TodoWrite Items
- PRESERVE: Todo items with exact IDs, statuses (pending/in_progress/completed), priorities
- DROP: Cancelled todos

### Memory System
If you discover:
- Gotchas/edge cases → Save to .opencode/memory/project/gotchas.md
- Build/test commands → Save to .opencode/memory/project/commands.md
- Code patterns/conventions → Save to .opencode/memory/project/conventions.md
- Architecture insights → Save to .opencode/memory/project/architecture.md

### Preservation Priorities
- PRESERVE: File paths (file:line_number), user constraints, decisions, UNCONFIRMED items
- DROP: Failed attempts, superseded info, verbose tool outputs, exploration dead-ends
`;
		},
	};
};
