# Tool System

Legion CLI uses a declarative tool registration system where tools define their schema, parameters, and execution logic.

## Tool Registration

Tools are registered in `src/tool/registry.ts` which calls into `src/kilocode/tool/registry.ts` for Legion-specific tools.

```typescript
// Example tool definition
export const MyTool = Tool.define(
  "my_tool",           // Tool ID
  {
    description: "Description of what the tool does",
    parameters: zod({
      input: zod.string().describe("Input parameter"),
    }),
    execute: async (args, ctx) => {
      // Tool logic
      return {
        title: "Tool Result",
        metadata: { key: "value" },
        output: "Result text",
      }
    },
  },
  () => ({})  // Default state
)
```

## Tool Categories

### Core Tools (`src/tool/builtin/`)
Always available, fundamental capabilities:

| Tool | Purpose |
|---|---|
| `read` | Read file contents |
| `write` | Write file contents |
| `edit` | Edit file with string replacement |
| `bash` | Execute shell commands |
| `glob` | Find files by pattern |
| `grep` | Search file contents |
| `question` | Ask user questions |
| `task` | Launch subagent tasks |
| `webfetch` | Fetch web content |
| `suggest` | Suggest code review |

### Extended Tools (`src/kilocode/tool/`)
Additional capabilities for Legion:

| Tool | Purpose |
|---|---|
| `test_runner` | Auto-detect and run tests |
| `git_pr_create` | Create GitHub PRs |
| `git_pr_list` | List GitHub PRs |
| `git_conflict_resolve` | Resolve merge conflicts |
| `git_conflict_list` | List conflicted files |
| `git_blame` | Git blame analysis |
| `agent_manager` | Multi-agent orchestration |

### Skill Tools (`src/skill/`)
Loaded dynamically from skill definitions:

| Tool | Purpose |
|---|---|
| `skill` | Load and execute skills |
| `recall` | Search past conversations |

## Tool Execution Flow

```
1. User input triggers LLM request
2. LLM response includes tool calls
3. Tool registry looks up tool by ID
4. Tool parameters are validated against schema
5. Tool executes with provided arguments
6. Result is returned to LLM
7. LLM continues with tool output
```

## Tool Visibility

Tools can be gated by permissions or flags:

```typescript
// Always visible
const tools = ToolRegistry.infos()

// Gated by permission
const tools = ToolRegistry.infos({ permission: agent.permission })

// With flags
const tools = ToolRegistry.infos({ flags: runtimeFlags })
```

## Adding New Tools

1. Create tool file in `src/kilocode/tool/` or `src/tool/builtin/`
2. Define tool with `Tool.define()`
3. Register in `src/kilocode/tool/registry.ts`
4. Add to `infos()`, `build()`, and `extra()` functions
5. Optionally create description file (`.txt`)

## Tool Output Format

```typescript
{
  title: "Human-readable result title",
  metadata: { key: "value" },  // Structured data
  output: "Text output for LLM"  // Truncated if too long
}
```
