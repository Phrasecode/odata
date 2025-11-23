import { Column, DataTypes, Model, Table } from '../../../src';
import { parseResponse } from '../../../src/serializers/responseBuilder';

// Test model
@Table({ tableName: 'test_items', underscored: true })
class TestItem extends Model<TestItem> {
  @Column({
    dataType: DataTypes.INTEGER,
    isPrimaryKey: true,
  })
  itemId!: number;

  @Column({
    dataType: DataTypes.STRING,
  })
  itemName!: string;

  @Column({
    dataType: DataTypes.BOOLEAN,
  })
  isActive!: boolean;
}

describe('parseResponse', () => {
  describe('Basic response formatting', () => {
    it('should format response with array data', () => {
      const data = [
        { item_id: 1, item_name: 'Item 1', is_active: true },
        { item_id: 2, item_name: 'Item 2', is_active: false },
      ];
      const count = 5;
      const executionTime = 123.45;

      const result = parseResponse(data, TestItem, executionTime, count);

      expect(result['@odata.context']).toBeDefined();
      expect(result['@odata.count']).toBeDefined();
      expect(result.value).toBeDefined();
      expect(result.meta).toBeDefined();
    });

    it('should set correct count for array data', () => {
      const data = [
        { item_id: 1, item_name: 'Item 1', is_active: true },
        { item_id: 2, item_name: 'Item 2', is_active: false },
      ];
      const count = 25;
      const executionTime = 100;

      const result = parseResponse(data, TestItem, executionTime, count);

      expect(result['@odata.count']).toBe(count);
    });

    it('should set correct count if not defined', () => {
      const data = [
        { item_id: 1, item_name: 'Item 1', is_active: true },
        { item_id: 2, item_name: 'Item 2', is_active: false },
      ];
      const executionTime = 50;

      const result = parseResponse(data, TestItem, executionTime);

      expect(result['@odata.count']).toBe(undefined);
    });

    it('should include execution time in meta', () => {
      const data = [{ item_id: 1, item_name: 'Item 1', is_active: true }];
      const executionTime = 234.56;

      const result = parseResponse(data, TestItem, executionTime);

      expect(result.meta.queryExecutionTime).toBe(234.56);
    });
  });

  describe('Column name conversion', () => {
    it('should convert column identifiers to property keys', () => {
      const data = [{ item_id: 1, item_name: 'Test Item', is_active: true }];
      const executionTime = 100;

      const result = parseResponse(data, TestItem, executionTime);

      expect(result.value).toHaveLength(1);
      const item = (result.value as any[])[0];
      expect(item).toHaveProperty('itemId');
      expect(item).toHaveProperty('itemName');
      expect(item).toHaveProperty('isActive');
    });

    it('should preserve values during conversion', () => {
      const data = [{ item_id: 123, item_name: 'My Item', is_active: false }];
      const executionTime = 100;

      const result = parseResponse(data, TestItem, executionTime);

      const item = (result.value as any[])[0];
      expect(item.itemId).toBe(123);
      expect(item.itemName).toBe('My Item');
      expect(item.isActive).toBe(false);
    });

    it('should handle multiple items', () => {
      const data = [
        { item_id: 1, item_name: 'Item 1', is_active: true },
        { item_id: 2, item_name: 'Item 2', is_active: false },
        { item_id: 3, item_name: 'Item 3', is_active: true },
      ];
      const executionTime = 100;

      const result = parseResponse(data, TestItem, executionTime);

      expect(result.value).toHaveLength(3);
      const items = result.value as any[];
      expect(items[0].itemId).toBe(1);
      expect(items[1].itemId).toBe(2);
      expect(items[2].itemId).toBe(3);
    });
  });

  describe('OData context', () => {
    it('should generate correct @odata.context', () => {
      const data = [{ item_id: 1, item_name: 'Item 1', is_active: true }];
      const executionTime = 100;

      const result = parseResponse(data, TestItem, executionTime);

      expect(result['@odata.context']).toContain('$metadata');
      expect(result['@odata.context']).toContain('TestItem');
    });
  });

  describe('Edge cases', () => {
    it('should handle null values in data', () => {
      const data = [{ item_id: 1, item_name: null, is_active: true }];
      const executionTime = 100;

      const result = parseResponse(data, TestItem, executionTime);

      const item = (result.value as any[])[0];
      expect(item.itemName).toBeNull();
    });

    it('should handle zero execution time', () => {
      const data = [{ item_id: 1, item_name: 'Item 1', is_active: true }];
      const executionTime = 0;

      const result = parseResponse(data, TestItem, executionTime);

      expect(result.meta.queryExecutionTime).toBe(0);
    });
  });
});
