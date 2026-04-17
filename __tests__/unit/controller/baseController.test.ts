import { BaseControler } from '../../../src/controller/baseController';
import { DataSource } from '../../../src/core/dataSource';
import { Model } from '../../../src/core/model';
import { EndpointNamingConvention } from '../../../src/utils/constant';

// Mock Model class for testing
class MockModel extends Model<MockModel> {}
MockModel.setTableMetadata({ tableName: 'mock_table' });

describe('BaseControler', () => {
  describe('constructor', () => {
    it('should create controller with config', () => {
      const controller = new BaseControler({
        model: MockModel,
        allowedMethod: ['get', 'post'],
      });

      expect(controller.config).toBeDefined();
      expect(controller.config.model).toBe(MockModel);
      expect(controller.config.allowedMethod).toEqual(['get', 'post']);
    });

    it('should create controller with custom endpoint', () => {
      const controller = new BaseControler({
        model: MockModel,
        endpoint: '/custom-endpoint',
      });

      expect(controller.config.endpoint).toBe('/custom-endpoint');
    });
  });

  describe('getAllowedMethod()', () => {
    it('should return configured allowed methods', () => {
      const controller = new BaseControler({
        model: MockModel,
        allowedMethod: ['get', 'post', 'put'],
      });

      expect(controller.getAllowedMethod()).toEqual(['get', 'post', 'put']);
    });

    it('should return default ["get"] when no methods configured', () => {
      const controller = new BaseControler({
        model: MockModel,
      });

      expect(controller.getAllowedMethod()).toEqual(['get']);
    });
  });

  describe('getEndpoint()', () => {
    it('should return custom endpoint when configured', () => {
      const controller = new BaseControler({
        model: MockModel,
        endpoint: '/my-custom-endpoint',
      });

      expect(controller.getEndpoint()).toBe('/my-custom-endpoint');
    });

    it('should return kebab-case model name by default', () => {
      class MyTestModel extends Model<MyTestModel> {}

      const controller = new BaseControler({
        model: MyTestModel,
      });

      expect(controller.getEndpoint()).toBe('my-test-model');
    });
  });

  describe('setEndpointNamingConvention()', () => {
    it('should use AS_MODEL_NAME convention', () => {
      class MyTestModel extends Model<MyTestModel> {}

      const controller = new BaseControler({
        model: MyTestModel,
      });
      controller.setEndpointNamingConvention(EndpointNamingConvention.AS_MODEL_NAME);

      expect(controller.getEndpoint()).toBe('MyTestModel');
    });

    it('should use KEBAB_CASE convention', () => {
      class MyTestModel extends Model<MyTestModel> {}

      const controller = new BaseControler({
        model: MyTestModel,
      });
      controller.setEndpointNamingConvention(EndpointNamingConvention.KEBAB_CASE);

      expect(controller.getEndpoint()).toBe('my-test-model');
    });

    it('should use LOWER_CASE convention', () => {
      class MyTestModel extends Model<MyTestModel> {}

      const controller = new BaseControler({
        model: MyTestModel,
      });
      controller.setEndpointNamingConvention(EndpointNamingConvention.LOWER_CASE);

      expect(controller.getEndpoint()).toBe('mytestmodel');
    });
  });

  describe('setDataSource()', () => {
    it('should set the data source', () => {
      const controller = new BaseControler({
        model: MockModel,
      });

      // Create a mock DataSource
      const mockDataSource = {} as DataSource;
      controller.setDataSource(mockDataSource);

      // Access protected property through any cast for testing
      expect((controller as any).dataSource).toBe(mockDataSource);
    });
  });

  describe('getBaseModel()', () => {
    it('should return the configured model', () => {
      const controller = new BaseControler({
        model: MockModel,
      });

      expect(controller.getBaseModel()).toBe(MockModel);
    });
  });

  describe('queryable()', () => {
    it('should throw error when dataSource is not set', async () => {
      const controller = new BaseControler({
        model: MockModel,
      });

      const mockQuery = {} as any;

      await expect(controller.queryable(mockQuery)).rejects.toThrow(
        'DataSource is not set. Ensure the controller is registered with a router.',
      );
    });
  });

  describe('rawQueryable()', () => {
    it('should throw error when dataSource is not set', async () => {
      const controller = new BaseControler({
        model: MockModel,
      });

      // Access protected method through any cast for testing
      await expect((controller as any).rawQueryable('SELECT * FROM test', {})).rejects.toThrow(
        'DataSource is not set. Ensure the controller is registered with a router.',
      );
    });
  });
});
