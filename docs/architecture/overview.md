# System Architecture

Legion CLI is structured as a monorepo with the core engine in `packages/opencode/`. The system follows a modular architecture with clear separation of concerns.

## High-Level Flow

```
User Input → Session → LLM Request → Provider API → Response → Tool Execution → Output
     ↑                                    ↓
     └──────────── Memory System ─────────┘
```

## Core Components

### 1. Session Layer (`src/session/`)
Manages conversation state, message history, and LLM interactions.

- `system.ts` - System prompt assembly (soul, brain, provider, memory)
- `llm/request.ts` - LLM request preparation and tool injection
- `prompt.ts` - Prompt resolution and template handling
- `instruction.ts` - Loads instruction files from project and global config

### 2. Tool System (`src/tool/`)
Provides capabilities to the AI agent.

- `registry.ts` - Central tool registration and lookup
- `builtin/` - Core tools (read, write, edit, bash, glob, grep, etc.)
- `kilocode/tool/` - Extended tools (test runner, git, agent manager)

### 3. Provider System (`src/provider/`)
Handles communication with AI model providers.

- `provider.ts` - Provider definitions and model catalogs
- `transform.ts` - Request/response transformations per provider
- `error.ts` - Provider-specific error handling

### 4. Plugin System (`src/plugin/`)
Extends functionality through plugins.

- Plugin loading from npm packages
- Hook-based event system
- MCP (Model Context Protocol) integration

### 5. Memory System (`src/kilocode/memory/`)
Persistent project knowledge.

- LEGION.md loading from project root and global config
- Session memory persistence to JSON
- Automatic context injection into system prompts

## Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   TUI/CLI   │────▶│   Session    │────▶│  LLM Layer  │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌──────────────┐     ┌─────────────┐
                    │    Tools     │     │  Providers  │
                    └──────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌──────────────┐     ┌─────────────┐
                    │   Filesystem │     │  API calls  │
                    └──────────────┘     └─────────────┘
```

## Key Design Decisions

1. **Effect-based Services** - Core services use Effect for dependency injection and error handling
2. **Singleton State** - Per-project state managed via `InstanceState`
3. **Tool Registration** - Tools are registered declaratively and auto-discovered
4. **Prompt Assembly** - System prompts are composed from multiple sources (soul, brain, provider, memory)
5. **Plugin Architecture** - Extensible via hooks and MCP servers
