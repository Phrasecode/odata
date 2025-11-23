const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/CustomUser';

describe('SQL Injection Prevention', () => {
  test('should handle SQL injection in $filter', async () => {
    // Malicious input attempting SQL injection
    const maliciousQuery = "?$filter=name eq 'admin'; DROP TABLE users--'";
    const invalidresult = await fetch(`${BASE_URL}${maliciousQuery}`);
    expect(invalidresult.status).not.toBe(200);

    // Verify table still exists
    const valuidQuery = '?$top=1';
    const response = await fetch(`${BASE_URL}${valuidQuery}`);
    expect(response.status).toBeDefined();
    expect(response.status).toBe(200);
  });

  test('should handle SQL injection with UNION', async () => {
    const maliciousQuery = "?$filter=name eq 'admin' UNION SELECT * FROM passwords--";
    const invalidresult = await fetch(`${BASE_URL}${maliciousQuery}`);
    expect(invalidresult.status).not.toBe(200);
  });

  test('should handle SQL injection in $orderby', async () => {
    const maliciousQuery = '?$orderby=name; DROP TABLE users--';
    const invalidresult = await fetch(`${BASE_URL}${maliciousQuery}`);
    expect(invalidresult.status).not.toBe(200);

    // Verify table still exists
    const valuidQuery = '?$top=1';
    const response = await fetch(`${BASE_URL}${valuidQuery}`);
    expect(response.status).toBeDefined();
    expect(response.status).toBe(200);
  });

  test('should handle SQL comments in filter', async () => {
    const maliciousQuery = "?$filter=name eq 'admin'--";
    const invalidresult = await fetch(`${BASE_URL}${maliciousQuery}`);
    expect(invalidresult.status).not.toBe(200);
  });

  test('should handle hex/unicode injection attempts', async () => {
    const maliciousQuery = '?$filter=name eq CHAR(97,100,109,105,110)';
    const invalidresult = await fetch(`${BASE_URL}${maliciousQuery}`);
    expect(invalidresult.status).not.toBe(200);
  });
});
