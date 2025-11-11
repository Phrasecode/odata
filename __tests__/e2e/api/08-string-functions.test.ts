/**
 * E2E Tests for String Function Queries
 * Tests: trim, substring, indexof, contains, tolower, length, startswith
 */

import {
  query41_trim,
  query42_usernameMatchesEmailPrefix,
  query43_notesLengthComparison,
  query44_categoryNameInDescription,
  query45_usersByEmailDomain,
  query46_titleCategoryPrefix,
  query47_fullNameSearch,
  query48_lengthMatchAcrossRelations,
  query49_contentContainsTitle,
  query50_emailStartsWithUsername,
} from '../test-queries';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

describe('08 - String Function Queries', () => {
  describe('Query 41: Trim Function', () => {
    it('should filter using trim function', async () => {
      const response = await fetch(`${BASE_URL}${query41_trim}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 42: Username Matches Email Prefix', () => {
    it('should match username with email prefix using substring and indexof', async () => {
      const response = await fetch(`${BASE_URL}${query42_usernameMatchesEmailPrefix}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 43: Notes Length Comparison', () => {
    it('should compare title and content length', async () => {
      const response = await fetch(`${BASE_URL}${query43_notesLengthComparison}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 44: Category Name in Description', () => {
    it('should check if category name is in description', async () => {
      const response = await fetch(`${BASE_URL}${query44_categoryNameInDescription}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 45: Users by Email Domain', () => {
    it('should extract and compare email domain', async () => {
      const response = await fetch(`${BASE_URL}${query45_usersByEmailDomain}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 46: Title Category Prefix', () => {
    it('should match title prefix with category prefix', async () => {
      const response = await fetch(`${BASE_URL}${query46_titleCategoryPrefix}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 47: Full Name Search', () => {
    it('should search full names with complex conditions', async () => {
      const response = await fetch(`${BASE_URL}${query47_fullNameSearch}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 48: Length Match Across Relations', () => {
    it('should compare string lengths across relationships', async () => {
      const response = await fetch(`${BASE_URL}${query48_lengthMatchAcrossRelations}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 49: Content Contains Title', () => {
    it('should check if content contains title', async () => {
      const response = await fetch(`${BASE_URL}${query49_contentContainsTitle}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });

  describe('Query 50: Email Starts With Username', () => {
    it('should check if email starts with username', async () => {
      const response = await fetch(`${BASE_URL}${query50_emailStartsWithUsername}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });
  });
});
