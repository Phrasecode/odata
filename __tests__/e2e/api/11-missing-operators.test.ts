/**
 * E2E Tests for Missing Operators
 * Tests: not, in, endswith, toupper, date, time, second
 */

import {
  query91_notOperator,
  query93_endswithFunction,
  query94_toupperFunction,
  query95_dateFunction,
  query97_secondFunction,
} from '../test-queries';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

describe('11 - Missing Operators', () => {
  describe('Query 91: not() operator', () => {
    it('should filter users using logical not', async () => {
      const response = await fetch(`${BASE_URL}${query91_notOperator}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 93: endswith function', () => {
    it('should filter using endswith string function', async () => {
      const response = await fetch(`${BASE_URL}${query93_endswithFunction}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 94: toupper function', () => {
    it('should filter using toupper string function', async () => {
      const response = await fetch(`${BASE_URL}${query94_toupperFunction}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 95: date function', () => {
    it('should evaluate date function', async () => {
      const response = await fetch(`${BASE_URL}${query95_dateFunction}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 97: second function', () => {
    it('should evaluate second function', async () => {
      const response = await fetch(`${BASE_URL}${query97_secondFunction}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });
});
