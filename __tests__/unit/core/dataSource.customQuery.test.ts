import { DataSource } from '../../../src/core/dataSource';
import { Model } from '../../../src/core/model';
import { QueryModel } from '../../../src/core/queryModel';
import { Column, Table } from '../../../src/decorators';
import { DataTypes } from '../../../src/types/entitySchema.types';

// Regular Model for testing
@Table({ tableName: 'users' })
class User extends Model<User> {
  @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
  id!: number;

  @Column({ dataType: DataTypes.STRING })
  name!: string;
}

// QueryModel for testing
@Table({ tableName: 'user_stats' })
class UserStats extends QueryModel<UserStats> {
  @Column({ dataType: DataTypes.INTEGER })
  userId!: number;

  @Column({ dataType: DataTypes.STRING })
  userName!: string;

  @Column({ dataType: DataTypes.INTEGER })
  totalOrders!: number;
}

describe('DataSource with QueryModel', () => {
  describe('defineEntityModels', () => {
    it('should register both regular and custom query models in entityMap', () => {
      const dataSource = new DataSource({
        database: ':memory:',
        username: '',
        password: '',
        host: 'localhost',
        dialect: 'sqlite',
        port: 0,
        pool: { max: 1, min: 0, idle: 10000 },
        schema: '',
        models: [User, UserStats],
      });

      // Both models should be in entityMap
      expect(dataSource.entityMap.has('User')).toBe(true);
      expect(dataSource.entityMap.has('UserStats')).toBe(true);
    });

    it('should register both models in entityNameMap', () => {
      const dataSource = new DataSource({
        database: ':memory:',
        username: '',
        password: '',
        host: 'localhost',
        dialect: 'sqlite',
        port: 0,
        pool: { max: 1, min: 0, idle: 10000 },
        schema: '',
        models: [User, UserStats],
      });

      expect(dataSource.entityNameMap.has('User')).toBe(true);
      expect(dataSource.entityNameMap.has('UserStats')).toBe(true);
    });

    it('should identify QueryModel correctly', () => {
      expect((User as any).isCustomQuery).toBeUndefined();
      expect((UserStats as any).isCustomQuery).toBe(true);
    });
  });

  describe('Model differentiation', () => {
    it('should correctly identify regular models', () => {
      const isCustomQuery = (User as any).isCustomQuery === true;
      expect(isCustomQuery).toBe(false);
    });

    it('should correctly identify custom query models', () => {
      const isCustomQuery = (UserStats as any).isCustomQuery === true;
      expect(isCustomQuery).toBe(true);
    });
  });

  describe('getEntity', () => {
    it('should return regular model by name', () => {
      const dataSource = new DataSource({
        database: ':memory:',
        username: '',
        password: '',
        host: 'localhost',
        dialect: 'sqlite',
        port: 0,
        pool: { max: 1, min: 0, idle: 10000 },
        schema: '',
        models: [User, UserStats],
      });

      const entity = dataSource.getEntity('User');
      expect(entity).toBeDefined();
    });

    it('should return custom query model by name', () => {
      const dataSource = new DataSource({
        database: ':memory:',
        username: '',
        password: '',
        host: 'localhost',
        dialect: 'sqlite',
        port: 0,
        pool: { max: 1, min: 0, idle: 10000 },
        schema: '',
        models: [User, UserStats],
      });

      const entity = dataSource.getEntity('UserStats');
      expect(entity).toBeDefined();
    });

    it('should return undefined for non-existent model', () => {
      const dataSource = new DataSource({
        database: ':memory:',
        username: '',
        password: '',
        host: 'localhost',
        dialect: 'sqlite',
        port: 0,
        pool: { max: 1, min: 0, idle: 10000 },
        schema: '',
        models: [User],
      });

      const entity = dataSource.getEntity('NonExistent');
      expect(entity).toBeUndefined();
    });
  });
});
