# OpenCodeKit Template - Configuration Guide

**Project-specific OpenCode configuration and custom extensions.**

---

## Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .opencode/.env.example .opencode/.env

# Add required API keys (minimum)
# Edit .opencode/.env and add:
CONTEXT7_API_KEY=your_context7_api_key_here
EXA_API_KEY=your_exa_api_key_here
```

### 2. Verify Configuration

```bash
# Start OpenCode (should load without errors)
opencode

# Test MCP services
# In OpenCode chat: "search context7 for Next.js documentation"
```

---

## Directory Structure

```
.opencode/
├── .env.example           # Environment variables template (COPY TO .env)
├── README.md              # This file
├── opencode.json          # OpenCode configuration
├── AGENTS.md              # Global agent rules
│
├── agent/                 # Custom agents (5 total)
├── command/               # Custom commands (26 workflows)
├── skill/                 # Domain expertise (27 skills)
├── tool/                  # Custom MCP tools (memory-*, observation, ast-grep)
├── plugin/                # Background plugins (enforcer, compactor, truncator)
└── memory/                # Persistent context
```

---

## Required Environment Variables

**Minimum setup (.opencode/.env):**

```bash
# Required for core functionality
CONTEXT7_API_KEY=your_context7_api_key_here  # Library docs
EXA_API_KEY=your_exa_api_key_here            # Web search
```

**Optional (enable specific features):**

```bash
# Figma integration
FIGMA_API_KEY=your_figma_api_key_here

# Cloud deployments (devops skill)
CLOUDFLARE_API_TOKEN=your_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
```

**Get API keys:**

- Context7: https://context7.com
- Exa: https://exa.ai
- Figma: https://www.figma.com/developers/api#access-tokens

---

## Agent System (5 Custom + 2 Built-in)

**Primary Agents:**

- **@build** - Main orchestrator (Claude Opus 4.5) - handles 70% of work
- **@rush** - Fast agent (GLM-4.6) - same capabilities, faster

**Subagents:**

- **@planner** - Architecture, multi-phase coordination
- **@scout** - External research (library docs + GitHub patterns)
- **@review** - Code review + debugging + security audit
- **@vision** - UI/UX design: mockup, UI review, accessibility, aesthetics, visual

**Built-in (OpenCode):**

- **@explore** - Fast codebase search
- **@general** - Simple tasks and fallback

---

## Custom Commands (26 workflows)

**Invoke with `/` prefix:**

- `/commit` - Intelligent git commits
- `/pr` - Create pull requests
- `/design` - Thoughtful design with brainstorming expertise
- `/fix` - Systematic debugging with root-cause analysis
- `/implement` - High-quality implementation with TDD and subagents
- `/finish` - Verified completion with structured integration options

**See:** `.opencode/command/` for all commands

---

## Skills System (27 skills)

**Core:** brainstorming, writing-plans, executing-plans, verification-before-completion, using-superpowers, finishing-a-development-branch
**Code:** requesting-code-review, receiving-code-review, root-cause-tracing, test-driven-development, testing-anti-patterns, condition-based-waiting, defense-in-depth, systematic-debugging
**UI/UX:** frontend-aesthetics, mockup-to-code, visual-analysis, ui-ux-research, accessibility-audit, design-system-audit
**Workflow:** gemini-large-context, subagent-driven-development, dispatching-parallel-agents, using-git-worktrees, sharing-skills, writing-skills, testing-skills-with-subagents

**Note:** Skills load via native `skill()` tool. Commands auto-load relevant expertise.

---

## Memory System (2-Layer Architecture)

```
Memory (Permanent)     → Beads (Multi-session)    → Git (Audit Trail)
.opencode/memory/       .beads/artifacts/          .git/
```

**Memory:** Permanent knowledge, decisions, learnings  
**Beads:** Multi-session tasks with spec/research/plan/review artifacts  
**Git:** Automatic execution history

**See:** `AGENTS.md` for global rules and tool priority

---

## Active Plugins (Background)

Plugins run automatically in every session:

- **enforcer** - OS notification when session idles with incomplete TODOs
- **compactor** - Warns at 70%, 85%, 95% context usage - prevents rushed work
- **truncator** - Dynamic output truncation based on context remaining

**Compactor thresholds**:

- 70% - Gentle reminder, still plenty of room
- 85% - Consider pruning or summarizing
- 95% - Critical: prune immediately or start new session

---

## Custom Tools

- **memory-read** - Load previous context, templates
- **memory-update** - Save learnings, handoffs
- **memory-search** - Search across all memory files (keyword, semantic, hybrid)
- **memory-index** - Rebuild vector store for semantic search
- **memory-embed** - Generate embeddings using Ollama
- **observation** - Create structured observations (auto-embedded)
- **ast-grep** - Semantic code search/replace (AST-based)

---

## Semantic Memory Setup (Ollama)

Semantic search requires Ollama running locally. Zero API keys needed.

**Model:** `qwen3-embedding:0.6b` (639MB)

- State-of-the-art quality (MTEB #1 for 8B version)
- Code-aware (optimized for code retrieval)
- Multilingual (100+ languages including Vietnamese)
- 32K context, 1024 dimensions

### Installation

**macOS:**

```bash
brew install ollama
```

**Linux:**

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**

1. Download from https://ollama.com/download/windows
2. Run the installer
3. Ollama runs as a background service automatically

### Setup

```bash
# Start Ollama (macOS/Linux - if not running as service)
ollama serve

# Pull embedding model (one-time, ~639MB)
ollama pull qwen3-embedding:0.6b

# Verify
ollama list  # Should show qwen3-embedding:0.6b
```

**Linux:**

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**

1. Download from https://ollama.com/download/windows
2. Run the installer
3. Ollama runs as a background service automatically

### Setup

```bash
# Start Ollama (macOS/Linux - if not running as service)
ollama serve

# Pull embedding model (one-time, ~274MB)
ollama pull nomic-embed-text

# Verify
ollama list  # Should show nomic-embed-text
```

### Custom Host (Optional)

If Ollama runs on a different machine:

```bash
export OLLAMA_HOST=http://192.168.1.100:11434
```

### Usage

```bash
# Rebuild vector index (after adding new observations)
memory-index action=rebuild

# Search with semantic similarity
memory-search query="authentication patterns" mode=semantic

# Hybrid search (keyword + semantic)
memory-search query="auth" mode=hybrid
```

---

### AST-Grep Usage

Semantic code operations - smarter than regex:

```bash
# Search patterns
ast-grep pattern="console.log($$$)"                    # Find all console.log
ast-grep pattern="async function $NAME($$$) { $$$ }"   # Find async functions
ast-grep pattern="const [$S, $SET] = useState($$$)"    # Find React hooks

# Replace (dry run by default)
ast-grep pattern="oldFunc($$$)" rewrite="newFunc($$$)" dryRun=true
```

**Pattern syntax**: `$NAME` = single node, `$$$` = zero or more nodes

**Requires**: `brew install ast-grep` or `cargo install ast-grep --locked`

---

## MCP Services

**Enabled by default (3 total):**

1. **context7** - Up-to-date library documentation (37.6k+ libraries)
   - Requires: CONTEXT7_API_KEY
   - GitHub: https://github.com/upstash/context7

2. **exa** - Web search + code context (3.3k+ repos)
   - Requires: EXA_API_KEY
   - GitHub: https://github.com/exa-labs/exa-mcp-server

3. **gh_grep** - Search 1M+ public GitHub repositories
   - No API key needed (public service)
   - GitHub: https://github.com/Shachlan/grep.app-mcp

**Skill-Embedded MCP (load on-demand):**

4. **figma** - Extract Figma layouts and design tokens
   - Requires: FIGMA_API_KEY
   - Use: `skill({ name: "figma" })` then `skill_mcp()`

5. **playwright** - Browser automation for testing
   - No API key needed
   - Use: `skill({ name: "playwright" })` then `skill_mcp()`

6. **chrome-devtools** - DevTools for debugging and performance
   - No API key needed
   - Use: `skill({ name: "chrome-devtools" })` then `skill_mcp()`

---

## Getting Started Examples

### Simple Task

```
User: "Find all TypeScript files"
@build: [executes directly]
Result: 42 files found
```

### Research Task

```
User: "Research Next.js 14 App Router"
@build → @scout (docs + GitHub patterns)
Result: Comprehensive research doc
```

### Complex Feature

```
User: "Build auth system"
@build → @planner (4 phases)
@planner → @review (security audit)
Result: Secure auth with tests
```

### Using Commands

```
User: "/design implement dashboard"
@build: [loads brainstorming skill]
Result: Dashboard with shadcn/ui
```

---

## Troubleshooting

**"Notifications not working" (WSL/Windows):**

If running OpenCode in WSL, notifications require additional setup:

```bash
# 1. Install dependencies
sudo apt install -y libnotify-bin dunst

# 2. Start dunst (run each time you open WSL terminal)
dunst >/dev/null 2>&1 &

# 3. Or add to ~/.bashrc for auto-start:
if ! pgrep -x dunst >/dev/null; then
  dunst >/dev/null 2>&1 &
fi
```

**"API key not found":**

- Check .env location (.opencode/.env or ~/.config/opencode/.env)
- No quotes around values (CONTEXT7_API_KEY=abc not "abc")
- Restart OpenCode after changes

**"MCP server failed":**

- Check enabled: true in opencode.json
- Verify command path (python, npx in PATH)
- Check logs: ~/.config/opencode/logs/

**"Skills not loading":**

- Skills load via native `skill()` tool (auto-discovered)
- Use /design to load brainstorming
- Use /fix to load systematic-debugging
- Check `.opencode/skill/` directory exists

---

## Best Practices

**Environment:**

- Use .opencode/.env for project keys
- Use ~/.config/opencode/.env for global keys
- Never commit .env files
- Rotate API keys regularly

**Memory:**

- Update memory after major phases
- Document decisions in architecture notes
- Log blockers in research findings
- Keep research organized (YYYY-MM-DD-topic.md)

**Delegation:**

- Use @build for 70% of work
- Delegate to @planner for 3+ phases
- Use @review before deployment (code review + security)
- Use @scout for library docs + GitHub patterns
- Use @explore for codebase search

---

## Resources

- **OpenCode Docs:** https://opencode.ai/docs
- **Context7 API:** https://context7.com
- **Exa API:** https://exa.ai
- **Skills Documentation:** `.opencode/skill/`
- **Architecture Guide:** `AGENTS.md`

---

**OpenCodeKit v0.13.2**  
**Architecture:** Two-Layer (Memory + Beads + Git)  
**New in v0.13.2:** Multimodal support for gemini-claude models (image, PDF input)  
**Package:** `npx opencodekit` to scaffold new projects  
**Last Updated:** January 8, 2026
