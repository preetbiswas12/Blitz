# Architecture Documentation

This document describes the internal architecture of the Claude Code Integration plugin for developers and contributors.

## Overview

The plugin acts as a bridge between Obsidian and the Claude Code CLI, providing a rich UI for interacting with Claude AI's capabilities within the note-taking environment.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Obsidian Application                    │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │             Claude Code Integration Plugin             │ │
│  │                                                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐   │ │
│  │  │   UI Layer   │  │  Core Logic  │  │  Utilities  │   │ │
│  │  │  (View)      │←→│  (Runner)    │←→│  (Managers) │   │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘   │ │
│  │         ↓                  ↓                           │ │
│  └─────────┼──────────────────┼───────────────────────────┘ │
└────────────┼──────────────────┼─────────────────────────────┘
             ↓                  ↓
    ┌────────────────┐  ┌──────────────────┐
    │  User Browser  │  │  Child Process   │
    │  (Rendering)   │  │ (Claude Code CLI)│
    └────────────────┘  └──────────────────┘
                               ↓
                        ┌──────────────┐
                        │ Anthropic API│
                        └──────────────┘
```

## Directory Structure

```
obsidian-claude-code-plugin/
├── src/
│   ├── main.ts                    # Plugin entry point
│   ├── core/                      # Core business logic
│   │   ├── claude-code-runner.ts  # Main execution engine
│   │   ├── settings.ts            # Settings management
│   │   ├── session-manager.ts     # Session persistence
│   │   ├── prompt-builder.ts      # Prompt construction
│   │   ├── response-parser.ts     # Response parsing
│   │   ├── process-spawner.ts     # Process management
│   │   ├── cli-args-builder.ts    # CLI arguments
│   │   └── streaming/             # Stream processing
│   │       ├── stream-event-processor.ts
│   │       ├── response-content-extractor.ts
│   │       └── tool-output-formatter.ts
│   └── ui/                        # User interface
│       ├── view.ts                # Main view component
│       ├── ui-builder.ts          # UI construction
│       ├── context-manager.ts     # UI state management
│       └── renderers/             # Output rendering
│           ├── output-renderer.ts
│           ├── agent-tracker.ts
│           └── result-renderer.ts
├── styles.css                     # Plugin styles
├── manifest.json                  # Plugin manifest
└── docs/                          # Documentation
```

## Core Components

### 1. Main Plugin (main.ts)

**Responsibility**: Plugin lifecycle management

**Key Functions**:
- `onload()`: Initialize plugin, register views, load settings
- `onunload()`: Cleanup resources
- `loadSettings()`: Load user settings
- `saveSettings()`: Persist settings

**Interactions**:
- Creates and registers the `ClaudeCodeView`
- Manages settings through `ClaudeCodeSettings`
- Adds ribbon icon and commands

### 2. Claude Code Runner (claude-code-runner.ts)

**Responsibility**: Execute Claude Code CLI and manage process lifecycle

**Key Classes**:
- `ClaudeCodeRunner`: Main execution engine

**Key Methods**:
- `run()`: Execute Claude Code with a request
- `executeClaudeCode()`: Spawn process and handle I/O
- `sendInput()`: Send user input to Claude Code stdin
- `terminate()`: Stop running process
- `handleStreamEvent()`: Process streaming events

**Data Flow**:
```
Request → Build Prompt → Spawn Process → Stream Events → Parse Response → Return Result
```

**Event Types Handled**:
- `system`: Initialization events
- `assistant`: Claude's messages
- `tool_use`: Tool execution events
- `user`: Tool results
- `result`: Final results with usage stats
- `stream_event`: Real-time streaming deltas

### 3. UI View (ui/view.ts)

**Responsibility**: Render and manage the UI

**Key Components**:
- Input section (prompt, options)
- Result section (streaming output)
- Preview section (diff viewer)
- Activity section (tool usage)
- Output section (logs)
- History section (past interactions)

**State Management**:
- Per-note context via `ContextManager`
- Current streaming state
- Session information

**Event Handlers**:
- `handleRunClaudeCode()`: Start execution
- `handleCancel()`: Stop execution
- `handleApprovePermission()`: Grant permission
- `handleDenyPermission()`: Deny permission
- `handleAcceptChanges()`: Apply edits
- `handleRejectChanges()`: Discard edits

### 4. Stream Event Processor (streaming/stream-event-processor.ts)

**Responsibility**: Process and format streaming events from Claude Code

**Key Methods**:
- `processEvent()`: Route events to appropriate handlers
- `handleSystemEvent()`: Process initialization
- `handleAssistantEvent()`: Process Claude's messages
- `handleToolUseEvent()`: Process tool usage
- `handleStreamEvent()`: Process real-time deltas

**Output Formatting**:
- Tool-specific parameter formatting
- Result summarization
- Progress indicators

### 5. Session Manager (session-manager.ts)

**Responsibility**: Persist and restore Claude Code sessions

**Key Features**:
- Per-note session directories
- Session ID storage
- Conversation history
- Resume capability

**Storage Structure**:
```
.obsidian/plugins/claude-code-integration/sessions/
└── [note-path-hash]/
    ├── session-id.txt
    ├── conversation.json
    └── .claude/  (Claude Code session data)
```

### 6. Prompt Builder (prompt-builder.ts)

**Responsibility**: Construct prompts for Claude Code

**Prompt Structure**:
```
1. Custom system prompt (if provided)
2. Permission mode instructions
3. Context information (note path, vault path)
4. Note content
5. User request
6. Agent mode instructions
7. Output format instructions
```

**Key Considerations**:
- Separate instructions for questions vs. edits
- FINAL-CONTENT separator for file modifications
- Tool usage encouragement

## Data Flow

### Request Flow

```
User Input
    ↓
ClaudeCodeView.handleRunClaudeCode()
    ↓
PromptBuilder.buildPrompt()
    ↓
ClaudeCodeRunner.run()
    ↓
ProcessSpawner.spawn()
    ↓
Claude Code CLI (stdout/stderr)
    ↓
StreamEventProcessor.processEvent()
    ↓
ClaudeCodeView (callbacks)
    ↓
UI Update (streaming)
    ↓
ResponseParser.parseOutput()
    ↓
ClaudeCodeView (final response)
    ↓
Preview/Apply Changes
```

### Streaming Flow

```
Claude Code CLI
    ↓ (stdout JSON lines)
StreamEventProcessor
    ↓
    ├─→ system → Initialize session
    ├─→ assistant → Show message
    ├─→ tool_use → Show tool usage
    ├─→ stream_event → Append text delta
    ├─→ result → Show completion stats
    └─→ unknown → Log for debugging
         ↓
OutputCallback (view.ts)
    ↓
    ├─→ Result Area (markdown rendering)
    ├─→ Activity Tracker (tool usage)
    └─→ Output Area (logs)
```

## State Management

### Per-Note Context

Each note maintains its own context:

```typescript
interface NoteContext {
    sessionDir: string;           // Session storage directory
    history: HistoryEntry[];      // Past interactions
    currentRequest?: Request;      // Active request
    currentResponse?: Response;    // Active response
    outputLines: string[];        // CLI output
    runner: ClaudeCodeRunner;     // Runner instance
    isRunning: boolean;           // Execution state
    selectedModel?: string;       // Model override
}
```

Managed by `ContextManager`:
- Lazy initialization
- Automatic cleanup
- Context switching on note change

### Session Persistence

Sessions are stored in:
```
.obsidian/plugins/claude-code-integration/sessions/[hash]/
```

Contents:
- `session-id.txt`: Claude Code session ID
- `conversation.json`: Interaction history
- `.claude/`: Claude Code internal state

### UI State

The view maintains:
- Current note path
- Active streaming elements
- Preview content
- Permission requests
- Todo list
- Activity log

## Plugin Integration Points

### Obsidian API Usage

1. **Workspace**:
   - Register view type
   - Add ribbon icon
   - Track active file changes

2. **Vault**:
   - Read/write notes
   - Access vault path
   - File operations

3. **Editor**:
   - Get note content
   - Get selections
   - Apply modifications

4. **Settings**:
   - Plugin settings tab
   - Persistent storage

5. **Notice**:
   - User notifications
   - Status updates

### Child Process Management

Uses Node.js `child_process.spawn()`:
- Non-blocking execution
- Stream stdout/stderr
- Send to stdin
- Graceful termination
- Timeout handling

## Security Considerations

### Permission System

Two modes:
1. **Interactive**: Claude must ask before using tools
2. **Permissionless**: Claude operates autonomously

Permission detection:
- Pattern matching in response text
- `REQUIRED_APPROVAL` marker
- UI prompt for approval

### Vault Access Control

- Optional: Limit Claude to current note
- When enabled: Full vault access via absolute paths
- User configurable per workflow

### API Key Handling

- Plugin never accesses API key
- Managed by Claude Code CLI
- Environment variable or CLI config
- No key storage in plugin

## Performance Optimizations

### Streaming

- Real-time text deltas for responsive UI
- Incremental markdown rendering
- Efficient DOM updates

### Session Caching

- Reuse sessions per note
- Avoid re-initialization overhead
- Persist conversation context

### Lazy Loading

- Components created on-demand
- Context initialized when needed
- Minimal memory footprint

## Error Handling

### Levels

1. **Process Errors**: CLI spawn failures, crashes
2. **API Errors**: Rate limits, authentication
3. **Parsing Errors**: Malformed responses
4. **UI Errors**: Rendering failures

### Strategies

- Try-catch blocks around critical operations
- Graceful degradation (show raw output on parsing failure)
- User-friendly error messages
- Detailed logging for debugging

### Recovery

- Automatic cleanup on errors
- Process termination on timeout
- State reset for new requests
- Session preservation

## Extension Points

### Custom Prompts

Users can add custom system prompts via settings to modify Claude's behavior.

### Model Selection

Runtime model override per request:
- UI dropdown
- Passed to Claude Code via `--model` flag

### Tool Output Formatting

`ToolOutputFormatter` provides extensible formatting for different tools:
- Compact vs. verbose modes
- Tool-specific parameter display
- Result summarization

### UI Customization

CSS variables and classes for theming:
- Obsidian theme integration
- Responsive design
- Accessibility support

## Testing Strategy

### Manual Testing

- Install in development vault
- Test common workflows
- Edge case scenarios
- Cross-platform verification

### Build Verification

```bash
npm run build    # TypeScript compilation + bundling
npm run dev      # Watch mode for development
```

### Integration Testing

- Test with different Claude models
- Various note structures
- Permission flows
- Session resumption

## Future Architecture Considerations

### Potential Improvements

1. **WebSocket Support**: For lower-latency streaming
2. **Caching Layer**: For repeated operations
3. **Plugin API**: For other plugins to integrate
4. **Background Processing**: For long-running operations
5. **Batch Operations**: Process multiple notes
6. **Template System**: Reusable prompt templates

### Scalability

Current limitations:
- One request per note at a time
- In-memory state (no database)
- Linear history growth

Potential solutions:
- Request queuing system
- IndexedDB for large histories
- History pagination/archiving

## Code Standards

### TypeScript

- Strict mode enabled
- Explicit types for public APIs
- Interface-based design

### Naming Conventions

- Classes: PascalCase
- Methods: camelCase
- Constants: UPPER_SNAKE_CASE
- Private members: _prefixed (where needed)

### Documentation

- JSDoc comments for public APIs
- Inline comments for complex logic
- README for setup and usage
- Architecture docs (this file)

## Dependencies

### Runtime

- `obsidian`: Obsidian plugin API
- Node.js built-ins: `child_process`, `path`, `fs`

### Build

- `esbuild`: Fast bundler
- `typescript`: Type checking
- `@typescript-eslint/*`: Linting

### External

- Claude Code CLI: Required external dependency
- Anthropic API: Required for Claude access

---

## Contributing

When contributing to this plugin:

1. Understand this architecture
2. Follow existing patterns
3. Add tests for new features
4. Update documentation
5. Follow code standards

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.
