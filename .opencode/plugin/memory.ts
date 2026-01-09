/**
 * Memory Plugin (Refactored for OpenCode Event System)
 *
 * Features:
 * 1. Keyword Detection: Detects "remember", "save this", etc. and nudges agent
 * 2. Auto-Index Rebuild: Rebuilds vector index when memory files change
 * 3. Code-Change Awareness: Flags stale observations when related code changes
 * 4. Toast Notifications: Alerts agent when observations need review
 * 5. Session Idle Hook: Prompts memory summary at session end
 *
 * Uses OpenCode's official event system (v1.1.2+):
 * - file.edited: When OpenCode edits files
 * - file.watcher.updated: External file changes
 * - session.idle: Session completed
 * - tui.toast.show: Display notifications
 *
 * Inspired by: Supermemory, Nia, Graphiti, GKG
 */

import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "@opencode-ai/plugin";

// ============================================================================
// Configuration
// ============================================================================

const MEMORY_DIR = ".opencode/memory";
const BEADS_DIR = ".beads/artifacts";
const SRC_DIR = "src";
const CODE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs"];
const DEBOUNCE_MS = 30000; // 30 seconds
const CODE_CHANGE_DEBOUNCE_MS = 10000; // 10 seconds for toast responsiveness

// Default trigger patterns (case-insensitive)
const DEFAULT_PATTERNS = [
	// English
	"remember\\s+(this|that)",
	"save\\s+(this|that)",
	"don'?t\\s+forget",
	"note\\s+(this|that)",
	"keep\\s+(this\\s+)?in\\s+mind",
	"store\\s+this",
	"log\\s+this",
	"write\\s+(this\\s+)?down",
	"make\\s+a\\s+note",
	"add\\s+to\\s+memory",
	"commit\\s+to\\s+memory",
	"take\\s+note",
	"jot\\s+(this\\s+)?down",
	"file\\s+this\\s+away",
	"bookmark\\s+this",
	"pin\\s+this",
	"important\\s+to\\s+remember",
	"for\\s+future\\s+reference",
	"never\\s+forget",
	"always\\s+remember",

	// Vietnamese
	"nhớ\\s+(điều\\s+)?này",
	"ghi\\s+nhớ",
	"lưu\\s+(lại\\s+)?(điều\\s+)?này",
	"đừng\\s+quên",
	"không\\s+được\\s+quên",
	"ghi\\s+chú",
	"note\\s+lại",
	"save\\s+lại",
	"để\\s+ý",
	"chú\\s+ý",
	"quan\\s+trọng",
	"cần\\s+nhớ",
	"phải\\s+nhớ",
	"luôn\\s+nhớ",
	"ghi\\s+lại",
	"lưu\\s+ý",
	"đánh\\s+dấu",
	"bookmark\\s+lại",
];

const DEFAULT_NUDGE = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[MEMORY TRIGGER DETECTED]

The user wants you to remember something. You MUST:

1. Extract the key information to save
2. Call the \`observation\` tool with:
   - type: Choose from "learning", "decision", "pattern", "preference", or "warning"
   - title: A concise, searchable title
   - content: The full context of what to remember
   - concepts: Keywords for semantic search (comma-separated)

Example:
\`\`\`typescript
observation({
  type: "preference",
  title: "Use bun instead of npm",
  content: "This project uses bun as the package manager, not npm",
  concepts: "bun, npm, package-manager"
});
\`\`\`

After saving, confirm: "✓ Saved to memory for future reference."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

// ============================================================================
// Types
// ============================================================================

interface MemoryConfig {
	enabled?: boolean;
	patterns?: string[];
	nudgeTemplate?: string;
	watcherEnabled?: boolean;
	toastEnabled?: boolean;
	sessionSummaryEnabled?: boolean;
}

interface PendingChange {
	file: string;
	type: "code" | "memory";
	timestamp: number;
}

// ============================================================================
// Helpers
// ============================================================================

async function loadConfig(): Promise<MemoryConfig> {
	const configPaths = [
		path.join(process.cwd(), ".opencode", "memory.json"),
		path.join(process.cwd(), ".opencode", "memory.jsonc"),
	];

	for (const configPath of configPaths) {
		try {
			const content = await fsPromises.readFile(configPath, "utf-8");
			const jsonContent = content.replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, "");
			return JSON.parse(jsonContent);
		} catch {
			// Config doesn't exist
		}
	}

	return {};
}

function buildPattern(patterns: string[]): RegExp {
	return new RegExp(`(${patterns.join("|")})`, "i");
}

function extractContext(message: string, matchIndex: number): string {
	const before = message.substring(0, matchIndex);
	const after = message.substring(matchIndex);

	const sentenceStart = Math.max(
		before.lastIndexOf(".") + 1,
		before.lastIndexOf("!") + 1,
		before.lastIndexOf("?") + 1,
		0,
	);

	const afterPeriod = after.search(/[.!?]/);
	const sentenceEnd =
		afterPeriod === -1 ? message.length : matchIndex + afterPeriod + 1;

	return message.substring(sentenceStart, sentenceEnd).trim();
}

function isCodeFile(filePath: string): boolean {
	return CODE_EXTENSIONS.some((ext) => filePath.endsWith(ext));
}

function isMemoryFile(filePath: string): boolean {
	const normalized = filePath.replace(/\\/g, "/");
	return (
		normalized.includes(MEMORY_DIR) &&
		filePath.endsWith(".md") &&
		!normalized.includes("vector_db")
	);
}

// Dynamic import for indexer
async function getIndexer() {
	const toolPath = path.join(process.cwd(), ".opencode/tool/memory-index.ts");
	try {
		const module = await import(toolPath);
		return module.indexMemoryFiles as (
			memoryDir: string,
			beadsDir: string,
		) => Promise<{ indexed: number; skipped: number; errors: string[] }>;
	} catch {
		return null;
	}
}

// ============================================================================
// Plugin
// ============================================================================

export const MemoryPlugin: Plugin = async ({ client, $ }) => {
	const config = await loadConfig();

	if (config.enabled === false) {
		return {};
	}

	// Logger helper
	const log = async (message: string, level: "info" | "warn" = "info") => {
		await client.app
			.log({
				body: {
					service: "memory",
					level,
					message,
				},
			})
			.catch(() => {});
	};

	// Toast notification helper using TUI (cross-platform)
	const showToast = async (
		title: string,
		message: string,
		variant: "info" | "success" | "warning" | "error" = "info",
	) => {
		if (config.toastEnabled === false) return;

		try {
			// Use OpenCode's TUI toast API (cross-platform, integrated)
			await client.tui.showToast({
				body: {
					title: `Memory: ${title}`,
					message,
					variant,
					duration: variant === "error" ? 8000 : 5000,
				},
			});

			// Also log for debugging
			await log(`[TOAST] ${title}: ${message}`, "info");
		} catch {
			// Toast failed, continue silently
		}
	};

	// -------------------------------------------------------------------------
	// Part 1: Keyword Detection
	// -------------------------------------------------------------------------

	const patterns = config.patterns || DEFAULT_PATTERNS;
	const triggerPattern = buildPattern(patterns);
	const nudgeTemplate = config.nudgeTemplate || DEFAULT_NUDGE;
	const processedMessages = new Set<string>();

	// -------------------------------------------------------------------------
	// Part 2: Index Rebuild
	// -------------------------------------------------------------------------

	let rebuildTimer: ReturnType<typeof setTimeout> | null = null;
	let pendingRebuild = false;

	const triggerRebuild = async () => {
		if (pendingRebuild) return;
		pendingRebuild = true;

		try {
			const memoryDir = path.join(process.cwd(), MEMORY_DIR);
			const beadsDir = path.join(process.cwd(), BEADS_DIR);

			const indexMemoryFiles = await getIndexer();
			if (!indexMemoryFiles) {
				await log("Failed to load indexer - skipping rebuild", "warn");
				return;
			}

			await log("Rebuilding vector index...");
			const result = await indexMemoryFiles(memoryDir, beadsDir);

			await log(
				`Vector index rebuilt: ${result.indexed} indexed, ${result.skipped} skipped`,
			);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			await log(`Vector index rebuild failed: ${msg}`, "warn");
		} finally {
			pendingRebuild = false;
		}
	};

	const scheduleRebuild = () => {
		if (rebuildTimer) {
			clearTimeout(rebuildTimer);
		}
		rebuildTimer = setTimeout(() => {
			rebuildTimer = null;
			triggerRebuild();
		}, DEBOUNCE_MS);
	};

	// -------------------------------------------------------------------------
	// Part 3: Code-Change Awareness with Toast Notifications
	// -------------------------------------------------------------------------

	let codeChangeTimer: ReturnType<typeof setTimeout> | null = null;
	const pendingCodeChanges = new Set<string>();

	const flagStaleObservations = async (changedFiles: string[]) => {
		const obsDir = path.join(process.cwd(), MEMORY_DIR, "observations");

		try {
			const files = await fsPromises.readdir(obsDir);
			const observations = files.filter((f) => f.endsWith(".md"));

			let flaggedCount = 0;
			const flaggedTitles: string[] = [];

			for (const obsFile of observations) {
				const obsPath = path.join(obsDir, obsFile);
				const content = await fsPromises.readFile(obsPath, "utf-8");

				// Skip already flagged
				if (content.includes("needs_review: true")) continue;

				// Check if observation references any changed files
				const referencesChanged = changedFiles.some((changedFile) => {
					const normalizedChanged = changedFile.replace(/\\/g, "/");
					return (
						content.includes(normalizedChanged) ||
						content.includes(path.basename(changedFile))
					);
				});

				if (referencesChanged) {
					// Extract title from content
					const titleMatch = content.match(/^# .* (.+)$/m);
					const title = titleMatch ? titleMatch[1] : obsFile;

					// Add needs_review flag
					const updatedContent = content.replace(
						/^(---\n)/,
						`$1needs_review: true\nreview_reason: "Related code changed on ${new Date().toISOString().split("T")[0]}"\n`,
					);

					if (updatedContent !== content) {
						await fsPromises.writeFile(obsPath, updatedContent, "utf-8");
						flaggedCount++;
						flaggedTitles.push(title);
						await log(`Flagged observation for review: ${obsFile}`);
					}
				}
			}

			// Show toast notification if observations were flagged
			if (flaggedCount > 0) {
				const message =
					flaggedCount === 1
						? `"${flaggedTitles[0]}" may be outdated`
						: `${flaggedCount} observations may be outdated`;

				await showToast("Review Needed", message, "warning");
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			await log(`Failed to flag stale observations: ${msg}`, "warn");
		}
	};

	const processCodeChanges = async () => {
		const changedFiles = Array.from(pendingCodeChanges);
		pendingCodeChanges.clear();

		if (changedFiles.length > 0) {
			await log(`Processing ${changedFiles.length} code change(s)`);
			await flagStaleObservations(changedFiles);
		}
	};

	const handleCodeChange = (filePath: string) => {
		pendingCodeChanges.add(filePath);

		if (codeChangeTimer) {
			clearTimeout(codeChangeTimer);
		}

		codeChangeTimer = setTimeout(() => {
			codeChangeTimer = null;
			processCodeChanges();
		}, CODE_CHANGE_DEBOUNCE_MS);
	};

	// -------------------------------------------------------------------------
	// Part 4: Session Idle Summary
	// -------------------------------------------------------------------------

	const SESSION_SUMMARY_NUDGE = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[SESSION ENDING - MEMORY CHECK]

Before this session ends, consider:

1. **Any key learnings** from this session worth remembering?
2. **Decisions made** that should be documented?
3. **Patterns discovered** that could help future sessions?

Use \`observation\` tool to save important insights, or skip if nothing notable.

Quick check: \`memory-search\` to see if related knowledge already exists.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

	// -------------------------------------------------------------------------
	// Return Event Hooks (Official OpenCode Event System)
	// -------------------------------------------------------------------------

	return {
		// Hook: Detect memory trigger keywords in user messages
		"message.updated": async ({ event }) => {
			// Only process user messages
			const message = event.properties?.message;
			if (!message || message.role !== "user") return;

			const parts = message.parts;
			if (!parts) return;

			// Get text content
			const textParts = parts.filter(
				(p: { type: string; text?: string }): p is {
					type: "text";
					text: string;
				} => p.type === "text",
			);
			if (textParts.length === 0) return;

			const fullText = textParts.map((p: { text: string }) => p.text).join(" ");

			// Avoid processing same message twice
			const messageHash = `${message.role}:${fullText.substring(0, 100)}`;
			if (processedMessages.has(messageHash)) return;
			processedMessages.add(messageHash);

			// Limit cache size
			if (processedMessages.size > 100) {
				const first = processedMessages.values().next().value;
				if (first) processedMessages.delete(first);
			}

			// Check for trigger keywords
			const match = fullText.match(triggerPattern);
			if (!match) return;

			const context = extractContext(fullText, match.index || 0);
			await log(
				`Detected memory trigger: "${match[0]}" in: "${context.substring(0, 50)}..."`,
			);

			// Note: The nudge would be injected via chat.message hook if available
		},

		// Hook: file.edited - OpenCode edited a file
		"file.edited": async ({ event }) => {
			const filePath = event.properties?.file || event.properties?.path;
			if (!filePath) return;

			const absolutePath =
				typeof filePath === "string" && path.isAbsolute(filePath)
					? filePath
					: path.join(process.cwd(), filePath);

			// Check if it's a code file in src/
			if (isCodeFile(absolutePath) && absolutePath.includes(`/${SRC_DIR}/`)) {
				await log(`Code edited by OpenCode: ${filePath}`);
				handleCodeChange(absolutePath);
			}

			// Check if it's a memory file
			if (isMemoryFile(absolutePath)) {
				await log(`Memory file edited: ${filePath}`);
				scheduleRebuild();
			}
		},

		// Hook: file.watcher.updated - External file changes
		"file.watcher.updated": async ({ event }) => {
			const filePath = event.properties?.file || event.properties?.path;
			if (!filePath) return;

			const absolutePath =
				typeof filePath === "string" && path.isAbsolute(filePath)
					? filePath
					: path.join(process.cwd(), filePath);

			// Ignore node_modules and vector_db
			if (
				absolutePath.includes("node_modules") ||
				absolutePath.includes("vector_db")
			) {
				return;
			}

			// Code file changes
			if (isCodeFile(absolutePath) && absolutePath.includes(`/${SRC_DIR}/`)) {
				await log(`External code change: ${filePath}`);
				handleCodeChange(absolutePath);
			}

			// Memory file changes
			if (isMemoryFile(absolutePath)) {
				await log(`External memory change: ${filePath}`);
				scheduleRebuild();
			}
		},

		// Hook: session.idle - Session completed
		"session.idle": async () => {
			if (config.sessionSummaryEnabled === false) return;

			await log("Session idle - prompting memory summary");
			await showToast(
				"Session Ending",
				"Consider saving key learnings before ending",
				"info",
			);
		},

		// Hook: tool.execute.after - Notify when observation is saved
		"tool.execute.after": async (input, output) => {
			if (input.tool === "observation") {
				await showToast("Memory Saved", "Observation added to memory", "info");
			}

			// LSP Nudge Injection: If tool output contains LSP hints, wrap them in a prompt
			if (
				output.output.includes("lsp_lsp_goto_definition") ||
				output.output.includes("lsp_lsp_document_symbols") ||
				output.output.includes("lsp_lsp_find_references")
			) {
				// Avoid double injection
				if (output.output.includes("[LSP NAVIGATION AVAILABLE]")) return;

				const LSP_PROMPT = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[LSP NAVIGATION AVAILABLE]

The tool output contains actionable LSP navigation links (🔍).
You can use these to immediately jump to the relevant code context.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
				output.output += LSP_PROMPT;
			}
		},

		// Hook: session.error - Warn about potential lost context
		"session.error": async () => {
			await showToast(
				"Session Error",
				"Consider saving important learnings with observation tool",
				"warning",
			);
		},

		// Hook: Inject nudge for memory triggers (chat.message if available)
		"chat.message": async (input, output) => {
			const { sessionID, messageID } = input;
			const { message, parts } = output;

			// Only process user messages
			if (message.role !== "user") return;

			// Get text content
			const textParts = parts.filter(
				(p): p is Extract<typeof p, { type: "text" }> => p.type === "text",
			);
			if (textParts.length === 0) return;

			const fullText = textParts.map((p) => p.text).join(" ");

			// Avoid processing same message twice (use different cache for this hook)
			const messageKey = `chat:${fullText.substring(0, 100)}`;
			if (processedMessages.has(messageKey)) return;
			processedMessages.add(messageKey);

			// Check for trigger keywords
			const match = fullText.match(triggerPattern);
			if (!match) return;

			const context = extractContext(fullText, match.index || 0);
			await log(
				`Detected memory trigger: "${match[0]}" in: "${context.substring(0, 50)}..."`,
			);

			// Inject the nudge as a synthetic text part
			const partId = `memory-nudge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

			parts.push({
				id: partId,
				sessionID,
				messageID: messageID || "",
				type: "text",
				text: nudgeTemplate,
				synthetic: true,
			} as import("@opencode-ai/sdk").Part);
		},
	};
};

// Default export for OpenCode plugin loader
export default MemoryPlugin;
