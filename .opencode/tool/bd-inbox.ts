import fs from "node:fs/promises";
import path from "node:path";
import { tool } from "@opencode-ai/plugin";

const RESERVATIONS_DIR = ".reservations";
const MESSAGES_FILE = "messages.jsonl";

interface Message {
	id: string;
	from: string;
	to: string;
	subj: string;
	body?: string;
	importance: string;
	at: number;
	read: boolean;
}

export default tool({
	description:
		"Read messages from other agents. Returns most recent messages addressed to you or broadcast to 'all'.",
	args: {
		n: tool.schema
			.number()
			.optional()
			.default(5)
			.describe("Max messages to return"),
		unread: tool.schema
			.boolean()
			.optional()
			.default(false)
			.describe("Only show unread messages"),
		ack: tool.schema
			.array(tool.schema.string())
			.optional()
			.describe("Message IDs to mark as read"),
	},
	execute: async (args, context) => {
		const cwd = process.cwd();
		const agentId = context?.agent || `agent-${process.pid}`;
		const messagesPath = path.join(cwd, RESERVATIONS_DIR, MESSAGES_FILE);

		try {
			const content = await fs.readFile(messagesPath, "utf-8");
			if (!content.trim()) {
				return JSON.stringify({ msgs: [], count: 0 });
			}

			const idsToAck = new Set(args.ack || []);
			let messages: Message[] = [];
			const lines = content.trim().split("\n");

			for (const line of lines) {
				if (!line.trim()) continue;
				try {
					const msg = JSON.parse(line) as Message;
					// Filter to messages for this agent or broadcast
					if (msg.to === "all" || msg.to === agentId) {
						// Mark as read if in ack list
						if (idsToAck.has(msg.id)) {
							msg.read = true;
						}
						messages.push(msg);
					}
				} catch {
					// Skip invalid lines
				}
			}

			// If acking, rewrite the file
			if (idsToAck.size > 0) {
				const allMsgs: Message[] = [];
				for (const line of lines) {
					if (!line.trim()) continue;
					try {
						const msg = JSON.parse(line) as Message;
						if (idsToAck.has(msg.id)) {
							msg.read = true;
						}
						allMsgs.push(msg);
					} catch {
						// Skip
					}
				}
				await fs.writeFile(
					messagesPath,
					`${allMsgs.map((m) => JSON.stringify(m)).join("\n")}\n`,
					"utf-8",
				);
			}

			// Filter unread if requested
			if (args.unread) {
				messages = messages.filter((m) => !m.read);
			}

			// Return most recent N
			const limit = args.n || 5;
			messages = messages.slice(-limit).reverse();

			return JSON.stringify({ msgs: messages, count: messages.length });
		} catch (e) {
			const err = e as NodeJS.ErrnoException;
			if (err.code === "ENOENT") {
				return JSON.stringify({ msgs: [], count: 0 });
			}
			return JSON.stringify({ error: (e as Error).message });
		}
	},
});
