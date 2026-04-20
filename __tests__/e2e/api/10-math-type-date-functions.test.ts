/**
 * E2E Tests for Date, Math, and Type Function Queries
 * Tests: year, month, day, hour, minute, second, now, date, time, floor, ceiling, round, cast, concat
 */

import {
  query81_usersByYearMonth,
  query82_notesByDay,
  query83_categoriesMorning,
  query84_recentUsers,
  query85_mathFunctions,
  query86_castFunction,
  query87_concatFunction,
} from '../test-queries';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

describe('10 - Math, Type, and Date Function Queries', () => {
  describe('Query 81: Users created in a specific year and month', () => {
    it('should filter users using year() and month()', async () => {
      const response = await fetch(`${BASE_URL}${query81_usersByYearMonth}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 82: Notes created on a specific day', () => {
    it('should filter notes using day()', async () => {
      const response = await fetch(`${BASE_URL}${query82_notesByDay}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 83: Categories created in the morning', () => {
    it('should filter categories using hour() and minute()', async () => {
      const response = await fetch(`${BASE_URL}${query83_categoriesMorning}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 84: Users created recently', () => {
    it('should filter using now()', async () => {
      const response = await fetch(`${BASE_URL}${query84_recentUsers}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 85: Math functions', () => {
    it('should filter using round(), floor(), and ceiling()', async () => {
      const response = await fetch(`${BASE_URL}${query85_mathFunctions}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 86: Cast function', () => {
    it('should cast numeric ID to string for comparison', async () => {
      const response = await fetch(`${BASE_URL}${query86_castFunction}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
      // user ID 1 is the admin
      expect(data.value.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Query 87: Concat function', () => {
    it('should concat username and email', async () => {
      const response = await fetch(`${BASE_URL}${query87_concatFunction}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });
});
