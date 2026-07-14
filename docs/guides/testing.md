# Testing Guide

Legion CLI includes comprehensive testing support with auto-detection and execution.

## Running Tests

### Auto-Detect and Run
```bash
# Run all tests
legion run "run tests"

# Run specific test file
legion run "run tests in src/auth.test.ts"

# Run tests matching pattern
legion run "run tests matching 'user'"
```

### Manual Test Execution
```bash
# Vitest
npx vitest run

# Jest
npx jest

# Pytest
pytest

# Go
go test ./...

# Cargo
cargo test
```

## Writing Tests

### TypeScript (Vitest/Jest)
```typescript
import { describe, it, expect } from 'vitest'

describe('UserService', () => {
  it('should create user', async () => {
    const user = await createUser({ name: 'John' })
    expect(user.name).toBe('John')
  })

  it('should validate email', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('invalid')).toBe(false)
  })
})
```

### Python (Pytest)
```python
import pytest

def test_create_user():
    user = create_user(name="John")
    assert user.name == "John"

def test_validate_email():
    assert is_valid_email("test@example.com") == True
    assert is_valid_email("invalid") == False
```

### Go
```go
func TestCreateUser(t *testing.T) {
    user, err := CreateUser("John")
    if err != nil {
        t.Fatal(err)
    }
    if user.Name != "John" {
        t.Errorf("expected John, got %s", user.Name)
    }
}
```

### Rust
```rust
#[test]
fn test_create_user() {
    let user = create_user("John");
    assert_eq!(user.name, "John");
}
```

## Test Patterns

### Unit Tests
Test individual functions:
```typescript
// src/utils/math.test.ts
import { add, subtract } from './math'

describe('math', () => {
  it('adds numbers', () => {
    expect(add(1, 2)).toBe(3)
  })

  it('subtracts numbers', () => {
    expect(subtract(5, 3)).toBe(2)
  })
})
```

### Integration Tests
Test component interactions:
```typescript
// src/services/auth.integration.test.ts
describe('AuthService', () => {
  it('authenticates user', async () => {
    const auth = new AuthService()
    const user = await auth.login('john@example.com', 'password')
    expect(user).toBeDefined()
  })
})
```

### E2E Tests
Test complete workflows:
```typescript
// e2e/login.test.ts
describe('Login Flow', () => {
  it('logs in user', async () => {
    await page.goto('/login')
    await page.fill('#email', 'john@example.com')
    await page.fill('#password', 'password')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })
})
```

## Test Configuration

### Vitest
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

### Jest
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
}
```

### Pytest
```ini
# pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
python_functions = test_*
addopts = -v --tb=short
```

## Mocking

### Vitest/Jest
```typescript
import { vi, describe, it, expect } from 'vitest'

// Mock function
const mockFn = vi.fn()

// Mock module
vi.mock('./module', () => ({
  function: vi.fn(),
}))

// Mock implementation
mockFn.mockReturnValue(42)
```

### Pytest
```python
from unittest.mock import Mock, patch

# Mock function
mock_fn = Mock(return_value=42)

# Mock module
with patch('module.function') as mock:
    mock.return_value = 42
    result = function()
```

## Coverage

### Generate Coverage
```bash
# Vitest
npx vitest run --coverage

# Jest
npx jest --coverage

# Pytest
pytest --cov=src
```

### Coverage Reports
```bash
# HTML report
open coverage/index.html

# LCOV report
cat coverage/lcov.info
```

## CI Integration

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm test
```

### GitLab CI
```yaml
# .gitlab-ci.yml
test:
  script:
    - npm install
    - npm test
```

## Best Practices

1. **Test behavior, not implementation** - Test what it does, not how
2. **Use descriptive test names** - Clear intent
3. **Keep tests independent** - No shared state
4. **Use factories for test data** - Consistent fixtures
5. **Mock external dependencies** - Isolate unit tests
6. **Test edge cases** - Empty, null, boundary values
7. **Maintain test coverage** - Aim for 80%+
8. **Run tests in CI** - Catch regressions early
