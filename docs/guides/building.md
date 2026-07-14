# Build Process

Legion CLI compiles to a single Bun binary for easy distribution.

## Build Commands

### Development
```bash
# Run in development mode
bun run dev

# Run with parameters
bun run dev -- help
bun run dev -- run "implement feature"
```

### Production Build
```bash
# Build single binary
cd packages/opencode
bun run script/build.ts --single --skip-install

# Check binary size
du -h dist/*/*/bin/Legion
```

### Type Checking
```bash
# From root (all packages)
bun turbo typecheck

# From packages/opencode/
bun run typecheck
```

### Testing
```bash
# From packages/opencode/
bun test

# Single test
bun test ./test/tool/tool.test.ts
```

### Linting
```bash
# From root
bun run lint
```

## Build Output

```
dist/
├── @legion/
│   └── cli/
│       └── bin/
│           └── Legion          # Single Bun binary
└── ...
```

## Build Script

The build script (`script/build.ts`) handles:

1. **TypeScript compilation** - Compiles to JavaScript
2. **Bundling** - Bundles all dependencies
3. **Binary creation** - Creates single executable
4. **Optimization** - Tree-shaking, minification

### Build Options

```bash
# Full build
bun run script/build.ts

# Single binary
bun run script/build.ts --single

# Skip dependency install
bun run script/build.ts --skip-install

# Development build
bun run script/build.ts --dev
```

## Code Generation

Some code is auto-generated:

### SDK Generation
```bash
# From root
./script/generate.ts
```

### ELC/Context Generation
```bash
# From packages/opencode/
bun run script/generate-ecc.ts
bun run script/generate-ponytail.ts
```

## CI/CD

### GitHub Actions
```yaml
# .github/workflows/build.yml
name: Build
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun turbo typecheck
      - run: bun run script/build.ts --single
```

### Release Process
```bash
# 1. Update version
npm version patch|minor|major

# 2. Create changeset
bunx changeset add

# 3. Build
bun run script/build.ts --single

# 4. Publish
npm publish
```

## Platform-Specific Notes

### Windows
- Uses `windowsHide: true` for subprocess calls
- Avoids flashing console windows

### macOS
- Universal binary support (arm64 + x64)
- Code signing for distribution

### Linux
- Static linking for portability
- AppImage support

## Troubleshooting

### Build Errors
```bash
# Clean build
rm -rf dist
rm -rf node_modules
bun install
bun run script/build.ts --single
```

### Binary Too Large
```bash
# Check what's included
bun run script/build.ts --analyze

# Exclude debug info
bun run script/build.ts --production
```

### Missing Dependencies
```bash
# Reinstall
bun install

# Check dependencies
bun run script/check-dependencies.ts
```

## Development Tips

1. **Use `bun run dev`** - Fast iteration
2. **Run typecheck frequently** - Catch errors early
3. **Test binary before release** - Verify it works
4. **Check binary size** - Keep it reasonable
5. **Use source maps** - For debugging
