# Test Runner

Legion CLI includes an intelligent test runner that auto-detects frameworks and provides structured test results.

## Features

- **Auto-detection** of 7+ test frameworks
- **Structured output** with pass/fail counts and timing
- **File:line references** for failed tests
- **Framework-specific** command generation
- **Error handling** for missing dependencies

## Supported Frameworks

| Framework | Detection Pattern | Command |
|---|---|---|
| Vitest | `vitest.config.*` | `npx vitest run` |
| Jest | `jest.config.*` | `npx jest` |
| Pytest | `pytest.ini`, `setup.cfg`, `pyproject.toml` | `pytest` |
| Go Test | `go.mod` | `go test ./...` |
| Cargo Test | `Cargo.toml` | `cargo test` |
| Maven | `pom.xml` | `mvn test` |
| Gradle | `build.gradle*` | `gradle test` |

## Usage

### Auto-Run Tests
```bash
# Run tests in current directory
legion run "run tests"

# Run specific test file
legion run "run tests in src/utils.test.ts"

# Run tests matching pattern
legion run "run tests matching 'auth'"
```

### Manual Test Runner
The test runner tool can be called directly:

```typescript
// The tool auto-detects the framework and runs tests
const result = yield* TestRunnerTool.execute({
  // No parameters needed - auto-detects everything
})
```

## Output Format

```json
{
  "title": "Tests completed",
  "metadata": {
    "framework": "vitest",
    "totalTests": 42,
    "passed": 40,
    "failed": 2,
    "skipped": 0,
    "duration": "3.2s"
  },
  "output": "Test Results: 40 passed, 2 failed, 0 skipped (3.2s)\n\nFailed Tests:\n  src/auth.test.ts:45 - should validate token\n  src/auth.test.ts:67 - should handle refresh"
}
```

## Framework Detection

The test runner searches for framework config files:

```
Current Directory
├── vitest.config.ts      → Vitest
├── jest.config.js        → Jest
├── pytest.ini            → Pytest
├── go.mod                → Go Test
├── Cargo.toml            → Cargo Test
├── pom.xml               → Maven
└── build.gradle          → Gradle
```

## Integration with AI

When the AI detects test-related requests, it automatically:

1. **Detects framework** by searching for config files
2. **Generates command** based on detected framework
3. **Executes tests** via shell
4. **Parses output** for structured results
5. **Reports results** with file:line references

## Error Handling

### Missing Framework
```
Error: No test framework detected. 
Install vitest, jest, or pytest.
```

### Test Failures
```
Test Results: 40 passed, 2 failed (3.2s)

Failed Tests:
  src/auth.test.ts:45 - should validate token
    Expected: true
    Received: false
  
  src/auth.test.ts:67 - should handle refresh
    TypeError: Cannot read property 'token' of undefined
```

### Command Not Found
```
Error: 'vitest' not found. 
Run: npm install -D vitest
```

## Configuration

Test runner settings in `legion.json`:

```json
{
  "testRunner": {
    "framework": "auto",
    "timeout": 30000,
    "coverage": false
  }
}
```

## Examples

### TypeScript Project (Vitest)
```bash
$ legion run "run tests"
# Auto-detects: vitest
# Command: npx vitest run
# Output: 42 tests passed (2.1s)
```

### Python Project (Pytest)
```bash
$ legion run "run tests"
# Auto-detects: pytest
# Command: pytest
# Output: 128 tests passed (5.4s)
```

### Rust Project (Cargo)
```bash
$ legion run "run tests"
# Auto-detects: cargo
# Command: cargo test
# Output: 89 tests passed (12.3s)
```
