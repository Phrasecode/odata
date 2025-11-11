/**
 * E2E Tests for Combined Complex Queries
 * Tests: Real-world scenarios combining multiple features
 */

import {
  query32_dashboardActiveUsers,
  query33_pinnedNotesManagement,
  query34_categoryAnalytics,
  query36_userActivityReport,
  query37_globalNoteSearch,
  query38_recentActivity,
  query39_activeCategoryUsage,
  query40_comprehensiveUserProfile,
} from '../test-queries';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

describe('07 - Combined Complex Queries', () => {
  describe('Query 32: Dashboard Active Users', () => {
    it('should return active users with recent notes', async () => {
      const response = await fetch(`${BASE_URL}${query32_dashboardActiveUsers}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 33: Pinned Notes Management', () => {
    it('should return pinned notes with full context', async () => {
      const response = await fetch(`${BASE_URL}${query33_pinnedNotesManagement}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 34: Category Analytics', () => {
    it('should return categories with note counts', async () => {
      const response = await fetch(`${BASE_URL}${query34_categoryAnalytics}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 36: User Activity Report', () => {
    it('should return users with their content', async () => {
      const response = await fetch(`${BASE_URL}${query36_userActivityReport}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 37: Global Note Search', () => {
    it('should search notes with user context', async () => {
      const response = await fetch(`${BASE_URL}${query37_globalNoteSearch}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 38: Recent Activity', () => {
    it('should return latest notes with full context', async () => {
      const response = await fetch(`${BASE_URL}${query38_recentActivity}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 39: Active Category Usage', () => {
    it('should return categories with active notes', async () => {
      const response = await fetch(`${BASE_URL}${query39_activeCategoryUsage}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 40: Comprehensive User Profile', () => {
    it('should return complete user profile with max depth', async () => {
      const response = await fetch(`${BASE_URL}${query40_comprehensiveUserProfile}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });
});
