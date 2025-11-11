// Set environment variable for E2E tests
process.env.TEST_TYPE = 'e2e';

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  displayName: 'E2E Tests',
  roots: ['<rootDir>/__tests__/e2e'],
  testMatch: ['**/__tests__/e2e/**/*.test.ts', '**/__tests__/e2e/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testTimeout: 60000, // 30 seconds for E2E tests
  collectCoverage: true,
  coverageDirectory: 'coverage/unit',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/index.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/e2e/setup.ts'],
  globalSetup: '<rootDir>/__tests__/e2e/globalSetup.ts',
  globalTeardown: '<rootDir>/__tests__/e2e/globalTeardown.ts',
  maxWorkers: 1, // Run tests serially to avoid database conflicts
};
