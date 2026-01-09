/**
 * AST-Grep Tool for OpenCode
 * Semantic code search and replace using ast-grep - smarter than regex
 *
 * Inspired by oh-my-opencode's AST-Grep integration
 * Requires: npm install -g @ast-grep/cli (or brew install ast-grep)
 */

import { exec } from "node:child_process";
import { promisify } from "node:util";
import { tool } from "@opencode-ai/plugin";

const execAsync = promisify(exec);

async function checkAstGrep(): Promise<boolean> {
	try {
		await execAsync("sg --version");
		return true;
	} catch {
		return false;
	}
}

export const astGrepSearch = tool({
	description: `Semantic code search using AST patterns - smarter than regex.
Searches for code patterns structurally, ignoring formatting differences.

Examples:
- Find all console.log calls: "console.log($$$)"
- Find async functions: "async function $NAME($$$) { $$$ }"
- Find React useState: "const [$STATE, $SETTER] = useState($$$)"
- Find try-catch blocks: "try { $$$ } catch ($ERR) { $$$ }"

Pattern syntax:
- $NAME: matches any single AST node (identifier, expression, etc)
- $$$: matches zero or more nodes (for arguments, statements, etc)
- Literal code: matches exactly that code structure`,

	args: {
		pattern: tool.schema.string().describe("AST pattern to search for"),
		path: tool.schema
			.string()
			.optional()
			.describe("Directory or file to search (default: current directory)"),
		language: tool.schema
			.string()
			.optional()
			.describe(
				"Language: typescript, javascript, python, rust, go, java, etc.",
			),
		json: tool.schema
			.boolean()
			.optional()
			.describe("Output as JSON (default: false)"),
	},

	async execute(args) {
		const hasAstGrep = await checkAstGrep();
		if (!hasAstGrep) {
			return `Error: ast-grep (sg) not installed.

Install via:
  npm install -g @ast-grep/cli
  # or
  brew install ast-grep
  # or
  cargo install ast-grep`;
		}

		const searchPath = args.path || ".";
		const outputFormat = args.json ? "--json" : "";

		// Build command - escape pattern for shell
		const escapedPattern = args.pattern.replace(/'/g, "'\"'\"'");
		let cmd = `sg --pattern '${escapedPattern}'`;

		if (args.language) {
			cmd += ` --lang ${args.language}`;
		}

		if (outputFormat) {
			cmd += ` ${outputFormat}`;
		}

		cmd += ` ${searchPath}`;

		try {
			const { stdout, stderr } = await execAsync(cmd, {
				maxBuffer: 10 * 1024 * 1024, // 10MB buffer
				timeout: 60000, // 60s timeout
			});

			if (stderr && !stdout) {
				return `Warning: ${stderr}`;
			}

			if (!stdout.trim()) {
				return `No matches found for pattern: ${args.pattern}`;
			}

			// Count matches
			const lines = stdout.trim().split("\n");
			let matchCount: number;
			if (args.json) {
				try {
					matchCount = JSON.parse(stdout).length;
				} catch {
					matchCount = lines.length;
				}
			} else {
				matchCount = lines.filter((l) => l.includes(":")).length;
			}

			return `Found ${matchCount} matches:\n\n${stdout}`;
		} catch (error) {
			const err = error as { message?: string; stderr?: string };
			if (err.stderr?.includes("no files found")) {
				return `No files found for language: ${args.language || "auto-detected"}`;
			}
			return `Error: ${err.message || err.stderr || "Unknown error"}`;
		}
	},
});

export const astGrepReplace = tool({
	description: `Semantic code replacement using AST patterns - safe refactoring.
Replaces code patterns structurally, preserving formatting where possible.

Examples:
- Rename function: pattern="oldFunc($$$)" rewrite="newFunc($$$)"
- Add await: pattern="fetch($URL)" rewrite="await fetch($URL)"
- Wrap in try-catch: pattern="$EXPR" rewrite="try { $EXPR } catch (e) { console.error(e) }"

Use $NAME in rewrite to reference captured nodes from pattern.`,

	args: {
		pattern: tool.schema.string().describe("AST pattern to match"),
		rewrite: tool.schema.string().describe("Replacement pattern"),
		path: tool.schema
			.string()
			.optional()
			.describe("Directory or file to modify (default: current directory)"),
		language: tool.schema
			.string()
			.optional()
			.describe(
				"Language: typescript, javascript, python, rust, go, java, etc.",
			),
		dryRun: tool.schema
			.boolean()
			.optional()
			.describe("Preview changes without applying (default: true)"),
	},

	async execute(args) {
		const hasAstGrep = await checkAstGrep();
		if (!hasAstGrep) {
			return `Error: ast-grep (sg) not installed.

Install via:
  npm install -g @ast-grep/cli
  # or
  brew install ast-grep`;
		}

		const searchPath = args.path || ".";
		const dryRun = args.dryRun !== false; // Default to dry run for safety

		// Build command - escape patterns for shell
		const escapedPattern = args.pattern.replace(/'/g, "'\"'\"'");
		const escapedRewrite = args.rewrite.replace(/'/g, "'\"'\"'");
		let cmd = `sg --pattern '${escapedPattern}' --rewrite '${escapedRewrite}'`;

		if (args.language) {
			cmd += ` --lang ${args.language}`;
		}

		if (dryRun) {
			cmd += " --json"; // Use JSON output for dry run preview
		} else {
			cmd += " --update-all"; // Actually apply changes
		}

		cmd += ` ${searchPath}`;

		try {
			const { stdout, stderr } = await execAsync(cmd, {
				maxBuffer: 10 * 1024 * 1024,
				timeout: 120000, // 2 min for replacements
			});

			if (stderr && !stdout) {
				return `Warning: ${stderr}`;
			}

			if (!stdout.trim()) {
				return `No matches found for pattern: ${args.pattern}`;
			}

			if (dryRun) {
				// Parse and format dry run output
				try {
					const matches = JSON.parse(stdout) as Array<{
						file?: string;
						range?: { start?: { line?: number } };
						text?: string;
						replacement?: string;
					}>;
					const count = matches.length;

					let preview = `## Dry Run: ${count} potential replacement(s)\n\n`;
					preview += `Pattern: \`${args.pattern}\`\n`;
					preview += `Rewrite: \`${args.rewrite}\`\n\n`;

					for (const match of matches.slice(0, 10)) {
						preview += `### ${match.file || "unknown"}:${match.range?.start?.line || "?"}\n`;
						preview += "```\n";
						preview += `- ${match.text || ""}\n`;
						preview += `+ ${match.replacement || args.rewrite}\n`;
						preview += "```\n\n";
					}

					if (count > 10) {
						preview += `... and ${count - 10} more matches\n`;
					}

					preview += "\n**To apply:** Run again with dryRun: false";
					return preview;
				} catch {
					return `Dry run preview:\n${stdout}`;
				}
			}

			// Actual replacement
			const lines = stdout.trim().split("\n");
			return `Applied ${lines.length} replacement(s):\n\n${stdout}`;
		} catch (error) {
			const err = error as { message?: string; stderr?: string };
			return `Error: ${err.message || err.stderr || "Unknown error"}`;
		}
	},
});

// Default export for single-tool registration
export default astGrepSearch;
