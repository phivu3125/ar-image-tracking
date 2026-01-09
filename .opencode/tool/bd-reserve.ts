import fs from "node:fs/promises";
import path from "node:path";
import { tool } from "@opencode-ai/plugin";

const RESERVATIONS_DIR = ".reservations";

interface LockData {
	path: string;
	agent: string;
	reason?: string;
	created: number;
	expires: number;
}

function lockDir(filePath: string): string {
	const safe = filePath.replace(/[/\\]/g, "_").replace(/\.\./g, "_");
	return path.join(RESERVATIONS_DIR, `${safe}.lock`);
}

export default tool({
	description:
		"Lock files for editing to prevent conflicts between agents. Uses atomic mkdir-based locking.",
	args: {
		paths: tool.schema
			.array(tool.schema.string())
			.describe("File paths to lock"),
		reason: tool.schema
			.string()
			.optional()
			.describe("Why reserving these files"),
		ttl: tool.schema
			.number()
			.optional()
			.default(600)
			.describe("Lock TTL in seconds (default 600 = 10 min)"),
	},
	execute: async (args, context) => {
		if (!args.paths?.length) {
			return JSON.stringify({ error: "paths required" });
		}

		const cwd = process.cwd();
		const agentId = context?.agent || `agent-${process.pid}`;
		const ttlSeconds = args.ttl || 600;
		const now = Date.now();
		const expires = now + ttlSeconds * 1000;

		// Ensure reservations dir exists
		await fs.mkdir(path.join(cwd, RESERVATIONS_DIR), { recursive: true });

		const granted: string[] = [];
		const conflicts: { path: string; holder?: string }[] = [];

		for (const filePath of args.paths) {
			const lockPath = path.join(cwd, lockDir(filePath));
			const metaPath = path.join(lockPath, "meta.json");

			try {
				// Atomic: mkdir fails if dir exists
				await fs.mkdir(lockPath, { recursive: false });

				// Lock acquired - write metadata
				const lockData: LockData = {
					path: filePath,
					agent: agentId,
					reason: args.reason,
					created: now,
					expires,
				};
				await fs.writeFile(metaPath, JSON.stringify(lockData), "utf-8");
				granted.push(filePath);
			} catch (e) {
				const err = e as NodeJS.ErrnoException;
				if (err.code === "EEXIST") {
					// Lock exists - check if expired or ours
					try {
						const content = await fs.readFile(metaPath, "utf-8");
						const lock: LockData = JSON.parse(content);

						if (lock.expires < now) {
							// Expired - remove and retry
							await fs.rm(lockPath, { recursive: true });
							// Retry acquisition
							try {
								await fs.mkdir(lockPath, { recursive: false });
								const lockData: LockData = {
									path: filePath,
									agent: agentId,
									reason: args.reason,
									created: now,
									expires,
								};
								await fs.writeFile(metaPath, JSON.stringify(lockData), "utf-8");
								granted.push(filePath);
							} catch {
								conflicts.push({ path: filePath });
							}
						} else if (lock.agent === agentId) {
							// We already hold it - refresh
							lock.expires = expires;
							await fs.writeFile(metaPath, JSON.stringify(lock), "utf-8");
							granted.push(filePath);
						} else {
							conflicts.push({ path: filePath, holder: lock.agent });
						}
					} catch {
						// Corrupted lock - remove and retry
						await fs.rm(lockPath, { recursive: true, force: true });
						conflicts.push({ path: filePath });
					}
				} else {
					conflicts.push({ path: filePath });
				}
			}
		}

		const response: Record<string, unknown> = { granted };
		if (conflicts.length) response.conflicts = conflicts;
		return JSON.stringify(response);
	},
});
