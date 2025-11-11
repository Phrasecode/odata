import { BelongsTo, Column, DataTypes, HasMany, Model, Table } from '../../../src';
import { convertQueryParser } from '../../../src/serializers/queryConverter';
import { IParsedQuery } from '../../../src/types';

// Test models
@Table({ tableName: 'test_users', underscored: true })
class TestUser extends Model<TestUser> {
  @Column({
    dataType: DataTypes.INTEGER,
    isPrimaryKey: true,
    isAutoIncrement: true,
  })
    userId!: number;

  @Column({
    dataType: DataTypes.STRING,
    isNullable: false,
  })
    userName!: string;

  @Column({
    dataType: DataTypes.STRING,
  })
    emailAddress!: string;

  @Column({
    dataType: DataTypes.BOOLEAN,
  })
    isActive!: boolean;

  @HasMany(() => TestPost, {
    relation: [{ foreignKey: 'userId', sourceKey: 'userId' }],
  })
    posts!: TestPost[];
}

@Table({ tableName: 'test_posts', underscored: true })
class TestPost extends Model<TestPost> {
  @Column({
    dataType: DataTypes.INTEGER,
    isPrimaryKey: true,
    isAutoIncrement: true,
  })
    postId!: number;

  @Column({
    dataType: DataTypes.STRING,
  })
    postTitle!: string;

  @Column({
    dataType: DataTypes.TEXT,
  })
    postContent!: string;

  @Column({
    dataType: DataTypes.INTEGER,
  })
    userId!: number;

  @BelongsTo(() => TestUser, {
    relation: [{ foreignKey: 'userId', sourceKey: 'userId' }],
  })
    user!: TestUser;
}

// Helper to create a mock QueryParser result
const createMockQuery = (table: string, params: Partial<IParsedQuery> = {}): any => {
  return {
    getParams: () => ({
      table,
      select: params.select,
      filter: params.filter,
      orderBy: params.orderBy,
      expand: params.expand,
      top: params.top,
      skip: params.skip,
      ...params,
    }),
  };
};

describe('convertQueryParser', () => {
  let entityMap: Map<string, typeof Model<any>>;

  beforeEach(() => {
    entityMap = new Map();
    entityMap.set('TestUser', TestUser);
    entityMap.set('TestPost', TestPost);
  });

  describe('Table name conversion', () => {
    it('should convert model name to table identifier', () => {
      const query = createMockQuery('TestUser', {});
      const result = convertQueryParser(entityMap, query);

      expect(result.table).toBe('test_users');
    });

    it('should throw error for non-existent table', () => {
      const query = createMockQuery('NonExistentModel', {});

      expect(() => convertQueryParser(entityMap, query)).toThrow('Table name not found');
    });
  });

  describe('Select clause conversion', () => {
    it('should convert property keys to column identifiers', () => {
      const query = createMockQuery('TestUser', {
        select: [
          { field: 'userName', table: 'TestUser' },
          { field: 'emailAddress', table: 'TestUser' },
        ],
      });
      const result = convertQueryParser(entityMap, query);

      expect(result.select).toBeDefined();
      expect(result.select).toHaveLength(2);
      expect(result.select![0].field).toBe('user_name');
      expect(result.select![1].field).toBe('email_address');
    });

    it('should throw error for non-existent column in select', () => {
      const query = createMockQuery('TestUser', {
        select: [{ field: 'nonExistentField', table: 'TestUser' }],
      });

      expect(() => convertQueryParser(entityMap, query)).toThrow(
        'Column nonExistentField not found',
      );
    });

    it('should handle empty select clause', () => {
      const query = createMockQuery('TestUser', {});
      const result = convertQueryParser(entityMap, query);

      expect(result.select).toBeUndefined();
    });
  });

  describe('Filter clause conversion', () => {
    it('should convert field names in simple filter', () => {
      const query = createMockQuery('TestUser', {
        filter: {
          leftExpression: { type: 'field', field: { name: 'isActive' } },
          operator: 'eq',
          rightExpression: { type: 'literal', value: true },
        } as any,
      });
      const result = convertQueryParser(entityMap, query);

      expect(result.filter).toBeDefined();
      expect(result.filter).toHaveProperty('leftExpression');
      expect((result.filter as any).leftExpression.field.name).toBe('is_active');
    });
  });

  describe('OrderBy clause conversion', () => {
    it('should convert property keys to column identifiers in orderBy', () => {
      const query = createMockQuery('TestUser', {
        orderBy: [{ field: 'userName', table: 'TestUser', direction: 'asc' }],
      });
      const result = convertQueryParser(entityMap, query);

      expect(result.orderBy).toBeDefined();
      expect(result.orderBy).toHaveLength(1);
      expect(result.orderBy![0].field).toBe('user_name');
      expect(result.orderBy![0].direction).toBe('asc');
    });

    it('should throw error for non-existent column in orderBy', () => {
      const query = createMockQuery('TestUser', {
        orderBy: [{ field: 'nonExistentField', table: 'TestUser', direction: 'asc' }],
      });

      expect(() => convertQueryParser(entityMap, query)).toThrow(
        'Column nonExistentField not found',
      );
    });
  });

  describe('Expand clause conversion', () => {
    it('should convert navigation property to table identifier', () => {
      const query = createMockQuery('TestUser', {
        expand: [{ table: 'posts' }],
      });
      const result = convertQueryParser(entityMap, query);

      expect(result.expand).toBeDefined();
      expect(result.expand).toHaveLength(1);
      expect(result.expand![0].table).toBe('test_posts');
      expect(result.expand![0].as).toBe('posts');
    });

    it('should throw error for non-existent navigation property', () => {
      const query = createMockQuery('TestUser', {
        expand: [{ table: 'nonExistentRelation' }],
      });

      expect(() => convertQueryParser(entityMap, query)).toThrow(
        'Navigation property \'nonExistentRelation\' not found',
      );
    });

    it('should convert nested expand with select', () => {
      const query = createMockQuery('TestUser', {
        expand: [{ table: 'posts', select: [{ field: 'postTitle', table: 'TestPost' }] }],
      });
      const result = convertQueryParser(entityMap, query);

      expect(result.expand).toBeDefined();
      expect(result.expand![0].select).toBeDefined();
      expect(result.expand![0].select![0].field).toBe('post_title');
    });
  });

  describe('Complex queries', () => {
    it('should convert query with select and orderBy', () => {
      const query = createMockQuery('TestUser', {
        select: [
          { field: 'userName', table: 'TestUser' },
          { field: 'emailAddress', table: 'TestUser' },
        ],
        orderBy: [{ field: 'userName', table: 'TestUser', direction: 'asc' }],
      });
      const result = convertQueryParser(entityMap, query);

      expect(result.table).toBe('test_users');
      expect(result.select).toHaveLength(2);
      expect(result.orderBy).toHaveLength(1);
    });

    it('should preserve top and skip values', () => {
      const query = createMockQuery('TestUser', { top: 10, skip: 20 });
      const result = convertQueryParser(entityMap, query);

      expect(result.top).toBe(10);
      expect(result.skip).toBe(20);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty entity map', () => {
      const emptyMap = new Map();
      const query = createMockQuery('TestUser', {});

      expect(() => convertQueryParser(emptyMap, query)).toThrow('Table name not found');
    });

    it('should handle query with no clauses', () => {
      const query = createMockQuery('TestUser', {});
      const result = convertQueryParser(entityMap, query);

      expect(result.table).toBe('test_users');
      expect(result.select).toBeUndefined();
      expect(result.filter).toBeUndefined();
      expect(result.orderBy).toBeUndefined();
      expect(result.expand).toBeUndefined();
    });
  });
});
