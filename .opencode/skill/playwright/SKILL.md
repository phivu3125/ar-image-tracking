---
name: playwright
description: Browser automation with Playwright MCP. Test pages, fill forms, take screenshots, check responsive design, validate UX, test login flows. Use when user wants to test websites or automate browser interactions.
mcp:
  playwright:
    command: npx
    args: ["@playwright/mcp@latest"]
---

# Playwright Browser Automation (MCP)

Browser automation via Playwright MCP server. When this skill is loaded, the `playwright` MCP server auto-starts and exposes browser tools.

## Quick Start

After loading this skill, use `skill_mcp` to invoke browser tools:

```
skill_mcp(mcp_name="playwright", tool_name="browser_navigate", arguments='{"url": "https://example.com"}')
```

## Available Tools

### Navigation & Page

| Tool                 | Description            | Arguments                           |
| -------------------- | ---------------------- | ----------------------------------- |
| `browser_navigate`   | Navigate to URL        | `{"url": "https://..."}`            |
| `browser_go_back`    | Go back                | `{}`                                |
| `browser_go_forward` | Go forward             | `{}`                                |
| `browser_wait_for`   | Wait for text/selector | `{"text": "...", "timeout": 10000}` |

### Interaction

| Tool                    | Description               | Arguments                                                                          |
| ----------------------- | ------------------------- | ---------------------------------------------------------------------------------- |
| `browser_click`         | Click element             | `{"element": "Submit button", "ref": "e123"}`                                      |
| `browser_type`          | Type text                 | `{"element": "Search input", "ref": "e456", "text": "query"}`                      |
| `browser_fill`          | Fill input (clears first) | `{"element": "Email field", "ref": "e789", "text": "test@example.com"}`            |
| `browser_select_option` | Select dropdown option    | `{"element": "Country", "ref": "e012", "values": ["US"]}`                          |
| `browser_hover`         | Hover over element        | `{"element": "Menu", "ref": "e345"}`                                               |
| `browser_drag`          | Drag and drop             | `{"startElement": "...", "startRef": "...", "endElement": "...", "endRef": "..."}` |

### Screenshots & Content

| Tool                      | Description                     | Arguments                              |
| ------------------------- | ------------------------------- | -------------------------------------- |
| `browser_take_screenshot` | Capture screenshot              | `{"filename": "screenshot.png"}`       |
| `browser_snapshot`        | Get page accessibility snapshot | `{}`                                   |
| `browser_evaluate`        | Run JavaScript                  | `{"function": "() => document.title"}` |
| `browser_pdf_save`        | Save page as PDF                | `{"filename": "page.pdf"}`             |

### Viewport & Device

| Tool             | Description     | Arguments                                                    |
| ---------------- | --------------- | ------------------------------------------------------------ |
| `browser_resize` | Resize viewport | `{"width": 375, "height": 667}` or `{"device": "iPhone 13"}` |

### Tabs

| Tool                 | Description    | Arguments                |
| -------------------- | -------------- | ------------------------ |
| `browser_tab_list`   | List open tabs | `{}`                     |
| `browser_tab_new`    | Open new tab   | `{"url": "https://..."}` |
| `browser_tab_select` | Switch to tab  | `{"index": 0}`           |
| `browser_tab_close`  | Close tab      | `{"index": 0}`           |

## Workflow

1. **Navigate** to the target URL
2. **Snapshot** to see page structure and element refs
3. **Interact** using element refs from snapshot
4. **Screenshot** to capture results

## Examples

### Test a Page

```
# Navigate
skill_mcp(mcp_name="playwright", tool_name="browser_navigate", arguments='{"url": "http://localhost:3000"}')

# Get page snapshot (shows elements with refs)
skill_mcp(mcp_name="playwright", tool_name="browser_snapshot")

# Take screenshot
skill_mcp(mcp_name="playwright", tool_name="browser_take_screenshot", arguments='{"filename": "/tmp/homepage.png"}')
```

### Fill a Form

```
# Navigate to form
skill_mcp(mcp_name="playwright", tool_name="browser_navigate", arguments='{"url": "http://localhost:3000/contact"}')

# Get snapshot to find element refs
skill_mcp(mcp_name="playwright", tool_name="browser_snapshot")

# Fill fields (use refs from snapshot)
skill_mcp(mcp_name="playwright", tool_name="browser_fill", arguments='{"element": "Name input", "ref": "e12", "text": "John Doe"}')
skill_mcp(mcp_name="playwright", tool_name="browser_fill", arguments='{"element": "Email input", "ref": "e34", "text": "john@example.com"}')

# Submit
skill_mcp(mcp_name="playwright", tool_name="browser_click", arguments='{"element": "Submit button", "ref": "e56"}')
```

### Test Responsive Design

```
# Navigate
skill_mcp(mcp_name="playwright", tool_name="browser_navigate", arguments='{"url": "http://localhost:3000"}')

# Desktop
skill_mcp(mcp_name="playwright", tool_name="browser_resize", arguments='{"width": 1920, "height": 1080}')
skill_mcp(mcp_name="playwright", tool_name="browser_take_screenshot", arguments='{"filename": "/tmp/desktop.png"}')

# Tablet
skill_mcp(mcp_name="playwright", tool_name="browser_resize", arguments='{"device": "iPad Pro 11"}')
skill_mcp(mcp_name="playwright", tool_name="browser_take_screenshot", arguments='{"filename": "/tmp/tablet.png"}')

# Mobile
skill_mcp(mcp_name="playwright", tool_name="browser_resize", arguments='{"device": "iPhone 13"}')
skill_mcp(mcp_name="playwright", tool_name="browser_take_screenshot", arguments='{"filename": "/tmp/mobile.png"}')
```

### Test Login Flow

```
# Navigate to login
skill_mcp(mcp_name="playwright", tool_name="browser_navigate", arguments='{"url": "http://localhost:3000/login"}')

# Snapshot to get refs
skill_mcp(mcp_name="playwright", tool_name="browser_snapshot")

# Fill credentials
skill_mcp(mcp_name="playwright", tool_name="browser_fill", arguments='{"element": "Email", "ref": "e10", "text": "test@example.com"}')
skill_mcp(mcp_name="playwright", tool_name="browser_fill", arguments='{"element": "Password", "ref": "e20", "text": "password123"}')

# Click login
skill_mcp(mcp_name="playwright", tool_name="browser_click", arguments='{"element": "Login button", "ref": "e30"}')

# Wait for redirect
skill_mcp(mcp_name="playwright", tool_name="browser_wait_for", arguments='{"text": "Dashboard", "timeout": 10000}')

# Screenshot success
skill_mcp(mcp_name="playwright", tool_name="browser_take_screenshot", arguments='{"filename": "/tmp/logged-in.png"}')
```

### Run JavaScript

```
# Get page title
skill_mcp(mcp_name="playwright", tool_name="browser_evaluate", arguments='{"function": "() => document.title"}')

# Get all links
skill_mcp(mcp_name="playwright", tool_name="browser_evaluate", arguments='{"function": "() => Array.from(document.querySelectorAll(\"a\")).map(a => a.href)"}')

# Scroll to bottom
skill_mcp(mcp_name="playwright", tool_name="browser_evaluate", arguments='{"function": "() => window.scrollTo(0, document.body.scrollHeight)"}')
```

## Server Options

For advanced usage, modify the MCP args in frontmatter:

```yaml
mcp:
  playwright:
    command: npx
    args: ["@playwright/mcp@latest", "--headless", "--browser=firefox"]
```

Common options:

- `--headless` - Run without visible browser
- `--browser=chrome|firefox|webkit` - Choose browser
- `--device="iPhone 13"` - Emulate device
- `--viewport-size=1280x720` - Set viewport
- `--user-data-dir=/path` - Persist browser data

## Tips

- **Always snapshot first** to get element refs before interacting
- **Use descriptive element names** in click/fill for clarity
- **Save screenshots to /tmp** for easy access
- **Use device presets** for accurate mobile emulation
- **Chain wait_for** after navigation for dynamic pages
