# Publishing @legioncli to npm

## Prerequisites

### 1. npm Account
- Create an account at https://www.npmjs.com/signup
- Verify your email address
- Enable 2FA (recommended, required for `--provenance` flag)

### 2. npm Organization
Since the package is scoped (`@legioncli`), you need to create an npm org:
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

## Build Process

### Understanding the Build

Legion CLI compiles to a single Bun binary. The build process:
1. Type-checks the codebase
2. Bundles all dependencies into a single file
3. Creates a self-contained executable
4. Packages with npm metadata for distribution

### Build Commands

#### Development Build
```bash
cd packages/opencode

# Run in development mode (no binary)
bun run dev

# Run with parameters
bun run dev -- help
bun run dev -- run "implement feature"
```

#### Production Build (Single Binary)
```bash
cd packages/opencode

# Build single binary for current platform
bun run script/build.ts --single --skip-install

# The binary will be at:
# dist/@legion/cli/bin/Legion (Linux/macOS)
# dist/@legion/cli/bin/Legion.exe (Windows)
```

#### Check Binary Size
```bash
# After building
du -h dist/*/*/bin/Legion
```

### Build Options

| Option | Description |
|---|---|
| `--single` | Create single binary (default: multi-file) |
| `--skip-install` | Skip dependency installation during build |
| `--dev` | Development build with source maps |
| `--production` | Production build, optimized |

### Build Script Details

The build script (`script/build.ts`) performs:

1. **Dependency Resolution** - Installs production dependencies
2. **TypeScript Compilation** - Compiles TypeScript to JavaScript
3. **Bundling** - Uses Bun's bundler to create single file
4. **Binary Creation** - Wraps bundle in executable
5. **Version Injection** - Bakes version from package.json into binary
6. **Platform Detection** - Creates appropriate binary for OS/arch

## Packing for npm

### Create npm Package

```bash
cd packages/opencode

# Build the binary first
bun run script/build.ts --single --skip-install

# Create the npm package
npm pack

# This creates: legioncli-x.x.x.tgz
```

### Package Structure

The npm package includes:
```
package/
├── bin/
│   └── Legion          # The CLI binary
├── package.json        # npm metadata
├── README.md           # Documentation
└── LICENSE             # License file
```

### Verify Package Contents

```bash
# List contents of the tarball
tar -tzf legioncli-*.tgz

# Extract and inspect
mkdir temp && tar -xzf legioncli-*.tgz -C temp
ls -la temp/package/
```

## Publishing

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

### Publish with Tag

```bash
# Publish as latest (default)
npm publish --access public

# Publish as beta
npm publish --access public --tag beta

# Publish as next
npm publish --access public --tag next
```

### Full Release (npm + GitHub + Homebrew)

```bash
cd packages/opencode

# Bump version in package.json first
# Then run the full publish script
GITHUB_TOKEN=your_token bun run script/publish.ts
```

### Publishing Workflow

1. **Update Version**
   ```bash
   # Edit package.json
   # Or use npm version
   npm version patch  # 1.0.0 → 1.0.1
   npm version minor  # 1.0.0 → 1.1.0
   npm version major  # 1.0.0 → 2.0.0
   ```

2. **Create Changeset** (optional, for changelogs)
   ```bash
   bunx changeset add
   ```

3. **Build**
   ```bash
   bun run script/build.ts --single --skip-install
   ```

4. **Test**
   ```bash
   # Test the binary
   ./dist/@legion/cli/bin/Legion --version
   ./dist/@legion/cli/bin/Legion run "hello world"
   ```

5. **Publish**
   ```bash
   npm publish --access public --provenance
   ```

6. **Tag Release**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
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
- **Package**: `@legioncli`
- **URL**: `https://registry.npmjs.org/@legion%2fcli/latest`

If users have a custom npm registry (e.g., enterprise), the CLI reads their `.npmrc` to resolve the correct registry URL.

## User Installation

### Install globally
```bash
npm install -g @legioncli
```

### Install specific version
```bash
npm install -g @legioncli@1.0.0
```

### Update manually
```bash
npm update -g @legioncli
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

## CI/CD Publishing

### GitHub Actions

```yaml
# .github/workflows/publish.yml
name: Publish
on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: cd packages/opencode && bun run script/build.ts --single --skip-install
      - run: cd packages/opencode && npm publish --access public --provenance
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Publish from Script

```bash
#!/bin/bash
# publish.sh

set -e

echo "Building..."
cd packages/opencode
bun run script/build.ts --single --skip-install

echo "Testing..."
./dist/@legion/cli/bin/Legion --version

echo "Publishing..."
npm publish --access public --provenance

echo "Done!"
```

## Troubleshooting

### "npm ERR 403 Forbidden"
- Ensure you're logged in: `npm whoami`
- Ensure the org `@legion` exists
- Ensure you have publish permissions

### "npm ERR 402 Payment Required"
- Scoped packages require a paid plan for private packages
- Use `--access public` for free public packages

### Build Fails
```bash
# Clean and rebuild
rm -rf dist
rm -rf node_modules
bun install
bun run script/build.ts --single --skip-install
```

### Binary Too Large
```bash
# Check what's included
bun run script/build.ts --analyze

# Exclude debug info
bun run script/build.ts --production
```

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

### Platform-Specific Issues

#### Windows
- Ensure `windowsHide: true` is set for subprocess calls
- Test on clean Windows environment

#### macOS
- Test on both Intel and Apple Silicon
- Consider code signing for distribution

#### Linux
- Test on multiple distributions
- Consider AppImage for wider compatibility
