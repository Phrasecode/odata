import { Model } from '../../../src/core/model';
import { QueryModel } from '../../../src/core/queryModel';

describe('QueryModel', () => {
  describe('isCustomQuery flag', () => {
    it('should have isCustomQuery set to true', () => {
      expect(QueryModel.isCustomQuery).toBe(true);
    });

    it('should be identifiable as a custom query model', () => {
      class TestCustomModel extends QueryModel<TestCustomModel> {}

      expect((TestCustomModel as any).isCustomQuery).toBe(true);
    });

    it('should differentiate from regular Model', () => {
      class RegularModel extends Model<RegularModel> {}
      class CustomModel extends QueryModel<CustomModel> {}

      expect((RegularModel as any).isCustomQuery).toBeUndefined();
      expect((CustomModel as any).isCustomQuery).toBe(true);
    });
  });

  describe('Inheritance', () => {
    it('should extend Model class', () => {
      class TestCustomModel extends QueryModel<TestCustomModel> {}

      const instance = new TestCustomModel();
      expect(instance).toBeInstanceOf(Model);
      expect(instance).toBeInstanceOf(QueryModel);
    });

    it('should inherit Model static methods', () => {
      class TestCustomModel extends QueryModel<TestCustomModel> {}

      expect(typeof TestCustomModel.getModelName).toBe('function');
      expect(typeof TestCustomModel.getMetadata).toBe('function');
      expect(typeof TestCustomModel.setTableMetadata).toBe('function');
      expect(typeof TestCustomModel.addColumnMetadata).toBe('function');
    });

    it('should return correct model name', () => {
      class UserRoleCustomQuery extends QueryModel<UserRoleCustomQuery> {}

      expect(UserRoleCustomQuery.getModelName()).toBe('UserRoleCustomQuery');
    });
  });

  describe('Usage with decorators', () => {
    it('should work with Table decorator pattern', () => {
      class TestCustomModel extends QueryModel<TestCustomModel> {}

      // Simulate Table decorator behavior
      TestCustomModel.setTableMetadata({ tableName: 'custom_query_result' });

      const metadata = TestCustomModel.getMetadata();
      expect(metadata.tableMetadata.tableIdentifier).toBe('custom_query_result');
    });

    it('should work with Column decorator pattern', () => {
      class TestCustomModel extends QueryModel<TestCustomModel> {}

      // Simulate Column decorator behavior
      TestCustomModel.addColumnMetadata('id', {
        dataType: 'INTEGER' as any,
        isPrimaryKey: true,
      });
      TestCustomModel.addColumnMetadata('name', {
        dataType: 'STRING' as any,
        isNullable: false,
      });

      const metadata = TestCustomModel.getMetadata();
      expect(metadata.columnMetadata).toHaveLength(2);
    });
  });
});
