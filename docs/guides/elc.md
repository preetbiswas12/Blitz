# Everything Legion Code (ELC)

ELC is a comprehensive collection of 278+ skills, 94 commands, 67 agents, and 121 rules that extend Legion CLI's capabilities.

## Overview

ELC provides battle-tested patterns and workflows for:

- **Development workflows** (TDD, code review, refactoring)
- **Architecture patterns** (microservices, event sourcing, CQRS)
- **Security practices** (vulnerability scanning, dependency auditing)
- **Performance optimization** (profiling, caching, lazy loading)
- **DevOps** (CI/CD, containerization, monitoring)
- **Documentation** (API docs, README generation, changelogs)

## Components

### Skills (278+)
Self-contained workflows for specific tasks:

| Category | Examples |
|---|---|
| Development | `tdd`, `refactoring`, `code-review` |
| Architecture | `microservices`, `event-sourcing`, `cqrs` |
| Security | `security-scan`, `dependency-audit`, `owasp` |
| Performance | `profiling`, `caching`, `lazy-loading` |
| DevOps | `ci-cd`, `docker`, `kubernetes` |
| Documentation | `api-docs`, `readme`, `changelog` |

### Commands (94)
Slash commands for quick actions:

| Command | Purpose |
|---|---|
| `/plan` | Create implementation plan |
| `/review` | Code review workflow |
| `/test` | Test generation |
| `/refactor` | Refactoring suggestions |
| `/security-scan` | Security analysis |
| `/cost-report` | Token usage report |

### Agents (67)
Specialized AI personas for different tasks:

| Agent | Purpose |
|---|---|
| `code-reviewer` | Thorough code review |
| `security-auditor` | Security analysis |
| `performance-expert` | Optimization |
| `architect` | System design |
| `documenter` | Documentation |

### Rules (121)
Language-specific coding rules:

| Language | Rules |
|---|---|
| Common | Best practices, error handling |
| TypeScript | Types, async/await, modules |
| Python | PEP 8, type hints, async |
| Go | Concurrency, error handling |
| Rust | Ownership, lifetimes, traits |
| Java | Design patterns, streams |

## Usage

### Loading Skills
```bash
# Load a skill
legion run "use tdd skill to implement feature"

# Or via skill tool
skill(name="tdd")
```

### Using Commands
```bash
# Use a command
/plan implement user authentication

# Review code
/review src/auth.ts
```

### Agent Routing
Legion automatically routes tasks to appropriate agents:

```
User: "Review my code for security issues"
→ Routes to: security-auditor agent
→ Uses: security-scan skill
→ Applies: security rules
```

## Skill Structure

Each skill follows this structure:

```markdown
---
name: skill-name
description: What this skill does
---

# Skill Title

## When to Use
- Use case 1
- Use case 2

## Instructions
1. Step 1
2. Step 2

## Examples
...
```

## Integration

ELC integrates with Legion's core systems:

1. **System Prompts** - Rules are injected into context
2. **Tool System** - Skills provide tool instructions
3. **Agent System** - Agents use skills and rules
4. **Session System** - Commands are available in sessions

## Configuration

Enable/disable ELC in `legion.json`:

```json
{
  "elc": {
    "enabled": true,
    "skills": true,
    "commands": true,
    "agents": true,
    "rules": true
  }
}
```

## Customization

### Adding Custom Skills
Create `.legion/skills/my-skill/SKILL.md`:

```markdown
---
name: my-custom-skill
description: Does something specific
---

# My Custom Skill

## Instructions
1. Do this
2. Then that
```

### Disabling Specific Skills
```json
{
  "elc": {
    "disabledSkills": ["legacy-pattern", "deprecated-api"]
  }
}
```

## Examples

### TDD Workflow
```bash
legion run "use tdd to implement user registration"
# 1. Writes failing test
# 2. Implements minimal code
# 3. Refactors
# 4. Repeats
```

### Security Audit
```bash
legion run "security scan this project"
# 1. Scans dependencies
# 2. Checks for vulnerabilities
# 3. Reviews code patterns
# 4. Generates report
```

### Code Review
```bash
/review src/auth.ts
# 1. Analyzes code quality
# 2. Checks security
# 3. Reviews performance
# 4. Suggests improvements
```
