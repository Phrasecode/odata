/**
 * Helper functions for running OData queries in E2E tests
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export interface QueryResult {
  success: boolean;
  statusCode: number;
  data?: any;
  error?: string;
  responseTime: number;
}

/**
 * Execute an OData query and return the result
 */
export async function executeQuery(query: string): Promise<QueryResult> {
  const startTime = Date.now();
  const url = `${BASE_URL}${query}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    return {
      success: response.ok,
      statusCode: response.status,
      data,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      success: false,
      statusCode: 0,
      error: error instanceof Error ? error.message : String(error),
      responseTime,
    };
  }
}

/**
 * Execute multiple queries and return all results
 */
export async function executeQueries(queries: Record<string, string>): Promise<Record<string, QueryResult>> {
  const results: Record<string, QueryResult> = {};

  for (const [name, query] of Object.entries(queries)) {
    results[name] = await executeQuery(query);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Check if server is healthy
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

