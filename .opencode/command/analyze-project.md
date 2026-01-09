---
description: Analyze project health, status, and ready work with metrics
argument-hint: "[--quick|--deep|--health|--security]"
agent: explore
subtask: true
---

# Analyze Project

## Load Beads Skill

```typescript
skill({ name: "beads" });
```

## Phase 1: Quick Status Dashboard

Run these checks in parallel for speed:

```
# Git status
!`git status --short`
!`git branch --show-current`
!`git log --oneline -3`

# Beads status
!`bd status`
!`bd list --status open --limit 5`
!`bd list --status ready --limit 5`

# CI/CD status (GitHub Actions)
!`gh run list --limit 5`

# Last commit info
!`git log -1 --format="%h %s (%cr by %an)"`
```

### Status Dashboard Output

```markdown
## Project Status Dashboard

| Category         | Status                | Details                        |
| ---------------- | --------------------- | ------------------------------ |
| **Branch**       | `main`                | 3 commits ahead of origin      |
| **Working Tree** | Clean / Dirty         | X files modified               |
| **Last Commit**  | `abc123`              | "feat: add auth" (2 hours ago) |
| **CI Status**    | Pass / Fail / Running | Last run: 2h ago               |
| **Open Tasks**   | X beads               | Y ready, Z blocked             |
| **Dependencies** | X outdated            | Y security issues              |
```

---

## Phase 2: Tech Stack Detection

Detect project technology:

```
# Package manager & framework
!`ls package.json pyproject.toml Cargo.toml go.mod pom.xml build.gradle`

# Read main config (instructional - agent must read this file)
# Read package.json  # or equivalent
```

### Tech Stack Analysis

| Aspect                | Detection Method          | Example Output                   |
| --------------------- | ------------------------- | -------------------------------- |
| **Language**          | File extensions, config   | TypeScript, Python, Rust         |
| **Framework**         | package.json dependencies | Next.js 14, FastAPI, Axum        |
| **Package Manager**   | Lock file presence        | npm, pnpm, yarn, bun             |
| **Testing**           | Test framework in deps    | Jest, Vitest, pytest, cargo test |
| **Linting**           | Config files              | ESLint, Biome, Ruff              |
| **Formatting**        | Config files              | Prettier, Biome, Black           |
| **CI/CD**             | Workflow files            | GitHub Actions, GitLab CI        |
| **Database**          | Dependencies, .env        | PostgreSQL, SQLite, MongoDB      |
| **UI Framework**      | Dependencies              | React, Vue, Svelte               |
| **Component Library** | components.json, deps     | shadcn/ui, MUI, Chakra           |

```markdown
## Tech Stack

| Category        | Technology | Version |
| --------------- | ---------- | ------- |
| Language        | TypeScript | 5.3.x   |
| Runtime         | Node.js    | 20.x    |
| Framework       | Next.js    | 14.2    |
| Package Manager | pnpm       | 8.x     |
| Testing         | Vitest     | 1.x     |
| Linting         | Biome      | 1.x     |
| UI              | shadcn/ui  | latest  |
| Database        | PostgreSQL | 16      |
```

---

## Phase 3: Health Metrics

### 3.1 Dependency Health

```bash
# Node.js
!`npm outdated --json || pnpm outdated --json`
!`npm audit --json`

# Python
!`pip list --outdated`
!`pip-audit`

# Rust
!`cargo outdated`
cargo audit
```

**Dependency Dashboard:**

| Metric                   | Value | Status  | Threshold |
| ------------------------ | ----- | ------- | --------- |
| Total dependencies       | 45    | -       | -         |
| Outdated (major)         | 3     | Warning | < 5       |
| Outdated (minor)         | 8     | OK      | < 20      |
| Security vulnerabilities | 0     | OK      | 0         |
| High/Critical vulns      | 0     | OK      | 0         |

### 3.2 Test Coverage

```bash
# Node.js
npm test -- --coverage --json

# Python
pytest --cov --cov-report=json

# Check for coverage config (instructional - agent uses glob tool)
glob({ pattern: "**/jest.config.*" })
glob({ pattern: "**/vitest.config.*" })
glob({ pattern: "**/pytest.ini" })
glob({ pattern: "**/pyproject.toml" })
```

**Coverage Dashboard:**

| Metric          | Value | Status  | Threshold |
| --------------- | ----- | ------- | --------- |
| Line coverage   | 78%   | Warning | > 80%     |
| Branch coverage | 65%   | Warning | > 70%     |
| Uncovered files | 12    | -       | -         |
| Test count      | 156   | -       | -         |
| Test pass rate  | 100%  | OK      | 100%      |

### 3.3 Code Quality

```bash
# TypeScript type errors
!`npx tsc --noEmit 2>&1 | wc -l`

# Linting issues
!`npm run lint -- --format json 2>/dev/null || npx biome check --reporter=json`

# TODO/FIXME count
!`grep -r "TODO\|FIXME\|HACK\|XXX" src/ --include="*.ts" --include="*.tsx" | wc -l`
```

**Quality Dashboard:**

| Metric                 | Value | Status  | Threshold |
| ---------------------- | ----- | ------- | --------- |
| Type errors            | 0     | OK      | 0         |
| Lint errors            | 5     | Warning | 0         |
| Lint warnings          | 23    | OK      | < 50      |
| TODO/FIXME             | 15    | Info    | < 30      |
| Console.log statements | 3     | Warning | 0         |

### 3.4 Documentation Status

```
# Check for docs
!`ls README.md CHANGELOG.md CONTRIBUTING.md docs/ 2>/dev/null`

# README freshness
!`git log -1 --format="%cr" -- README.md`

# API docs
!`ls docs/api/ openapi.yaml swagger.json 2>/dev/null`
```

**Documentation Dashboard:**

| Document        | Status  | Last Updated |
| --------------- | ------- | ------------ |
| README.md       | Present | 5 days ago   |
| CHANGELOG.md    | Present | 2 days ago   |
| CONTRIBUTING.md | Missing | -            |
| API docs        | Present | 1 week ago   |
| AGENTS.md       | Present | 3 days ago   |

---

## Phase 4: Detailed Analysis (--deep)

**For large codebases (>100KB of source):**

skill({ name: "gemini-large-context" })

### 4.1 Architecture Analysis

```typescript
gemini({ prompt: "@src/
Describe:
1. Overall architecture pattern (MVC, Clean, Hexagonal, etc.)
2. Key modules and their responsibilities
3. Data flow between components
4. External dependencies and integrations
5. Areas of high complexity" });
```

### 4.2 Test Gap Analysis

```typescript
gemini({ prompt: "@src/ @tests/
Assess test coverage:
- Which modules have tests?
- Which are missing tests?
- Test quality (unit vs integration)
- Edge cases covered
- Critical paths without tests" });
```

### 4.3 Code Smell Detection

```typescript
gemini({ prompt: "@src/
Identify code smells:
- Duplicated code
- Long functions (>50 lines)
- Deep nesting (>4 levels)
- God objects/files
- Overly complex conditions" });
```

### 4.4 Security Analysis (--security)

```bash
# Automated scans
!`npm audit`
!`npx snyk test 2>/dev/null || true`

# Pattern-based detection
!`grep -r "password\s*=" src/ --include="*.ts" || true`
!`grep -r "api_key\s*=" src/ --include="*.ts" || true`
!`grep -r "secret" src/ --include="*.ts" || true`

# Deep analysis with Gemini
gemini -p "@src/ @api/
Security review:
- Input validation practices
- Authentication/authorization patterns
- SQL injection protections
- XSS prevention measures
- Secrets in code
- CORS configuration"
```

**Security Dashboard:**

| Check             | Status  | Issues                    |
| ----------------- | ------- | ------------------------- |
| npm audit         | Pass    | 0 vulnerabilities         |
| Hardcoded secrets | Warning | 2 potential matches       |
| Auth patterns     | OK      | Using established library |
| Input validation  | Warning | 5 unvalidated endpoints   |
| CORS              | OK      | Properly configured       |

---

## Phase 5: Ready Work

Find actionable tasks with no blockers:

```
!`bd list --status ready --limit 10`
```

### Ready Work Table

| ID     | Title         | Type    | Priority | Tags        |
| ------ | ------------- | ------- | -------- | ----------- |
| bd-123 | Add user auth | feature | P1       | backend     |
| bd-124 | Fix login bug | bug     | P0       | urgent      |
| bd-125 | Update deps   | task    | P2       | maintenance |

**Blocked Work:**

```
!`bd list --status blocked --limit 5`
```

| ID     | Title          | Blocked By | Action Needed       |
| ------ | -------------- | ---------- | ------------------- |
| bd-130 | Deploy to prod | bd-124     | Fix login bug first |

---

## Phase 6: Health Score

Calculate overall project health:

```
Health Score = 100 - (penalties)

Penalties:
- Each high/critical vulnerability: -10 (max -30)
- Each major outdated dependency: -2 (max -10)
- Type errors present: -15
- Test coverage < 80%: -10
- Test coverage < 60%: -20
- CI failing: -20
- No README: -5
- No CHANGELOG: -3
- Lint errors > 0: -5
- TODO count > 50: -5

Score interpretation:
90-100: Excellent - Ship with confidence
75-89: Good - Minor issues to address
60-74: Fair - Technical debt accumulating
< 60: Poor - Significant attention needed
```

### Health Score Output

```markdown
## Project Health Score: 82/100 (Good)

### Score Breakdown

| Category      | Score | Notes                    |
| ------------- | ----- | ------------------------ |
| Security      | 20/20 | No vulnerabilities       |
| Dependencies  | 18/20 | 2 major outdated         |
| Tests         | 15/20 | 78% coverage (below 80%) |
| Code Quality  | 15/20 | 5 lint errors            |
| CI/CD         | 10/10 | Passing                  |
| Documentation | 4/10  | Missing CONTRIBUTING.md  |

### Priority Actions

1. **Fix 5 lint errors** → `npm run lint -- --fix`
2. **Increase test coverage** → Focus on uncovered files
3. **Update 2 major deps** → `npm update`
4. **Add CONTRIBUTING.md** → Document contribution process
```

---

## Phase 7: Recommendations & Actions

Based on analysis, generate actionable recommendations:

### Immediate Actions

| Priority | Issue            | Command                 | Bead Created |
| -------- | ---------------- | ----------------------- | ------------ |
| P0       | CI failing       | Check `gh run view`     | -            |
| P1       | 2 security vulns | `npm audit fix`         | bd-xxx       |
| P2       | 5 lint errors    | `npm run lint -- --fix` | -            |

### Create Beads for Issues

For significant findings, create tracking issues:

```bash
# For security vulnerabilities
bd create "[Security] Fix npm audit vulnerabilities" -t bug -p 1  # Keep as instructional

# For test coverage
bd create "[Quality] Increase test coverage to 80%" -t task -p 2  # Keep as instructional
```

### Suggested Follow-up Commands

Based on findings:

| Finding               | Suggested Command                     |
| --------------------- | ------------------------------------- |
| Ready tasks available | `/implement <bead-id>`                |
| Test coverage low     | `/research test coverage strategies`  |
| Security issues       | `/fix security`                       |
| Outdated deps         | `npm update` or `/research migration` |
| Architecture unclear  | `/research architecture`              |
| Design system issues  | `/design-audit codebase`              |

---

## Output Modes

### --quick (Default)

- Status dashboard only
- Ready work list
- ~30 seconds

### --health

- Quick status + health metrics
- Dependency/security scan
- Health score
- ~2-3 minutes

### --deep

- Full analysis including Gemini-powered insights
- Architecture, test gaps, code smells
- ~10-15 minutes

### --security

- Security-focused analysis
- npm audit, secret detection, pattern analysis
- Gemini security review
- ~5-10 minutes

---

## Examples

```bash
# Quick status check
/analyze-project

# Full health assessment
/analyze-project --health

# Deep analysis for large codebase
/analyze-project --deep

# Security audit
/analyze-project --security
```

---

## Storage

Save analysis to `.opencode/memory/project/analysis-[YYYY-MM-DD].md` for trend tracking.

Compare with previous analysis:

```typescript
glob({ pattern: ".opencode/memory/project/analysis-*.md" });
// Then read each matched file
```

---

## Related Commands

| Need                | Command                               |
| ------------------- | ------------------------------------- |
| Start ready work    | `/implement <bead-id>`                |
| Review codebase     | `/review-codebase`                    |
| Check design system | `/design-audit`                       |
| Security deep dive  | `/research security best practices`   |
| Dependency update   | `/research migration to [package] vX` |
