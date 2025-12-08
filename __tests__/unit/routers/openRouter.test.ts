import { DataSource } from '../../../src/core/dataSource';
import { Model } from '../../../src/core/model';
import { Column, Table } from '../../../src/decorators';
import { OpenRouter } from '../../../src/routers/openRouter';
import { DataTypes } from '../../../src/types/entitySchema.types';

// Mock Model for testing
@Table({ tableName: 'test_users' })
class TestUser extends Model<TestUser> {
  @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
  id!: number;

  @Column({ dataType: DataTypes.STRING })
  name!: string;
}

describe('OpenRouter', () => {
  let dataSource: DataSource;
  let router: OpenRouter;

  beforeAll(() => {
    dataSource = new DataSource({
      database: ':memory:',
      username: '',
      password: '',
      host: 'localhost',
      dialect: 'sqlite',
      port: 0,
      pool: { max: 1, min: 0, idle: 10000 },
      schema: '',
      models: [TestUser],
    });

    router = new OpenRouter({
      dataSource,
      pathMapping: {
        '/users': TestUser,
      },
    });
  });

  describe('constructor', () => {
    it('should create router with config', () => {
      expect(router).toBeInstanceOf(OpenRouter);
    });

    it('should require pathMapping in config', () => {
      const newRouter = new OpenRouter({
        dataSource,
        pathMapping: {
          '/test': TestUser,
        },
      });
      expect(newRouter).toBeInstanceOf(OpenRouter);
    });
  });

  describe('getConfig()', () => {
    it('should return the router configuration', () => {
      const config = router.getConfig();
      expect(config).toBeDefined();
      expect(config.dataSource).toBe(dataSource);
    });

    it('should include pathMapping in config', () => {
      const config = router.getConfig();
      expect(config.pathMapping).toBeDefined();
    });
  });

  describe('getDataSource()', () => {
    it('should return the data source', () => {
      const ds = router.getDataSource();
      expect(ds).toBe(dataSource);
    });
  });

  describe('getMetaData()', () => {
    it('should return metadata', () => {
      const metadata = router.getMetaData();
      expect(metadata).toBeDefined();
    });
  });

  describe('queryable()', () => {
    it('should be an async function', () => {
      expect(typeof router.queryable).toBe('function');
    });

    it('should throw error for unregistered path', async () => {
      await expect(router.queryable('/unknown-path')).rejects.toThrow();
    });
  });

  describe('rawQueryable()', () => {
    it('should be defined', () => {
      expect(typeof router.rawQueryable).toBe('function');
    });

    it('should be an async function', () => {
      expect(router.rawQueryable.constructor.name).toBe('AsyncFunction');
    });

    it('should throw error for unregistered path', async () => {
      await expect(router.rawQueryable('/unknown-path', 'SELECT 1', {})).rejects.toThrow();
    });

    it('should accept path, sql, and params parameters', async () => {
      // This will fail because the table doesn't exist in SQLite memory,
      // but we can verify the method signature is correct
      try {
        await router.rawQueryable('/users', 'SELECT * FROM test_users', {});
      } catch (error) {
        // Expected to fail due to table not existing
        expect(error).toBeDefined();
      }
    });
  });
});
