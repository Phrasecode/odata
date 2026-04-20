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

// ---------------------------------------------------------------------------
// Query builder helpers
// ---------------------------------------------------------------------------

/** Simple field eq literal comparison:  fieldName eq value */
function makeFieldQuery(
  fieldName: string,
  value: any,
  operator: string = 'eq',
): IParsedQuery {
  return {
    table: 'test',
    filter: {
      leftExpression: { type: 'field', field: { name: fieldName } },
      operator,
      rightExpression: { type: 'literal', value },
    },
  } as IParsedQuery;
}

/** Boolean function query:  funcName(fieldName, searchValue) eq checkTrue */
function makeBoolFuncQuery(
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
      rightExpression: { type: 'literal', value: checkTrue },
    },
  } as IParsedQuery;
}

/** Arithmetic expression:  (fieldName add addend) gt compareValue */
function makeArithmeticQuery(
  fieldName: string,
  addend: number,
  compareValue: number,
): IParsedQuery {
  return {
    table: 'test',
    filter: {
      leftExpression: {
        type: 'arithmetic',
        arithmetic: {
          operator: 'add',
          left: { type: 'field', field: { name: fieldName } },
          right: { type: 'literal', value: addend },
        },
      },
      operator: 'gt',
      rightExpression: { type: 'literal', value: compareValue },
    },
  } as IParsedQuery;
}

/** Navigation path field:  alias/columnName eq value */
function makeNavPathQuery(
  alias: string,
  columnName: string,
  tableName: string,
  value: any,
): IParsedQuery {
  return {
    table: 'test',
    filter: {
      leftExpression: {
        type: 'field',
        field: {
          name: columnName,
          table: tableName,
          navigationPath: [alias],
        },
      },
      operator: 'eq',
      rightExpression: { type: 'literal', value },
    },
  } as IParsedQuery;
}

/** Count sub-query:  (SELECT COUNT(*) …) gt compareValue */
function makeCountQuery(
  sourceTable: string,
  targetTable: string,
  foreignKey: string,
  sourceKey: string,
  compareValue: number,
): IParsedQuery {
  return {
    table: sourceTable,
    filter: {
      leftExpression: {
        type: 'count',
        count: {
          relationType: 'hasMany',
          sourceTable,
          targetTable,
          foreignKey,
          sourceKey,
        },
      },
      operator: 'gt',
      rightExpression: { type: 'literal', value: compareValue },
    },
  } as unknown as IParsedQuery;
}

/** has operator:  fieldName has flagValue */
function makeHasQuery(fieldName: string, flagValue: number): IParsedQuery {
  return {
    table: 'test',
    filter: {
      leftExpression: { type: 'field', field: { name: fieldName } },
      operator: 'has',
      rightExpression: { type: 'literal', value: flagValue },
    },
  } as IParsedQuery;
}

// ---------------------------------------------------------------------------
// Assertion helpers
// ---------------------------------------------------------------------------

function getWhereComparator(w: any): symbol {
  return w.comparator;
}
function getWhereLogic(w: any): any {
  return w.logic;
}

// ============================================================================
// TESTS
// ============================================================================

describe('SequelizerAdaptor – identifier naming patterns', () => {
  // --------------------------------------------------------------------------
  // 1. Simple field comparisons
  // --------------------------------------------------------------------------
  describe('simple field comparisons – standard names', () => {
    it('handles snake_case field: user_name', () => {
      const result = adaptor.buildSequelizeQuery(makeFieldQuery('user_name', 'Alice'));
      expect(result.where).toHaveProperty('user_name');
      expect(result.where['user_name'][Op.eq]).toBe('Alice');
    });

    it('handles camelCase field: userName', () => {
      const result = adaptor.buildSequelizeQuery(makeFieldQuery('userName', 'Bob'));
      expect(result.where).toHaveProperty('userName');
      expect(result.where['userName'][Op.eq]).toBe('Bob');
    });

    it('handles PascalCase field: UserName', () => {
      const result = adaptor.buildSequelizeQuery(makeFieldQuery('UserName', 'Carol'));
      expect(result.where).toHaveProperty('UserName');
    });

    it('handles UPPER_CASE field: USER_NAME', () => {
      const result = adaptor.buildSequelizeQuery(makeFieldQuery('USER_NAME', 'Dave'));
      expect(result.where).toHaveProperty('USER_NAME');
    });

    it('handles single character field: x', () => {
      const result = adaptor.buildSequelizeQuery(makeFieldQuery('x', 1));
      expect(result.where).toHaveProperty('x');
    });

    it('handles field with trailing digits: col2', () => {
      const result = adaptor.buildSequelizeQuery(makeFieldQuery('col2', 100));
      expect(result.where).toHaveProperty('col2');
    });

    it('handles field with dollar sign: $price', () => {
      const result = adaptor.buildSequelizeQuery(makeFieldQuery('$price', 9.99));
      expect(result.where).toHaveProperty('$price');
    });
  });

  describe('simple field comparisons – non-standard but valid DB names', () => {
    it('handles hyphenated field: order-item', () => {
      const result = adaptor.buildSequelizeQuery(makeFieldQuery('order-item', 'widget'));
      expect(result.where).toHaveProperty('order-item');
      expect(result.where['order-item'][Op.eq]).toBe('widget');
    });

    it('handles field with multiple hyphens: first-middle-last', () => {
      const result = adaptor.buildSequelizeQuery(makeFieldQuery('first-middle-last', 'val'));
      expect(result.where).toHaveProperty('first-middle-last');
    });

    it('handles field starting with digit: 2024_sales', () => {
      const result = adaptor.buildSequelizeQuery(makeFieldQuery('2024_sales', 500));
      expect(result.where).toHaveProperty('2024_sales');
      expect(result.where['2024_sales'][Op.eq]).toBe(500);
    });

    it('handles purely numeric field name: 123', () => {
      const result = adaptor.buildSequelizeQuery(makeFieldQuery('123', 1));
      expect(result.where).toHaveProperty('123');
    });

    it('handles field with dots: schema.column', () => {
      const result = adaptor.buildSequelizeQuery(makeFieldQuery('schema.column', 'test'));
      // Sequelize may interpret dots specially, but the query should not throw
      expect(result.where).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // 2. Boolean function queries (contains / startswith / endswith)
  // --------------------------------------------------------------------------
  describe('boolean functions – standard field names', () => {
    it('contains with snake_case field', () => {
      const result = adaptor.buildSequelizeQuery(
        makeBoolFuncQuery('contains', 'user_name', 'test', true),
      );
      expect(getWhereComparator(result.where)).toBe(Op.like);
      expect(getWhereLogic(result.where)).toBe('%test%');
    });

    it('startswith with camelCase field', () => {
      const result = adaptor.buildSequelizeQuery(
        makeBoolFuncQuery('startswith', 'firstName', 'Jo', true),
      );
      expect(getWhereComparator(result.where)).toBe(Op.like);
      expect(getWhereLogic(result.where)).toBe('Jo%');
    });
  });

  describe('boolean functions – non-standard field names', () => {
    it('contains with hyphenated field: full-name', () => {
      const result = adaptor.buildSequelizeQuery(
        makeBoolFuncQuery('contains', 'full-name', 'test', true),
      );
      expect(getWhereComparator(result.where)).toBe(Op.like);
      expect(getWhereLogic(result.where)).toBe('%test%');
    });

    it('endswith with digit-starting field: 2024_description', () => {
      const result = adaptor.buildSequelizeQuery(
        makeBoolFuncQuery('endswith', '2024_description', 'end', true),
      );
      expect(getWhereComparator(result.where)).toBe(Op.like);
      expect(getWhereLogic(result.where)).toBe('%end');
    });

    it('contains with dot-containing field: meta.title', () => {
      const result = adaptor.buildSequelizeQuery(
        makeBoolFuncQuery('contains', 'meta.title', 'hello', true),
      );
      expect(getWhereComparator(result.where)).toBe(Op.like);
      expect(getWhereLogic(result.where)).toBe('%hello%');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Arithmetic expressions (field goes through expressionToSql → literal)
  // --------------------------------------------------------------------------
  describe('arithmetic expressions – standard field names', () => {
    it('arithmetic with snake_case field: unit_price add 10 gt 100', () => {
      const result = adaptor.buildSequelizeQuery(makeArithmeticQuery('unit_price', 10, 100));
      expect(result.where).toBeDefined();
      expect(getWhereComparator(result.where)).toBe(Op.gt);
      expect(getWhereLogic(result.where)).toBe(100);
    });

    it('arithmetic with camelCase field: unitPrice add 5 gt 50', () => {
      const result = adaptor.buildSequelizeQuery(makeArithmeticQuery('unitPrice', 5, 50));
      expect(result.where).toBeDefined();
      expect(getWhereComparator(result.where)).toBe(Op.gt);
    });
  });

  describe('arithmetic expressions – non-standard field names', () => {
    it('arithmetic with hyphenated field: unit-price add 10 gt 100', () => {
      const result = adaptor.buildSequelizeQuery(makeArithmeticQuery('unit-price', 10, 100));
      expect(result.where).toBeDefined();
      expect(getWhereComparator(result.where)).toBe(Op.gt);
    });

    it('arithmetic with digit-starting field: 2024_amount add 1 gt 0', () => {
      const result = adaptor.buildSequelizeQuery(makeArithmeticQuery('2024_amount', 1, 0));
      expect(result.where).toBeDefined();
      expect(getWhereComparator(result.where)).toBe(Op.gt);
    });

    it('arithmetic with dot-containing field: price.net add 5 gt 50', () => {
      const result = adaptor.buildSequelizeQuery(makeArithmeticQuery('price.net', 5, 50));
      expect(result.where).toBeDefined();
      expect(getWhereComparator(result.where)).toBe(Op.gt);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Navigation path fields (alias and column name)
  // --------------------------------------------------------------------------
  describe('navigation path fields – standard names', () => {
    it('standard alias and column: category/categoryName eq "Books"', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(makeNavPathQuery('category', 'categoryName', 'categories', 'Books')),
      ).not.toThrow();
    });

    it('snake_case alias and column: order_detail/line_total', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(makeNavPathQuery('order_detail', 'line_total', 'order_details', 'test')),
      ).not.toThrow();
    });
  });

  describe('navigation path fields – non-standard names', () => {
    it('hyphenated alias: order-detail/lineTotal', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(makeNavPathQuery('order-detail', 'lineTotal', 'order_details', 'x')),
      ).not.toThrow();
    });

    it('digit-starting alias: 2024data/revenue', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(makeNavPathQuery('2024data', 'revenue', 'data_2024', 100)),
      ).not.toThrow();
    });

    it('hyphenated column name: category/display-name', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(makeNavPathQuery('category', 'display-name', 'categories', 'test')),
      ).not.toThrow();
    });

    it('dot in column name: settings/ui.theme', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(makeNavPathQuery('settings', 'ui.theme', 'app_settings', 'dark')),
      ).not.toThrow();
    });
  });

  // --------------------------------------------------------------------------
  // 5. Count expressions (table and column names in literal SQL subqueries)
  // --------------------------------------------------------------------------
  describe('count expressions – standard table/column names', () => {
    it('count with snake_case: users / orders / user_id / id', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(makeCountQuery('users', 'orders', 'user_id', 'id', 5)),
      ).not.toThrow();
    });

    it('count with camelCase: Users / Orders / userId / id', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(makeCountQuery('Users', 'Orders', 'userId', 'id', 5)),
      ).not.toThrow();
    });
  });

  describe('count expressions – non-standard table/column names', () => {
    it('count with hyphenated table: user-accounts / order-items / user_id / id', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(
          makeCountQuery('user-accounts', 'order-items', 'user_id', 'id', 5),
        ),
      ).not.toThrow();
    });

    it('count with digit-starting table: 2024_users / 2024_orders / user_id / id', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(
          makeCountQuery('2024_users', '2024_orders', 'user_id', 'id', 3),
        ),
      ).not.toThrow();
    });

    it('count with schema-qualified table: public.users / public.orders / user_id / id', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(
          makeCountQuery('public.users', 'public.orders', 'user_id', 'id', 5),
        ),
      ).not.toThrow();
    });

    it('count with hyphenated foreign key: user-accounts / orders / account-id / id', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(
          makeCountQuery('user_accounts', 'orders', 'account-id', 'id', 1),
        ),
      ).not.toThrow();
    });
  });

  // --------------------------------------------------------------------------
  // 6. has operator
  //    Note: 'has' is NOT in OPERATOR_MAP, so it currently throws
  //    "Unsupported operator: has" before reaching the case handler.
  //    These tests document the current behaviour.
  // --------------------------------------------------------------------------
  describe('has operator – current behaviour', () => {
    it('throws "Unsupported operator: has" for snake_case field', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(makeHasQuery('access_flags', 4)),
      ).toThrow('Unsupported operator: has');
    });

    it('throws "Unsupported operator: has" for hyphenated field', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(makeHasQuery('access-flags', 4)),
      ).toThrow('Unsupported operator: has');
    });
  });

  // --------------------------------------------------------------------------
  // 7. SQL injection prevention – identifiers
  //    These verify that malicious identifier strings are handled safely
  //    (either by escaping or by the query structure preventing exploitation).
  // --------------------------------------------------------------------------
  describe('SQL injection prevention – identifiers', () => {
    it('field name with double quote in arithmetic expression should be escaped', () => {
      // Arithmetic expressions use expressionToSql → literal(), which wraps
      // the field name in double quotes. A " in the name must be escaped to ""
      // to prevent SQL injection breakout.
      //
      // CURRENT BEHAVIOR: produces ("col"umn" + 1) — VULNERABLE
      // EXPECTED AFTER FIX: produces ("col""umn" + 1) — safe
      const result = adaptor.buildSequelizeQuery(makeArithmeticQuery('col"umn', 1, 0));
      const attrSql: string = result.where.attribute?.val ?? '';
      // After the sanitization fix, the SQL should contain escaped double quotes
      expect(attrSql).toContain('col""umn');
    });

    it('field name with semicolon in simple query does not produce injection', () => {
      // Simple field queries use object notation, so the name is just a key
      const result = adaptor.buildSequelizeQuery(
        makeFieldQuery('name; DROP TABLE users;--', 'test'),
      );
      expect(result.where).toHaveProperty('name; DROP TABLE users;--');
      // The value is correctly set via Sequelize's parameterisation
      expect(result.where['name; DROP TABLE users;--'][Op.eq]).toBe('test');
    });

    it('field name with SQL injection attempt in arithmetic does not crash', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(makeArithmeticQuery('x"; DROP TABLE t;--', 1, 0)),
      ).not.toThrow();
    });

    it('navigation path with injection attempt does not crash', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(
          makeNavPathQuery('alias"; DROP TABLE t;--', 'col', 'tbl', 'x'),
        ),
      ).not.toThrow();
    });

    it('count expression with injection attempt in table name does not crash', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(
          makeCountQuery('users"; DROP TABLE t;--', 'orders', 'user_id', 'id', 0),
        ),
      ).not.toThrow();
    });

    it('has operator rejects any input (not in OPERATOR_MAP)', () => {
      expect(() =>
        adaptor.buildSequelizeQuery({
          table: 'test',
          filter: {
            leftExpression: { type: 'field', field: { name: 'flags' } },
            operator: 'has',
            rightExpression: { type: 'literal', value: '4; DROP TABLE users;--' },
          },
        } as IParsedQuery),
      ).toThrow('Unsupported operator: has');
    });
  });

  // --------------------------------------------------------------------------
  // 8. Various comparison operators with non-standard names
  // --------------------------------------------------------------------------
  describe('comparison operators with non-standard field names', () => {
    it.each([
      ['ne', Op.ne],
      ['gt', Op.gt],
      ['ge', Op.gte],
      ['lt', Op.lt],
      ['le', Op.lte],
    ])('operator "%s" works with hyphenated field name', (operator, opSymbol) => {
      const result = adaptor.buildSequelizeQuery(
        makeFieldQuery('order-total', 100, operator),
      );
      expect(result.where).toHaveProperty('order-total');
      expect(result.where['order-total'][opSymbol]).toBe(100);
    });
  });
});
