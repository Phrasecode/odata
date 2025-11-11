module.exports = {
  projects: ['<rootDir>/jest.config.unit.js', '<rootDir>/jest.config.e2e.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/index.ts',
  ],
  maxWorkers: 1, // Run all test projects serially to avoid database conflicts
};
