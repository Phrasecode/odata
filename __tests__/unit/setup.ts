/**
 * Unit Test Setup
 * This file runs before each unit test file
 */

import { closeTestDatabase, createTestDatabase } from '../db';

// Set test environment variables
process.env.NODE_ENV = 'test';

// Setup test database before all tests
beforeAll(async () => {
  await createTestDatabase();
}, 30000); // 30 second timeout for database setup

// Close test database after all tests
afterAll(async () => {
  await closeTestDatabase();
}, 10000);
