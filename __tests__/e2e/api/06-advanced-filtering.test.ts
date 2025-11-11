/**
 * E2E Tests for Advanced Filtering
 * Tests: Complex conditions and functions
 */

import {
  query21_advancedNoteSearch,
  query22_usersByEmailDomain,
  query23_complexCategoryFilter,
  query24_notesDateRange,
  query25_usersNullChecks,
} from '../test-queries';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

describe('06 - Advanced Filtering', () => {
  describe('Query 21: Advanced Note Search', () => {
    it('should search notes with multiple string functions', async () => {
      const response = await fetch(`${BASE_URL}${query21_advancedNoteSearch}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 22: Users by Email Domain', () => {
    it('should filter users by email domain', async () => {
      const response = await fetch(`${BASE_URL}${query22_usersByEmailDomain}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 23: Complex Category Filter', () => {
    it('should filter categories with grouped conditions', async () => {
      const response = await fetch(`${BASE_URL}${query23_complexCategoryFilter}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 24: Notes Date Range', () => {
    it('should filter notes by date range', async () => {
      const response = await fetch(`${BASE_URL}${query24_notesDateRange}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 25: Users Null Checks', () => {
    it('should filter users with null checks', async () => {
      const response = await fetch(`${BASE_URL}${query25_usersNullChecks}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });
});
