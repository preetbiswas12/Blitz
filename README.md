<p align="center">
  <h1 align="center">Blitz</h1>
  <p align="center">The open source coding agent for building with AI.</p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@blitzcode/cli"><img alt="npm" src="https://raster.shields.io/npm/v/@blitzcode/cli?style=flat" height="20" /></a>
  <a href="https://x.com/blitzcode"><img src="https://raster.shields.io/badge/blitzcode-000000?style=flat&logo=x&logoColor=white" alt="X (Twitter)" height="20"></a>
  <a href="https://blitz.ai/discord"><img src="https://raster.shields.io/badge/Join%20Discord-5865F2?style=flat&logo=discord&logoColor=white" alt="Discord" height="20"></a>
  <a href="https://www.reddit.com/r/blitzcode/"><img src="https://raster.shields.io/badge/Join%20r%2Fblitzcode-D84315?style=flat&logo=reddit&logoColor=white" alt="Reddit" height="20"></a>
</p>

---

Blitz is an open source AI coding agent. You pick from 500+ models, switch between them mid-task, and pay the model provider's rate with zero markup. No API keys required to start.

### Installation

```bash
# npm
npm install -g @blitzcode/cli

# curl
curl -fsSL https://blitz.ai/cli/install | bash

# pnpm
pnpm add -g @blitzcode/cli

# bun
bun add -g @blitzcode/cli

# Homebrew (macOS / Linux)
brew install Blitz-Org/tap/blitz

# Arch Linux (AUR)
paru -S blitz-bin
```

Then run `blitz` in any project directory to start.

<details>
<summary>Install from GitHub Releases (binaries)</summary>

Download the latest binary from the [Releases page](https://github.com/Blitz-Org/blitzcode/releases).

| Platform | Asset |
|---|---|
| Windows (most PCs) | `blitz-windows-x64.zip` |
| macOS (Apple Silicon) | `blitz-darwin-arm64.zip` |
| macOS (Intel) | `blitz-darwin-x64.zip` |
| Linux x64 | `blitz-linux-x64.tar.gz` |
| Linux ARM | `blitz-linux-arm64.tar.gz` |

</details>

### Agents

Blitz ships with specialized agents you switch between depending on the task. You can also build your own custom agents.

- **Code** - The default. Implements and edits code from natural language.
- **Plan** - Designs architecture and writes implementation plans before any code gets written.
- **Ask** - Answers questions about your codebase without touching any files.
- **Debug** - Troubleshoots and traces issues.
- **Review** - Reviews your changes and surfaces issues across performance, security, style, and test coverage.

Learn more about [agents and custom agents](https://blitz.ai/docs/code-with-ai/agents/using-agents).

### What it does

- **Code generation** from natural language, across multiple files.
- **Self-checking** so the agent reviews and corrects its own work.
- **Terminal and browser control** to run commands and automate the web.
- **MCP marketplace** to find and wire up MCP servers that extend what the agent can do.
- **500+ models** with mid-task switching, so you can match latency, cost, and reasoning to the job.

### Autonomous Mode (CI/CD)

Run `blitz run` with `--auto` for fully autonomous operation with no prompts, built for CI/CD pipelines:

```bash
blitz run --auto "run tests and fix any failures"
```

`--auto` disables all permission prompts and lets the agent execute any action without confirmation. Only use it in trusted environments.

### Documentation

For configuration and everything else, [head over to the docs](https://blitz.ai/docs).

### Contributing

Contributions are welcome from developers, writers, and everyone in between. Start with the [Contributing Guide](/CONTRIBUTING.md) for environment setup, coding standards, and how to open a pull request.

Please review our [Code of Conduct](/CODE_OF_CONDUCT.md) before getting involved.

### License

MIT. You're free to use, modify, and distribute this code, including commercially, as long as you keep the attribution and license notices. See [License](/LICENSE).

### FAQ

<details>
<summary>Where did Blitz come from?</summary>

Blitz is a fork of [OpenCode](https://github.com/anomalyco/opencode), enhanced to work as a standalone BYOK (Bring Your Own Key) coding agent.

</details>

---

**Join the community** [Discord](https://blitz.ai/discord) | [X](https://x.com/blitzcode) | [Reddit](https://www.reddit.com/r/blitzcode/)
