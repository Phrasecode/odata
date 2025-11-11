import { parseFilter } from '../../../../src/serializers/query/parseFilter';

describe('parseFilter', () => {
  const tableName = 'TestTable';

  describe('Basic comparison operators', () => {
    it('should parse equality filter', () => {
      const result = parseFilter('isActive eq true', tableName);
      expect(result).toMatchObject({
        leftExpression: {
          type: 'field',
        },
        operator: 'eq',
        rightExpression: {
          type: 'literal',
          value: true,
        },
      });
    });

    it('should parse not equal filter', () => {
      const result = parseFilter('status ne "inactive"', tableName);
      expect(result).toMatchObject({
        leftExpression: {
          type: 'field',
        },
        operator: 'ne',
      });
    });

    it('should parse greater than filter', () => {
      const result = parseFilter('age gt 18', tableName);
      expect(result).toMatchObject({
        leftExpression: {
          type: 'field',
        },
        operator: 'gt',
        rightExpression: {
          type: 'literal',
          value: 18,
        },
      });
    });

    it('should parse less than filter', () => {
      const result = parseFilter('price lt 100', tableName);
      expect(result).toMatchObject({
        leftExpression: {
          type: 'field',
        },
        operator: 'lt',
        rightExpression: {
          type: 'literal',
          value: 100,
        },
      });
    });

    it('should parse greater than or equal filter', () => {
      const result = parseFilter('score ge 50', tableName);
      expect(result).toMatchObject({
        leftExpression: {
          type: 'field',
        },
        operator: 'ge',
        rightExpression: {
          type: 'literal',
          value: 50,
        },
      });
    });

    it('should parse less than or equal filter', () => {
      const result = parseFilter('quantity le 10', tableName);
      expect(result).toMatchObject({
        leftExpression: {
          type: 'field',
        },
        operator: 'le',
        rightExpression: {
          type: 'literal',
          value: 10,
        },
      });
    });
  });

  describe('Logical operators', () => {
    it('should parse AND condition', () => {
      const result = parseFilter('isActive eq true and age gt 18', tableName);
      expect(result).toMatchObject({
        logicalOperator: 'and',
      });
      expect(result).toHaveProperty('conditions');
    });

    it('should parse OR condition', () => {
      const result = parseFilter('status eq "active" or status eq "pending"', tableName);
      expect(result).toMatchObject({
        logicalOperator: 'or',
      });
      expect(result).toHaveProperty('conditions');
    });

    it('should parse complex nested conditions', () => {
      const result = parseFilter(
        'isActive eq true and (age gt 18 or status eq "verified")',
        tableName,
      );
      expect(result).toMatchObject({
        logicalOperator: 'and',
      });
    });
  });

  describe('String functions', () => {
    it('should parse contains function', () => {
      const result = parseFilter('contains(name,\'test\')', tableName);
      expect(result).toBeDefined();
      // Contains is parsed as a function call that returns boolean
      expect(result).toHaveProperty('leftExpression');
    });

    it('should parse startswith function', () => {
      const result = parseFilter('startswith(email,\'admin\')', tableName);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('leftExpression');
    });

    it('should parse endswith function', () => {
      const result = parseFilter('endswith(email,\'@example.com\')', tableName);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('leftExpression');
    });
  });

  describe('Edge cases', () => {
    it('should return undefined for empty string', () => {
      const result = parseFilter('', tableName);
      expect(result).toBeUndefined();
    });

    it('should return undefined for whitespace only', () => {
      const result = parseFilter('   ', tableName);
      expect(result).toBeUndefined();
    });
  });

  describe('Real-world OData examples', () => {
    it('should parse active users filter', () => {
      const result = parseFilter('isActive eq true', 'CustomUser');
      expect(result).toMatchObject({
        leftExpression: {
          type: 'field',
        },
        operator: 'eq',
        rightExpression: {
          type: 'literal',
          value: true,
        },
      });
    });

    it('should parse department filter with AND', () => {
      const result = parseFilter('departmentId eq 1 and isActive eq true', 'CustomUser');
      expect(result).toMatchObject({
        logicalOperator: 'and',
      });
    });

    it('should parse pinned and not archived notes', () => {
      const result = parseFilter('isPinned eq true and isArchived eq false', 'Note');
      expect(result).toMatchObject({
        logicalOperator: 'and',
      });
    });
  });
});
