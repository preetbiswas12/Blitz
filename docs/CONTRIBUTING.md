# Contributing to Legion CLI

Thank you for your interest in contributing to Legion CLI! This guide will help you get started.

## Development Setup

### Prerequisites
- [Bun](https://bun.sh/) (latest version)
- [Node.js](https://nodejs.org/) (v18+)
- [Git](https://git-scm.com/)

### Clone and Install
```bash
# Clone the repository
git clone https://github.com/preetbiswas12/Blitz.git
cd kilocode

# Install dependencies
bun install

# Start development
bun run dev
```

## Project Structure

```
kilocode/
├── packages/
│   ├── opencode/          # Core CLI engine
│   ├── sdk/js/            # Auto-generated SDK
│   ├── kilo-vscode/       # VS Code extension
│   └── ...
├── docs/                  # Documentation
└── script/                # Build scripts
```

## Development Workflow

### 1. Create a Branch
```bash
git checkout -b feature/my-feature
```

### 2. Make Changes
- Follow the [Style Guide](#style-guide)
- Write tests for new functionality
- Update documentation if needed

### 3. Run Checks
```bash
# Type check
bun turbo typecheck

# Lint
bun run lint

# Test
cd packages/opencode
bun test
```

### 4. Commit Changes
```bash
git add .
git commit -m "feat: add my feature"
```

### 5. Push and Create PR
```bash
git push origin feature/my-feature
```

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

| Type | Description |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Maintenance |

Examples:
```
feat: add user authentication
fix: resolve login bug
docs: update API documentation
```

## Style Guide

### TypeScript
- Use TypeScript strict mode
- Prefer `const` over `let`
- Avoid `any` type
- Use single word variable names
- Follow existing patterns

### Naming
```typescript
// Good
const user = getUser()
const count = items.length

// Bad
const userData = getUser()
const itemCount = items.length
```

### Functions
```typescript
// Good - short and focused
function getUser() { ... }
function validateInput() { ... }

// Bad - too long
function getUserAndValidateAndProcessAndReturn() { ... }
```

### Error Handling
```typescript
// Good
try {
  await riskyOperation()
} catch (err) {
  log.error("Operation failed", { err })
  throw err
}

// Bad
try {
  await riskyOperation()
} catch {
  // Silent failure
}
```

## Testing

### Write Tests
```typescript
// src/utils/math.test.ts
import { describe, it, expect } from 'vitest'
import { add } from './math'

describe('add', () => {
  it('adds numbers', () => {
    expect(add(1, 2)).toBe(3)
  })
})
```

### Run Tests
```bash
# All tests
bun test

# Specific test
bun test ./test/tool/tool.test.ts
```

## Documentation

### Update Docs
- Add new features to `docs/`
- Update existing docs if behavior changes
- Include examples

### Documentation Style
- Use clear, concise language
- Include code examples
- Add tables for reference

## Pull Request Process

1. **Fill out PR template**
2. **Link related issues**
3. **Add screenshots** (if UI changes)
4. **Request review**
5. **Address feedback**
6. **Merge when approved**

## Reporting Issues

### Bug Reports
Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details

### Feature Requests
Include:
- Use case
- Proposed solution
- Alternatives considered

## Code of Conduct

- Be respectful
- Welcome newcomers
- Help others learn
- Focus on the code

## Questions?

- Open an issue
- Join discussions
- Ask in PRs

Thank you for contributing!
