---
description: Create integration tests within task constraints
argument-hint: "<bead-id|path> [--pattern=<pattern>] [--framework=<framework>]"
agent: build
---

# Integration Test: $ARGUMENTS

Create integration tests that verify module boundaries and system interactions.

## Load Skills

```typescript
skill({ name: "beads" }); // Session protocol
skill({ name: "test-driven-development" });
```

```typescript
skill({ name: "test-driven-development" });
skill({ name: "condition-based-waiting" }); // For async tests
skill({ name: "testing-anti-patterns" }); // Avoid common mistakes
```

---

## What Are Integration Tests?

| Test Type       | Scope                       | Speed        | Dependencies         |
| --------------- | --------------------------- | ------------ | -------------------- |
| **Unit**        | Single function/class       | Fast (ms)    | All mocked           |
| **Integration** | Module boundaries, APIs, DB | Medium (s)   | Real or test doubles |
| **E2E**         | Full user flows             | Slow (s-min) | Real everything      |

**Integration tests verify:**

- API endpoints work end-to-end
- Database queries return correct data
- Services communicate correctly
- External integrations behave as expected

---

## Phase 1: Task Validation

!`bd show $ARGUMENTS`

```typescript
// Read test constraints
read({ filePath: ".beads/artifacts/$ARGUMENTS/spec.md" });
```

If bead missing: STOP. Create with `/create` first.

---

## Phase 2: Framework Detection

```typescript
glob({ pattern: "**/jest.config.*" });
glob({ pattern: "**/vitest.config.*" });
glob({ pattern: "**/pytest.ini" });
glob({ pattern: "**/pyproject.toml" });

// Read package.json for test command
read({ filePath: "package.json" });
```

| Framework | File Pattern             | Test Command |
| --------- | ------------------------ | ------------ |
| Jest      | `*.test.ts`, `*.spec.ts` | `npm test`   |
| Vitest    | `*.test.ts`, `*.spec.ts` | `npm test`   |
| pytest    | `test_*.py`, `*_test.py` | `pytest`     |
| Go        | `*_test.go`              | `go test`    |

---

## Phase 3: Test Structure

### File Location

```
src/
├── auth/
│   ├── login.ts
│   └── login.test.ts          # Co-located unit tests
tests/
├── integration/
│   ├── auth.test.ts           # Integration tests here
│   ├── api.test.ts
│   └── database.test.ts
└── fixtures/
    ├── users.json
    └── factories.ts
```

### Test File Structure

```typescript
// tests/integration/auth.test.ts

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createTestDatabase, cleanupDatabase } from "../fixtures/database";
import { createTestUser } from "../fixtures/factories";
import { app } from "../../src/app";

describe("Auth Integration", () => {
  let db: TestDatabase;

  beforeAll(async () => {
    db = await createTestDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase(db);
  });

  beforeEach(async () => {
    await db.clear(); // Clean slate each test
  });

  describe("POST /login", () => {
    it("returns JWT for valid credentials", async () => {
      // Arrange
      const user = await createTestUser(db, { email: "test@example.com" });

      // Act
      const response = await app.request("/login", {
        method: "POST",
        body: JSON.stringify({ email: user.email, password: "password123" }),
      });

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.token).toBeDefined();
      expect(body.user.email).toBe(user.email);
    });

    it("returns 401 for invalid password", async () => {
      const user = await createTestUser(db);

      const response = await app.request("/login", {
        method: "POST",
        body: JSON.stringify({ email: user.email, password: "wrong" }),
      });

      expect(response.status).toBe(401);
    });
  });
});
```

---

## Phase 4: Common Test Patterns

### Database Integration

```typescript
describe("User Repository", () => {
  let db: Database;

  beforeAll(async () => {
    db = await createTestDatabase();
    await db.migrate();
  });

  afterEach(async () => {
    await db.exec("DELETE FROM users"); // Clean between tests
  });

  afterAll(async () => {
    await db.close();
  });

  it("creates user with hashed password", async () => {
    const repo = new UserRepository(db);

    const user = await repo.create({
      email: "test@example.com",
      password: "plaintext123",
    });

    expect(user.id).toBeDefined();
    expect(user.password).not.toBe("plaintext123"); // Should be hashed
  });
});
```

### API Integration

```typescript
describe("API Integration", () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(async () => {
    await server.close();
  });

  it("GET /users returns paginated list", async () => {
    // Seed data
    await seedUsers(10);

    const response = await fetch(`${server.url}/users?page=1&limit=5`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.users).toHaveLength(5);
    expect(data.total).toBe(10);
    expect(data.page).toBe(1);
  });
});
```

### External Service Integration

```typescript
describe("Payment Service", () => {
  it("processes payment with Stripe test mode", async () => {
    const stripe = new Stripe(process.env.STRIPE_TEST_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
      currency: "usd",
      payment_method: "pm_card_visa", // Stripe test card
      confirm: true,
    });

    expect(paymentIntent.status).toBe("succeeded");
  });
});
```

### Async/Queue Integration

```typescript
describe("Job Queue", () => {
  it("processes email job within timeout", async () => {
    const queue = createTestQueue();

    // Add job
    await queue.add("send-email", { to: "test@example.com" });

    // Wait for processing (use condition-based-waiting skill)
    await waitFor(
      async () => {
        const job = await queue.getJob("send-email");
        return job?.status === "completed";
      },
      { timeout: 5000, interval: 100 },
    );

    const job = await queue.getJob("send-email");
    expect(job.status).toBe("completed");
  });
});
```

---

## Phase 5: Test Data Management

### Factories

```typescript
// tests/fixtures/factories.ts

export function createTestUser(db: Database, overrides = {}) {
  return db.insert("users", {
    id: randomUUID(),
    email: `test-${Date.now()}@example.com`,
    password: hashSync("password123", 10),
    createdAt: new Date(),
    ...overrides,
  });
}

export function createTestOrder(db: Database, userId: string, overrides = {}) {
  return db.insert("orders", {
    id: randomUUID(),
    userId,
    status: "pending",
    total: 100,
    ...overrides,
  });
}
```

### Cleanup Strategies

| Strategy                 | Pros        | Cons               |
| ------------------------ | ----------- | ------------------ |
| **Transaction rollback** | Fast, clean | Complex setup      |
| **DELETE after each**    | Simple      | Slower             |
| **Fresh DB per test**    | Isolated    | Very slow          |
| **Truncate tables**      | Fast reset  | May miss FK issues |

**Recommended:** Transaction rollback for speed, DELETE for simplicity.

---

## Phase 6: Isolation Patterns

### Database Isolation

```typescript
// Wrap each test in transaction that rolls back
beforeEach(async () => {
  await db.exec("BEGIN");
});

afterEach(async () => {
  await db.exec("ROLLBACK");
});
```

### Port Isolation (Parallel Tests)

```typescript
// Use dynamic ports for parallel test runners
const server = await app.listen(0); // Random available port
const port = server.address().port;
```

### Environment Isolation

```bash
# .env.test
DATABASE_URL=postgres://localhost/myapp_test
STRIPE_KEY=sk_test_xxx
REDIS_URL=redis://localhost:6379/1  # Separate DB number
```

---

## Phase 7: TDD Workflow

Follow the cycle:

1. **Write failing test first**
   - Test should fail for the RIGHT reason
   - Not a syntax error, but missing functionality

2. **Verify failure message**
   - Should clearly indicate what's missing
   - "Expected 200, got 404" = endpoint missing

3. **Implement minimal code**
   - Just enough to pass
   - Don't over-engineer

4. **Refactor while green**
   - Improve code quality
   - Keep tests passing

---

## Anti-Patterns to Avoid

| Anti-Pattern                   | Problem                     | Do Instead                        |
| ------------------------------ | --------------------------- | --------------------------------- |
| Testing implementation details | Brittle tests               | Test behavior/outcomes            |
| Excessive mocking              | Tests don't reflect reality | Use real dependencies             |
| Shared mutable state           | Flaky tests                 | Isolate each test                 |
| Testing third-party code       | Waste of time               | Trust libraries, test integration |
| No cleanup                     | Tests affect each other     | Always clean up                   |
| Hardcoded test data            | Fragile                     | Use factories                     |

---

## Coverage Guidelines

| Coverage Type        | Target    | Notes                         |
| -------------------- | --------- | ----------------------------- |
| Line coverage        | 70-80%    | Higher for critical paths     |
| Branch coverage      | 60-70%    | Cover main branches           |
| Integration coverage | Key paths | All API endpoints, main flows |

**Focus on:** Happy paths, error cases, edge cases in that order.

---

## CI Considerations

```yaml
# .github/workflows/test.yml
jobs:
  integration-tests:
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test
    steps:
      - run: npm run test:integration
        env:
          DATABASE_URL: postgres://postgres@localhost/test
```

---

## Output

After writing tests:

1. **Run tests**: Verify all pass
2. **Check coverage**: Meet guidelines
3. **Update review.md**: `.beads/artifacts/$ARGUMENTS/review.md`
4. **Complete**: `/finish $ARGUMENTS`

---

## Related Commands

| Need                | Command                   |
| ------------------- | ------------------------- |
| Create unit tests   | Use TDD skill directly    |
| Fix failing tests   | `/fix`                    |
| Review test quality | `/review-codebase tests/` |
| Complete task       | `/finish <bead-id>`       |
