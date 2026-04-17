import { Model, Table } from '../../../../src';
import { QueryParser } from '../../../../src/serializers/query';
import { BadRequestError } from '../../../../src/utils/error-management';

@Table({ tableName: 'users' })
class User extends Model<User> {}

describe('QueryParser Configuration and Validation', () => {
  describe('maxTop validation', () => {
    it('should allow $top within default maxTop (1000)', () => {
      const parser = new QueryParser('/users?$top=500', User);
      expect(parser.top).toBe(500);
    });

    it('should throw BadRequestError if $top exceeds default maxTop (1000)', () => {
      expect(() => {
        new QueryParser('/users?$top=1001', User);
      }).toThrow(BadRequestError);
      expect(() => {
        new QueryParser('/users?$top=1001', User);
      }).toThrow('$top cannot exceed 1000, got: 1001');
    });

    it('should respect custom maxTop', () => {
      const parser = new QueryParser('/users?$top=50', User, { maxTop: 100 });
      expect(parser.top).toBe(50);
      
      expect(() => {
        new QueryParser('/users?$top=101', User, { maxTop: 100 });
      }).toThrow('$top cannot exceed 100, got: 101');
    });
  });

  describe('maxSkip validation', () => {
    it('should allow $skip within default maxSkip (1000)', () => {
      const parser = new QueryParser('/users?$skip=500', User);
      expect(parser.skip).toBe(500);
    });

    it('should throw BadRequestError if $skip exceeds default maxSkip (1000)', () => {
      expect(() => {
        new QueryParser('/users?$skip=1001', User);
      }).toThrow(BadRequestError);
      expect(() => {
        new QueryParser('/users?$skip=1001', User);
      }).toThrow('$skip cannot exceed 1000, got: 1001');
    });

    it('should respect custom maxSkip', () => {
      const parser = new QueryParser('/users?$skip=50', User, { maxSkip: 100 });
      expect(parser.skip).toBe(50);

      expect(() => {
        new QueryParser('/users?$skip=101', User, { maxSkip: 100 });
      }).toThrow('$skip cannot exceed 100, got: 101');
    });
  });

  describe('expandDepth validation', () => {
    it('should allow queries without expand depth configuration', () => {
      const parser = new QueryParser(
        '/users?$expand=orders($expand=items)',
        User
      );
      expect(parser.expand.length).toBeGreaterThan(0);
    });

    it('should allow queries within expandDepth limit', () => {
      // 1 level: expand=orders
      const parser = new QueryParser('/users?$expand=orders', User, { expandDepth: 2 });
      expect(parser.expand.length).toBeGreaterThan(0);

      // 2 levels: expand=orders($expand=items)
      const parser2 = new QueryParser('/users?$expand=orders($expand=items)', User, { expandDepth: 2 });
      expect(parser2.expand.length).toBeGreaterThan(0);
    });

    it('should throw BadRequestError if expandDepth is exceeded', () => {
      expect(() => {
        // 3 levels deep: orders -> items -> product
        new QueryParser(
          '/users?$expand=orders($expand=items($expand=product))',
          User,
          { expandDepth: 2 }
        );
      }).toThrow(BadRequestError);

      expect(() => {
        new QueryParser(
          '/users?$expand=orders($expand=items($expand=product))',
          User,
          { expandDepth: 2 }
        );
      }).toThrow('$expand depth cannot exceed 2, got: 3');
    });
    
    it('should calculate max depth correctly among multiple branches', () => {
      expect(() => {
        // max depth across branches is 3
        new QueryParser(
          '/users?$expand=profile,orders($expand=items($expand=product)),settings',
          User,
          { expandDepth: 2 }
        );
      }).toThrow('$expand depth cannot exceed 2, got: 3');
      
      const parser = new QueryParser(
        '/users?$expand=profile,orders($expand=items($expand=product)),settings',
        User,
        { expandDepth: 3 }
      );
      expect(parser.expand.length).toBe(3);
    });
  });
});
