/**
 * E2E Tests for Complex Filtering
 * Tests: Advanced $filter conditions
 */

import {
  query10_searchNotes,
  query11_categoriesByCreator,
  query12_complexUserFilter,
  query8_pinnedNotes,
  query9_recentUsers,
} from '../test-queries';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

describe('03 - Complex Filtering', () => {
  describe('Query 8: Pinned Notes', () => {
    it('should return pinned and non-archived notes', async () => {
      const response = await fetch(`${BASE_URL}${query8_pinnedNotes}`);
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

  describe('Query 9: Recent Users', () => {
    it('should return users created after specific date', async () => {
      const response = await fetch(`${BASE_URL}${query9_recentUsers}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);

      if (data.value.length > 0) {
        const user = data.value[0];
        expect(user).toHaveProperty('userId');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('createdAt');
      }
    });
  });

  describe('Query 10: Search Notes', () => {
    it('should return notes with string filtering', async () => {
      const response = await fetch(`${BASE_URL}${query10_searchNotes}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);

      if (data.value.length > 0) {
        const note = data.value[0];
        expect(note).toHaveProperty('noteId');
        expect(note).toHaveProperty('title');
      }
    });
  });

  describe('Query 11: Categories by Creator', () => {
    it('should return categories filtered by creator', async () => {
      const response = await fetch(`${BASE_URL}${query11_categoriesByCreator}`);
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

  describe('Query 12: Complex User Filter', () => {
    it('should return users with complex filtering conditions', async () => {
      const response = await fetch(`${BASE_URL}${query12_complexUserFilter}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);

      if (data.value.length > 0) {
        const user = data.value[0];
        expect(user).toHaveProperty('userId');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('email');
      }
    });
  });
});
