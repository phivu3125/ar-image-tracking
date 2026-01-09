import fs from "node:fs/promises";
import path from "node:path";
import { tool } from "@opencode-ai/plugin";

export default tool({
	description:
		"Update memory files with new learnings, progress, or context. Appends or replaces content based on mode. Supports subdirectories for organization (e.g., 'research/opencode-sessions' creates .opencode/memory/research/opencode-sessions.md).",
	args: {
		file: tool.schema
			.string()
			.describe(
				"Memory file to update: handoffs/YYYY-MM-DD-phase, research/YYYY-MM-DD-topic. Use _templates/ for reference only.",
			),
		content: tool.schema
			.string()
			.describe("Content to write or append to the memory file"),
		mode: tool.schema
			.string()
			.optional()
			.default("replace")
			.describe(
				"Update mode: 'replace' (overwrite file) or 'append' (add to end).",
			),
	},
	execute: async (args: { file: string; content: string; mode?: string }) => {
		// Always write to project memory (.opencode/memory/)
		const memoryDir = path.join(process.cwd(), ".opencode/memory");

		// Normalize file path: strip existing .md extension, handle subdirectories
		const normalizedFile = args.file.replace(/\.md$/i, ""); // Remove .md if present
		const filePath = path.join(memoryDir, `${normalizedFile}.md`);
		const mode = args.mode || "replace";

		try {
			// Ensure parent directory exists (handles subdirectories)
			const fileDir = path.dirname(filePath);
			await fs.mkdir(fileDir, { recursive: true });

			if (mode === "append") {
				const timestamp = new Date().toISOString();
				const appendContent = `\n\n---\n**Updated:** ${timestamp}\n\n${args.content}`;
				await fs.appendFile(filePath, appendContent, "utf-8");
				return `Successfully appended to ${normalizedFile}.md\n[Written to: ${filePath}]`;
			}
			// Replace mode - update timestamp
			const timestamp = new Date().toISOString();
			const updatedContent = args.content.replace(
				/\*\*Last Updated:\*\* \[Timestamp\]/,
				`**Last Updated:** ${timestamp}`,
			);
			await fs.writeFile(filePath, updatedContent, "utf-8");
			return `Successfully updated ${normalizedFile}.md\n[Written to: ${filePath}]`;
		} catch (error) {
			if (error instanceof Error) {
				return `Error updating memory: ${error.message}`;
			}
			return "Unknown error updating memory file";
		}
	},
});
