import { tool } from "@opencode-ai/plugin";

// Configuration - Qwen3-Embedding-0.6B
// Better for code, multilingual (100+ langs), instruction-aware
// See: https://ollama.com/library/qwen3-embedding
const OLLAMA_MODEL = "qwen3-embedding:0.6b";
const OLLAMA_DIMENSIONS = 1024;
const OLLAMA_BASE_URL = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";

interface EmbeddingResult {
	text: string;
	embedding: number[];
	model: string;
	dimensions: number;
}

interface BatchEmbeddingResult {
	results: EmbeddingResult[];
	failed: { text: string; error: string }[];
	model: string;
}

async function checkOllamaRunning(): Promise<boolean> {
	try {
		const response = await fetch(`${OLLAMA_BASE_URL}/api/version`, {
			method: "GET",
			signal: AbortSignal.timeout(3000),
		});
		return response.ok;
	} catch {
		return false;
	}
}

async function ensureModelAvailable(): Promise<{
	ok: boolean;
	error?: string;
}> {
	try {
		const listResponse = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
			method: "GET",
			signal: AbortSignal.timeout(5000),
		});

		if (!listResponse.ok) {
			return { ok: false, error: "Failed to list models" };
		}

		const data = (await listResponse.json()) as {
			models?: { name: string }[];
		};
		const models = data.models || [];
		const modelExists = models.some(
			(m) => m.name === OLLAMA_MODEL || m.name === `${OLLAMA_MODEL}:latest`,
		);

		if (modelExists) {
			return { ok: true };
		}

		return {
			ok: false,
			error: `Model '${OLLAMA_MODEL}' not found. Run: ollama pull ${OLLAMA_MODEL}`,
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return { ok: false, error: `Failed to check models: ${message}` };
	}
}

async function embedWithOllama(
	texts: string[],
): Promise<{ embeddings: number[][]; error?: string }> {
	try {
		const embeddings: number[][] = [];

		for (const text of texts) {
			const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					model: OLLAMA_MODEL,
					prompt: text,
				}),
				signal: AbortSignal.timeout(30000),
			});

			if (!response.ok) {
				const errorText = await response.text();
				return {
					embeddings: [],
					error: `Ollama API error (${response.status}): ${errorText}`,
				};
			}

			const data = (await response.json()) as { embedding?: number[] };
			if (!data.embedding) {
				return { embeddings: [], error: "No embedding in response" };
			}

			embeddings.push(data.embedding);
		}

		return { embeddings };
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);

		if (message.includes("ECONNREFUSED") || message.includes("fetch failed")) {
			return {
				embeddings: [],
				error: "Cannot connect to Ollama. See .opencode/README.md for setup.",
			};
		}

		return { embeddings: [], error: `Ollama error: ${message}` };
	}
}

export default tool({
	description: `Generate embeddings using Ollama (${OLLAMA_MODEL}). Requires Ollama running locally.`,
	args: {
		text: tool.schema
			.union([tool.schema.string(), tool.schema.array(tool.schema.string())])
			.describe("Text or array of texts to embed"),
	},
	execute: async (args: { text: string | string[] }) => {
		const texts = Array.isArray(args.text) ? args.text : [args.text];

		if (texts.length === 0) {
			return "Error: No text provided";
		}

		const maxChars = 32000;
		const longTexts = texts.filter((t) => t.length > maxChars);
		if (longTexts.length > 0) {
			return `Error: ${longTexts.length} text(s) exceed ${maxChars} char limit`;
		}

		const ollamaRunning = await checkOllamaRunning();
		if (!ollamaRunning) {
			return "Error: Ollama not running. See .opencode/README.md for setup.";
		}

		const modelCheck = await ensureModelAvailable();
		if (!modelCheck.ok) {
			return `Error: ${modelCheck.error}. See .opencode/README.md for setup.`;
		}

		const result = await embedWithOllama(texts);

		if (result.error) {
			return `Error: ${result.error}`;
		}

		const response: BatchEmbeddingResult = {
			results: texts.map((text, i) => ({
				text: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
				embedding: result.embeddings[i],
				model: OLLAMA_MODEL,
				dimensions: OLLAMA_DIMENSIONS,
			})),
			failed: [],
			model: OLLAMA_MODEL,
		};

		return JSON.stringify(response, null, 2);
	},
});

// Export for other tools (memory-index, observation)
export async function generateEmbedding(
	text: string,
): Promise<{ embedding: number[]; model: string } | null> {
	const ollamaRunning = await checkOllamaRunning();
	if (!ollamaRunning) return null;

	const result = await embedWithOllama([text]);
	if (result.error || result.embeddings.length === 0) return null;

	return { embedding: result.embeddings[0], model: OLLAMA_MODEL };
}

export const EMBEDDING_DIMENSIONS = OLLAMA_DIMENSIONS;
