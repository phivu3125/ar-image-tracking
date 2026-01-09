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
		"Send message to other agents or broadcast to all. Messages stored in .reservations/messages.jsonl.",
	args: {
		subj: tool.schema.string().describe("Message subject"),
		body: tool.schema.string().optional().describe("Message body"),
		to: tool.schema
			.string()
			.optional()
			.default("all")
			.describe("Recipient agent ID or 'all' for broadcast"),
		importance: tool.schema
			.string()
			.optional()
			.default("normal")
			.describe("Priority: low | normal | high"),
	},
	execute: async (args, context) => {
		if (!args.subj) {
			return JSON.stringify({ error: "subj required" });
		}

		const cwd = process.cwd();
		const agentId = context?.agent || `agent-${process.pid}`;
		const messagesPath = path.join(cwd, RESERVATIONS_DIR, MESSAGES_FILE);

		// Ensure dir exists
		await fs.mkdir(path.join(cwd, RESERVATIONS_DIR), { recursive: true });

		const msg: Message = {
			id: `msg-${Date.now().toString(36)}`,
			from: agentId,
			to: args.to || "all",
			subj: args.subj,
			body: args.body,
			importance: args.importance || "normal",
			at: Date.now(),
			read: false,
		};

		await fs.appendFile(messagesPath, `${JSON.stringify(msg)}\n`, "utf-8");
		return JSON.stringify({ ok: 1, id: msg.id });
	},
});
