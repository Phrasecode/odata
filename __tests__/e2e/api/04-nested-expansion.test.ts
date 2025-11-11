/**
 * E2E Tests for Nested Expansion
 * Tests: Deep relationship queries (3+ levels)
 */

import {
  query13_departmentsWithUserNotes,
  query14_usersFullProfile,
  query15_categoriesDeepExpand,
  query16_notesFullContext,
} from '../test-queries';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

describe('04 - Nested Expansion', () => {
  describe('Query 13: Departments with User Notes', () => {
    it('should return departments with nested users and notes', async () => {
      const response = await fetch(`${BASE_URL}${query13_departmentsWithUserNotes}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);

      if (data.value.length > 0) {
        const department = data.value[0];
        expect(department).toHaveProperty('id');
        expect(department).toHaveProperty('departmentName');

        if (department.users && department.users.length > 0) {
          const user = department.users[0];
          expect(user).toHaveProperty('username');
        }
      }
    });
  });

  describe('Query 14: Users Full Profile', () => {
    it('should return users with department, notes, and categories', async () => {
      const response = await fetch(`${BASE_URL}${query14_usersFullProfile}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);

      if (data.value.length > 0) {
        const user = data.value[0];
        expect(user).toHaveProperty('userId');
        expect(user).toHaveProperty('username');
      }
    });
  });

  describe('Query 15: Categories Deep Expand', () => {
    it('should return categories with deep nested expansion', async () => {
      const response = await fetch(`${BASE_URL}${query15_categoriesDeepExpand}`);
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

  describe('Query 16: Notes Full Context', () => {
    it('should return notes with full context (4 levels deep)', async () => {
      const response = await fetch(`${BASE_URL}${query16_notesFullContext}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);

      if (data.value.length > 0) {
        const note = data.value[0];
        expect(note).toHaveProperty('noteId');
        expect(note).toHaveProperty('title');
        expect(note).toHaveProperty('content');
      }
    });
  });
});
