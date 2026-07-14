# Configuration

Legion CLI uses a hierarchical configuration system with project-level and global settings.

## Configuration Files

| File | Purpose | Scope |
|---|---|---|
| `legion.json` | Project configuration | Project |
| `~/.legion/legion.json` | Global configuration | User |
| `LEGION.md` | Project memory | Project |
| `~/.legion/LEGION.md` | Global memory | User |

## Configuration Schema

```json
{
  "$schema": "https://legioncli.com/schema/legion.json",
  "model": "anthropic/claude-sonnet-4",
  "small_model": "anthropic/claude-haiku-4",
  "subagent_model": "anthropic/claude-sonnet-4",
  "theme": "dark",
  "elc": {
    "enabled": true,
    "skills": true,
    "commands": true,
    "agents": true,
    "rules": true
  },
  "context": {
    "enabled": true,
    "intensity": "normal"
  },
  "memory": {
    "enabled": true,
    "autoSave": true
  },
  "git": {
    "autoPush": false,
    "createDraftPR": false
  }
}
```

## Core Settings

### Model Selection

```json
{
  "model": "provider/model-id",
  "small_model": "provider/model-id",
  "subagent_model": "provider/model-id"
}
```

| Setting | Purpose |
|---|---|
| `model` | Primary model for main tasks |
| `small_model` | Faster model for simple tasks |
| `subagent_model` | Model for subagent tasks |

### Theme

```json
{
  "theme": "dark" | "light" | "system"
}
```

## ELC Settings

```json
{
  "elc": {
    "enabled": true,
    "skills": true,
    "commands": true,
    "agents": true,
    "rules": true,
    "disabledSkills": ["skill-name"],
    "disabledCommands": ["command-name"]
  }
}
```

## Context Settings

```json
{
  "context": {
    "enabled": true,
    "intensity": "light" | "normal" | "deep",
    "preserveStyle": true,
    "minimalChanges": true,
    "customRules": true
  }
}
```

## Memory Settings

```json
{
  "memory": {
    "enabled": true,
    "autoSave": true,
    "maxEntries": 100,
    "persistSession": true
  }
}
```

## Git Settings

```json
{
  "git": {
    "autoPush": false,
    "createDraftPR": false,
    "defaultBranch": "main",
    "commitStyle": "conventional"
  }
}
```

## Permission Settings

```json
{
  "permissions": {
    "tool": {
      "bash": "ask" | "allow" | "deny",
      "write": "ask" | "allow" | "deny",
      "edit": "ask" | "allow" | "deny"
    },
    "network": {
      "fetch": "ask" | "allow" | "deny"
    }
  }
}
```

## Provider Settings

```json
{
  "providers": {
    "anthropic": {
      "apiKey": "env:ANTHROPIC_API_KEY"
    },
    "openai": {
      "apiKey": "env:OPENAI_API_KEY"
    }
  }
}
```

## MCP Settings

```json
{
  "mcp": {
    "servers": {
      "my-server": {
        "command": "node",
        "args": ["./server.js"],
        "env": {
          "API_KEY": "env:MY_API_KEY"
        }
      }
    }
  }
}
```

## Environment Variables

Legion respects these environment variables:

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `LEGION_CONFIG_DIR` | Custom config directory |
| `LEGION_PLATFORM` | Platform identifier |

## Configuration Priority

1. Command-line flags
2. Project `legion.json`
3. Global `~/.legion/legion.json`
4. Environment variables
5. Defaults

## Example Configurations

### Minimal
```json
{
  "model": "anthropic/claude-sonnet-4"
}
```

### Full Featured
```json
{
  "model": "anthropic/claude-sonnet-4",
  "small_model": "anthropic/claude-haiku-4",
  "theme": "dark",
  "elc": {
    "enabled": true
  },
  "context": {
    "enabled": true,
    "intensity": "normal"
  },
  "memory": {
    "enabled": true
  },
  "git": {
    "autoPush": false
  }
}
```

### Team Configuration
```json
{
  "model": "anthropic/claude-sonnet-4",
  "permissions": {
    "tool": {
      "bash": "ask"
    }
  },
  "git": {
    "commitStyle": "conventional",
    "defaultBranch": "develop"
  },
  "mcp": {
    "servers": {
      "jira": {
        "command": "jira-mcp",
        "args": ["--project", "PROJ"]
      }
    }
  }
}
```

## Validation

Legion validates configuration on startup:

```bash
# Check configuration
legion config validate

# Show current config
legion config show

# Reset to defaults
legion config reset
```

## Migration

When upgrading Legion, configuration may need migration:

```bash
# Auto-migrate configuration
legion config migrate

# Check migration status
legion config migrate --status
```
