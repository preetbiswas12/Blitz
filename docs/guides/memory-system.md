# Memory System

Legion CLI includes a persistent memory system that loads project-specific context and session learnings to improve AI responses.

## Overview

The memory system provides:
- **LEGION.md loading** from project root and global config
- **Session memory** persistence across conversations
- **Automatic injection** into system prompts
- **Structured storage** in JSON format

## How It Works

```
┌─────────────────────────────────────┐
│         Memory Loader               │
├─────────────────────────────────────┤
│  1. Load LEGION.md (project)        │
│  2. Load LEGION.md (global)         │
│  3. Load session memory             │
│  4. Format context                  │
│  5. Inject into system prompt       │
└─────────────────────────────────────┘
```

## LEGION.md

Create a `LEGION.md` file in your project root to provide persistent context:

```markdown
# Project Memory

## Architecture
- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL with Prisma

## Conventions
- Use functional components with hooks
- All API endpoints follow RESTful patterns
- Error handling uses custom error classes

## Decisions
- 2024-01-15: Switched from MongoDB to PostgreSQL
- 2024-02-20: Adopted Zustand for state management

## Learnings
- The auth module requires special handling for JWT refresh tokens
- Database migrations must be run in order
```

### Global LEGION.md

For preferences across all projects, create `~/.legion/LEGION.md`:

```markdown
# Global Preferences

## Coding Style
- Prefer functional programming
- Use async/await over callbacks
- Always handle errors explicitly

## Tools
- Use ripgrep for searching
- Prefer fd over find
- Use bat for file viewing
```

## Session Memory

Session memory stores learnings from conversations:

```typescript
// Memory entries are stored in ~/.legion/legion-memory.json
{
  "key": "learning-1234567890-abc123",
  "content": "The auth module requires JWT refresh token handling",
  "source": "auto",
  "timestamp": 1710000000000
}
```

### Memory Sources

| Source | Description |
|---|---|
| `legion.md` | LEGION.md file content |
| `user` | User-created memory entries |
| `auto` | Automatically saved learnings |

## Automatic Context Injection

Memory is automatically loaded and injected into the system prompt:

```
# Project Memory
The following memory has been loaded from LEGION.md and session memory.
Use this context to inform your responses about project conventions...

# LEGION.md content
[Your LEGION.md content here]

# Session Memory
## learning-1234567890-abc123
The auth module requires JWT refresh token handling
```

## Using Memory

### In Conversations
Memory is automatically available. The AI will use it to:
- Follow project conventions
- Reference past decisions
- Apply learned patterns

### Manual Memory Management
```typescript
// Save a memory entry
yield* Memory.save({
  key: "architecture-decision",
  content: "We use Event Sourcing for the order service",
  source: "user"
})

// List all memories
const memories = yield* Memory.list()

// Remove a memory
yield* Memory.remove({ key: "architecture-decision" })
```

## Configuration

Memory settings in `legion.json`:

```json
{
  "memory": {
    "enabled": true,
    "autoSave": true,
    "maxEntries": 100
  }
}
```

## File Locations

| File | Purpose |
|---|---|
| `./LEGION.md` | Project-specific memory |
| `~/.legion/LEGION.md` | Global memory |
| `~/.legion/legion-memory.json` | Session memory storage |

## Best Practices

1. **Be specific** - Write clear, actionable conventions
2. **Update regularly** - Keep LEGION.md current with project evolution
3. **Use sections** - Organize with clear headings
4. **Include examples** - Show code patterns when helpful
5. **Date decisions** - Track when decisions were made
6. **Global vs project** - Keep project-specific items in project LEGION.md
