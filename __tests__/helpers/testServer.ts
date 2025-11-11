/**
 * Test Server Helper
 * Starts the Express server from examples/express-app for E2E testing
 */
import { ChildProcess, spawn } from 'child_process';
import { closeTestDatabase, createTestDatabase } from '../db';

let serverProcess: ChildProcess | null = null;

/**
 * Start the test server by running the example Express app
 */
export async function startTestServer(port = 3001): Promise<ChildProcess> {
  console.log('🚀 Creating test database...');
  await createTestDatabase();

  // Get the database path
  const dbPath = require('path').join(__dirname, '../db/test.db');

  console.log('🚀 Starting Express server...');

  return new Promise((resolve, reject) => {
    // Start the Express server using ts-node
    // Note: server.ts uses lowercase 'port' env var, so we set both PORT and port
    serverProcess = spawn('npx', ['ts-node', 'examples/express-app/server.ts'], {
      env: {
        ...process.env,
        PORT: port.toString(),
        port: port.toString(),
        DB_PATH: dbPath,
      },
      stdio: 'pipe',
    });

    let serverStarted = false;

    // Listen for server output
    serverProcess.stdout?.on('data', data => {
      const output = data.toString();
      console.log(output);

      // Check if server has started
      if (output.includes('Server listening on port')) {
        serverStarted = true;
        console.log(`✅ Test server started on port ${port}`);
        resolve(serverProcess!);
      }
    });

    serverProcess.stderr?.on('data', data => {
      console.error('Server error:', data.toString());
    });

    serverProcess.on('error', error => {
      if (!serverStarted) {
        console.error('❌ Failed to start test server:', error);
        reject(error);
      }
    });

    serverProcess.on('exit', (code, signal) => {
      if (!serverStarted) {
        reject(new Error(`Server process exited with code ${code} and signal ${signal}`));
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!serverStarted) {
        reject(new Error('Server failed to start within 10 seconds'));
      }
    }, 10000);
  });
}

/**
 * Stop the test server and close database
 */
export async function stopTestServer(server: ChildProcess): Promise<void> {
  console.log('🛑 Stopping test server...');

  return new Promise(async resolve => {
    if (server && !server.killed) {
      server.on('exit', async () => {
        console.log('✅ Test server stopped');
        await closeTestDatabase();
        serverProcess = null;
        resolve();
      });

      // Kill the server process
      server.kill('SIGTERM');

      // Force kill after 5 seconds if not stopped
      setTimeout(() => {
        if (server && !server.killed) {
          server.kill('SIGKILL');
        }
      }, 5000);
    } else {
      await closeTestDatabase();
      resolve();
    }
  });
}
