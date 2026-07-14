# Monorepo Structure

Legion CLI uses Turborepo with Bun workspaces for managing the monorepo.

## Package Layout

```
kilocode/
├── packages/
│   ├── opencode/          # Core CLI engine (@legion/cli)
│   ├── sdk/js/            # Auto-generated TypeScript SDK
│   ├── kilo-vscode/       # VS Code extension
│   ├── kilo-gateway/      # Auth and provider routing
│   ├── kilo-telemetry/    # Analytics and observability
│   ├── kilo-i18n/         # Internationalization
│   ├── kilo-ui/           # Shared UI components
│   ├── util/              # Shared utilities
│   └── plugin/            # Plugin interface definitions
├── docs/                  # Documentation
└── script/                # Build and code generation scripts
```

## Core Package (`packages/opencode/`)

The main CLI engine containing:

### Source Structure
```
src/
├── session/           # Session management and LLM interaction
│   ├── system.ts      # System prompt assembly
│   ├── prompt.ts      # Prompt resolution
│   └── llm/           # LLM request/response handling
├── tool/              # Tool definitions and registry
│   ├── builtin/       # Core tools (read, write, edit, bash, etc.)
│   └── registry.ts    # Tool registration
├── provider/          # AI provider integrations
├── plugin/            # Plugin system
├── skill/             # Skill discovery and loading
├── agent/             # Agent definitions and prompts
├── config/            # Configuration management
├── cli/               # CLI entry points and TUI
├── server/            # HTTP server for SDK communication
└── kilocode/          # Legion-specific extensions
    ├── memory/        # Memory system (LEGION.md)
    ├── tool/          # Extended tools (test runner, git, etc.)
    ├── git/           # Git integration tools
    ├── elc/           # Everything Legion Code (skills, commands, agents)
    ├── context/       # Context mode (lazy senior dev)
    ├── soul.txt       # Core personality
    ├── brain.txt      # Behavioral rules
    └── system-prompt.ts # Environment injection
```

### Build Outputs
```
dist/
├── @legion/cli/       # Scoped package output
│   └── bin/
│       └── legion     # Single Bun binary
└── ...
```

## Key Packages

| Package | Name | Purpose |
|---|---|---|
| `packages/opencode/` | `@legion/cli` | Core CLI engine |
| `packages/sdk/js/` | `@legion/sdk` | Auto-generated TypeScript SDK |
| `packages/kilo-vscode/` | `Legion-code` | VS Code extension |
| `packages/kilo-gateway/` | `@legion/kilo-gateway` | Auth and provider routing |
| `packages/kilo-telemetry/` | `@legion/kilo-telemetry` | Analytics |
| `packages/kilo-i18n/` | `@legion/kilo-i18n` | Translations |
| `packages/kilo-ui/` | `@legion/kilo-ui` | Shared UI components |
| `packages/util/` | `@opencode-ai/util` | Shared utilities |
| `packages/plugin/` | `@legion/plugin` | Plugin definitions |

## Development Commands

```bash
# From root
bun install              # Install dependencies
bun run dev              # Run development server
bun turbo typecheck      # Type-check all packages
bun run lint             # Lint all packages

# From packages/opencode/
bun test                 # Run tests
bun test ./path/to/test  # Run single test
bun run typecheck        # Type-check CLI package
```

## Code Generation

Some packages are auto-generated:

- `packages/sdk/js/` - Generated from server API spec
- `packages/opencode/src/kilocode/elc/` - Generated from upstream skills
- `packages/opencode/src/kilocode/context/` - Generated from upstream rules

Run generators:
```bash
# From packages/opencode/
bun run script/generate-ecc.ts      # Generate ELC skills
bun run script/generate-ponytail.ts # Generate Context rules

# From root
./script/generate.ts                # Regenerate SDK
```
