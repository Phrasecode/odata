/**
 * E2E Tests for Expansion Queries
 * Tests: $expand with relationships
 */

import {
  query4_usersWithDepartment,
  query5_departmentsWithUsers,
  query6_notesWithRelations,
  query7_categoriesWithDetails,
} from '../test-queries';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

describe('02 - Expansion Queries', () => {
  describe('Query 4: Users with Department', () => {
    it('should return users with expanded department information', async () => {
      const response = await fetch(`${BASE_URL}${query4_usersWithDepartment}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);

      if (data.value.length > 0) {
        const user = data.value[0];
        expect(user).toHaveProperty('userId');
        expect(user).toHaveProperty('username');

        if (user.myDepartment) {
          expect(user.myDepartment).toHaveProperty('departmentName');
          expect(user.myDepartment).toHaveProperty('description');
        }
      }
    });
  });

  describe('Query 5: Departments with Users', () => {
    it('should return departments with expanded users', async () => {
      const response = await fetch(`${BASE_URL}${query5_departmentsWithUsers}`);
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
          expect(user).toHaveProperty('email');
          expect(user).toHaveProperty('isActive');
        }
      }
    });
  });

  describe('Query 6: Notes with Relations', () => {
    it('should return notes with expanded user and category', async () => {
      const response = await fetch(`${BASE_URL}${query6_notesWithRelations}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);

      if (data.value.length > 0) {
        const note = data.value[0];
        expect(note).toHaveProperty('noteId');
        expect(note).toHaveProperty('title');

        if (note.user) {
          expect(note.user).toHaveProperty('username');
          expect(note.user).toHaveProperty('email');
        }

        if (note.category) {
          expect(note.category).toHaveProperty('categoryName');
          expect(note.category).toHaveProperty('description');
        }
      }
    });
  });

  describe('Query 7: Categories with Details', () => {
    it('should return categories with creator and notes', async () => {
      const response = await fetch(`${BASE_URL}${query7_categoriesWithDetails}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);

      if (data.value.length > 0) {
        const category = data.value[0];
        expect(category).toHaveProperty('categoryId');
        expect(category).toHaveProperty('categoryName');

        if (category.creator) {
          expect(category.creator).toHaveProperty('username');
          expect(category.creator).toHaveProperty('email');
        }

        if (category.notes && category.notes.length > 0) {
          const note = category.notes[0];
          expect(note).toHaveProperty('title');
        }
      }
    });
  });
});
