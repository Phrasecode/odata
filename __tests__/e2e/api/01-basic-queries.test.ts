/**
 * E2E Tests for Basic OData Queries
 * Tests: $filter, $select, basic queries
 */

import { query1_activeUsers, query2_usersByDepartment, query3_departments } from '../test-queries';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

describe('01 - Basic OData Queries', () => {
  describe('Query 1: Active Users', () => {
    it('should return active users with selected fields', async () => {
      const response = await fetch(`${BASE_URL}${query1_activeUsers}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);

      if (data.value.length > 0) {
        const user = data.value[0];
        expect(user).toHaveProperty('userId');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('fullName');
      }
    });

    it('should include query metadata', async () => {
      const response = await fetch(`${BASE_URL}${query1_activeUsers}`);
      const data = (await response.json()) as any;

      expect(data['@odata.context']).toBeDefined();
      expect(data).toHaveProperty('meta');
    });
  });

  describe('Query 2: Users by Department', () => {
    it('should return users filtered by department', async () => {
      const response = await fetch(`${BASE_URL}${query2_usersByDepartment}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);

      if (data.value.length > 0) {
        const user = data.value[0];
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('departmentId');
      }
    });
  });

  describe('Query 3: All Departments', () => {
    it('should return all departments', async () => {
      const response = await fetch(`${BASE_URL}${query3_departments}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);

      if (data.value.length > 0) {
        const department = data.value[0];
        expect(department).toHaveProperty('id');
        expect(department).toHaveProperty('departmentName');
        expect(department).toHaveProperty('description');
        expect(department).toHaveProperty('createdAt');
      }
    });
  });
});
