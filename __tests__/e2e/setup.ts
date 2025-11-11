/**
 * E2E Test Setup
 * This file runs before each E2E test file
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; // Use different port for testing

// Increase timeout for E2E tests
jest.setTimeout(30000);

