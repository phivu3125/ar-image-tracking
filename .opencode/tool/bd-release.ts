import fs from "node:fs/promises";
import path from "node:path";
import { tool } from "@opencode-ai/plugin";

const RESERVATIONS_DIR = ".reservations";

function lockDir(filePath: string): string {
	const safe = filePath.replace(/[/\\]/g, "_").replace(/\.\./g, "_");
	return path.join(RESERVATIONS_DIR, `${safe}.lock`);
}

export default tool({
	description:
		"Release file locks. If no paths specified, lists all active locks.",
	args: {
		paths: tool.schema
			.array(tool.schema.string())
			.optional()
			.describe("File paths to unlock (empty = list locks)"),
	},
	execute: async (args) => {
		const cwd = process.cwd();
		const reservationsPath = path.join(cwd, RESERVATIONS_DIR);

		// If no paths, list locks
		if (!args.paths?.length) {
			try {
				const entries = await fs.readdir(reservationsPath);
				const locks = [];
				const now = Date.now();

				for (const entry of entries) {
					if (entry.endsWith(".lock")) {
						const metaPath = path.join(reservationsPath, entry, "meta.json");
						try {
							const content = await fs.readFile(metaPath, "utf-8");
							const lock = JSON.parse(content);
							if (lock.expires > now) {
								locks.push({
									path: lock.path,
									agent: lock.agent,
									expires: new Date(lock.expires).toISOString(),
								});
							}
						} catch {
							// Skip invalid locks
						}
					}
				}

				return JSON.stringify({ locks, count: locks.length });
			} catch {
				return JSON.stringify({ locks: [], count: 0 });
			}
		}

		// Release specified paths
		const released: string[] = [];
		for (const filePath of args.paths) {
			const lockPath = path.join(cwd, lockDir(filePath));
			try {
				await fs.rm(lockPath, { recursive: true });
				released.push(filePath);
			} catch {
				// Already released or never locked
			}
		}

		return JSON.stringify({ released });
	},
});
