/**
 * Global Teardown for E2E Tests
 * This runs once after all E2E tests
 */

import { stopTestServer } from '../helpers/testServer';

export default async function globalTeardown() {
  console.log('\n🛑 Shutting down test server...\n');

  const server = (global as any).__TEST_SERVER__;

  if (server) {
    try {
      await stopTestServer(server);
      console.log('✅ Test server stopped successfully\n');
    } catch (error) {
      console.error('❌ Error stopping test server:', error);
    }
  }

  // Give it time to clean up
  await new Promise(resolve => setTimeout(resolve, 1000));
}
