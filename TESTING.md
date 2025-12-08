# Testing Configuration Summary

This document provides an overview of the testing setup for the @phrasecode/odata project.

## 📋 Overview

The project now has a comprehensive testing setup with two types of tests:

1. **Unit Tests** - Test individual functions and classes in isolation
2. **End-to-End (E2E) Tests** - Test the complete API with a running Express server

## 🗂️ Project Structure

```
@phrasecode/odata/
├── __tests__/
│   ├── README.md                    # Detailed testing guide
│   ├── unit/                        # Unit tests
│   │   ├── setup.ts                # Unit test setup
│   │   ├── utils/                  # Utility function tests
│   │   │   ├── logger.test.ts
│   │   │   └── stringUtilFunctions.test.ts
│   │   └── core/                   # Core functionality tests
│   │       └── query/
│   │           └── parseSelect.test.ts
│   └── e2e/                        # End-to-end tests
│       ├── setup.ts                # E2E test setup
│       ├── globalSetup.ts          # Start server before tests
│       ├── globalTeardown.ts       # Stop server after tests
│       ├── helpers/                # Test helper functions
│       │   └── queryRunner.ts
│       └── api/                    # API endpoint tests
│           ├── basic-queries.test.ts
│           └── expansion-queries.test.ts
├── jest.config.js                  # Main Jest config (runs both)
├── jest.config.unit.js             # Unit test config
└── jest.config.e2e.js              # E2E test config
```

## 🚀 Available Test Commands

### Unit Tests

```bash
npm run test:unit              # Run all unit tests
npm run test:unit:watch        # Run unit tests in watch mode
npm run test:unit:coverage     # Run unit tests with coverage report
```

### End-to-End Tests

```bash
npm run test:e2e               # Run all E2E tests
npm run test:e2e:watch         # Run E2E tests in watch mode
```

### All Tests

```bash
npm run test:all               # Run both unit and E2E tests sequentially
npm test                       # Run all tests (default)
npm run test:watch             # Run all tests in watch mode
npm run test:coverage          # Run all tests with coverage
```

## 📝 Test Examples

### Unit Test Example

```typescript
// __tests__/unit/utils/stringUtilFunctions.test.ts
import { convertStringToSnakeCase } from '../../../src/utils/stringUtilFunctions';

describe('convertStringToSnakeCase', () => {
  it('should convert camelCase to snake_case', () => {
    expect(convertStringToSnakeCase('camelCase')).toBe('camel_case');
  });
});
```

### E2E Test Example

```typescript
// __tests__/e2e/api/basic-queries.test.ts
import { query1_activeUsers } from '../../../examples/express-app/test-queries';

const BASE_URL = 'http://localhost:3001';

describe('Basic OData Queries', () => {
  it('should return active users', async () => {
    const response = await fetch(`${BASE_URL}${query1_activeUsers}`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('data');
  });
});
```

## ⚙️ Configuration Details

### Unit Tests

- **Test Environment**: Node.js
- **Test Pattern**: `**/__tests__/unit/**/*.test.ts`
- **Coverage**: Enabled by default
- **Coverage Directory**: `coverage/unit`
- **Timeout**: Default (5 seconds)

### E2E Tests

- **Test Environment**: Node.js
- **Test Pattern**: `**/__tests__/e2e/**/*.test.ts`
- **Coverage**: Disabled (focused on integration)
- **Timeout**: 30 seconds
- **Server Port**: 3001 (different from dev port 3000)
- **Execution**: Sequential (`--runInBand`)

## 🎯 Current Test Coverage

### Unit Tests

- ✅ Utility Functions (`convertStringToSnakeCase`)
- ✅ Logger (info, error, warn, log levels)
- ✅ Query Parser (`parseSelect`)

### E2E Tests

- ✅ Basic Queries (active users, departments)
- ✅ Expansion Queries (users with department, notes with relations)
- ✅ Health Check endpoint

## 📊 Test Results

Latest unit test run:

```
Test Suites: 3 passed, 3 total
Tests:       25 passed, 25 total
Coverage:    82.53% Statements | 50% Branches | 94.44% Functions | 81.66% Lines
```

## 🔧 How E2E Tests Work

1. **Global Setup** (`globalSetup.ts`):
   - Starts the Express server on port 3001
   - Waits for server to be ready
   - Stores server process ID

2. **Test Execution**:
   - Tests run against the live server
   - Uses actual database connections
   - Tests real OData queries from `test-queries.ts`

3. **Global Teardown** (`globalTeardown.ts`):
   - Stops the Express server
   - Cleans up resources

## 📚 Adding New Tests

### Adding Unit Tests

1. Create test file in `__tests__/unit/` matching source structure
2. Import the function/class to test
3. Write test cases using Jest syntax
4. Run `npm run test:unit` to verify

### Adding E2E Tests

1. Create test file in `__tests__/e2e/api/`
2. Import queries from `examples/express-app/test-queries.ts`
3. Write tests using `fetch` to call API endpoints
4. Run `npm run test:e2e` to verify

## 🐛 Known Issues

- Logger has a bug where `enabled: false` doesn't work due to `this.enabled = enabled || true;`
- Workaround: Test log levels instead of enabled/disabled state

## 📖 Further Reading

- See `__tests__/README.md` for detailed testing guide
- See `examples/express-app/test-queries.ts` for available OData queries
- See `examples/express-app/test-runner.ts` for manual query testing
