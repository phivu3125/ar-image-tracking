/**
 * OpenCode Truncator Plugin
 * Warns when tools return large outputs under context pressure
 *
 * Note: This doesn't actually truncate - OpenCode handles that via compaction.prune.
 * This only adds WARNINGS that OpenCode doesn't provide.
 */

import type { Plugin } from "@opencode-ai/plugin";

export const TruncatorPlugin: Plugin = async ({ client }) => {
	const sessionContext = new Map<string, number>();

	return {
		event: async ({ event }) => {
			const props = event.properties as Record<string, unknown>;

			if (event.type === "session.updated") {
				const info = props?.info as Record<string, unknown> | undefined;
				const tokenStats = (info?.tokens || props?.tokens) as
					| { used: number; limit: number }
					| undefined;
				const sessionId = (info?.id || props?.sessionID) as string | undefined;

				if (sessionId && tokenStats?.used && tokenStats?.limit) {
					sessionContext.set(
						sessionId,
						Math.round((tokenStats.used / tokenStats.limit) * 100),
					);
				}
			}

			if (event.type === "session.deleted") {
				const sessionId = props?.sessionID as string | undefined;
				if (sessionId) {
					sessionContext.delete(sessionId);
				}
			}
		},

		"tool.execute.after": async (input, output) => {
			const pct = sessionContext.get(input.sessionID) || 0;
			if (pct < 70) return; // Only warn under pressure

			// Thresholds get tighter as context fills up
			const threshold = pct >= 95 ? 5000 : pct >= 85 ? 10000 : 20000;
			const outputStr = output.output || "";

			if (outputStr.length > threshold) {
				await client.app
					.log({
						body: {
							service: "truncator",
							level: pct >= 95 ? "warn" : "info",
							message: `Large output from ${input.tool}: ${outputStr.length} chars (threshold: ${threshold}, context: ${pct}%)`,
						},
					})
					.catch(() => {});
			}
		},
	};
};
