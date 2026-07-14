# Plugin System

Legion CLI supports extensibility through plugins that can add tools, hooks, and MCP servers.

## Plugin Architecture

```
┌─────────────────────────────────────┐
│           Plugin Manager            │
├─────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐        │
│  │ npm pkg  │  │ npm pkg  │  ...   │
│  └──────────┘  └──────────┘        │
├─────────────────────────────────────┤
│         Hook System                 │
│  - preToolUse                       │
│  - postToolUse                      │
│  - prePrompt                        │
│  - postPrompt                       │
├─────────────────────────────────────┤
│         MCP Integration             │
│  - StdioClientTransport             │
│  - SSEClientTransport              │
└─────────────────────────────────────┘
```

## Plugin Loading

Plugins are loaded from:
1. Project-level `.legion/plugins/`
2. Global `~/.legion/plugins/`
3. npm packages

```typescript
// Plugin discovery
const plugins = yield* Plugin.discover({
  project: ".legion/plugins/",
  global: path.join(home, ".legion", "plugins"),
})
```

## Hook System

Plugins can register hooks that execute at specific points:

```typescript
// Example hook registration
plugin.register("preToolUse", async (context) => {
  // Before tool execution
  console.log(`Tool ${context.tool} called with`, context.args)
})

plugin.register("postToolUse", async (context) => {
  // After tool execution
  console.log(`Tool ${context.tool} returned`, context.result)
})
```

### Available Hooks

| Hook | When | Use Case |
|---|---|---|
| `preToolUse` | Before tool execution | Validation, logging |
| `postToolUse` | After tool execution | Processing results |
| `prePrompt` | Before system prompt | Modify prompts |
| `postPrompt` | After system prompt | Post-process |
| `chat.params` | Before LLM request | Modify parameters |
| `chat.headers` | Before LLM request | Add headers |
| `experimental.chat.system.transform` | System prompt transform | Modify system prompt |

## MCP Integration

Plugins can provide MCP (Model Context Protocol) servers:

```typescript
// MCP server configuration
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["./my-mcp-server.js"],
      "env": {
        "API_KEY": "..."
      }
    }
  }
}
```

## Plugin Interface

```typescript
interface Plugin {
  name: string
  version: string
  hooks: Record<string, HookHandler>
  mcpServers?: MCPServerConfig[]
}
```

## Creating Plugins

1. Create npm package with plugin structure
2. Export plugin interface
3. Register hooks and MCP servers
4. Publish to npm
5. Install in project or globally

```json
// package.json
{
  "name": "legion-plugin-my-feature",
  "main": "dist/index.js",
  "legion": {
    "plugin": true
  }
}
```

## Plugin Permissions

Plugins can request permissions:

```typescript
// Permission request
const permissions = yield* Plugin.requestPermissions([
  "file:read",
  "file:write",
  "network:request"
])
```
