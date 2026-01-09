import fs from "node:fs/promises";
import path from "node:path";
import { tool } from "@opencode-ai/plugin";
import { searchVectorStore } from "./memory-index";

interface SearchResult {
	file: string;
	matches: { line: number; content: string }[];
	score?: number;
}

interface SemanticResult {
	file: string;
	title: string;
	preview: string;
	type: string;
	score?: number;
	confidence?: string;
	age_days?: number;
}

// Confidence decay factor based on age (Graphiti-inspired)
// Older observations with lower confidence rank lower
function applyConfidenceDecay(
	results: SemanticResult[],
	contents: Map<string, string>,
): SemanticResult[] {
	const now = Date.now();

	return results.map((result) => {
		const content = contents.get(result.file) || "";

		// Extract metadata from YAML frontmatter
		const createdMatch = content.match(/created:\s*(.+)/);
		const confidenceMatch = content.match(/confidence:\s*(\w+)/);
		const validUntilMatch = content.match(/valid_until:\s*(.+)/);
		const supersededByMatch = content.match(/superseded_by:\s*(.+)/);

		// Check if superseded (should rank very low)
		if (supersededByMatch && supersededByMatch[1] !== "null") {
			return { ...result, score: (result.score || 1) * 0.1 };
		}

		// Check if expired
		if (validUntilMatch && validUntilMatch[1] !== "null") {
			const validUntil = new Date(validUntilMatch[1]).getTime();
			if (validUntil < now) {
				return { ...result, score: (result.score || 1) * 0.2 };
			}
		}

		// Calculate age in days
		let ageDays = 0;
		if (createdMatch) {
			const created = new Date(createdMatch[1]).getTime();
			ageDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
		}

		// Confidence multiplier
		const confidenceMultiplier: Record<string, number> = {
			high: 1.0,
			medium: 0.8,
			low: 0.6,
		};
		const confidence = confidenceMatch?.[1] || "high";
		const confMult = confidenceMultiplier[confidence] || 1.0;

		// Age decay: lose 5% per 30 days, minimum 50%
		const ageDecay = Math.max(0.5, 1 - (ageDays / 30) * 0.05);

		const finalScore = (result.score || 1) * confMult * ageDecay;

		return {
			...result,
			score: finalScore,
			confidence,
			age_days: ageDays,
		};
	});
}

async function searchDirectory(
	dir: string,
	pattern: RegExp,
	results: SearchResult[],
	baseDir: string,
): Promise<void> {
	try {
		const entries = await fs.readdir(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);

			if (entry.isDirectory()) {
				// Skip hidden directories and vector_db
				if (entry.name.startsWith(".") || entry.name === "vector_db") {
					continue;
				}
				await searchDirectory(fullPath, pattern, results, baseDir);
			} else if (entry.name.endsWith(".md")) {
				const content = await fs.readFile(fullPath, "utf-8");
				const lines = content.split("\n");
				const matches: { line: number; content: string }[] = [];

				lines.forEach((line, index) => {
					if (pattern.test(line)) {
						matches.push({
							line: index + 1,
							content: line.trim().substring(0, 150),
						});
					}
				});

				if (matches.length > 0) {
					const relativePath = path.relative(baseDir, fullPath);
					results.push({ file: relativePath, matches });
				}
			}
		}
	} catch {
		// Directory doesn't exist or not readable
	}
}

async function keywordSearch(
	query: string,
	type: string | undefined,
	limit: number,
): Promise<SearchResult[]> {
	const memoryDir = path.join(process.cwd(), ".opencode/memory");
	const beadsDir = path.join(process.cwd(), ".beads/artifacts");
	const globalMemoryDir = path.join(
		process.env.HOME || "",
		".config/opencode/memory",
	);

	// Create case-insensitive regex from query
	let pattern: RegExp;
	try {
		pattern = new RegExp(query, "i");
	} catch {
		// Escape special chars if not valid regex
		const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		pattern = new RegExp(escaped, "i");
	}

	const results: SearchResult[] = [];

	// Handle type filtering
	if (type === "beads") {
		await searchDirectory(beadsDir, pattern, results, beadsDir);
	} else if (type && type !== "all") {
		const typeMap: Record<string, string> = {
			handoffs: "handoffs",
			research: "research",
			templates: "_templates",
			observations: "observations",
		};
		const subdir = typeMap[type];
		if (subdir) {
			const searchDir = path.join(memoryDir, subdir);
			await searchDirectory(searchDir, pattern, results, memoryDir);
		}
	} else {
		// Search all: memory + beads
		await searchDirectory(memoryDir, pattern, results, memoryDir);
		await searchDirectory(beadsDir, pattern, results, beadsDir);
		await searchDirectory(globalMemoryDir, pattern, results, globalMemoryDir);
	}

	return results;
}

async function semanticSearch(
	query: string,
	type: string | undefined,
	limit: number,
): Promise<SemanticResult[]> {
	const typeMap: Record<string, string> = {
		handoffs: "handoff",
		observations: "observation",
		beads: "bead",
		project: "project",
		templates: "template",
	};

	const fileType = type && type !== "all" ? typeMap[type] : undefined;
	const docs = await searchVectorStore(query, limit * 2, fileType); // Fetch extra for decay filtering

	// Build content map for decay calculation
	const contents = new Map<string, string>();
	for (const doc of docs) {
		try {
			const content = await fs.readFile(doc.file_path, "utf-8");
			contents.set(doc.file_path, content);
		} catch {
			// File not found, skip
		}
	}

	const results: SemanticResult[] = docs.map((doc) => ({
		file: doc.file_path,
		title: doc.title,
		preview: doc.content_preview,
		type: doc.file_type,
		score: 1.0,
	}));

	// Apply confidence decay and re-sort
	const decayedResults = applyConfidenceDecay(results, contents);
	decayedResults.sort((a, b) => (b.score || 0) - (a.score || 0));

	return decayedResults.slice(0, limit);
}

function formatKeywordResults(
	query: string,
	results: SearchResult[],
	limit: number,
): string {
	if (results.length === 0) {
		return `No keyword matches found for "${query}".\n\nTip: Try 'mode: semantic' for conceptual search, or run 'vector-store rebuild' first.`;
	}

	let output = `# Keyword Search: "${query}"\n\n`;
	output += `Found ${results.length} file(s) with matches.\n\n`;

	for (const result of results) {
		output += `## ${result.file}\n\n`;
		const matchesToShow = result.matches.slice(0, limit);
		for (const match of matchesToShow) {
			output += `- **Line ${match.line}:** ${match.content}\n`;
		}
		if (result.matches.length > limit) {
			output += `- ... and ${result.matches.length - limit} more matches\n`;
		}
		// Add LSP navigation hint for code files
		if (
			result.file.endsWith(".ts") ||
			result.file.endsWith(".tsx") ||
			result.file.endsWith(".js") ||
			result.file.endsWith(".jsx") ||
			result.file.endsWith(".py") ||
			result.file.endsWith(".go") ||
			result.file.endsWith(".rs")
		) {
			const lineNum = result.matches[0]?.line;
			if (lineNum) {
				output += `\n🔍 **LSP Nudge:**\n`;
				output += `  \`lsp_lsp_goto_definition({ filePath: "${result.file}", line: ${lineNum}, character: 1 })\`\n`;
			}
		}
		output += "\n";
	}

	return output;
}

function formatSemanticResults(
	query: string,
	results: SemanticResult[],
): string {
	if (results.length === 0) {
		return `No semantic matches found for "${query}".\n\nTip: Run 'vector-store rebuild' to index memory files first.`;
	}

	let output = `# Semantic Search: "${query}"\n\n`;
	output += `Found ${results.length} similar document(s).\n\n`;

	const confidenceIcons: Record<string, string> = {
		high: "🟢",
		medium: "🟡",
		low: "🔴",
	};

	for (const result of results) {
		output += `## ${result.title}\n\n`;
		output += `**File:** \`${result.file}\`\n`;
		output += `**Type:** ${result.type}`;
		if (result.confidence) {
			const icon = confidenceIcons[result.confidence] || "";
			output += ` | **Confidence:** ${icon} ${result.confidence}`;
		}
		if (result.age_days !== undefined && result.age_days > 0) {
			output += ` | **Age:** ${result.age_days}d`;
		}
		output += "\n\n";
		output += `${result.preview}...\n\n`;

		// Add LSP navigation for code files
		if (
			result.file.endsWith(".ts") ||
			result.file.endsWith(".tsx") ||
			result.file.endsWith(".js") ||
			result.file.endsWith(".jsx") ||
			result.file.endsWith(".py") ||
			result.file.endsWith(".go") ||
			result.file.endsWith(".rs")
		) {
			output += `\n🔍 **LSP Nudge:**\n`;
			output += `  Get symbols: \`lsp_lsp_document_symbols({ filePath: "${result.file}" })\`\n`;
			output += `  Find references: \`lsp_lsp_find_references({ filePath: "${result.file}", line: 1, character: 1 })\`\n`;
		}

		output += "---\n\n";
	}

	return output;
}

function formatHybridResults(
	query: string,
	keywordResults: SearchResult[],
	semanticResults: SemanticResult[],
	limit: number,
): string {
	let output = `# Hybrid Search: "${query}"\n\n`;

	// Semantic results first (conceptual matches)
	output += `## Semantic Matches (${semanticResults.length})\n\n`;
	if (semanticResults.length === 0) {
		output += `_No semantic matches. Run 'vector-store rebuild' to enable._\n\n`;
	} else {
		for (const result of semanticResults.slice(0, limit)) {
			output += `- **${result.title}** (\`${result.file}\`)\n`;
			output += `  ${result.preview.substring(0, 100)}...\n`;
			// Add LSP hint for code files
			if (
				result.file.endsWith(".ts") ||
				result.file.endsWith(".tsx") ||
				result.file.endsWith(".js") ||
				result.file.endsWith(".jsx") ||
				result.file.endsWith(".py") ||
				result.file.endsWith(".go") ||
				result.file.endsWith(".rs")
			) {
				output += `  🔍 **LSP Nudge:** \`lsp_lsp_document_symbols({ filePath: "${result.file}" })\`\n`;
			}
		}
		output += "\n";
	}

	// Keyword results (exact matches)
	output += `## Keyword Matches (${keywordResults.length})\n\n`;
	if (keywordResults.length === 0) {
		output += "_No exact keyword matches._\n\n";
	} else {
		for (const result of keywordResults.slice(0, limit)) {
			output += `- **${result.file}**\n`;
			for (const match of result.matches.slice(0, 2)) {
				output += `  - Line ${match.line}: ${match.content.substring(0, 80)}...\n`;
			}
			// Add LSP hint for code files
			if (
				result.file.endsWith(".ts") ||
				result.file.endsWith(".tsx") ||
				result.file.endsWith(".js") ||
				result.file.endsWith(".jsx") ||
				result.file.endsWith(".py") ||
				result.file.endsWith(".go") ||
				result.file.endsWith(".rs")
			) {
				const lineNum = result.matches[0]?.line;
				if (lineNum) {
					output += `  🔍 **LSP Nudge:** \`lsp_lsp_goto_definition({ filePath: "${result.file}", line: ${lineNum}, character: 1 })\`\n`;
				}
			}
		}
		output += "\n";
	}

	return output;
}

export default tool({
	description:
		"Search across all memory files using keywords, semantic similarity, or hybrid mode. Returns matching files with context. Useful for finding past decisions, research, or handoffs.",
	args: {
		query: tool.schema
			.string()
			.describe(
				"Search query: keywords, regex pattern, or natural language for semantic search",
			),
		mode: tool.schema
			.enum(["keyword", "semantic", "hybrid"])
			.optional()
			.describe(
				"Search mode: 'keyword' (default, regex matching), 'semantic' (vector similarity), 'hybrid' (both)",
			),
		type: tool.schema
			.string()
			.optional()
			.describe(
				"Filter by type: 'all' (default), 'handoffs', 'research', 'templates', 'observations', 'beads'",
			),
		limit: tool.schema.number().optional().describe("Max results (default: 5)"),
	},
	execute: async (args: {
		query: string;
		mode?: "keyword" | "semantic" | "hybrid";
		type?: string;
		limit?: number;
	}) => {
		const mode = args.mode || "keyword";
		const limit = args.limit || 5;

		if (mode === "keyword") {
			const results = await keywordSearch(args.query, args.type, limit);
			return formatKeywordResults(args.query, results, limit);
		}

		if (mode === "semantic") {
			const results = await semanticSearch(args.query, args.type, limit);
			return formatSemanticResults(args.query, results);
		}

		if (mode === "hybrid") {
			const [keywordResults, semanticResults] = await Promise.all([
				keywordSearch(args.query, args.type, limit),
				semanticSearch(args.query, args.type, limit),
			]);
			return formatHybridResults(
				args.query,
				keywordResults,
				semanticResults,
				limit,
			);
		}

		return "Unknown search mode";
	},
});
