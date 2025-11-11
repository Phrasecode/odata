import { convertStringToSnakeCase } from '../../../src/utils/utilFunctions';

describe('utilFunctions', () => {
  describe('convertStringToSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      expect(convertStringToSnakeCase('camelCase')).toBe('camel_case');
      expect(convertStringToSnakeCase('myVariableName')).toBe('my_variable_name');
    });

    it('should convert PascalCase to snake_case', () => {
      expect(convertStringToSnakeCase('PascalCase')).toBe('pascal_case');
      expect(convertStringToSnakeCase('MyClassName')).toBe('my_class_name');
    });

    it('should handle strings with spaces', () => {
      expect(convertStringToSnakeCase('hello world')).toBe('hello_world');
      expect(convertStringToSnakeCase('my variable name')).toBe('my_variable_name');
    });

    it('should handle strings with hyphens', () => {
      expect(convertStringToSnakeCase('hello-world')).toBe('hello_world');
      expect(convertStringToSnakeCase('my-variable-name')).toBe('my_variable_name');
    });

    it('should handle mixed formats', () => {
      expect(convertStringToSnakeCase('myVariable-Name Test')).toBe('my_variable_name_test');
    });

    it('should handle already snake_case strings', () => {
      expect(convertStringToSnakeCase('already_snake_case')).toBe('already_snake_case');
    });

    it('should handle empty strings', () => {
      expect(convertStringToSnakeCase('')).toBe('');
    });

    it('should handle strings with numbers', () => {
      expect(convertStringToSnakeCase('myVar123Name')).toBe('my_var123_name');
      expect(convertStringToSnakeCase('test123')).toBe('test123');
    });

    it('should handle single word', () => {
      expect(convertStringToSnakeCase('word')).toBe('word');
      expect(convertStringToSnakeCase('WORD')).toBe('word');
    });
  });
});

