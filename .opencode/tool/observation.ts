import fs from "node:fs/promises";
import path from "node:path";
import * as lancedb from "@lancedb/lancedb";
import { tool } from "@opencode-ai/plugin";
import { generateEmbedding } from "./memory-embed";
import { searchVectorStore } from "./memory-index";

// Observation types following claude-mem patterns
type ObservationType =
	| "decision"
	| "bugfix"
	| "feature"
	| "pattern"
	| "discovery"
	| "learning"
	| "warning";

type ConfidenceLevel = "high" | "medium" | "low";

const TYPE_ICONS: Record<ObservationType, string> = {
	decision: "🎯",
	bugfix: "🐛",
	feature: "✨",
	pattern: "🔄",
	discovery: "💡",
	learning: "📚",
	warning: "⚠️",
};

const CONFIDENCE_ICONS: Record<ConfidenceLevel, string> = {
	high: "🟢",
	medium: "🟡",
	low: "🔴",
};

// Patterns to detect file references in observation content
const FILE_PATTERNS = [
	// file:line format (e.g., src/auth.ts:42)
	/(?:^|\s)([a-zA-Z0-9_\-./]+\.[a-zA-Z]{2,4}):(\d+)/g,
	// backtick file paths (e.g., `src/auth.ts`)
	/`([a-zA-Z0-9_\-./]+\.[a-zA-Z]{2,4})`/g,
	// common source paths
	/(?:^|\s)(src\/[a-zA-Z0-9_\-./]+\.[a-zA-Z]{2,4})/g,
	/(?:^|\s)(\.opencode\/[a-zA-Z0-9_\-./]+\.[a-zA-Z]{2,4})/g,
];

interface FileReference {
	file: string;
	line?: number;
}

interface CodeLink {
	name: string;
	type: string;
	file: string;
	line: number;
}

// Extract file references from observation content
function extractFileReferences(content: string): FileReference[] {
	const refs: FileReference[] = [];
	const seen = new Set<string>();

	for (const pattern of FILE_PATTERNS) {
		// Reset regex state
		pattern.lastIndex = 0;
		let match = pattern.exec(content);

		while (match !== null) {
			const file = match[1];
			const line = match[2] ? Number.parseInt(match[2], 10) : undefined;
			const key = `${file}:${line || ""}`;

			if (!seen.has(key) && !file.includes("node_modules")) {
				seen.add(key);
				refs.push({ file, line });
			}
			match = pattern.exec(content);
		}
	}

	return refs;
}

// Find related code definitions for an observation
async function findRelatedCode(
	title: string,
	content: string,
	fileRefs: FileReference[],
): Promise<CodeLink[]> {
	const links: CodeLink[] = [];

	try {
		// Search for code definitions related to the observation
		const searchQuery = `${title} ${fileRefs.map((r) => r.file).join(" ")}`;
		const results = await searchVectorStore(searchQuery, 5, "code");

		for (const result of results) {
			// Check if this code is in one of the referenced files
			const isDirectRef = fileRefs.some(
				(ref) =>
					result.file_path.includes(ref.file) ||
					ref.file.includes(result.file_path),
			);

			if (isDirectRef) {
				links.push({
					name: result.title.replace(/^(function|class|type|interface): /, ""),
					type: result.title.split(":")[0] || "code",
					file: result.file_path,
					line: 0, // Would need to parse from result
				});
			}
		}
	} catch {
		// Vector store might not have code indexed yet
	}

	return links.slice(0, 5); // Limit to 5 links
}

// Vector store configuration
const VECTOR_DB_PATH = ".opencode/memory/vector_db";
const TABLE_NAME = "memories";

async function addToVectorStore(
	filePath: string,
	title: string,
	content: string,
	fileType: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		const embeddingResult = await generateEmbedding(content.substring(0, 8000));
		if (!embeddingResult) {
			return { success: false, error: "Failed to generate embedding" };
		}

		const dbPath = path.join(process.cwd(), VECTOR_DB_PATH);
		await fs.mkdir(dbPath, { recursive: true });

		const db = await lancedb.connect(dbPath);
		const relativePath = path.relative(process.cwd(), filePath);

		const document: Record<string, unknown> = {
			id: relativePath.replace(/[\/\\]/g, "_"),
			file_path: relativePath,
			title,
			content,
			content_preview: content.substring(0, 500),
			embedding: embeddingResult.embedding,
			indexed_at: new Date().toISOString(),
			file_type: fileType,
		};

		let table: lancedb.Table;
		try {
			table = await db.openTable(TABLE_NAME);
			// Add to existing table
			await table.add([document]);
		} catch {
			// Table doesn't exist, create it
			await db.createTable(TABLE_NAME, [document]);
		}

		return { success: true };
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		return { success: false, error: msg };
	}
}

// Check for potentially contradicting observations
async function findSimilarObservations(
	title: string,
	content: string,
	concepts: string[],
): Promise<{ file: string; title: string; similarity: string }[]> {
	try {
		// Search for similar observations using semantic search
		const searchQuery = `${title} ${concepts.join(" ")}`;
		const similar = await searchVectorStore(searchQuery, 5, "observation");

		// Filter to only observations with high similarity
		return similar
			.filter((doc) => doc.title !== title) // Exclude self
			.slice(0, 3)
			.map((doc) => ({
				file: path.basename(doc.file_path),
				title: doc.title,
				similarity: "high",
			}));
	} catch {
		return [];
	}
}

export default tool({
	description:
		"Create a structured observation for future reference. Observations are categorized by type (decision, bugfix, feature, pattern, discovery, learning, warning) and stored in .opencode/memory/observations/.",
	args: {
		type: tool.schema
			.string()
			.describe(
				"Observation type: decision, bugfix, feature, pattern, discovery, learning, warning",
			),
		title: tool.schema.string().describe("Brief title for the observation"),
		content: tool.schema
			.string()
			.describe("Detailed observation content with context"),
		concepts: tool.schema
			.string()
			.optional()
			.describe(
				"Comma-separated concept tags (e.g., 'authentication, oauth, security')",
			),
		files: tool.schema
			.string()
			.optional()
			.describe(
				"Comma-separated related files (e.g., 'src/auth.ts, src/login.ts')",
			),
		bead_id: tool.schema
			.string()
			.optional()
			.describe("Related bead ID for traceability"),
		confidence: tool.schema
			.string()
			.optional()
			.describe(
				"Confidence level: high (verified), medium (likely), low (uncertain). Defaults to high.",
			),
		supersedes: tool.schema
			.string()
			.optional()
			.describe(
				"Filename of observation this supersedes (for contradiction handling)",
			),
	},
	execute: async (args: {
		type: string;
		title: string;
		content: string;
		concepts?: string;
		files?: string;
		bead_id?: string;
		confidence?: string;
		supersedes?: string;
	}) => {
		const obsDir = path.join(process.cwd(), ".opencode/memory/observations");

		// Validate type
		const validTypes: ObservationType[] = [
			"decision",
			"bugfix",
			"feature",
			"pattern",
			"discovery",
			"learning",
			"warning",
		];
		const obsType = args.type.toLowerCase() as ObservationType;
		if (!validTypes.includes(obsType)) {
			return `Error: Invalid observation type '${args.type}'.\nValid types: ${validTypes.join(", ")}`;
		}

		// Validate confidence level
		const validConfidence: ConfidenceLevel[] = ["high", "medium", "low"];
		const confidence = (args.confidence?.toLowerCase() ||
			"high") as ConfidenceLevel;
		if (!validConfidence.includes(confidence)) {
			return `Error: Invalid confidence level '${args.confidence}'.\nValid levels: ${validConfidence.join(", ")}`;
		}

		// Generate filename: YYYY-MM-DD-type-slug.md
		const now = new Date();
		const dateStr = now.toISOString().split("T")[0];
		const slug = args.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "")
			.substring(0, 40);
		const filename = `${dateStr}-${obsType}-${slug}.md`;
		const filePath = path.join(obsDir, filename);

		// Parse concepts and files
		const concepts = args.concepts
			? args.concepts.split(",").map((c) => c.trim())
			: [];
		let files = args.files ? args.files.split(",").map((f) => f.trim()) : [];

		// Auto-detect file references from content (Phase 2: Link to code)
		const detectedRefs = extractFileReferences(args.content);
		const detectedFiles = detectedRefs.map((r) => r.file);

		// Merge detected files with explicitly provided files
		const allFiles = [...new Set([...files, ...detectedFiles])];
		files = allFiles;

		// Find related code definitions
		const codeLinks = await findRelatedCode(
			args.title,
			args.content,
			detectedRefs,
		);

		// Build observation content with YAML frontmatter for temporal tracking
		const icon = TYPE_ICONS[obsType];
		const confidenceIcon = CONFIDENCE_ICONS[confidence];

		// YAML frontmatter for temporal validity (Graphiti-inspired)
		let observation = "---\n";
		observation += `type: ${obsType}\n`;
		observation += `created: ${now.toISOString()}\n`;
		observation += `confidence: ${confidence}\n`;
		observation += "valid_until: null\n"; // null = still valid
		observation += "superseded_by: null\n"; // null = not superseded
		if (args.supersedes) {
			observation += `supersedes: ${args.supersedes}\n`;
		}
		if (args.bead_id) {
			observation += `bead_id: ${args.bead_id}\n`;
		}
		if (concepts.length > 0) {
			observation += `concepts: [${concepts.map((c) => `"${c}"`).join(", ")}]\n`;
		}
		if (files.length > 0) {
			observation += `files: [${files.map((f) => `"${f}"`).join(", ")}]\n`;
		}
		if (codeLinks.length > 0) {
			observation += "code_links:\n";
			for (const link of codeLinks) {
				observation += `  - name: "${link.name}"\n`;
				observation += `    type: "${link.type}"\n`;
				observation += `    file: "${link.file}"\n`;
			}
		}
		observation += "---\n\n";

		// Content
		observation += `# ${icon} ${args.title}\n\n`;
		observation += `${confidenceIcon} **Confidence:** ${confidence}\n\n`;
		observation += args.content;
		observation += "\n";

		try {
			// Ensure directory exists
			await fs.mkdir(obsDir, { recursive: true });

			// Write observation
			await fs.writeFile(filePath, observation, "utf-8");

			// Generate embedding and add to vector store
			let embeddingStatus = "";
			const vectorResult = await addToVectorStore(
				filePath,
				args.title,
				observation,
				"observation",
			);
			if (vectorResult.success) {
				embeddingStatus = "\nEmbedding: ✓ Added to vector store";
			} else {
				embeddingStatus = `\nEmbedding: ⚠ ${vectorResult.error || "Failed"}`;
			}

			// Handle supersedes - update old observation's superseded_by field
			let supersedesStatus = "";
			if (args.supersedes) {
				try {
					const oldPath = path.join(obsDir, args.supersedes);
					const oldContent = await fs.readFile(oldPath, "utf-8");
					// Update superseded_by in frontmatter
					const updatedContent = oldContent.replace(
						/superseded_by: null/,
						`superseded_by: "${filename}"`,
					);
					if (updatedContent !== oldContent) {
						await fs.writeFile(oldPath, updatedContent, "utf-8");
						supersedesStatus = `\nSupersedes: ✓ Marked ${args.supersedes} as superseded`;
					}
				} catch {
					supersedesStatus = `\nSupersedes: ⚠ Could not update ${args.supersedes}`;
				}
			}

			let beadUpdate = "";

			// Check for similar/potentially contradicting observations
			let contradictionWarning = "";
			const similarObs = await findSimilarObservations(
				args.title,
				args.content,
				concepts,
			);
			if (similarObs.length > 0) {
				contradictionWarning =
					"\n\n⚠️ **Similar observations found** (potential contradictions):";
				for (const obs of similarObs) {
					contradictionWarning += `\n- ${obs.title} (\`${obs.file}\`)`;
				}
				contradictionWarning +=
					"\n\nIf this supersedes an older observation, use `supersedes` arg to mark it.";
			}

			// Update bead notes if bead_id provided
			if (args.bead_id) {
				try {
					const { execSync } = await import("node:child_process");
					const noteContent = `${icon} ${obsType}: ${args.title}`;
					execSync(
						`bd edit ${args.bead_id} --note "${noteContent.replace(/"/g, '\\"')}"`,
						{
							cwd: process.cwd(),
							encoding: "utf-8",
							timeout: 5000,
						},
					);
					beadUpdate = `\nBead updated: ${args.bead_id}`;
				} catch {
					beadUpdate = `\nWarning: Could not update bead ${args.bead_id}`;
				}
			}

			// Build code links info
			let codeLinksInfo = "";
			if (codeLinks.length > 0) {
				codeLinksInfo = `\nCode Links: ${codeLinks.map((l) => `${l.type}:${l.name}`).join(", ")}`;
			}

			// Build auto-detected files info
			let autoDetectedInfo = "";
			if (detectedFiles.length > 0) {
				autoDetectedInfo = `\nAuto-detected: ${detectedFiles.length} file reference(s)`;
			}

			return `✓ Observation saved: ${filename}\n\nType: ${icon} ${obsType}\nTitle: ${args.title}\nConfidence: ${confidenceIcon} ${confidence}\nConcepts: ${concepts.join(", ") || "none"}\nFiles: ${files.join(", ") || "none"}${codeLinksInfo}${autoDetectedInfo}${embeddingStatus}${supersedesStatus}${beadUpdate}${contradictionWarning}\n\nPath: ${filePath}`;
		} catch (error) {
			if (error instanceof Error) {
				return `Error saving observation: ${error.message}`;
			}
			return "Unknown error saving observation";
		}
	},
});
