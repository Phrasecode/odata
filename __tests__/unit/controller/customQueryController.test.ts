import { BaseControler } from '../../../src/controller/baseController';
import { QueryController } from '../../../src/controller/queryController';
import { QueryModel } from '../../../src/core/queryModel';

// Mock QueryModel for testing
class MockQueryModel extends QueryModel<MockQueryModel> {}
MockQueryModel.setTableMetadata({ tableName: 'custom_query_result' });

describe('QueryController', () => {
  describe('constructor', () => {
    it('should create Query controller with config', () => {
      const controller = new QueryController({
        model: MockQueryModel,
        allowedMethod: ['get'],
      });

      expect(controller).toBeInstanceOf(QueryController);
      expect(controller.config.model).toBe(MockQueryModel);
    });
  });

  describe('Inheritance', () => {
    it('should extend BaseControler', () => {
      const controller = new QueryController({
        model: MockQueryModel,
      });

      expect(controller).toBeInstanceOf(BaseControler);
    });

    it('should inherit all BaseControler methods', () => {
      const controller = new QueryController({
        model: MockQueryModel,
      });

      expect(typeof controller.getAllowedMethod).toBe('function');
      expect(typeof controller.getEndpoint).toBe('function');
      expect(typeof controller.setDataSource).toBe('function');
      expect(typeof controller.getBaseModel).toBe('function');
      expect(typeof controller.queryable).toBe('function');
    });
  });

  describe('Usage with CustomQueryModel', () => {
    it('should work with CustomQueryModel', () => {
      const controller = new QueryController({
        model: MockQueryModel,
        endpoint: '/custom-query',
      });

      expect(controller.getBaseModel()).toBe(MockQueryModel);
      expect(controller.getEndpoint()).toBe('/custom-query');
    });

    it('should identify model as custom query', () => {
      const controller = new QueryController({
        model: MockQueryModel,
      });

      const model = controller.getBaseModel();
      expect((model as any).isCustomQuery).toBe(true);
    });
  });

  describe('rawQueryable access', () => {
    it('should have access to rawQueryable method', () => {
      const controller = new QueryController({
        model: MockQueryModel,
      });

      // rawQueryable is protected, so we check it exists via any cast
      expect(typeof (controller as any).rawQueryable).toBe('function');
    });

    it('should throw error when dataSource is not set', async () => {
      const controller = new QueryController({
        model: MockQueryModel,
      });

      await expect((controller as any).rawQueryable('SELECT * FROM test', {})).rejects.toThrow(
        'DataSource is not set',
      );
    });
  });
});
