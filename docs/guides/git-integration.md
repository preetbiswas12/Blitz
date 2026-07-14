# Git Integration

Legion CLI provides built-in git tools for PR management, conflict resolution, and blame analysis.

## Tools Overview

| Tool | Purpose |
|---|---|
| `git_pr_create` | Create GitHub PRs from current branch |
| `git_pr_list` | List open/closed PRs |
| `git_conflict_resolve` | Resolve merge conflicts |
| `git_conflict_list` | List files with conflicts |
| `git_blame` | Analyze git blame with grouping |

## PR Creation

### Usage
```bash
# Create PR with title
legion run "create PR for user auth feature"

# Create PR with description
legion run "create PR with description 'Implements JWT authentication'"

# Create draft PR
legion run "create draft PR for work in progress"
```

### Tool Output
```json
{
  "title": "PR Created",
  "metadata": {
    "branch": "feature/user-auth",
    "prUrl": "https://github.com/user/repo/pull/123"
  },
  "output": "PR created successfully!\n\nBranch: feature/user-auth\nURL: https://github.com/user/repo/pull/123"
}
```

### Workflow
1. Checks for uncommitted changes
2. Pushes current branch to origin
3. Creates PR via GitHub CLI
4. Returns PR URL

## PR Listing

### Usage
```bash
# List open PRs
legion run "show open PRs"

# List closed PRs
legion run "show closed PRs"

# List all PRs
legion run "show all PRs"
```

### Tool Output
```json
{
  "title": "Open PRs (open)",
  "metadata": {
    "state": "open",
    "count": 5
  },
  "output": "#123  feat: user auth     feature/user-auth  2 hours ago\n#122  fix: login bug      fix/login          1 day ago\n..."
}
```

## Conflict Resolution

### List Conflicts
```bash
# Find conflicted files
legion run "list merge conflicts"
```

### Resolve Conflicts
```bash
# Resolve with "ours" strategy
legion run "resolve conflicts using ours"

# Resolve with "theirs" strategy
legion run "resolve conflicts using theirs"

# Manual resolution (shows conflict markers)
legion run "show conflict details"
```

### Conflict Resolution Strategies

| Strategy | Description |
|---|---|
| `ours` | Keep current branch changes |
| `theirs` | Keep incoming branch changes |
| `manual` | Show conflict markers for manual resolution |

### Tool Output
```json
{
  "title": "Conflicts Resolved",
  "metadata": {
    "strategy": "ours",
    "filesResolved": 3
  },
  "output": "Resolved 3 files using 'ours' strategy:\n- src/auth.ts\n- src/user.ts\n- src/config.ts"
}
```

## Git Blame

### Usage
```bash
# Blame a file
legion run "blame src/auth.ts"

# Blame with line range
legion run "blame src/auth.ts lines 10-50"
```

### Tool Output
```json
{
  "title": "Git Blame",
  "metadata": {
    "file": "src/auth.ts",
    "totalLines": 150,
    "uniqueAuthors": 3
  },
  "output": "Blame Summary:\n- John Doe: 89 lines (59%)\n- Jane Smith: 45 lines (30%)\n- Bob Wilson: 16 lines (11%)\n\nMost Recent Changes:\n- Line 145: Updated token validation (2 hours ago)\n- Line 120: Added refresh token logic (1 day ago)"
}
```

### Blame Analysis
The blame tool groups commits by author and provides:
- Line count per author
- Percentage of contribution
- Most recent changes
- Commit timestamps

## Integration with AI

Legion uses git tools to:

1. **Understand code history** before making changes
2. **Create PRs** automatically after implementing features
3. **Resolve conflicts** intelligently based on context
4. **Track changes** with blame analysis

## Prerequisites

### GitHub CLI
Ensure `gh` is installed and authenticated:

```bash
# Install GitHub CLI
brew install gh  # macOS
winget install gh  # Windows

# Authenticate
gh auth login
```

### Git Configuration
Ensure git is configured:

```bash
git config user.name "Your Name"
git config user.email "your@email.com"
```

## Examples

### Full Workflow
```bash
# 1. Create feature branch
git checkout -b feature/user-auth

# 2. Implement feature
legion run "implement user authentication"

# 3. Run tests
legion run "run tests"

# 4. Create PR
legion run "create PR for user auth"

# 5. Review and merge
# (Done via GitHub UI)
```

### Conflict Resolution
```bash
# 1. Merge branch
git merge main

# 2. See conflicts
legion run "list merge conflicts"

# 3. Resolve
legion run "resolve conflicts using ours"

# 4. Complete merge
git add .
git commit -m "merge: resolve conflicts"
```

## Configuration

Git settings in `legion.json`:

```json
{
  "git": {
    "autoPush": true,
    "createDraftPR": false,
    "defaultBranch": "main"
  }
}
```
