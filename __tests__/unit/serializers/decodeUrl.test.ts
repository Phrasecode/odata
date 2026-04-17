import { decodeUrl, validatePath } from '../../../src/serializers/decodeUrl';

describe('decodeUrl', () => {
  describe('basic path handling', () => {
    it('decodes a simple path with leading slash', () => {
      const result = decodeUrl('/Products');
      expect(result.fullPath).toBe('Products');
      expect(result.path).toBe('Products');
      expect(result.basepath).toBe('Products');
    });

    it('decodes a path without leading slash', () => {
      const result = decodeUrl('Products');
      expect(result.fullPath).toBe('Products');
      expect(result.basepath).toBe('Products');
    });

    it('trims whitespace from the url', () => {
      const result = decodeUrl('  /Products  ');
      expect(result.fullPath).toBe('Products');
    });

    it('strips trailing slash without re-decoding', () => {
      const result = decodeUrl('/Products/');
      expect(result.fullPath).toBe('Products');
    });
  });

  describe('query params', () => {
    it('parses query params correctly', () => {
      const result = decodeUrl("/Products?$filter=name eq 'test'");
      expect(result.queryParams).toHaveProperty('$filter');
      expect(result.path).toBe('Products');
    });

    it('returns empty object when no query params', () => {
      const result = decodeUrl('/Products');
      expect(result.queryParams).toEqual({});
    });
  });

  describe('double URL decoding prevention (PR #59)', () => {
    it('does NOT double-decode a percent-encoded value', () => {
      // %2525 -> first decode gives %25, a second decode would give % (bypass)
      // The fix ensures only one decode pass happens
      const result = decodeUrl('/Products%2525');
      expect(result.fullPath).toBe('Products%25');
      expect(result.fullPath).not.toBe('Products%');
    });

    it('does NOT double-decode encoded slashes in path', () => {
      // %252F -> first decode gives %2F, double-decode would give /
      const result = decodeUrl('/Products%252F');
      expect(result.fullPath).toBe('Products%2F');
      expect(result.fullPath).not.toBe('Products/');
    });

    it('does NOT double-decode trailing slash scenario', () => {
      // A path ending with an encoded char should not be decoded a second time
      // when the trailing slash removal runs
      const result = decodeUrl('/Products%2520/');
      expect(result.fullPath).toBe('Products%20');
      expect(result.fullPath).not.toBe('Products ');
    });

    it('handles a normal encoded space correctly (single decode)', () => {
      const result = decodeUrl('/My%20Products');
      expect(result.fullPath).toBe('My Products');
    });

    it('handles encoded query param value without double-decoding', () => {
      const result = decodeUrl('/Products?name=hello%2520world');
      expect(result.path).toBe('Products');
      // query string is parsed as-is (not decoded by decodeUrl itself)
      expect(result.queryParams).toHaveProperty('name');
    });
  });

  describe('basepath extraction', () => {
    it('extracts basepath from nested path', () => {
      const result = decodeUrl('/Products/1/Category');
      expect(result.basepath).toBe('Products');
      expect(result.path).toBe('Products/1/Category');
    });
  });
});

describe('validatePath', () => {
  it('throws when path is empty', () => {
    expect(() => validatePath('')).toThrow('Path is required');
  });

  it('throws when path is not a string', () => {
    expect(() => validatePath(null as unknown as string)).toThrow('Path is required');
  });

  it('throws for full http URL', () => {
    expect(() => validatePath('http://example.com/products')).toThrow('Full URL not supported');
  });

  it('throws for https URL', () => {
    expect(() => validatePath('https://example.com/products')).toThrow('Full URL not supported');
  });

  it('throws for protocol-relative URL', () => {
    expect(() => validatePath('//example.com/products')).toThrow('Full URL not supported');
  });

  it('does not throw for a valid path', () => {
    expect(() => validatePath('/products')).not.toThrow();
  });
});
