import fs from "node:fs/promises";
import path from "node:path";
import { tool } from "@opencode-ai/plugin";

export default tool({
	description:
		"Read memory files for persistent cross-session context. Returns current project state, learnings, and active tasks. Supports subdirectories (e.g., 'research/opencode-sessions').",
	args: {
		file: tool.schema
			.string()
			.optional()
			.describe(
				"Memory file to read: handoffs/YYYY-MM-DD-phase, research/YYYY-MM-DD-topic, _templates/task-prd, _templates/task-spec, _templates/task-review, _templates/research, _templates/handoff",
			),
	},
	execute: async (args: { file?: string }) => {
		const fileName = args.file || "memory";

		// Normalize: strip .md extension if present
		const normalizedFile = fileName.replace(/\.md$/i, "");

		// Location priority: project > global > legacy
		const locations = [
			path.join(process.cwd(), ".opencode/memory", `${normalizedFile}.md`),
			path.join(
				process.env.HOME || "",
				".config/opencode/memory",
				`${normalizedFile}.md`,
			),
			path.join(
				process.cwd(),
				".config/opencode/memory",
				`${normalizedFile}.md`,
			),
		];

		// Try each location in order
		for (const filePath of locations) {
			try {
				const content = await fs.readFile(filePath, "utf-8");
				const locationLabel = filePath.includes(".opencode/memory")
					? "project"
					: filePath.includes(process.env.HOME || "")
						? "global"
						: "legacy";
				return `[Read from ${locationLabel}: ${filePath}]\n\n${content}`;
			} catch (error) {
				// Continue to next location if file not found
				if (
					error instanceof Error &&
					"code" in error &&
					error.code === "ENOENT"
				) {
					continue;
				}
				// Other errors should be reported
				if (error instanceof Error) {
					return `Error reading memory from ${filePath}: ${error.message}`;
				}
			}
		}

		// No file found in any location
		return `Memory file '${normalizedFile}.md' not found in any location.\nSearched:\n- ${locations.join("\n- ")}\n\nStructure:\n- handoffs/YYYY-MM-DD-phase (phase transitions)\n- research/YYYY-MM-DD-topic (research findings)\n- _templates/ (prd, spec, review, research, handoff)`;
	},
});
