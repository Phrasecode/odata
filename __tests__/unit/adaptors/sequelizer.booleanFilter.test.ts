import { Op } from 'sequelize';
import { SequelizerAdaptor } from '../../../src/adaptors/sequelizer';
import { IParsedQuery } from '../../../src/types';

// Minimal SQLite-backed adaptor for unit testing (no real DB needed for query building)
const adaptor = new SequelizerAdaptor({
  dialect: 'sqlite',
  database: ':memory:',
  username: '',
  password: '',
  host: '',
  port: 0,
  pool: { max: 1, min: 0, acquire: 30000, idle: 10000 },
  schema: '',
});

/**
 * Helper to build a filter condition for a boolean function call.
 * e.g. contains(name, 'foo') eq true
 */
function makeBooleanFuncQuery(
  funcName: string,
  fieldName: string,
  searchValue: string,
  checkTrue: boolean,
): IParsedQuery {
  return {
    table: 'test',
    filter: {
      leftExpression: {
        type: 'function',
        function: {
          name: funcName,
          args: [
            { type: 'field', field: { name: fieldName } },
            { type: 'literal', value: searchValue },
          ],
        },
      },
      operator: 'eq',
      rightExpression: {
        type: 'literal',
        value: checkTrue,
      },
    },
  } as IParsedQuery;
}

/**
 * Sequelize's `where(col, Op.like, pattern)` returns a Where object with:
 *   .comparator === Op.like / Op.notLike
 *   .logic      === the pattern string
 */
function getWhereComparator(w: any): symbol {
  return w.comparator;
}
function getWhereLogic(w: any): string {
  return w.logic;
}

describe('SequelizerAdaptor – boolean filter functions (PR #62)', () => {
  describe('contains', () => {
    it('produces Op.like with %value% pattern for eq true', () => {
      const query = makeBooleanFuncQuery('contains', 'name', 'foo', true);
      const result = adaptor.buildSequelizeQuery(query);
      expect(getWhereComparator(result.where)).toBe(Op.like);
      expect(getWhereLogic(result.where)).toBe('%foo%');
    });

    it('produces Op.notLike with %value% pattern for eq false', () => {
      const query = makeBooleanFuncQuery('contains', 'name', 'foo', false);
      const result = adaptor.buildSequelizeQuery(query);
      expect(getWhereComparator(result.where)).toBe(Op.notLike);
      expect(getWhereLogic(result.where)).toBe('%foo%');
    });

    it('notLike pattern does NOT contain "NOT LIKE" string (old broken behaviour)', () => {
      const query = makeBooleanFuncQuery('contains', 'name', 'foo', false);
      const result = adaptor.buildSequelizeQuery(query);
      expect(getWhereComparator(result.where)).toBe(Op.notLike);
      expect(getWhereLogic(result.where)).not.toMatch(/NOT LIKE/i);
    });
  });

  describe('startswith', () => {
    it('produces Op.like with value% pattern for eq true', () => {
      const query = makeBooleanFuncQuery('startswith', 'name', 'foo', true);
      const result = adaptor.buildSequelizeQuery(query);
      expect(getWhereComparator(result.where)).toBe(Op.like);
      expect(getWhereLogic(result.where)).toBe('foo%');
    });

    it('produces Op.notLike with value% pattern for eq false', () => {
      const query = makeBooleanFuncQuery('startswith', 'name', 'foo', false);
      const result = adaptor.buildSequelizeQuery(query);
      expect(getWhereComparator(result.where)).toBe(Op.notLike);
      expect(getWhereLogic(result.where)).toBe('foo%');
    });

    it('notLike pattern does NOT contain "NOT LIKE" string', () => {
      const query = makeBooleanFuncQuery('startswith', 'name', 'foo', false);
      const result = adaptor.buildSequelizeQuery(query);
      expect(getWhereComparator(result.where)).toBe(Op.notLike);
      expect(getWhereLogic(result.where)).not.toMatch(/NOT LIKE/i);
    });
  });

  describe('endswith', () => {
    it('produces Op.like with %value pattern for eq true', () => {
      const query = makeBooleanFuncQuery('endswith', 'name', 'foo', true);
      const result = adaptor.buildSequelizeQuery(query);
      expect(getWhereComparator(result.where)).toBe(Op.like);
      expect(getWhereLogic(result.where)).toBe('%foo');
    });

    it('produces Op.notLike with %value pattern for eq false', () => {
      const query = makeBooleanFuncQuery('endswith', 'name', 'foo', false);
      const result = adaptor.buildSequelizeQuery(query);
      expect(getWhereComparator(result.where)).toBe(Op.notLike);
      expect(getWhereLogic(result.where)).toBe('%foo');
    });

    it('notLike pattern does NOT contain "NOT LIKE" string', () => {
      const query = makeBooleanFuncQuery('endswith', 'name', 'foo', false);
      const result = adaptor.buildSequelizeQuery(query);
      expect(getWhereComparator(result.where)).toBe(Op.notLike);
      expect(getWhereLogic(result.where)).not.toMatch(/NOT LIKE/i);
    });
  });

  describe('LIKE wildcard injection prevention (PR #62)', () => {
    it('escapes % in search value for contains', () => {
      const query = makeBooleanFuncQuery('contains', 'name', '100%', true);
      const result = adaptor.buildSequelizeQuery(query);
      expect(getWhereLogic(result.where)).toBe('%100\\%%');
    });

    it('escapes _ in search value for contains', () => {
      const query = makeBooleanFuncQuery('contains', 'name', 'foo_bar', true);
      const result = adaptor.buildSequelizeQuery(query);
      expect(getWhereLogic(result.where)).toBe('%foo\\_bar%');
    });

    it('escapes \\ in search value for contains', () => {
      const query = makeBooleanFuncQuery('contains', 'name', 'foo\\bar', true);
      const result = adaptor.buildSequelizeQuery(query);
      expect(getWhereLogic(result.where)).toBe('%foo\\\\bar%');
    });

    it('escapes % in search value for startswith', () => {
      const query = makeBooleanFuncQuery('startswith', 'name', '50%off', true);
      const result = adaptor.buildSequelizeQuery(query);
      expect(getWhereLogic(result.where)).toBe('50\\%off%');
    });

    it('escapes _ in search value for endswith', () => {
      const query = makeBooleanFuncQuery('endswith', 'name', '_suffix', true);
      const result = adaptor.buildSequelizeQuery(query);
      expect(getWhereLogic(result.where)).toBe('%\\_suffix');
    });

    it('escapes wildcards in notLike pattern too', () => {
      const query = makeBooleanFuncQuery('contains', 'name', '100%', false);
      const result = adaptor.buildSequelizeQuery(query);
      expect(getWhereComparator(result.where)).toBe(Op.notLike);
      expect(getWhereLogic(result.where)).toBe('%100\\%%');
    });

    it('does not alter a clean search value', () => {
      const query = makeBooleanFuncQuery('contains', 'name', 'hello', true);
      const result = adaptor.buildSequelizeQuery(query);
      expect(getWhereLogic(result.where)).toBe('%hello%');
    });
  });

  describe('edge cases', () => {
    it('valid boolean function does not throw', () => {
      const query = makeBooleanFuncQuery('contains', 'name', 'test', true);
      expect(() => adaptor.buildSequelizeQuery(query)).not.toThrow();
    });

    it('throws BadRequestError when function has wrong arg count', () => {
      const query: IParsedQuery = {
        table: 'test',
        filter: {
          leftExpression: {
            type: 'function',
            function: {
              name: 'contains',
              args: [{ type: 'field', field: { name: 'name' } }], // only 1 arg
            },
          },
          operator: 'eq',
          rightExpression: { type: 'literal', value: true },
        },
      } as IParsedQuery;
      expect(() => adaptor.buildSequelizeQuery(query)).toThrow(
        'contains function requires exactly 2 arguments',
      );
    });
  });
});
