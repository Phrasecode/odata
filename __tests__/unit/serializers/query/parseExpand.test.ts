import { parseExpand } from '../../../../src/serializers/query/parseExpand';

describe('parseExpand', () => {
  describe('Basic expansion', () => {
    it('should parse single table expansion', () => {
      const result = parseExpand('myDepartment');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        table: 'myDepartment',
      });
    });

    it('should parse multiple table expansions', () => {
      const result = parseExpand('user,category');
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        table: 'user',
      });
      expect(result[1]).toMatchObject({
        table: 'category',
      });
    });
  });

  describe('Expansion with $select', () => {
    it('should parse expansion with select clause', () => {
      const result = parseExpand('myDepartment($select=departmentName,description)');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        table: 'myDepartment',
      });
      expect(result[0].select).toBeDefined();
      expect(result[0].select).toHaveLength(2);
    });

    it('should parse multiple expansions with select', () => {
      const result = parseExpand('user($select=username,email),category($select=categoryName)');
      expect(result).toHaveLength(2);
      expect(result[0].select).toHaveLength(2);
      expect(result[1].select).toHaveLength(1);
    });
  });

  describe('Expansion with $filter', () => {
    it('should parse expansion with filter clause', () => {
      const result = parseExpand('users($filter=isActive eq true)');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        table: 'users',
      });
      expect(result[0].filter).toBeDefined();
    });

    it('should parse expansion with select and filter', () => {
      const result = parseExpand('users($select=username;$filter=isActive eq true)');
      expect(result).toHaveLength(1);
      expect(result[0].select).toBeDefined();
      expect(result[0].filter).toBeDefined();
    });
  });

  describe('Nested expansion', () => {
    it('should parse 2-level nested expansion', () => {
      const result = parseExpand('user($expand=myDepartment)');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        table: 'user',
      });
      expect(result[0].expand).toBeDefined();
      expect(result[0].expand).toHaveLength(1);
    });

    it('should parse nested expansion with select', () => {
      const result = parseExpand(
        'user($expand=myDepartment($select=departmentName);$select=username,email)',
      );
      expect(result).toHaveLength(1);
      expect(result[0].select).toBeDefined();
      expect(result[0].expand).toBeDefined();
      expect(result[0].expand![0].select).toBeDefined();
    });

    it('should parse 3-level nested expansion', () => {
      const result = parseExpand(
        'note($expand=user($expand=myDepartment($select=departmentName)))',
      );
      expect(result).toHaveLength(1);
      expect(result[0].expand).toBeDefined();
      expect(result[0].expand![0].expand).toBeDefined();
      expect(result[0].expand![0].expand![0].select).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should return empty array for empty string', () => {
      const result = parseExpand('');
      expect(result).toEqual([]);
    });

    it('should return empty array for whitespace only', () => {
      const result = parseExpand('   ');
      expect(result).toEqual([]);
    });

    it('should handle extra whitespace', () => {
      const result = parseExpand('  user  ,  category  ');
      expect(result).toHaveLength(2);
    });
  });

  describe('Real-world OData examples', () => {
    it('should parse user with department expansion', () => {
      const result = parseExpand('myDepartment($select=departmentName,description)');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        table: 'myDepartment',
      });
    });

    it('should parse department with users expansion', () => {
      const result = parseExpand('users($select=username,email,fullName,isActive)');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        table: 'users',
      });
    });

    it('should parse complex nested expansion from test queries', () => {
      const result = parseExpand(
        'user($expand=myDepartment($select=departmentName,description);$select=username,email,fullName),category($expand=creator($select=username);$select=categoryName,description)',
      );
      expect(result).toHaveLength(2);
      expect(result[0].table).toBe('user');
      expect(result[0].expand).toBeDefined();
      expect(result[1].table).toBe('category');
      expect(result[1].expand).toBeDefined();
    });
  });
});
