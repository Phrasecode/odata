import express, { Express } from 'express';
import { ODataControler } from '../../../src/controller/odataController';
import { QueryController } from '../../../src/controller/queryController';
import { DataSource } from '../../../src/core/dataSource';
import { Model } from '../../../src/core/model';
import { QueryModel } from '../../../src/core/queryModel';
import { Column, Query, Table } from '../../../src/decorators';
import { ExpressRouter } from '../../../src/routers/expressRouter';
import { DataTypes } from '../../../src/types/entitySchema.types';
import { EndpointNamingConvention } from '../../../src/utils/constant';

// Mock Models for testing
@Table({ tableName: 'test_users' })
class TestUser extends Model<TestUser> {
  @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
  id!: number;

  @Column({ dataType: DataTypes.STRING })
  name!: string;
}

@Table({ tableName: 'test_products' })
class TestProduct extends Model<TestProduct> {
  @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
  id!: number;

  @Column({ dataType: DataTypes.STRING })
  name!: string;

  @Column({ dataType: DataTypes.DECIMAL })
  price!: number;
}

// QueryModel for testing
@Table({ tableName: 'user_stats' })
class UserStats extends QueryModel<UserStats> {
  @Column({ dataType: DataTypes.INTEGER })
  userId!: number;

  @Column({ dataType: DataTypes.INTEGER })
  totalOrders!: number;
}

// Controller with custom method
class TestUserController extends ODataControler {
  constructor() {
    super({
      model: TestUser,
      allowedMethod: ['get'],
    });
  }

  @Query({
    method: 'get',
    endpoint: '/active',
    parameters: [{ name: 'limit', type: DataTypes.INTEGER, required: false, defaultValue: 10 }],
  })
  public async getActiveUsers() {
    return {
      value: [],
      '@odata.context': '$metadata#TestUser',
      meta: { queryExecutionTime: 0 },
    };
  }
}

// Controller without custom methods
class TestProductController extends ODataControler {
  constructor() {
    super({
      model: TestProduct,
      allowedMethod: ['get', 'post'],
    });
  }
}

// CustomQuery Controller
class TestUserStatsController extends QueryController {
  constructor() {
    super({
      model: UserStats,
      endpoint: '/user-stats',
    });
  }

  @Query({
    method: 'get',
    endpoint: '/summary',
    parameters: [],
  })
  public async getSummary() {
    return {
      value: [],
      '@odata.context': '$metadata#UserStats',
      meta: { queryExecutionTime: 0 },
    };
  }
}

describe('ExpressRouter', () => {
  let app: Express;
  let dataSource: DataSource;

  beforeEach(() => {
    app = express();

    dataSource = new DataSource({
      database: ':memory:',
      username: '',
      password: '',
      host: 'localhost',
      dialect: 'sqlite',
      port: 0,
      pool: { max: 1, min: 0, idle: 10000 },
      schema: '',
      models: [TestUser, TestProduct, UserStats],
    });
  });

  describe('constructor', () => {
    it('should create router with config', () => {
      const router = new ExpressRouter(app, {
        controllers: [new TestUserController()],
        dataSource,
      });

      expect(router).toBeInstanceOf(ExpressRouter);
    });

    it('should accept multiple controllers', () => {
      const router = new ExpressRouter(app, {
        controllers: [new TestUserController(), new TestProductController()],
        dataSource,
      });

      expect(router.getConfig().controllers).toHaveLength(2);
    });

    it('should accept endpoint naming convention', () => {
      const router = new ExpressRouter(app, {
        controllers: [new TestUserController()],
        dataSource,
        endpointNamingConvention: EndpointNamingConvention.KEBAB_CASE,
      });

      expect(router.getConfig().endpointNamingConvention).toBe(EndpointNamingConvention.KEBAB_CASE);
    });
  });

  describe('getApp()', () => {
    it('should return the Express app', () => {
      const router = new ExpressRouter(app, {
        controllers: [new TestUserController()],
        dataSource,
      });

      expect(router.getApp()).toBe(app);
    });
  });

  describe('getConfig()', () => {
    it('should return the router configuration', () => {
      const controllers = [new TestUserController()];
      const router = new ExpressRouter(app, {
        controllers,
        dataSource,
      });

      const config = router.getConfig();
      expect(config.controllers).toBe(controllers);
      expect(config.dataSource).toBe(dataSource);
    });
  });

  describe('Route Registration', () => {
    it('should register OData controller routes', () => {
      new ExpressRouter(app, {
        controllers: [new TestUserController()],
        dataSource,
      });

      // Check that routes are registered on the app
      const routes = (app as any)._router.stack.filter(
        (layer: any) => layer.route || layer.name === 'router',
      );
      expect(routes.length).toBeGreaterThan(0);
    });

    it('should register custom method routes', () => {
      const controller = new TestUserController();
      new ExpressRouter(app, {
        controllers: [controller],
        dataSource,
      });

      // The custom route /active should be registered
      const routes = (app as any)._router.stack.filter((layer: any) => layer.name === 'router');
      expect(routes.length).toBeGreaterThan(0);
    });

    it('should register metadata route', () => {
      new ExpressRouter(app, {
        controllers: [new TestUserController()],
        dataSource,
      });

      // Check for $metadata route (escaped as \$metadata in Express)
      const routes = (app as any)._router.stack.filter(
        (layer: any) => layer.route && layer.route.path === '/\\$metadata',
      );
      expect(routes.length).toBe(1);
    });

    it('should register CustomQueryController routes', () => {
      new ExpressRouter(app, {
        controllers: [new TestUserStatsController()],
        dataSource,
      });

      const routes = (app as any)._router.stack.filter((layer: any) => layer.name === 'router');
      expect(routes.length).toBeGreaterThan(0);
    });
  });

  describe('Controller DataSource', () => {
    it('should set dataSource on controllers', () => {
      const controller = new TestUserController();
      new ExpressRouter(app, {
        controllers: [controller],
        dataSource,
      });

      // Access protected property through any cast
      expect((controller as any).dataSource).toBe(dataSource);
    });
  });

  describe('Endpoint Naming Convention', () => {
    it('should apply naming convention to controllers', () => {
      const controller = new TestProductController();
      new ExpressRouter(app, {
        controllers: [controller],
        dataSource,
        endpointNamingConvention: EndpointNamingConvention.KEBAB_CASE,
      });

      expect(controller.getEndpoint()).toBe('test-product');
    });

    it('should use AS_MODEL_NAME convention', () => {
      const controller = new TestProductController();
      new ExpressRouter(app, {
        controllers: [controller],
        dataSource,
        endpointNamingConvention: EndpointNamingConvention.AS_MODEL_NAME,
      });

      expect(controller.getEndpoint()).toBe('TestProduct');
    });

    it('should use LOWER_CASE convention', () => {
      const controller = new TestProductController();
      new ExpressRouter(app, {
        controllers: [controller],
        dataSource,
        endpointNamingConvention: EndpointNamingConvention.LOWER_CASE,
      });

      expect(controller.getEndpoint()).toBe('testproduct');
    });
  });

  describe('Custom Routes with @Query decorator', () => {
    it('should register GET custom routes', () => {
      const controller = new TestUserController();
      new ExpressRouter(app, {
        controllers: [controller],
        dataSource,
      });

      // Verify query methods are detected
      const queryMethods = (controller.constructor as any).__queryMethods;
      expect(queryMethods).toBeDefined();
      expect(queryMethods.size).toBe(1);
      expect(queryMethods.has('getActiveUsers')).toBe(true);
    });

    it('should handle controllers without custom methods', () => {
      const controller = new TestProductController();

      // Should not throw
      expect(() => {
        new ExpressRouter(app, {
          controllers: [controller],
          dataSource,
        });
      }).not.toThrow();
    });
  });
});
