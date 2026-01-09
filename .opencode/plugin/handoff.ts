/**
 * OpenCode Handoff Plugin
 * Injects the most recent handoff file into session compaction
 *
 * Workflow:
 * 1. User creates handoff markdown file in .opencode/memory/handoffs/
 * 2. Session compaction (Ctrl+K) includes handoff context
 * 3. New session resumes from previous state
 */

import type { Plugin } from "@opencode-ai/plugin";

export const HandoffPlugin: Plugin = async ({ $, directory }) => {
	const HANDOFF_DIR = `${directory}/.opencode/memory/handoffs`;

	return {
		"experimental.session.compacting": async (_input, output) => {
			// Find most recent handoff file
			const result =
				await $`ls -t ${HANDOFF_DIR}/*.md 2>/dev/null | head -1`.quiet();

			if (!result.stdout) return;

			const handoffPath = result.stdout.toString().trim();
			const handoffContent = await $`cat ${handoffPath}`.text();

			// Inject into compaction context
			output.context.push(`
## Previous Session Handoff

${handoffContent}

**IMPORTANT**: Resume work from where previous session left off.
`);
		},
	};
};
