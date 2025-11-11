import { parseOrderBy } from '../../../../src/serializers/query/parseOrderBy';

describe('parseOrderBy', () => {
  const tableName = 'TestTable';

  describe('Basic ordering', () => {
    it('should parse single field ascending order', () => {
      const result = parseOrderBy('name asc', tableName);
      expect(result).toEqual([
        {
          field: 'name',
          table: tableName,
          direction: 'asc',
        },
      ]);
    });

    it('should parse single field descending order', () => {
      const result = parseOrderBy('createdAt desc', tableName);
      expect(result).toEqual([
        {
          field: 'createdAt',
          table: tableName,
          direction: 'desc',
        },
      ]);
    });

    it('should default to ascending when direction not specified', () => {
      const result = parseOrderBy('username', tableName);
      expect(result).toEqual([
        {
          field: 'username',
          table: tableName,
          direction: 'asc',
        },
      ]);
    });
  });

  describe('Multiple fields', () => {
    it('should parse multiple fields with mixed directions', () => {
      const result = parseOrderBy('lastName asc, firstName asc, age desc', tableName);
      expect(result).toEqual([
        {
          field: 'lastName',
          table: tableName,
          direction: 'asc',
        },
        {
          field: 'firstName',
          table: tableName,
          direction: 'asc',
        },
        {
          field: 'age',
          table: tableName,
          direction: 'desc',
        },
      ]);
    });

    it('should handle fields without explicit direction', () => {
      const result = parseOrderBy('name, createdAt desc', tableName);
      expect(result).toEqual([
        {
          field: 'name',
          table: tableName,
          direction: 'asc',
        },
        {
          field: 'createdAt',
          table: tableName,
          direction: 'desc',
        },
      ]);
    });
  });

  describe('Edge cases', () => {
    it('should return empty array for empty string', () => {
      const result = parseOrderBy('', tableName);
      expect(result).toEqual([]);
    });

    it('should return empty array for whitespace only', () => {
      const result = parseOrderBy('   ', tableName);
      expect(result).toEqual([]);
    });

    it('should handle extra whitespace', () => {
      const result = parseOrderBy('  name   asc  ,  age   desc  ', tableName);
      expect(result).toEqual([
        {
          field: 'name',
          table: tableName,
          direction: 'asc',
        },
        {
          field: 'age',
          table: tableName,
          direction: 'desc',
        },
      ]);
    });

    it('should handle case-insensitive direction keywords', () => {
      const result = parseOrderBy('name ASC, age DESC, email Asc', tableName);
      expect(result).toEqual([
        {
          field: 'name',
          table: tableName,
          direction: 'asc',
        },
        {
          field: 'age',
          table: tableName,
          direction: 'desc',
        },
        {
          field: 'email',
          table: tableName,
          direction: 'asc',
        },
      ]);
    });
  });

  describe('Real-world OData examples', () => {
    it('should parse typical OData orderby query', () => {
      const result = parseOrderBy('createdAt desc', 'Note');
      expect(result).toEqual([
        {
          field: 'createdAt',
          table: 'Note',
          direction: 'desc',
        },
      ]);
    });

    it('should parse complex multi-field ordering', () => {
      const result = parseOrderBy('departmentName asc, username asc', 'CustomUser');
      expect(result).toEqual([
        {
          field: 'departmentName',
          table: 'CustomUser',
          direction: 'asc',
        },
        {
          field: 'username',
          table: 'CustomUser',
          direction: 'asc',
        },
      ]);
    });
  });
});

