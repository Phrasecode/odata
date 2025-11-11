# Testing Guide

This project uses Jest for both unit tests and end-to-end (E2E) tests with an **in-memory SQLite database** for fast, isolated testing without external dependencies.

## Test Database

All tests use an **in-memory SQLite database** that is:

- ✅ **Fast** - No network latency, runs in memory
- ✅ **Isolated** - Each test run gets a fresh database
- ✅ **No Setup Required** - No external database needed
- ✅ **CI/CD Friendly** - Works in any environment
- ✅ **Pre-seeded** - Comes with test data ready to use

See [`helpers/README.md`](./helpers/README.md) for detailed documentation on the test database.

## Test Structure

```
__tests__/
├── unit/                    # Unit tests (107 tests)
│   ├── setup.ts            # Unit test setup
│   ├── utils/              # Tests for utility functions
│   │   ├── logger.test.ts
│   │   └── utilFunctions.test.ts
│   └── serializers/        # Tests for serializer modules
│       ├── metadata.test.ts         # Metadata generation tests
│       ├── responseBuilder.test.ts  # Response builder tests
│       ├── queryConverter.test.ts   # Query converter tests
│       └── query/                   # Query parser tests
│           ├── parseSelect.test.ts
│           ├── parseOrderBy.test.ts
│           ├── parseFilter.test.ts
│           └── parseExpand.test.ts
└── e2e/                    # End-to-end tests (54 tests)
    ├── setup.ts            # E2E test setup
    ├── globalSetup.ts      # Start server before tests
    ├── globalTeardown.ts   # Stop server after tests
    ├── helpers/            # Test helper functions
    ├── test-queries.ts     # OData query definitions
    └── api/                # API endpoint tests (9 test suites)
```

## Running Tests

### Unit Tests

Unit tests test individual functions and classes in isolation.

```bash
# Run all unit tests
npm run test:unit

# Run unit tests in watch mode
npm run test:unit:watch

# Run unit tests with coverage
npm run test:unit:coverage
```

### End-to-End Tests

E2E tests start the Express server and test the actual API endpoints with real queries.

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in watch mode
npm run test:e2e:watch
```

### All Tests

```bash
# Run both unit and E2E tests
npm run test:all

# Run all tests (default Jest config)
npm test

# Run tests in watch mode
npm run test:watch

# Run all tests with coverage
npm run test:coverage
```

## Writing Tests

### Unit Tests

Create test files in `__tests__/unit/` following the source structure:

- Test file: `__tests__/unit/path/to/module.test.ts`
- Source file: `src/path/to/module.ts`

Example:

```typescript
import { myFunction } from '../../../src/utils/myModule';

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction('input')).toBe('expected output');
  });
});
```

### E2E Tests

Create test files in `__tests__/e2e/api/` for testing API endpoints:

Example:

```typescript
import { query1_activeUsers } from '../../../examples/express-app/test-queries';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

describe('API Endpoint', () => {
  it('should return data', async () => {
    const response = await fetch(`${BASE_URL}${query1_activeUsers}`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('data');
  });
});
```

## Test Configuration

- `jest.config.js` - Main Jest configuration (runs both unit and E2E)
- `jest.config.unit.js` - Unit test configuration
- `jest.config.e2e.js` - E2E test configuration

## Environment Variables

E2E tests use the following environment variables:

- `PORT=3001` - Test server port (different from dev port 3000)
- `NODE_ENV=test` - Test environment
- `API_BASE_URL` - Base URL for API requests (default: http://localhost:3001)

## Test Database Setup

### Automatic Setup

The test database is automatically set up when you run tests:

1. **Unit Tests** - Database is created in `beforeAll` hook in `unit/setup.ts`
2. **E2E Tests** - Server with database is started in `globalSetup.ts`

### Manual Usage

If you need to use the test database in your own tests:

```typescript
import { getTestDatabase } from '../helpers/testDatabase';
import { CustomUser } from '../../examples/express-app/models/user';
import { QueryParser } from '../../src/serializers/query';

describe('My Test', () => {
  it('should query data', async () => {
    const dataSource = getTestDatabase();
    const queryParser = new QueryParser('/users', dataSource, CustomUser);
    const result = await dataSource.execute(queryParser);

    expect(result.value).toBeDefined();
  });
});
```

### Seed Data

The test database includes comprehensive seed data matching [`examples/express-app/seed-data.sql`](../examples/express-app/seed-data.sql):

### Installing SQLite

SQLite3 is included in `devDependencies`. If you need to install it manually:

```bash
npm install --save-dev sqlite3
```

## Notes

- E2E tests run with `--runInBand` to ensure tests run sequentially
- E2E tests have a 60-second timeout (increased for database operations)
- The server automatically starts before E2E tests and stops after
- Unit tests collect coverage by default
- E2E tests don't collect coverage (focused on integration)
- All tests use SQLite in-memory database (no PostgreSQL required)
