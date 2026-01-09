import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { tool } from "@opencode-ai/plugin";

const execAsync = promisify(exec);

interface CodeSymbol {
	name: string;
	type: string;
	line: number;
}

interface FileNode {
	name: string;
	path: string;
	symbols: CodeSymbol[];
	children: Map<string, FileNode>;
}

// AST-grep patterns for quick symbol extraction
const QUICK_PATTERNS: Record<string, { lang: string; pattern: string }[]> = {
	ts: [
		{ lang: "typescript", pattern: "function $NAME($$$)" },
		{ lang: "typescript", pattern: "const $NAME = ($$$) =>" },
		{ lang: "typescript", pattern: "class $NAME" },
		{ lang: "typescript", pattern: "interface $NAME" },
		{ lang: "typescript", pattern: "type $NAME =" },
		{ lang: "typescript", pattern: "export function $NAME($$$)" },
		{ lang: "typescript", pattern: "export const $NAME" },
	],
	tsx: [
		{ lang: "tsx", pattern: "function $NAME($$$)" },
		{ lang: "tsx", pattern: "export function $NAME($$$)" },
	],
	js: [
		{ lang: "javascript", pattern: "function $NAME($$$)" },
		{ lang: "javascript", pattern: "const $NAME = ($$$) =>" },
		{ lang: "javascript", pattern: "class $NAME" },
	],
	jsx: [
		{ lang: "javascript", pattern: "function $NAME($$$)" },
		{ lang: "javascript", pattern: "export function $NAME($$$)" },
	],
	py: [
		{ lang: "python", pattern: "def $NAME($$$):" },
		{ lang: "python", pattern: "class $NAME:" },
		{ lang: "python", pattern: "class $NAME($$$):" },
	],
	go: [
		{ lang: "go", pattern: "func $NAME($$$)" },
		{ lang: "go", pattern: "type $NAME struct" },
		{ lang: "go", pattern: "type $NAME interface" },
	],
	rs: [
		{ lang: "rust", pattern: "fn $NAME($$$)" },
		{ lang: "rust", pattern: "struct $NAME" },
		{ lang: "rust", pattern: "enum $NAME" },
		{ lang: "rust", pattern: "trait $NAME" },
		{ lang: "rust", pattern: "impl $NAME" },
	],
	rb: [
		{ lang: "ruby", pattern: "def $NAME" },
		{ lang: "ruby", pattern: "class $NAME" },
		{ lang: "ruby", pattern: "module $NAME" },
	],
	ex: [
		{ lang: "elixir", pattern: "def $NAME($$$) do" },
		{ lang: "elixir", pattern: "defmodule $NAME do" },
	],
	java: [
		{ lang: "java", pattern: "class $NAME" },
		{ lang: "java", pattern: "interface $NAME" },
	],
	kt: [
		{ lang: "kotlin", pattern: "fun $NAME($$$)" },
		{ lang: "kotlin", pattern: "class $NAME" },
	],
	swift: [
		{ lang: "swift", pattern: "func $NAME($$$)" },
		{ lang: "swift", pattern: "class $NAME" },
		{ lang: "swift", pattern: "struct $NAME" },
	],
	php: [
		{ lang: "php", pattern: "function $NAME($$$)" },
		{ lang: "php", pattern: "class $NAME" },
	],
	c: [{ lang: "c", pattern: "struct $NAME" }],
	cpp: [
		{ lang: "cpp", pattern: "class $NAME" },
		{ lang: "cpp", pattern: "struct $NAME" },
	],
	cs: [
		{ lang: "csharp", pattern: "class $NAME" },
		{ lang: "csharp", pattern: "interface $NAME" },
	],
};

async function extractSymbols(
	filePath: string,
): Promise<{ symbols: CodeSymbol[]; error?: string }> {
	const symbols: CodeSymbol[] = [];

	const ext = path.extname(filePath).slice(1);
	const patterns = QUICK_PATTERNS[ext];

	if (!patterns) {
		return { symbols };
	}

	for (const { lang, pattern } of patterns) {
		try {
			const { stdout } = await execAsync(
				`sg --pattern '${pattern}' --lang ${lang} --json "${filePath}"`,
				{ maxBuffer: 5 * 1024 * 1024 },
			);

			if (!stdout.trim()) continue;

			const matches = JSON.parse(stdout) as Array<{
				range: { start: { line: number } };
				metaVariables?: { single?: { NAME?: { text: string } } };
			}>;

			for (const match of matches) {
				const name = match.metaVariables?.single?.NAME?.text;
				if (name && !symbols.some((s) => s.name === name)) {
					symbols.push({
						name,
						type: getSymbolType(pattern),
						line: match.range.start.line,
					});
				}
			}
		} catch {
			// Pattern didn't match, continue
		}
	}

	// Sort by line number
	symbols.sort((a, b) => a.line - b.line);

	return { symbols };
}

function getSymbolType(pattern: string): string {
	if (pattern.includes("class")) return "class";
	if (pattern.includes("interface")) return "interface";
	if (pattern.includes("struct")) return "struct";
	if (pattern.includes("enum")) return "enum";
	if (pattern.includes("trait")) return "trait";
	if (pattern.includes("module")) return "module";
	if (pattern.includes("type")) return "type";
	if (pattern.includes("const")) return "const";
	if (pattern.includes("def ")) return "fn";
	if (pattern.includes("func ")) return "fn";
	if (pattern.includes("fn ")) return "fn";
	if (pattern.includes("function")) return "fn";
	return "symbol";
}

async function findSourceFiles(dir: string, maxDepth = 5): Promise<string[]> {
	const files: string[] = [];
	const extensions = Object.keys(QUICK_PATTERNS);

	async function walk(currentDir: string, depth: number) {
		if (depth > maxDepth) return;

		try {
			const entries = await fs.readdir(currentDir, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = path.join(currentDir, entry.name);

				// Skip common non-source directories
				if (entry.isDirectory()) {
					if (
						entry.name === "node_modules" ||
						entry.name === ".git" ||
						entry.name === "dist" ||
						entry.name === "build" ||
						entry.name === ".next" ||
						entry.name === "__pycache__" ||
						entry.name === "target" ||
						entry.name === "vendor" ||
						entry.name.startsWith(".")
					) {
						continue;
					}
					await walk(fullPath, depth + 1);
				} else {
					const ext = path.extname(entry.name).slice(1);
					if (extensions.includes(ext)) {
						files.push(fullPath);
					}
				}
			}
		} catch {
			// Directory not readable
		}
	}

	await walk(dir, 0);
	return files;
}

function buildTree(
	files: Array<{ path: string; symbols: CodeSymbol[] }>,
	baseDir: string,
): FileNode {
	const root: FileNode = {
		name: path.basename(baseDir),
		path: baseDir,
		symbols: [],
		children: new Map(),
	};

	for (const file of files) {
		const relativePath = path.relative(baseDir, file.path);
		const parts = relativePath.split(path.sep);

		let current = root;
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			const isFile = i === parts.length - 1;

			if (!current.children.has(part)) {
				current.children.set(part, {
					name: part,
					path: path.join(baseDir, ...parts.slice(0, i + 1)),
					symbols: isFile ? file.symbols : [],
					children: new Map(),
				});
			} else if (isFile) {
				const node = current.children.get(part);
				if (node) {
					node.symbols = file.symbols;
				}
			}

			const next = current.children.get(part);
			if (next) {
				current = next;
			}
		}
	}

	return root;
}

function renderTree(
	node: FileNode,
	prefix = "",
	isLast = true,
	isRoot = true,
): string {
	const lines: string[] = [];

	if (!isRoot) {
		const connector = isLast ? "└── " : "├── ";
		const symbolList =
			node.symbols.length > 0
				? ` (${node.symbols.map((s) => s.name).join(", ")})`
				: "";
		lines.push(`${prefix}${connector}${node.name}${symbolList}`);
	} else {
		lines.push(`${node.name}/`);
	}

	const children = Array.from(node.children.values());
	// Sort: directories first, then files
	children.sort((a, b) => {
		const aIsDir = a.children.size > 0;
		const bIsDir = b.children.size > 0;
		if (aIsDir && !bIsDir) return -1;
		if (!aIsDir && bIsDir) return 1;
		return a.name.localeCompare(b.name);
	});

	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		const childIsLast = i === children.length - 1;
		const newPrefix = isRoot ? "" : prefix + (isLast ? "    " : "│   ");
		lines.push(renderTree(child, newPrefix, childIsLast, false));
	}

	return lines.join("\n");
}

function renderCompact(
	files: Array<{ path: string; symbols: CodeSymbol[] }>,
	baseDir: string,
): string {
	const lines: string[] = [];

	// Group by directory
	const byDir = new Map<string, Array<{ name: string; symbols: string[] }>>();

	for (const file of files) {
		const relativePath = path.relative(baseDir, file.path);
		const dir = path.dirname(relativePath);
		const fileName = path.basename(relativePath);

		if (!byDir.has(dir)) {
			byDir.set(dir, []);
		}

		const dirFiles = byDir.get(dir);
		if (dirFiles) {
			dirFiles.push({
				name: fileName,
				symbols: file.symbols.map((s) => s.name),
			});
		}
	}

	// Sort directories
	const sortedDirs = Array.from(byDir.keys()).sort();

	for (const dir of sortedDirs) {
		const files = byDir.get(dir);
		if (!files) continue;

		lines.push(dir === "." ? "" : `${dir}/`);

		for (const file of files) {
			const symbolStr =
				file.symbols.length > 0 ? ` → ${file.symbols.join(", ")}` : "";
			lines.push(`  ${file.name}${symbolStr}`);
		}
	}

	return lines.join("\n");
}

export default tool({
	description:
		"Generate a compact repository map showing file structure with key symbols (functions, classes, etc). Inspired by Aider's repo-map. Great for understanding codebase structure.",
	args: {
		path: tool.schema
			.string()
			.optional()
			.describe("Directory to map. Defaults to 'src' or current directory."),
		format: tool.schema
			.string()
			.optional()
			.describe(
				"Output format: 'tree' (visual tree), 'compact' (grouped by dir), 'symbols-only' (just symbols). Default: tree",
			),
		maxDepth: tool.schema
			.number()
			.optional()
			.describe("Maximum directory depth to traverse. Default: 5"),
		includeSymbols: tool.schema
			.boolean()
			.optional()
			.describe(
				"Include symbol names in output. Default: true. Set false for structure only.",
			),
	},
	async execute(args, _context) {
		const { path: inputPath, format, maxDepth, includeSymbols } = args;
		const targetDir = (inputPath as string) || (await getDefaultDir());
		const depth = (maxDepth as number) ?? 5;
		const showSymbols = includeSymbols !== false;
		const outputFormat = (format as string) || "tree";

		// Check if ast-grep is available
		try {
			await execAsync("sg --version");
		} catch {
			return "Error: ast-grep (sg) not installed. Run: npm install -g @ast-grep/cli";
		}

		// Find source files
		const absPath = path.isAbsolute(targetDir)
			? targetDir
			: path.join(process.cwd(), targetDir);

		try {
			await fs.access(absPath);
		} catch {
			return `Error: Directory not found: ${targetDir}`;
		}

		const sourceFiles = await findSourceFiles(absPath, depth);

		if (sourceFiles.length === 0) {
			return `No source files found in ${targetDir}`;
		}

		// Extract symbols if needed
		const filesWithSymbols: Array<{ path: string; symbols: CodeSymbol[] }> = [];

		for (const file of sourceFiles) {
			if (showSymbols) {
				const { symbols } = await extractSymbols(file);
				filesWithSymbols.push({ path: file, symbols });
			} else {
				filesWithSymbols.push({ path: file, symbols: [] });
			}
		}

		// Sort by path
		filesWithSymbols.sort((a, b) => a.path.localeCompare(b.path));

		// Generate output
		let output: string;

		switch (outputFormat) {
			case "compact":
				output = renderCompact(filesWithSymbols, absPath);
				break;
			case "symbols-only": {
				const symbolLines = filesWithSymbols
					.filter((f) => f.symbols.length > 0)
					.map((f) => {
						const rel = path.relative(absPath, f.path);
						return `${rel}: ${f.symbols.map((s) => s.name).join(", ")}`;
					});
				output = symbolLines.join("\n");
				break;
			}
			default: {
				const tree = buildTree(filesWithSymbols, absPath);
				output = renderTree(tree);
			}
		}

		const stats = {
			files: sourceFiles.length,
			symbols: filesWithSymbols.reduce((sum, f) => sum + f.symbols.length, 0),
		};

		return `# Repository Map: ${path.basename(absPath)}\n\n${output}\n\n---\n📁 ${stats.files} files | 🔣 ${stats.symbols} symbols`;
	},
});

async function getDefaultDir(): Promise<string> {
	// Try common source directories
	for (const dir of ["src", "lib", "app", "."]) {
		try {
			await fs.access(path.join(process.cwd(), dir));
			return dir;
		} catch {
			// Continue to next
		}
	}
	return ".";
}
