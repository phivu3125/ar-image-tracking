import { type ChildProcess, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Plugin } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin/tool";

interface McpServerConfig {
	command: string;
	args?: string[];
	env?: Record<string, string>;
}

interface McpClient {
	process: ChildProcess;
	config: McpServerConfig;
	requestId: number;
	pendingRequests: Map<
		number,
		{ resolve: (v: any) => void; reject: (e: any) => void }
	>;
	capabilities?: {
		tools?: any[];
		resources?: any[];
		prompts?: any[];
	};
}

interface SkillMcpState {
	clients: Map<string, McpClient>; // key: skillName:serverName
	loadedSkills: Map<string, Record<string, McpServerConfig>>; // skillName -> mcp configs
}

function parseYamlFrontmatter(content: string): {
	frontmatter: any;
	body: string;
} {
	const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!match) return { frontmatter: {}, body: content };

	const yamlStr = match[1];
	const body = match[2];

	// Simple YAML parser for our use case
	const frontmatter: any = {};
	let currentKey = "";
	let currentIndent = 0;
	let mcpConfig: any = null;
	let serverName = "";
	let serverConfig: any = {};

	for (const line of yamlStr.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;

		const indent = line.search(/\S/);
		const keyMatch = trimmed.match(/^([\w-]+):\s*(.*)$/);

		if (keyMatch) {
			const [, key, value] = keyMatch;

			if (indent === 0) {
				// Top-level key
				if (key === "mcp") {
					mcpConfig = {};
					frontmatter.mcp = mcpConfig;
				} else {
					frontmatter[key] = value || undefined;
				}
				currentKey = key;
				currentIndent = indent;
			} else if (mcpConfig !== null && indent === 2) {
				// Server name under mcp
				serverName = key;
				serverConfig = {};
				mcpConfig[serverName] = serverConfig;
			} else if (serverConfig && indent === 4) {
				// Server config property
				if (key === "command") {
					serverConfig.command = value;
				} else if (key === "args") {
					// Parse inline array or set up for multi-line
					if (value.startsWith("[")) {
						try {
							serverConfig.args = JSON.parse(value);
						} catch {
							serverConfig.args = [];
						}
					} else {
						serverConfig.args = [];
					}
				}
			}
		} else if (trimmed.startsWith("- ") && serverConfig?.args) {
			// Array item for args
			const item = trimmed.slice(2).replace(/^["']|["']$/g, "");
			serverConfig.args.push(item);
		}
	}

	return { frontmatter, body };
}

function findSkillPath(skillName: string, projectDir: string): string | null {
	const locations = [
		join(projectDir, ".opencode", "skill", skillName, "SKILL.md"),
		join(homedir(), ".config", "opencode", "skill", skillName, "SKILL.md"),
	];

	for (const loc of locations) {
		if (existsSync(loc)) return loc;
	}
	return null;
}

export const SkillMcpPlugin: Plugin = async ({ directory }) => {
	const state: SkillMcpState = {
		clients: new Map(),
		loadedSkills: new Map(),
	};

	function getClientKey(skillName: string, serverName: string): string {
		return `${skillName}:${serverName}`;
	}

	async function sendRequest(
		client: McpClient,
		method: string,
		params?: any,
	): Promise<any> {
		return new Promise((resolve, reject) => {
			const id = ++client.requestId;
			const request = {
				jsonrpc: "2.0",
				id,
				method,
				params: params || {},
			};

			client.pendingRequests.set(id, { resolve, reject });

			const timeout = setTimeout(() => {
				client.pendingRequests.delete(id);
				reject(new Error(`Request timeout: ${method}`));
			}, 30000);

			client.pendingRequests.set(id, {
				resolve: (v) => {
					clearTimeout(timeout);
					resolve(v);
				},
				reject: (e) => {
					clearTimeout(timeout);
					reject(e);
				},
			});

			client.process.stdin?.write(`${JSON.stringify(request)}\n`);
		});
	}

	async function connectServer(
		skillName: string,
		serverName: string,
		config: McpServerConfig,
	): Promise<McpClient> {
		const key = getClientKey(skillName, serverName);

		// Return existing client if connected
		const existing = state.clients.get(key);
		if (existing && !existing.process.killed) {
			return existing;
		}

		// Spawn MCP server process
		const proc = spawn(config.command, config.args || [], {
			stdio: ["pipe", "pipe", "pipe"],
			env: { ...process.env, ...config.env },
			shell: true,
		});

		const client: McpClient = {
			process: proc,
			config,
			requestId: 0,
			pendingRequests: new Map(),
		};

		// Handle stdout (JSON-RPC responses)
		let buffer = "";
		proc.stdout?.on("data", (data) => {
			buffer += data.toString();
			const lines = buffer.split("\n");
			buffer = lines.pop() || "";

			for (const line of lines) {
				if (!line.trim()) continue;
				try {
					const response = JSON.parse(line);
					if (response.id !== undefined) {
						const pending = client.pendingRequests.get(response.id);
						if (pending) {
							client.pendingRequests.delete(response.id);
							if (response.error) {
								pending.reject(new Error(response.error.message));
							} else {
								pending.resolve(response.result);
							}
						}
					}
				} catch {}
			}
		});

		proc.on("error", (err) => {
			console.error(`MCP server error [${key}]:`, err.message);
		});

		proc.on("exit", (code) => {
			state.clients.delete(key);
		});

		state.clients.set(key, client);

		// Initialize connection
		try {
			await sendRequest(client, "initialize", {
				protocolVersion: "2024-11-05",
				capabilities: {},
				clientInfo: { name: "opencode-skill-mcp", version: "1.0.0" },
			});

			// Send initialized notification
			proc.stdin?.write(
				`${JSON.stringify({
					jsonrpc: "2.0",
					method: "notifications/initialized",
				})}\n`,
			);

			// Discover capabilities
			try {
				const toolsResult = await sendRequest(client, "tools/list", {});
				client.capabilities = { tools: toolsResult.tools || [] };
			} catch {
				client.capabilities = { tools: [] };
			}
		} catch (e: any) {
			proc.kill();
			state.clients.delete(key);
			throw new Error(`Failed to initialize MCP server: ${e.message}`);
		}

		return client;
	}

	function disconnectAll() {
		for (const [key, client] of state.clients) {
			client.process.kill();
		}
		state.clients.clear();
	}

	return {
		tool: {
			skill_mcp: tool({
				description: `Invoke MCP tools from skill-embedded MCP servers.

When a skill declares MCP servers in its YAML frontmatter, use this tool to:
- List available tools: skill_mcp(skill_name="playwright", list_tools=true)
- Call a tool: skill_mcp(skill_name="playwright", tool_name="browser_navigate", arguments='{"url": "..."}')

The skill must be loaded first via the skill() tool to register its MCP config.`,
				args: {
					skill_name: tool.schema
						.string()
						.describe("Name of the loaded skill with MCP config"),
					mcp_name: tool.schema
						.string()
						.optional()
						.describe("Specific MCP server name (if skill has multiple)"),
					list_tools: tool.schema
						.boolean()
						.optional()
						.describe("List available tools from this MCP"),
					tool_name: tool.schema
						.string()
						.optional()
						.describe("MCP tool to invoke"),
					arguments: tool.schema
						.string()
						.optional()
						.describe("JSON string of tool arguments"),
				},
				async execute(args) {
					const {
						skill_name,
						mcp_name,
						list_tools,
						tool_name,
						arguments: argsJson,
					} = args;

					if (!skill_name) {
						return JSON.stringify({ error: "skill_name required" });
					}

					// Find skill and parse its MCP config
					const skillPath = findSkillPath(skill_name, directory);
					if (!skillPath) {
						return JSON.stringify({ error: `Skill '${skill_name}' not found` });
					}

					const content = readFileSync(skillPath, "utf-8");
					const { frontmatter } = parseYamlFrontmatter(content);

					if (!frontmatter.mcp || Object.keys(frontmatter.mcp).length === 0) {
						return JSON.stringify({
							error: `Skill '${skill_name}' has no MCP config`,
						});
					}

					// Determine which MCP server to use
					const mcpServers = frontmatter.mcp as Record<string, McpServerConfig>;
					const serverNames = Object.keys(mcpServers);
					const targetServer = mcp_name || serverNames[0];

					if (!mcpServers[targetServer]) {
						return JSON.stringify({
							error: `MCP server '${targetServer}' not found in skill`,
							available: serverNames,
						});
					}

					const serverConfig = mcpServers[targetServer];

					// Connect to MCP server
					let client: McpClient;
					try {
						client = await connectServer(
							skill_name,
							targetServer,
							serverConfig,
						);
					} catch (e: any) {
						return JSON.stringify({ error: `Failed to connect: ${e.message}` });
					}

					// List tools
					if (list_tools) {
						return JSON.stringify(
							{
								mcp: targetServer,
								tools:
									client.capabilities?.tools?.map((t: any) => ({
										name: t.name,
										description: t.description,
										schema: t.inputSchema,
									})) || [],
							},
							null,
							2,
						);
					}

					// Call tool
					if (tool_name) {
						let toolArgs = {};
						if (argsJson) {
							try {
								toolArgs = JSON.parse(argsJson);
							} catch (e) {
								return JSON.stringify({ error: "Invalid JSON in arguments" });
							}
						}

						try {
							const result = await sendRequest(client, "tools/call", {
								name: tool_name,
								arguments: toolArgs,
							});
							return JSON.stringify({ result }, null, 2);
						} catch (e: any) {
							return JSON.stringify({
								error: `Tool call failed: ${e.message}`,
							});
						}
					}

					return JSON.stringify({
						error: "Specify either list_tools=true or tool_name to call",
						mcp: targetServer,
						available_tools:
							client.capabilities?.tools?.map((t: any) => t.name) || [],
					});
				},
			}),

			skill_mcp_status: tool({
				description: "Show status of connected MCP servers from skills.",
				args: {},
				async execute() {
					const servers: any[] = [];
					for (const [key, client] of state.clients) {
						const [skillName, serverName] = key.split(":");
						servers.push({
							skill: skillName,
							server: serverName,
							connected: !client.process.killed,
							tools: client.capabilities?.tools?.length || 0,
						});
					}
					return JSON.stringify({
						connected_servers: servers,
						count: servers.length,
					});
				},
			}),

			skill_mcp_disconnect: tool({
				description:
					"Disconnect MCP servers. Use when done with browser automation etc.",
				args: {
					skill_name: tool.schema
						.string()
						.optional()
						.describe("Specific skill to disconnect (all if omitted)"),
				},
				async execute(args) {
					if (args.skill_name) {
						const toDisconnect: string[] = [];
						for (const key of state.clients.keys()) {
							if (key.startsWith(`${args.skill_name}:`)) {
								toDisconnect.push(key);
							}
						}
						for (const key of toDisconnect) {
							const client = state.clients.get(key);
							client?.process.kill();
							state.clients.delete(key);
						}
						return JSON.stringify({ disconnected: toDisconnect });
					}
					const count = state.clients.size;
					disconnectAll();
					return JSON.stringify({ disconnected: "all", count });
				},
			}),
		},

		event: async ({ event }) => {
			// Cleanup on session idle (closest available event)
			if (event.type === "session.idle") {
				// Optional: could disconnect idle servers here
			}
		},
	};
};
