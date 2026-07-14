# Legion CLI Documentation

Legion CLI is an open-source AI coding agent that generates code from natural language, automates tasks, and supports 500+ AI models. It is built as a fork of OpenCode with significant enhancements for professional software engineering workflows.

## Quick Start

```bash
# Install globally
npm install -g @legioncli

# Run in your project
legion

# Or use directly
legion run "implement user authentication"
```

## Core Features

| Feature | Description |
|---|---|
| [Memory System](guides/memory-system.md) | Persistent project memory via LEGION.md and session entries |
| [Test Runner](guides/test-runner.md) | Auto-detect and run tests across 7+ frameworks |
| [Git Integration](guides/git-integration.md) | PR creation, conflict resolution, and blame analysis |
| [ELC Skills](guides/elc.md) | 278+ built-in skills for common development tasks |
| [Context Mode](guides/context.md) | Lazy senior dev mode with smart defaults |
| [Multi-Model](guides/multi-model.md) | Support for 500+ AI models across providers |

## Architecture

- [System Overview](architecture/overview.md) - High-level architecture
- [Monorepo Structure](architecture/monorepo.md) - Package layout and dependencies
- [Tool System](architecture/tools.md) - How tools are registered and executed
- [System Prompts](architecture/system-prompts.md) - Prompt assembly and injection
- [Plugin System](architecture/plugins.md) - Plugin loading and lifecycle

## Configuration

- [Configuration Guide](guides/configuration.md) - All config options
- [Provider Setup](guides/providers.md) - Setting up AI providers
- [Model Selection](guides/models.md) - Choosing the right model

## Development

- [Contributing](../CONTRIBUTING.md) - How to contribute
- [Testing](guides/testing.md) - Running and writing tests
- [Build Process](guides/building.md) - Building the CLI binary
