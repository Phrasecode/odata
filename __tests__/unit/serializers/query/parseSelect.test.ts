import { parseSelect } from '../../../../src/serializers/query/parseSelect';

describe('parseSelect', () => {
  const tableName = 'User';

  it('should parse single field', () => {
    const result = parseSelect('id', tableName);
    expect(result).toEqual([{ table: tableName, field: 'id' }]);
  });

  it('should parse multiple fields', () => {
    const result = parseSelect('id,name,email', tableName);
    expect(result).toEqual([
      { table: tableName, field: 'id' },
      { table: tableName, field: 'name' },
      { table: tableName, field: 'email' },
    ]);
  });

  it('should handle fields with spaces', () => {
    const result = parseSelect('id, name, email', tableName);
    expect(result).toEqual([
      { table: tableName, field: 'id' },
      { table: tableName, field: 'name' },
      { table: tableName, field: 'email' },
    ]);
  });

  it('should filter out empty fields', () => {
    const result = parseSelect('id,,name', tableName);
    expect(result).toEqual([
      { table: tableName, field: 'id' },
      { table: tableName, field: 'name' },
    ]);
  });

  it('should filter out asterisk (*)', () => {
    const result = parseSelect('id,*,name', tableName);
    expect(result).toEqual([
      { table: tableName, field: 'id' },
      { table: tableName, field: 'name' },
    ]);
  });

  it('should handle empty string', () => {
    const result = parseSelect('', tableName);
    expect(result).toEqual([]);
  });

  it('should handle only spaces', () => {
    const result = parseSelect('   ', tableName);
    expect(result).toEqual([]);
  });

  it('should handle complex field names', () => {
    const result = parseSelect('userId,fullName,createdAt', tableName);
    expect(result).toEqual([
      { table: tableName, field: 'userId' },
      { table: tableName, field: 'fullName' },
      { table: tableName, field: 'createdAt' },
    ]);
  });
});
