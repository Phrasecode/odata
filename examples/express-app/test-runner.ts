/**
 * OData API Test Runner
 *
 * This script executes all test queries against the running API server
 * and reports the results.
 */

import { allQueries } from './test-queries';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const DELAY_BETWEEN_REQUESTS = 100; // ms

interface TestResult {
  queryName: string;
  query: string;
  success: boolean;
  statusCode?: number;
  responseTime?: number;
  error?: string;
  dataCount?: number;
}

/**
 * Execute a single query and return the result
 */
async function executeQuery(queryName: string, query: string): Promise<TestResult> {
  const startTime = Date.now();
  const url = `${BASE_URL}${query}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('------response--->', response);

    const responseTime = Date.now() - startTime;
    const data: any = await response.json();

    return {
      queryName,
      query,
      success: response.ok,
      statusCode: response.status,
      responseTime,
      dataCount: Array.isArray(data?.data) ? data.data.length : undefined,
    };
  } catch (error) {
    console.log('------error--->', error);
    const responseTime = Date.now() - startTime;
    return {
      queryName,
      query,
      success: false,
      responseTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Delay execution for specified milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Run all test queries
 */
async function runAllTests(): Promise<void> {
  console.log('🚀 Starting OData API Test Suite');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📊 Total Queries: ${Object.keys(allQueries).length}\n`);

  const results: TestResult[] = [];
  const queryEntries = Object.entries(allQueries);

  for (let i = 0; i < queryEntries.length; i++) {
    const [queryName, query] = queryEntries[i];

    process.stdout.write(`[${i + 1}/${queryEntries.length}] Testing ${queryName}... `);

    const result = await executeQuery(queryName, query);
    results.push(result);

    if (result.success) {
      console.log(
        `✅ ${result.statusCode} (${result.responseTime}ms, ${result.dataCount ?? 'N/A'} records)`,
      );
    } else {
      console.log(
        `❌ ${result.statusCode ?? 'ERROR'} (${result.responseTime}ms) - ${
          result.error ?? 'Unknown error'
        }`,
      );
    }

    // Add delay between requests to avoid overwhelming the server
    if (i < queryEntries.length - 1) {
      await delay(DELAY_BETWEEN_REQUESTS);
    }
  }

  // Print summary
  printSummary(results);
}

/**
 * Print test summary
 */
function printSummary(results: TestResult[]): void {
  console.log('\n' + '='.repeat(80));
  console.log('📈 TEST SUMMARY');
  console.log('='.repeat(80));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalTime = results.reduce((sum, r) => sum + (r.responseTime ?? 0), 0);
  const avgTime = results.length > 0 ? Math.round(totalTime / results.length) : 0;

  console.log(`\n✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  console.log(`⏱️  Total Time: ${totalTime}ms`);
  console.log(`⏱️  Average Time: ${avgTime}ms`);

  if (failed.length > 0) {
    console.log('\n❌ FAILED QUERIES:');
    console.log('-'.repeat(80));
    failed.forEach(result => {
      console.log(`\n${result.queryName}:`);
      console.log(`  Query: ${result.query}`);
      console.log(`  Status: ${result.statusCode ?? 'ERROR'}`);
      console.log(`  Error: ${result.error ?? 'Unknown error'}`);
    });
  }

  // Performance statistics
  if (successful.length > 0) {
    const times = successful.map(r => r.responseTime ?? 0);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    console.log('\n⚡ PERFORMANCE STATISTICS:');
    console.log('-'.repeat(80));
    console.log(`  Fastest Query: ${minTime}ms`);
    console.log(`  Slowest Query: ${maxTime}ms`);
    console.log(`  Average Query: ${avgTime}ms`);

    // Find slowest queries
    const slowest = successful
      .sort((a, b) => (b.responseTime ?? 0) - (a.responseTime ?? 0))
      .slice(0, 5);

    console.log('\n🐌 TOP 5 SLOWEST QUERIES:');
    console.log('-'.repeat(80));
    slowest.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.queryName}: ${result.responseTime}ms`);
    });
  }

  console.log('\n' + '='.repeat(80));
}

/**
 * Run specific test by name
 */
async function runSpecificTest(queryName: string): Promise<void> {
  const query = allQueries[queryName as keyof typeof allQueries];

  if (!query) {
    console.error(`❌ Query "${queryName}" not found`);
    console.log('\nAvailable queries:');
    Object.keys(allQueries).forEach(name => console.log(`  - ${name}`));
    return;
  }

  console.log(`🚀 Running test: ${queryName}`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`🔍 Query: ${query}\n`);

  const result = await executeQuery(queryName, query);

  if (result.success) {
    console.log(`✅ Success!`);
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Response Time: ${result.responseTime}ms`);
    console.log(`   Records: ${result.dataCount ?? 'N/A'}`);
  } else {
    console.log(`❌ Failed!`);
    console.log(`   Status: ${result.statusCode ?? 'ERROR'}`);
    console.log(`   Response Time: ${result.responseTime}ms`);
    console.log(`   Error: ${result.error ?? 'Unknown error'}`);
  }
}

/**
 * List all available test queries
 */
function listQueries(): void {
  console.log('📋 Available Test Queries:\n');

  const categories = {
    'Basic Queries': Object.keys(allQueries).filter(k => k.match(/^query[1-3]_/)),
    'Expansion Queries': Object.keys(allQueries).filter(k => k.match(/^query[4-7]_/)),
    'Complex Filtering': Object.keys(allQueries).filter(k => k.match(/^query(8|9|1[0-2])_/)),
    'Nested Expansion': Object.keys(allQueries).filter(k => k.match(/^query1[3-6]_/)),
    'Ordering & Pagination': Object.keys(allQueries).filter(k => k.match(/^query1[7-9]|20_/)),
    'Advanced Filtering': Object.keys(allQueries).filter(k => k.match(/^query2[1-5]_/)),
    'Role & Permission': Object.keys(allQueries).filter(k => k.match(/^query2[6-9]_/)),
    'Tag Queries': Object.keys(allQueries).filter(k => k.match(/^query3[0-1]_/)),
    'Complex Scenarios': Object.keys(allQueries).filter(k => k.match(/^query3[2-9]|40_/)),
  };

  Object.entries(categories).forEach(([category, queries]) => {
    if (queries.length > 0) {
      console.log(`\n${category}:`);
      queries.forEach(q => console.log(`  - ${q}`));
    }
  });

  console.log(`\n📊 Total: ${Object.keys(allQueries).length} queries`);
}

// ============================================================================
// CLI Interface
// ============================================================================

const args = process.argv.slice(2);
const command = args[0];

if (command === 'list') {
  listQueries();
} else if (command === 'run' && args[1]) {
  runSpecificTest(args[1]);
} else if (command === 'all' || !command) {
  runAllTests();
} else {
  console.log('OData API Test Runner\n');
  console.log('Usage:');
  console.log('  npm run test:api              # Run all tests');
  console.log('  npm run test:api all          # Run all tests');
  console.log('  npm run test:api list         # List all available queries');
  console.log('  npm run test:api run <name>   # Run specific test\n');
  console.log('Examples:');
  console.log('  npm run test:api run query1_activeUsers');
  console.log('  npm run test:api run query40_comprehensiveUserProfile');
}
