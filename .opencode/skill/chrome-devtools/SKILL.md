---
name: chrome-devtools
description: Chrome DevTools for debugging, performance analysis, and browser automation. Use when debugging web apps, analyzing performance, inspecting network requests, or automating browser interactions.
mcp:
  chrome-devtools:
    command: npx
    args: ["-y", "chrome-devtools-mcp@latest", "--stdio"]
---

# Chrome DevTools (MCP)

Control and inspect a live Chrome browser via Chrome DevTools Protocol. Debug, analyze performance, inspect network, and automate browser interactions.

## Quick Start

```
skill_mcp(skill_name="chrome-devtools", tool_name="take_snapshot")
skill_mcp(skill_name="chrome-devtools", tool_name="navigate_page", arguments='{"type": "url", "url": "https://example.com"}')
```

## Tools

### Input

| Tool            | Description          | Parameters                   |
| --------------- | -------------------- | ---------------------------- |
| `click`         | Click element        | `uid`                        |
| `fill`          | Type text            | `uid`, `value`               |
| `fill_form`     | Fill multiple fields | `elements` array             |
| `hover`         | Hover element        | `uid`                        |
| `press_key`     | Press key            | `key` (e.g., "Enter")        |
| `drag`          | Drag element         | `from_uid`, `to_uid`         |
| `upload_file`   | Upload file          | `uid`, `filePath`            |
| `handle_dialog` | Handle dialog        | `action`: "accept"/"dismiss" |

### Navigation

| Tool            | Description   | Parameters                                     |
| --------------- | ------------- | ---------------------------------------------- |
| `navigate_page` | Navigate      | `type`: "url"/"back"/"forward"/"reload", `url` |
| `new_page`      | Open new page | `url`                                          |
| `list_pages`    | List pages    | -                                              |
| `select_page`   | Switch page   | `pageIdx`                                      |
| `close_page`    | Close page    | `pageIdx`                                      |
| `wait_for`      | Wait for text | `text`, `timeout`                              |

### Debugging

| Tool                    | Description        | Parameters                  |
| ----------------------- | ------------------ | --------------------------- |
| `take_snapshot`         | A11y tree snapshot | `verbose`                   |
| `take_screenshot`       | Screenshot         | `uid`, `fullPage`, `format` |
| `evaluate_script`       | Run JS             | `function`, `args`          |
| `list_console_messages` | Console logs       | `types` filter              |
| `get_console_message`   | Get message        | `msgid`                     |

### Network

| Tool                    | Description     | Parameters                  |
| ----------------------- | --------------- | --------------------------- |
| `list_network_requests` | List requests   | `resourceTypes`, `pageSize` |
| `get_network_request`   | Request details | `reqid`                     |

### Performance

| Tool                          | Description | Parameters                    |
| ----------------------------- | ----------- | ----------------------------- |
| `performance_start_trace`     | Start trace | `reload`, `autoStop`          |
| `performance_stop_trace`      | Stop trace  | -                             |
| `performance_analyze_insight` | Analyze     | `insightSetId`, `insightName` |

### Emulation

| Tool          | Description        | Parameters                               |
| ------------- | ------------------ | ---------------------------------------- |
| `emulate`     | Emulate conditions | `networkConditions`, `cpuThrottlingRate` |
| `resize_page` | Resize viewport    | `width`, `height`                        |

## Tips

- **Always `take_snapshot` first** to get element `uid`s
- **Element uids change** after navigation - take fresh snapshot
- **Network conditions**: "Slow 3G", "Fast 3G", "Offline"

## vs Playwright

- **chrome-devtools**: Performance profiling, network inspection, console - Chrome only
- **playwright**: Cross-browser testing - Chrome, Firefox, WebKit
