import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import * as lancedb from "@lancedb/lancedb";
import { tool } from "@opencode-ai/plugin";
import { generateEmbedding } from "./memory-embed";

const execAsync = promisify(exec);

// Configuration
const VECTOR_DB_PATH = ".opencode/memory/vector_db";
const TABLE_NAME = "memories";

interface MemoryDocument {
	id: string;
	file_path: string;
	title: string;
	content: string;
	content_preview: string;
	embedding: number[];
	indexed_at: string;
	file_type: string;
}

interface IndexResult {
	indexed: number;
	skipped: number;
	errors: string[];
}

interface CodeDefinition {
	name: string;
	type: string; // function, class, method, interface, type
	file_path: string;
	line_start: number;
	line_end: number;
	signature: string;
	content: string;
}

// AST-grep patterns for different languages
// Based on OpenCode LSP support: https://opencode.ai/docs/lsp
const AST_PATTERNS: Record<
	string,
	{ lang: string; patterns: Record<string, string> }
> = {
	// TypeScript/JavaScript family
	ts: {
		lang: "typescript",
		patterns: {
			function: "function $NAME($$$) { $$$ }",
			async_function: "async function $NAME($$$) { $$$ }",
			arrow_const: "const $NAME = ($$$) => $$$",
			arrow_export: "export const $NAME = ($$$) => $$$",
			class: "class $NAME { $$$ }",
			interface: "interface $NAME { $$$ }",
			type_alias: "type $NAME = $$$",
			enum: "enum $NAME { $$$ }",
		},
	},
	tsx: {
		lang: "tsx",
		patterns: {
			function: "function $NAME($$$) { $$$ }",
			component: "export function $NAME($$$) { $$$ }",
			class: "class $NAME { $$$ }",
		},
	},
	js: {
		lang: "javascript",
		patterns: {
			function: "function $NAME($$$) { $$$ }",
			async_function: "async function $NAME($$$) { $$$ }",
			class: "class $NAME { $$$ }",
			arrow_const: "const $NAME = ($$$) => $$$",
		},
	},
	jsx: {
		lang: "javascript",
		patterns: {
			function: "function $NAME($$$) { $$$ }",
			component: "export function $NAME($$$) { $$$ }",
		},
	},
	mjs: {
		lang: "javascript",
		patterns: { function: "function $NAME($$$) { $$$ }" },
	},
	cjs: {
		lang: "javascript",
		patterns: { function: "function $NAME($$$) { $$$ }" },
	},

	// Python
	py: {
		lang: "python",
		patterns: {
			function: "def $NAME($$$):",
			async_function: "async def $NAME($$$):",
			class: "class $NAME:",
			class_inherit: "class $NAME($$$):",
		},
	},
	pyi: {
		lang: "python",
		patterns: {
			function: "def $NAME($$$) -> $$$:",
			class: "class $NAME:",
		},
	},

	// Go
	go: {
		lang: "go",
		patterns: {
			function: "func $NAME($$$) $$$",
			method: "func ($$$) $NAME($$$) $$$",
			struct: "type $NAME struct { $$$ }",
			interface: "type $NAME interface { $$$ }",
		},
	},

	// Rust
	rs: {
		lang: "rust",
		patterns: {
			function: "fn $NAME($$$) { $$$ }",
			async_function: "async fn $NAME($$$) { $$$ }",
			struct: "struct $NAME { $$$ }",
			enum: "enum $NAME { $$$ }",
			impl: "impl $NAME { $$$ }",
			trait: "trait $NAME { $$$ }",
		},
	},

	// Ruby
	rb: {
		lang: "ruby",
		patterns: {
			method: "def $NAME",
			class: "class $NAME",
			module: "module $NAME",
		},
	},

	// PHP
	php: {
		lang: "php",
		patterns: {
			function: "function $NAME($$$)",
			class: "class $NAME",
			interface: "interface $NAME",
			trait: "trait $NAME",
		},
	},

	// Java
	java: {
		lang: "java",
		patterns: {
			method: "public $$$  $NAME($$$)",
			class: "class $NAME",
			interface: "interface $NAME",
		},
	},

	// Kotlin
	kt: {
		lang: "kotlin",
		patterns: {
			function: "fun $NAME($$$)",
			class: "class $NAME",
			interface: "interface $NAME",
			data_class: "data class $NAME($$$)",
		},
	},
	kts: {
		lang: "kotlin",
		patterns: {
			function: "fun $NAME($$$)",
		},
	},

	// C/C++
	c: {
		lang: "c",
		patterns: {
			function: "$$$  $NAME($$$) { $$$ }",
			struct: "struct $NAME { $$$ }",
		},
	},
	cpp: {
		lang: "cpp",
		patterns: {
			function: "$$$  $NAME($$$) { $$$ }",
			class: "class $NAME { $$$ }",
			struct: "struct $NAME { $$$ }",
		},
	},
	h: { lang: "c", patterns: { struct: "struct $NAME { $$$ }" } },
	hpp: { lang: "cpp", patterns: { class: "class $NAME { $$$ }" } },

	// C#
	cs: {
		lang: "csharp",
		patterns: {
			method: "public $$$ $NAME($$$)",
			class: "class $NAME",
			interface: "interface $NAME",
			struct: "struct $NAME",
		},
	},

	// Swift
	swift: {
		lang: "swift",
		patterns: {
			function: "func $NAME($$$)",
			class: "class $NAME",
			struct: "struct $NAME",
			protocol: "protocol $NAME",
		},
	},

	// Dart
	dart: {
		lang: "dart",
		patterns: {
			function: "$$$ $NAME($$$) { $$$ }",
			class: "class $NAME",
		},
	},

	// Lua
	lua: {
		lang: "lua",
		patterns: {
			function: "function $NAME($$$)",
			local_function: "local function $NAME($$$)",
		},
	},

	// Elixir
	ex: {
		lang: "elixir",
		patterns: {
			function: "def $NAME($$$) do",
			defp: "defp $NAME($$$) do",
			module: "defmodule $NAME do",
		},
	},
	exs: {
		lang: "elixir",
		patterns: {
			function: "def $NAME($$$) do",
		},
	},

	// Shell/Bash
	sh: {
		lang: "bash",
		patterns: {
			function: "function $NAME()",
			function_alt: "$NAME() {",
		},
	},
	bash: {
		lang: "bash",
		patterns: {
			function: "function $NAME()",
		},
	},

	// Vue/Svelte/Astro (component frameworks)
	vue: {
		lang: "vue",
		patterns: {
			script_setup: "<script setup>",
			function: "function $NAME($$$)",
		},
	},
	svelte: {
		lang: "svelte",
		patterns: {
			script: "<script>",
			function: "function $NAME($$$)",
		},
	},
};

async function extractCodeDefinitions(
	srcDir: string,
): Promise<{ definitions: CodeDefinition[]; errors: string[] }> {
	const definitions: CodeDefinition[] = [];
	const errors: string[] = [];

	// Check if ast-grep is available
	try {
		await execAsync("sg --version");
	} catch {
		errors.push(
			"ast-grep (sg) not installed. Run: npm install -g @ast-grep/cli",
		);
		return { definitions, errors };
	}

	// Find source files - use all extensions from AST_PATTERNS
	const extensions = Object.keys(AST_PATTERNS);

	for (const ext of extensions) {
		const config = AST_PATTERNS[ext] || AST_PATTERNS.ts;

		for (const [defType, pattern] of Object.entries(config.patterns)) {
			try {
				const { stdout } = await execAsync(
					`sg --pattern '${pattern}' --lang ${config.lang} --json "${srcDir}"`,
					{ maxBuffer: 10 * 1024 * 1024 }, // 10MB buffer
				);

				if (!stdout.trim()) continue;

				const matches = JSON.parse(stdout) as Array<{
					file: string;
					range: { start: { line: number }; end: { line: number } };
					text: string;
					metaVariables?: { single?: { NAME?: { text: string } } };
				}>;

				for (const match of matches) {
					// Skip node_modules and common non-source directories
					if (
						match.file.includes("node_modules") ||
						match.file.includes(".git") ||
						match.file.includes("dist/") ||
						match.file.includes("build/")
					) {
						continue;
					}

					const name = match.metaVariables?.single?.NAME?.text || "anonymous";
					const signature = match.text.split("\n")[0].substring(0, 200);

					definitions.push({
						name,
						type: defType,
						file_path: path.relative(process.cwd(), match.file),
						line_start: match.range.start.line,
						line_end: match.range.end.line,
						signature,
						content: match.text.substring(0, 2000), // Limit content size
					});
				}
			} catch (err) {
				// Pattern didn't match or other error, continue
				const msg = err instanceof Error ? err.message : String(err);
				if (!msg.includes("No matches found")) {
					errors.push(`Pattern ${defType}: ${msg.substring(0, 100)}`);
				}
			}
		}
	}

	return { definitions, errors };
}

async function indexCodeDefinitions(srcDir: string): Promise<IndexResult> {
	const result: IndexResult = { indexed: 0, skipped: 0, errors: [] };

	const { definitions, errors } = await extractCodeDefinitions(srcDir);
	result.errors.push(...errors);

	if (definitions.length === 0) {
		return result;
	}

	// Open database
	const dbPath = path.join(process.cwd(), VECTOR_DB_PATH);
	await fs.mkdir(dbPath, { recursive: true });
	const db = await lancedb.connect(dbPath);

	// Get existing table or create new one
	let existingDocs: Record<string, unknown>[] = [];
	try {
		const table = await db.openTable(TABLE_NAME);
		const allDocs = await table.search([0]).limit(10000).toArray();
		// Keep non-code documents
		existingDocs = allDocs.filter((doc) => doc.file_type !== "code");
	} catch {
		// Table doesn't exist
	}

	const documents: Record<string, unknown>[] = [...existingDocs];

	for (const def of definitions) {
		try {
			// Create searchable content
			const searchContent = `${def.type} ${def.name}\n${def.signature}\n${def.content}`;

			const embeddingResult = await generateEmbedding(
				searchContent.substring(0, 8000),
			);
			if (!embeddingResult) {
				result.skipped++;
				continue;
			}

			documents.push({
				id: `code_${def.file_path}_${def.name}_${def.line_start}`.replace(
					/[\/\\]/g,
					"_",
				),
				file_path: def.file_path,
				title: `${def.type}: ${def.name}`,
				content: def.content,
				content_preview: def.signature,
				embedding: embeddingResult.embedding,
				indexed_at: new Date().toISOString(),
				file_type: "code",
				// Code-specific fields
				code_name: def.name,
				code_type: def.type,
				code_line_start: def.line_start,
				code_line_end: def.line_end,
			});

			result.indexed++;
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			result.errors.push(`${def.file_path}:${def.name}: ${msg}`);
		}
	}

	if (documents.length > 0) {
		try {
			await db.dropTable(TABLE_NAME);
		} catch {
			// Table doesn't exist
		}
		await db.createTable(TABLE_NAME, documents);
	}

	return result;
}

async function extractTitle(content: string): Promise<string> {
	// Extract first H1 or H2 heading, or first line
	const h1Match = content.match(/^#\s+(.+)$/m);
	if (h1Match) return h1Match[1].trim();

	const h2Match = content.match(/^##\s+(.+)$/m);
	if (h2Match) return h2Match[1].trim();

	const firstLine = content.split("\n")[0];
	return firstLine?.trim().substring(0, 100) || "Untitled";
}

async function getMarkdownFiles(
	dir: string,
	files: string[] = [],
): Promise<string[]> {
	try {
		const entries = await fs.readdir(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);

			if (entry.isDirectory()) {
				// Skip vector_db and hidden directories
				if (entry.name === "vector_db" || entry.name.startsWith(".")) {
					continue;
				}
				await getMarkdownFiles(fullPath, files);
			} else if (entry.name.endsWith(".md")) {
				files.push(fullPath);
			}
		}
	} catch {
		// Directory doesn't exist
	}

	return files;
}

function getFileType(filePath: string): string {
	if (filePath.includes("/observations/")) return "observation";
	if (filePath.includes("/handoffs/")) return "handoff";
	if (filePath.includes("/project/")) return "project";
	if (filePath.includes("/_templates/")) return "template";
	if (filePath.includes(".beads/")) return "bead";
	return "memory";
}

async function indexMemoryFiles(
	memoryDir: string,
	beadsDir: string,
): Promise<IndexResult> {
	const result: IndexResult = { indexed: 0, skipped: 0, errors: [] };

	// Collect all markdown files
	const memoryFiles = await getMarkdownFiles(memoryDir);
	const beadFiles = await getMarkdownFiles(beadsDir);
	const allFiles = [...memoryFiles, ...beadFiles];

	if (allFiles.length === 0) {
		return result;
	}

	// Open or create database
	const dbPath = path.join(process.cwd(), VECTOR_DB_PATH);
	await fs.mkdir(dbPath, { recursive: true });

	const db = await lancedb.connect(dbPath);

	const documents: Record<string, unknown>[] = [];

	for (const filePath of allFiles) {
		try {
			const content = await fs.readFile(filePath, "utf-8");

			// Skip empty files
			if (content.trim().length === 0) {
				result.skipped++;
				continue;
			}

			// Generate embedding
			const embeddingResult = await generateEmbedding(
				content.substring(0, 8000),
			);
			if (!embeddingResult) {
				result.errors.push(`${filePath}: Failed to generate embedding`);
				continue;
			}

			const relativePath = path.relative(process.cwd(), filePath);
			const title = await extractTitle(content);

			documents.push({
				id: relativePath.replace(/[\/\\]/g, "_"),
				file_path: relativePath,
				title,
				content,
				content_preview: content.substring(0, 500),
				embedding: embeddingResult.embedding,
				indexed_at: new Date().toISOString(),
				file_type: getFileType(filePath),
			});

			result.indexed++;
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			result.errors.push(`${filePath}: ${msg}`);
		}
	}

	if (documents.length > 0) {
		// Create or overwrite table
		try {
			await db.dropTable(TABLE_NAME);
		} catch {
			// Table doesn't exist, that's fine
		}

		await db.createTable(TABLE_NAME, documents);
	}

	return result;
}

async function searchVectorStore(
	query: string,
	topK = 5,
	fileType?: string,
): Promise<MemoryDocument[]> {
	const dbPath = path.join(process.cwd(), VECTOR_DB_PATH);

	try {
		await fs.access(dbPath);
	} catch {
		return [];
	}

	const db = await lancedb.connect(dbPath);

	let table: lancedb.Table;
	try {
		table = await db.openTable(TABLE_NAME);
	} catch {
		return [];
	}

	// Generate query embedding
	const embeddingResult = await generateEmbedding(query);
	if (!embeddingResult) {
		return [];
	}

	let searchQuery = table.search(embeddingResult.embedding).limit(topK);

	if (fileType) {
		searchQuery = searchQuery.where(`file_type = '${fileType}'`);
	}

	const results = await searchQuery.toArray();

	return results.map((row) => ({
		id: row.id as string,
		file_path: row.file_path as string,
		title: row.title as string,
		content: row.content as string,
		content_preview: row.content_preview as string,
		embedding: row.embedding as number[],
		indexed_at: row.indexed_at as string,
		file_type: row.file_type as string,
	}));
}

export default tool({
	description:
		"Manage the vector store for semantic memory search. Rebuild index from memory files, index code definitions, or search for similar content.",
	args: {
		action: tool.schema
			.enum(["rebuild", "search", "status", "index-code"])
			.describe(
				"Action: 'rebuild' to reindex memory files, 'index-code' to index code definitions, 'search' to find similar content, 'status' to check index state",
			),
		query: tool.schema
			.string()
			.optional()
			.describe("Search query (required for 'search' action)"),
		limit: tool.schema
			.number()
			.optional()
			.describe("Max results for search (default: 5)"),
		type: tool.schema
			.string()
			.optional()
			.describe(
				"Filter by type: observation, handoff, project, template, bead, memory, code",
			),
		path: tool.schema
			.string()
			.optional()
			.describe("Source directory for 'index-code' action (default: 'src')"),
	},
	execute: async (args: {
		action: "rebuild" | "search" | "status" | "index-code";
		query?: string;
		limit?: number;
		type?: string;
		path?: string;
	}) => {
		const memoryDir = path.join(process.cwd(), ".opencode/memory");
		const beadsDir = path.join(process.cwd(), ".beads/artifacts");

		if (args.action === "rebuild") {
			const result = await indexMemoryFiles(memoryDir, beadsDir);

			let output = "# Vector Store Rebuild Complete\n\n";
			output += `- **Indexed:** ${result.indexed} files\n`;
			output += `- **Skipped:** ${result.skipped} files (empty)\n`;
			output += `- **Location:** ${VECTOR_DB_PATH}/\n`;

			if (result.errors.length > 0) {
				output += `\n## Errors (${result.errors.length})\n\n`;
				for (const err of result.errors.slice(0, 10)) {
					output += `- ${err}\n`;
				}
				if (result.errors.length > 10) {
					output += `- ... and ${result.errors.length - 10} more\n`;
				}
			}

			return output;
		}

		if (args.action === "index-code") {
			const srcDir = args.path || "src";
			const fullPath = path.join(process.cwd(), srcDir);

			// Check if directory exists
			try {
				await fs.access(fullPath);
			} catch {
				return `Error: Directory '${srcDir}' not found.\n\nUsage: memory-index action=index-code path=src`;
			}

			const result = await indexCodeDefinitions(fullPath);

			let output = "# Code Index Complete\n\n";
			output += `- **Indexed:** ${result.indexed} code definitions\n`;
			output += `- **Skipped:** ${result.skipped} (no embedding)\n`;
			output += `- **Source:** ${srcDir}/\n`;
			output += `- **Location:** ${VECTOR_DB_PATH}/\n`;

			if (result.errors.length > 0) {
				output += `\n## Errors (${result.errors.length})\n\n`;
				for (const err of result.errors.slice(0, 10)) {
					output += `- ${err}\n`;
				}
				if (result.errors.length > 10) {
					output += `- ... and ${result.errors.length - 10} more\n`;
				}
			}

			output += "\n## Indexed Types\n\n";
			output +=
				"Functions, classes, interfaces, types from TypeScript/JavaScript/Python files.\n";
			output +=
				"\nSearch with: `memory-search query='function name' mode=semantic type=code`";

			return output;
		}

		if (args.action === "search") {
			if (!args.query) {
				return "Error: 'query' is required for search action";
			}

			const results = await searchVectorStore(
				args.query,
				args.limit || 5,
				args.type,
			);

			if (results.length === 0) {
				return `No results found for "${args.query}".\n\nTip: Run 'vector-store rebuild' first to index memory files.`;
			}

			let output = `# Semantic Search: "${args.query}"\n\n`;
			output += `Found ${results.length} result(s).\n\n`;

			for (const doc of results) {
				output += `## ${doc.title}\n\n`;
				output += `**File:** \`${doc.file_path}\`\n`;
				output += `**Type:** ${doc.file_type}\n`;
				output += `**Indexed:** ${doc.indexed_at}\n\n`;
				output += `${doc.content_preview}...\n\n`;
				output += "---\n\n";
			}

			return output;
		}

		if (args.action === "status") {
			const dbPath = path.join(process.cwd(), VECTOR_DB_PATH);

			try {
				await fs.access(dbPath);
				const db = await lancedb.connect(dbPath);
				const table = await db.openTable(TABLE_NAME);
				const count = await table.countRows();

				return `# Vector Store Status\n\n- **Location:** ${VECTOR_DB_PATH}/\n- **Documents:** ${count}\n- **Table:** ${TABLE_NAME}\n\nUse 'vector-store rebuild' to reindex.`;
			} catch {
				return `# Vector Store Status\n\n- **Status:** Not initialized\n- **Location:** ${VECTOR_DB_PATH}/ (does not exist)\n\nRun 'vector-store rebuild' to create the index.`;
			}
		}

		return "Unknown action";
	},
});

// Export search function for use by memory-search.ts
export { searchVectorStore };

// Export rebuild function for use by memory-watcher plugin
export { indexMemoryFiles };
