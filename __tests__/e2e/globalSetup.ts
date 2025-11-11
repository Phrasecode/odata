/**
 * Global Setup for E2E Tests
 * This runs once before all E2E tests
 */

import { startTestServer } from '../helpers/testServer';

export default async function globalSetup() {
  console.log('\n🚀 Starting test server for E2E tests...\n');

  try {
    // Start the test server with SQLite database
    const server = await startTestServer(3001);

    // Store the server instance globally so we can close it in teardown
    (global as any).__TEST_SERVER__ = server;

    console.log('✅ Test server is ready for E2E tests\n');
  } catch (error) {
    console.error('❌ Failed to start test server:', error);
    throw error;
  }
}
