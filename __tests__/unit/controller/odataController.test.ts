import { ODataControler } from '../../../src/controller/odataController';
import { Model } from '../../../src/core/model';
import { QueryParser } from '../../../src/serializers/query';

// Mock Model class for testing
class MockModel extends Model<MockModel> {}
MockModel.setTableMetadata({ tableName: 'mock_table' });

describe('ODataControler', () => {
  describe('constructor', () => {
    it('should create OData controller with config', () => {
      const controller = new ODataControler({
        model: MockModel,
        allowedMethod: ['get'],
      });

      expect(controller).toBeInstanceOf(ODataControler);
      expect(controller.config.model).toBe(MockModel);
    });
  });

  describe('get()', () => {
    it('should be defined', () => {
      const controller = new ODataControler({
        model: MockModel,
      });

      expect(typeof controller.get).toBe('function');
    });

    it('should throw error when dataSource is not set', async () => {
      const controller = new ODataControler({
        model: MockModel,
      });

      const mockQuery = {} as QueryParser;

      await expect(controller.get(mockQuery)).rejects.toThrow();
    });
  });

  describe('post()', () => {
    it('should return the query as-is', async () => {
      const controller = new ODataControler({
        model: MockModel,
      });

      const mockQuery = { test: 'data' } as any;
      const result = await controller.post(mockQuery);

      expect(result).toBe(mockQuery);
    });
  });

  describe('put()', () => {
    it('should return the query as-is', async () => {
      const controller = new ODataControler({
        model: MockModel,
      });

      const mockQuery = { test: 'data' } as any;
      const result = await controller.put(mockQuery);

      expect(result).toBe(mockQuery);
    });
  });

  describe('delete()', () => {
    it('should return the query as-is', async () => {
      const controller = new ODataControler({
        model: MockModel,
      });

      const mockQuery = { test: 'data' } as any;
      const result = await controller.delete(mockQuery);

      expect(result).toBe(mockQuery);
    });
  });

  describe('Inheritance', () => {
    it('should inherit from BaseControler', () => {
      const controller = new ODataControler({
        model: MockModel,
      });

      expect(typeof controller.getAllowedMethod).toBe('function');
      expect(typeof controller.getEndpoint).toBe('function');
      expect(typeof controller.setDataSource).toBe('function');
      expect(typeof controller.getBaseModel).toBe('function');
    });
  });
});
