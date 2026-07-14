# Context Mode (Lazy Senior Dev)

Context mode provides a "lazy senior dev" approach to coding - minimal instructions, maximum efficiency.

## Philosophy

Context mode follows these principles:

1. **Don't repeat yourself** - Use existing patterns
2. **Convention over configuration** - Follow project conventions
3. **Minimal intervention** - Only change what's necessary
4. **Learn from context** - Understand before acting

## Features

- **Smart defaults** - Follows project conventions automatically
- **Pattern recognition** - Uses existing code patterns
- **Minimal code changes** - Only modifies what's needed
- **Context-aware** - Understands project structure

## Rules

Context rules are injected into the system prompt:

```markdown
# Context Rules

## Minimal Changes
- Only modify files directly related to the task
- Preserve existing code style
- Don't refactor unless asked

## Pattern Recognition
- Follow existing project patterns
- Use similar implementations as reference
- Maintain consistency

## Smart Defaults
- Use project's existing dependencies
- Follow established architecture
- Respect naming conventions
```

## Usage

Context mode is automatically active. The AI will:

1. **Analyze existing code** before making changes
2. **Follow patterns** found in the codebase
3. **Minimize changes** to only what's necessary
4. **Preserve style** and conventions

## Examples

### Adding a Feature
```bash
# Instead of creating new patterns
legion run "add user profile page"

# Context mode will:
# 1. Look at existing pages
# 2. Follow same structure
# 3. Use same components
# 4. Maintain same style
```

### Fixing a Bug
```bash
# Minimal fix approach
legion run "fix login validation bug"

# Context mode will:
# 1. Find the bug location
# 2. Understand the context
# 3. Apply minimal fix
# 4. Don't refactor surrounding code
```

## Configuration

Context settings in `legion.json`:

```json
{
  "context": {
    "enabled": true,
    "intensity": "normal",
    "preserveStyle": true,
    "minimalChanges": true
  }
}
```

### Intensity Levels

| Level | Description |
|---|---|
| `light` | Basic pattern following |
| `normal` | Standard context awareness |
| `deep` | Thorough analysis before changes |

## Integration

Context mode integrates with:

1. **ELC Rules** - Language-specific best practices
2. **Memory System** - Project conventions from LEGION.md
3. **Skill System** - Task-specific workflows
4. **Agent System** - Specialized personas

## Best Practices

1. **Write good LEGION.md** - Document your conventions
2. **Keep patterns consistent** - Context mode learns from your code
3. **Review changes** - Even with context mode, review outputs
4. **Provide feedback** - Help the AI learn your preferences

## Comparison

### Without Context Mode
```typescript
// AI might create new patterns
export function authenticateUser(credentials: any) {
  // New, inconsistent implementation
}
```

### With Context Mode
```typescript
// AI follows existing patterns
export function authenticateUser(credentials: LoginCredentials): Promise<User> {
  // Consistent with existing auth module
}
```

## Examples

### Project with Strong Conventions
```
Project: React + TypeScript + Tailwind

Context Mode will:
- Use functional components with hooks
- Follow existing naming patterns
- Use same state management approach
- Maintain consistent styling
```

### Project with Minimal Conventions
```
Project: Vanilla JS

Context Mode will:
- Infer patterns from existing code
- Follow file structure
- Use similar coding style
- Maintain consistency
```

## Advanced Usage

### Custom Rules
Add to `.legion/context-rules.md`:

```markdown
# Custom Context Rules

## Our Conventions
- Always use named exports
- Prefer composition over inheritance
- Error boundaries around all forms
- Memo expensive calculations
```

### Override Defaults
```json
{
  "context": {
    "intensity": "deep",
    "customRules": true,
    "preserveStyle": false
  }
}
```
