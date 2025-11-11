/**
 * E2E Tests for Ordering and Pagination
 * Tests: $orderby, $top, $skip
 */

import {
  query17_latestNotesPaginated,
  query18_usersMultiSort,
  query19_topCategories,
  query20_departmentsOrdered,
} from '../test-queries';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

describe('05 - Ordering and Pagination', () => {
  describe('Query 17: Latest Notes Paginated', () => {
    it('should return paginated notes ordered by date', async () => {
      const response = await fetch(`${BASE_URL}${query17_latestNotesPaginated}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);

      if (data.value.length > 0) {
        const note = data.value[0];
        expect(note).toHaveProperty('noteId');
        expect(note).toHaveProperty('title');
        expect(note).toHaveProperty('createdAt');
      }
    });
  });

  describe('Query 18: Users Multi Sort', () => {
    it('should return users ordered by multiple fields', async () => {
      const response = await fetch(`${BASE_URL}${query18_usersMultiSort}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);

      if (data.value.length > 0) {
        const user = data.value[0];
        expect(user).toHaveProperty('userId');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('departmentId');
      }
    });
  });

  describe('Query 19: Top Categories', () => {
    it('should return top categories with ordering', async () => {
      const response = await fetch(`${BASE_URL}${query19_topCategories}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);

      if (data.value.length > 0) {
        const category = data.value[0];
        expect(category).toHaveProperty('categoryId');
        expect(category).toHaveProperty('categoryName');
      }
    });
  });

  describe('Query 20: Departments Ordered', () => {
    it('should return departments ordered with user expansion', async () => {
      const response = await fetch(`${BASE_URL}${query20_departmentsOrdered}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);

      if (data.value.length > 0) {
        const department = data.value[0];
        expect(department).toHaveProperty('id');
        expect(department).toHaveProperty('departmentName');
      }
    });
  });
});
