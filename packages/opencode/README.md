# Legion CLI

The AI coding agent built for the terminal. Generate code from natural language, automate tasks, and run terminal commands — powered by 500+ AI models.

![Legion CLI](https://res.cloudinary.com/ttrllc2i/image/upload/v1784270695/Screenshot_2026-07-15_164637_knyaxm.png)

## Install

```bash
npm install -g @legioncli/cli
```

Or run directly with npx:

```bash
npx @legioncli/cli
```

## Getting Started

Run `legion` in any project directory to launch the interactive TUI:

```bash
legion
```

Run a one-off task:

```bash
legion run "add input validation to the signup form"
```

## Features

- **Code generation** — describe what you want in natural language
- **Terminal commands** — the agent can run shell commands on your behalf
- **500+ AI models** — use models from OpenAI, Anthropic, Google, and more
- **MCP servers** — extend agent capabilities with the Model Context Protocol
- **Multiple modes** — Plan, Code, Debug, or create your own custom agent
- **Sessions** — resume previous conversations and export transcripts
- **Memory** — persistent memory across sessions
- **Emotion detection** — adaptive responses based on user sentiment
- **Built-in tools** — Test Runner, Git PR tools, Memory System, and more

## Commands

| Command                  | Description                |
| ------------------------ | -------------------------- |
| `legion`                 | Launch interactive TUI     |
| `legion run "<task>"`    | Run a one-off task         |
| `legion auth`            | Manage authentication      |
| `legion models`          | List available models      |
| `legion mcp`             | Manage MCP servers         |
| `legion session list`    | List sessions              |
| `legion session delete`  | Delete a session           |
| `legion export`          | Export session transcripts |
| `legion upgrade`         | Upgrade to latest version  |

Run `legion --help` for the full list.

## Links

- [GitHub](https://github.com/preetbiswas12/Blitz)

## License

MIT
