# Publishing @legion/cli to npm

## Prerequisites

### 1. npm Account
- Create an account at https://www.npmjs.com/signup
- Verify your email address
- Enable 2FA (recommended, required for `--provenance` flag)

### 2. npm Organization
Since the package is scoped (`@legion/cli`), you need to create an npm org:
```bash
npm org create legion
```
Or create it at https://www.npmjs.com/org/create

### 3. npm Login
```bash
npm login
```
Enter your npm username, password, and 2FA code when prompted.

### 4. npm Token (for CI/CD)
If publishing from GitHub Actions or a script:
1. Go to https://www.npmjs.com/settings/tokens
2. Create a new "Automation" token
3. Store it as `NPM_TOKEN` in your environment or CI secrets

## Build and Publish

### Quick Publish (npm only)
```bash
cd packages/opencode

# Verify package.json has correct name and version
cat package.json | grep -E '"name"|"version"'

# Build the CLI
bun run script/build.ts --single --skip-install

# Publish to npm
npm publish --access public --provenance
```

### Full Release (npm + GitHub + Homebrew)
```bash
cd packages/opencode

# Bump version in package.json first
# Then run the full publish script
GITHUB_TOKEN=your_token bun run script/publish.ts
```

## Version Management

### Semantic Versioning
- `1.0.0` → `1.0.1` = Patch (bug fixes)
- `1.0.0` → `1.1.0` = Minor (new features, backward compatible)
- `1.0.0` → `2.0.0` = Major (breaking changes)

### Auto-Update Behavior
| User's Install Version | Latest Version | Behavior |
|---|---|---|
| 1.0.0 | 1.0.1 (patch) | Silent auto-upgrade (if autoupdate=true) |
| 1.0.0 | 1.1.0 (minor) | Shows update dialog |
| 1.0.0 | 2.0.0 (major) | Shows update dialog |
| 1.0.0 | 1.0.0 | No notification |

### Updating the Version
Edit `packages/opencode/package.json`:
```json
{
  "version": "1.1.0"
}
```

The build script (`script/build.ts`) reads this version and bakes it into the binary as `KILO_VERSION`.

## npm Registry Configuration

The CLI checks for updates at:
- **Registry**: `https://registry.npmjs.org`
- **Package**: `@legion/cli`
- **URL**: `https://registry.npmjs.org/@legion%2fcli/latest`

If users have a custom npm registry (e.g., enterprise), the CLI reads their `.npmrc` to resolve the correct registry URL.

## User Installation

### Install globally
```bash
npm install -g @legion/cli
```

### Install specific version
```bash
npm install -g @legion/cli@1.0.0
```

### Update manually
```bash
npm update -g @legion/cli
```

Or use the built-in command:
```bash
legion upgrade
```

## Configuration Options

Users can control auto-update behavior in their global config (`~/.legion/config.json`):

```json
{
  "autoupdate": true
}
```

| Value | Behavior |
|---|---|
| `true` (default) | Auto-upgrades patches silently, shows dialog for minor/major |
| `false` | Disables all update checks |
| `"notify"` | Only shows dialog, never auto-upgrades |

Environment variables:
| Variable | Effect |
|---|---|
| `KILO_DISABLE_AUTOUPDATE=1` | Disables all update checks |
| `KILO_ALWAYS_NOTIFY_UPDATE=1` | Always shows update dialog (for testing) |

## Troubleshooting

### "npm ERR 403 Forbidden"
- Ensure you're logged in: `npm whoami`
- Ensure the org `@legion` exists
- Ensure you have publish permissions

### "npm ERR 402 Payment Required"
- Scoped packages require a paid plan for private packages
- Use `--access public` for free public packages

### Auto-update not showing
- Check if installed via npm/yarn/pnpm/bun (only these support auto-update)
- Check `autoupdate` config setting
- Check environment variables
- Verify the published version is newer than installed version

### Version check failing silently
- The CLI catches all errors during version check
- Check network connectivity
- Verify npm registry is accessible
- Check if `.npmrc` has custom registry settings
