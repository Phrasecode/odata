import { Op } from 'sequelize';
import { SequelizerAdaptor } from '../../../src/adaptors/sequelizer';
import { IParsedQuery } from '../../../src/types';

/**
 * SQL Injection Prevention Tests for SequelizerAdaptor
 *
 * Tests are grouped by the code path (attack surface) each injection vector
 * exploits. Each test documents:
 *   - The attack payload
 *   - The code path it traverses
 *   - Whether the current code is SAFE or VULNERABLE
 *
 * Tests of currently-vulnerable paths assert the EXPECTED safe behaviour;
 * they deliberately FAIL until the sanitisation fix is applied.
 */

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
// Helpers – query construction
// ---------------------------------------------------------------------------

/** (fieldName add addend) gt compareValue – field goes via expressionToSql → literal() */
function makeArithmeticFieldQuery(fieldName: string, addend: number = 1): IParsedQuery {
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
      rightExpression: { type: 'literal', value: 0 },
    },
  } as IParsedQuery;
}

/** (field add stringLiteral) gt 0 – string literal in arithmetic via expressionToSql */
function makeArithmeticStringLiteralQuery(stringPayload: string): IParsedQuery {
  return {
    table: 'test',
    filter: {
      leftExpression: {
        type: 'arithmetic',
        arithmetic: {
          operator: 'add',
          left: { type: 'field', field: { name: 'price' } },
          right: { type: 'literal', value: stringPayload },
        },
      },
      operator: 'gt',
      rightExpression: { type: 'literal', value: 0 },
    },
  } as IParsedQuery;
}

/** (SELECT COUNT(*) FROM target WHERE …) gt value – table/key names via literal() */
function makeCountQuery(
  sourceTable: string,
  targetTable: string,
  foreignKey: string,
  sourceKey: string,
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
      rightExpression: { type: 'literal', value: 0 },
    },
  } as unknown as IParsedQuery;
}

/** alias/columnName eq value – navigation path via expressionToSql in arithmetic context */
function makeNavArithmeticQuery(alias: string, column: string, table: string): IParsedQuery {
  return {
    table: 'test',
    filter: {
      leftExpression: {
        type: 'arithmetic',
        arithmetic: {
          operator: 'add',
          left: {
            type: 'field',
            field: { name: column, table, navigationPath: [alias] },
          },
          right: { type: 'literal', value: 1 },
        },
      },
      operator: 'gt',
      rightExpression: { type: 'literal', value: 0 },
    },
  } as IParsedQuery;
}

/** contains(fieldName, searchValue) eq true – tests LIKE wildcard escaping */
function makeContainsQuery(fieldName: string, searchValue: string): IParsedQuery {
  return {
    table: 'test',
    filter: {
      leftExpression: {
        type: 'function',
        function: {
          name: 'contains',
          args: [
            { type: 'field', field: { name: fieldName } },
            { type: 'literal', value: searchValue },
          ],
        },
      },
      operator: 'eq',
      rightExpression: { type: 'literal', value: true },
    },
  } as IParsedQuery;
}

/** cast(fieldName, type) eq value – tests CAST type allowlist */
function makeCastQuery(fieldName: string, castType: string): IParsedQuery {
  return {
    table: 'test',
    filter: {
      leftExpression: {
        type: 'arithmetic',
        arithmetic: {
          operator: 'add',
          left: {
            type: 'function',
            function: {
              name: 'cast',
              args: [
                { type: 'field', field: { name: fieldName } },
                { type: 'literal', value: castType },
              ],
            },
          },
          right: { type: 'literal', value: 0 },
        },
      },
      operator: 'gt',
      rightExpression: { type: 'literal', value: 0 },
    },
  } as IParsedQuery;
}

/** fieldName eq value – simple field comparison (safe by design via Sequelize parameterisation) */
function makeSimpleFieldQuery(fieldName: string, value: any): IParsedQuery {
  return {
    table: 'test',
    filter: {
      leftExpression: { type: 'field', field: { name: fieldName } },
      operator: 'eq',
      rightExpression: { type: 'literal', value },
    },
  } as IParsedQuery;
}

// ---------------------------------------------------------------------------
// Helpers – SQL extraction
// ---------------------------------------------------------------------------

/** Extract the raw SQL string from a Sequelize Literal inside a Where clause */
function getLiteralSql(where: any): string {
  // where(literal(sql), Op.xx, value) → where.attribute.val = sql
  return where?.attribute?.val ?? '';
}

// ============================================================================
// TESTS
// ============================================================================

describe('SQL injection prevention', () => {
  // ==========================================================================
  // 1. IDENTIFIER INJECTION VIA ARITHMETIC EXPRESSIONS
  //    Code path: buildCondition → buildExpression('arithmetic')
  //              → literal(arithmeticToSql()) → expressionToSql('field')
  //              → `"${fieldName}"`
  //    Risk: double-quote breakout from the quoted identifier
  // ==========================================================================
  describe('1 – identifier injection via arithmetic (expressionToSql)', () => {
    it('double-quote breakout: field name closes the identifier and injects OR', () => {
      // Attack: x" OR 1=1 --
      // Vulnerable output: ("x" OR 1=1 --" + 1) → SQL injection!
      // Safe output:       ("x"" OR 1=1 --" + 1) → field named 'x" OR 1=1 --'
      const result = adaptor.buildSequelizeQuery(makeArithmeticFieldQuery('x" OR 1=1 --'));
      const sql = getLiteralSql(result.where);
      // The identifier should be properly escaped: " → ""
      expect(sql).toContain('x"" OR 1=1 --');
    });

    it('semicolon + DROP TABLE injection via field name', () => {
      // Attack: x"; DROP TABLE users; --
      // Vulnerable output: ("x"; DROP TABLE users; --" + 1)
      // Safe output:       ("x""; DROP TABLE users; --" + 1)
      const result = adaptor.buildSequelizeQuery(
        makeArithmeticFieldQuery('x"; DROP TABLE users; --'),
      );
      const sql = getLiteralSql(result.where);
      expect(sql).toContain('x""; DROP TABLE users; --');
    });

    it('UNION SELECT injection via field name', () => {
      // Attack: x" UNION SELECT password FROM secrets --
      const result = adaptor.buildSequelizeQuery(
        makeArithmeticFieldQuery('x" UNION SELECT password FROM secrets --'),
      );
      const sql = getLiteralSql(result.where);
      expect(sql).toContain('x"" UNION SELECT password FROM secrets --');
    });

    it('subquery injection via field name', () => {
      // Attack: x" + (SELECT password FROM users LIMIT 1) + "
      const result = adaptor.buildSequelizeQuery(
        makeArithmeticFieldQuery('x" + (SELECT password FROM users LIMIT 1) + "'),
      );
      const sql = getLiteralSql(result.where);
      // The entire payload should be inside quoted identifiers with escaped quotes.
      // The " in the payload is escaped to "", keeping the identifier contained.
      expect(sql).toContain('x"" + (SELECT password FROM users LIMIT 1) + ""');
    });

    it('closing quote with comment to suppress rest: field"--', () => {
      const result = adaptor.buildSequelizeQuery(makeArithmeticFieldQuery('field"--'));
      const sql = getLiteralSql(result.where);
      expect(sql).toContain('field""--');
    });
  });

  // ==========================================================================
  // 2. IDENTIFIER INJECTION VIA COUNT SUBQUERIES
  //    Code path: buildCondition → buildExpression('count')
  //              → buildCountExpression → literal(subquery)
  //              → `"${targetTable}"`, `"${foreignKey}"`, etc.
  //    Risk: double-quote breakout in table/column names inside subquery
  // ==========================================================================
  describe('2 – identifier injection via count subqueries (buildCountExpression)', () => {
    it('DROP TABLE via target table name', () => {
      // Attack: targetTable = t"); DROP TABLE secrets; --
      // Vulnerable: (SELECT COUNT(*) FROM "t"); DROP TABLE secrets; --" WHERE …)
      // Safe:       (SELECT COUNT(*) FROM "t""); DROP TABLE secrets; --" WHERE …)
      const result = adaptor.buildSequelizeQuery(
        makeCountQuery('users', 't"); DROP TABLE secrets; --', 'user_id', 'id'),
      );
      const sql = getLiteralSql(result.where);
      expect(sql).toContain('t""); DROP TABLE secrets; --');
      expect(sql).not.toMatch(/FROM "t"\);/);
    });

    it('DROP TABLE via source table name', () => {
      const result = adaptor.buildSequelizeQuery(
        makeCountQuery('src"); DROP TABLE t; --', 'orders', 'fk', 'id'),
      );
      const sql = getLiteralSql(result.where);
      expect(sql).toContain('src""); DROP TABLE t; --');
    });

    it('injection via foreign key name', () => {
      const result = adaptor.buildSequelizeQuery(
        makeCountQuery('users', 'orders', 'fk" OR 1=1) --', 'id'),
      );
      const sql = getLiteralSql(result.where);
      expect(sql).toContain('fk"" OR 1=1) --');
    });

    it('injection via source key name', () => {
      const result = adaptor.buildSequelizeQuery(
        makeCountQuery('users', 'orders', 'fk', 'id" OR 1=1) --'),
      );
      const sql = getLiteralSql(result.where);
      expect(sql).toContain('id"" OR 1=1) --');
    });

    it('combined injection: all four identifiers contain quotes', () => {
      const result = adaptor.buildSequelizeQuery(
        makeCountQuery('s"rc', 't"gt', 'f"k', 's"k'),
      );
      const sql = getLiteralSql(result.where);
      expect(sql).toContain('s""rc');
      expect(sql).toContain('t""gt');
      expect(sql).toContain('f""k');
      expect(sql).toContain('s""k');
    });
  });

  // ==========================================================================
  // 3. IDENTIFIER INJECTION VIA NAVIGATION PATHS IN expressionToSql
  //    Code path: arithmeticToSql → expressionToSql('field' with navPath)
  //              → `"${alias}"."${columnName}"`
  //    Risk: double-quote breakout in alias or column name
  // ==========================================================================
  describe('3 – identifier injection via navigation paths (expressionToSql)', () => {
    it('injection via navigation alias', () => {
      // Attack: alias = cat"; DROP TABLE t; --
      // Vulnerable: "cat"; DROP TABLE t; --"."name"
      // Safe:       "cat""; DROP TABLE t; --"."name"
      const result = adaptor.buildSequelizeQuery(
        makeNavArithmeticQuery('cat"; DROP TABLE t; --', 'name', 'categories'),
      );
      const sql = getLiteralSql(result.where);
      expect(sql).toContain('cat""; DROP TABLE t; --');
    });

    it('injection via navigation column name', () => {
      // Attack: column = name" OR 1=1 --
      const result = adaptor.buildSequelizeQuery(
        makeNavArithmeticQuery('category', 'name" OR 1=1 --', 'categories'),
      );
      const sql = getLiteralSql(result.where);
      expect(sql).toContain('name"" OR 1=1 --');
    });

    it('injection via both alias and column', () => {
      const result = adaptor.buildSequelizeQuery(
        makeNavArithmeticQuery('a"lias', 'c"ol', 'tbl'),
      );
      const sql = getLiteralSql(result.where);
      expect(sql).toContain('a""lias');
      expect(sql).toContain('c""ol');
    });
  });

  // ==========================================================================
  // 4. STRING LITERAL INJECTION VIA expressionToSql
  //    Code path: arithmeticToSql → expressionToSql('literal', string)
  //              → `'${value.replace(/'/g, "''")}'`
  //    The current code escapes single quotes by doubling them.
  //    Risk: null bytes or encoding tricks could bypass the escaping.
  // ==========================================================================
  describe('4 – string literal injection via expressionToSql', () => {
    it('single-quote breakout attempt: value containing single quote', () => {
      // Attack: ' OR '1'='1
      // After escaping: '' OR ''1''=''1
      // Wrapped: ''' OR ''1''=''1'
      // In SQL this is the string literal: ' OR '1'='1   ← still inside quotes
      const result = adaptor.buildSequelizeQuery(
        makeArithmeticStringLiteralQuery("' OR '1'='1"),
      );
      const sql = getLiteralSql(result.where);
      // The escaped value should have all single quotes doubled
      expect(sql).toContain("'' OR ''1''=''1");
      // And it should be wrapped in outer quotes, making it a safe string literal
      expect(sql).toContain("'");
    });

    it('semicolon + DROP TABLE via string literal', () => {
      // Attack: '; DROP TABLE users; --
      // After escaping: ''; DROP TABLE users; --
      // Wrapped: '''; DROP TABLE users; --'
      // Safe: the entire thing is a string literal containing '; DROP TABLE users; --
      const result = adaptor.buildSequelizeQuery(
        makeArithmeticStringLiteralQuery("'; DROP TABLE users; --"),
      );
      const sql = getLiteralSql(result.where);
      // Verify single quotes are doubled
      expect(sql).toContain("''; DROP TABLE users; --");
    });

    it('null byte injection attempt', () => {
      // Attack: test\0'; DROP TABLE users; --
      // Some databases may truncate at null byte, breaking the quoting
      // Safe: null bytes should be rejected entirely
      const payload = "test\0'; DROP TABLE users; --";
      // escapeSqlString rejects null bytes with a BadRequestError
      expect(() =>
        adaptor.buildSequelizeQuery(makeArithmeticStringLiteralQuery(payload)),
      ).toThrow('String values must not contain null bytes');
    });

    it('backslash-escaped quote attempt', () => {
      // Attack: test\'; DROP TABLE t; --
      // On PostgreSQL with standard_conforming_strings=on, \ is not an escape char
      // So \' is a literal backslash followed by a quote
      // The ' gets doubled: test\'' → in SQL: string 'test\'' (literal backslash + quote)
      const result = adaptor.buildSequelizeQuery(
        makeArithmeticStringLiteralQuery("test\\'; DROP TABLE t; --"),
      );
      const sql = getLiteralSql(result.where);
      // The single quote in the payload should be doubled
      expect(sql).toContain("test\\''");
    });

    it('multi-line injection attempt', () => {
      const result = adaptor.buildSequelizeQuery(
        makeArithmeticStringLiteralQuery("test'\n; DROP TABLE t; --"),
      );
      const sql = getLiteralSql(result.where);
      expect(sql).toContain("test''");
    });

    it('Unicode escape injection attempt', () => {
      // Attempt injection via unicode escaped quote: \u0027 = '
      const result = adaptor.buildSequelizeQuery(
        makeArithmeticStringLiteralQuery("test\u0027; DROP TABLE t; --"),
      );
      const sql = getLiteralSql(result.where);
      // JavaScript resolves \u0027 to ' at parse time, so it should be doubled
      expect(sql).toContain("test''");
    });
  });

  // ==========================================================================
  // 5. LIKE WILDCARD INJECTION
  //    Code path: buildCondition (boolean function) → escape [%_\]
  //    Risk: un-escaped wildcards change the semantics of LIKE patterns
  // ==========================================================================
  describe('5 – LIKE wildcard injection via boolean functions', () => {
    const getWhereLogic = (w: any) => w.logic;

    it('percent in search value is escaped', () => {
      const result = adaptor.buildSequelizeQuery(makeContainsQuery('name', '100%'));
      expect(getWhereLogic(result.where)).toBe('%100\\%%');
    });

    it('underscore in search value is escaped', () => {
      const result = adaptor.buildSequelizeQuery(makeContainsQuery('name', 'a_b'));
      expect(getWhereLogic(result.where)).toBe('%a\\_b%');
    });

    it('backslash in search value is escaped', () => {
      const result = adaptor.buildSequelizeQuery(makeContainsQuery('name', 'c:\\path'));
      expect(getWhereLogic(result.where)).toBe('%c:\\\\path%');
    });

    it('combined wildcards are all escaped', () => {
      const result = adaptor.buildSequelizeQuery(makeContainsQuery('name', '%_\\'));
      expect(getWhereLogic(result.where)).toBe('%\\%\\_\\\\%');
    });

    it('normal characters are not modified', () => {
      const result = adaptor.buildSequelizeQuery(makeContainsQuery('name', 'hello'));
      expect(getWhereLogic(result.where)).toBe('%hello%');
    });

    it('empty search value produces valid pattern', () => {
      const result = adaptor.buildSequelizeQuery(makeContainsQuery('name', ''));
      expect(getWhereLogic(result.where)).toBe('%%');
    });
  });

  // ==========================================================================
  // 6. CAST TYPE INJECTION
  //    Code path: functionToSql → cast case → ALLOWED_CAST_TYPES allowlist
  //    Risk: arbitrary SQL injected via the type argument of CAST
  // ==========================================================================
  describe('6 – CAST type injection via functionToSql', () => {
    it('valid CAST type "integer" is accepted', () => {
      expect(() => adaptor.buildSequelizeQuery(makeCastQuery('price', 'integer'))).not.toThrow();
    });

    it('valid CAST type with precision "decimal(10,2)" is accepted', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(makeCastQuery('price', 'decimal(10,2)')),
      ).not.toThrow();
    });

    it('valid CAST type "varchar(255)" is accepted', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(makeCastQuery('name', 'varchar(255)')),
      ).not.toThrow();
    });

    it('rejects arbitrary SQL in CAST type', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(makeCastQuery('name', 'int); DROP TABLE users; --')),
      ).toThrow(/Invalid CAST type/);
    });

    it('rejects unknown type name', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(makeCastQuery('name', 'EVIL_TYPE')),
      ).toThrow(/Invalid CAST type/);
    });

    it('rejects CAST type "TABLE"', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(makeCastQuery('name', 'TABLE')),
      ).toThrow(/Invalid CAST type/);
    });

    it('rejects CAST type with SQL comment', () => {
      expect(() =>
        adaptor.buildSequelizeQuery(makeCastQuery('name', 'int--')),
      ).toThrow(/Invalid CAST type/);
    });
  });

  // ==========================================================================
  // 7. NUMERIC INJECTION (NaN / Infinity)
  //    Code path: expressionToSql('literal', number) → String(value)
  //    Risk: NaN or Infinity produce invalid SQL or break query logic
  // ==========================================================================
  describe('7 – numeric injection via NaN/Infinity', () => {
    it('NaN in arithmetic literal should not produce "NaN" in SQL', () => {
      const result = adaptor.buildSequelizeQuery(makeArithmeticFieldQuery('price'));
      // Baseline: normal number works
      expect(getLiteralSql(result.where)).toContain('1');

      // NaN should be rejected or produce safe SQL (not the literal string "NaN")
      const nanQuery: IParsedQuery = {
        table: 'test',
        filter: {
          leftExpression: {
            type: 'arithmetic',
            arithmetic: {
              operator: 'add',
              left: { type: 'field', field: { name: 'price' } },
              right: { type: 'literal', value: NaN },
            },
          },
          operator: 'gt',
          rightExpression: { type: 'literal', value: 0 },
        },
      } as IParsedQuery;

      // After the fix, this should throw BadRequestError.
      // Current code produces ("price" + NaN) which is invalid SQL.
      expect(() => adaptor.buildSequelizeQuery(nanQuery)).toThrow();
    });

    it('Infinity in arithmetic literal should not produce "Infinity" in SQL', () => {
      const infQuery: IParsedQuery = {
        table: 'test',
        filter: {
          leftExpression: {
            type: 'arithmetic',
            arithmetic: {
              operator: 'add',
              left: { type: 'field', field: { name: 'price' } },
              right: { type: 'literal', value: Infinity },
            },
          },
          operator: 'gt',
          rightExpression: { type: 'literal', value: 0 },
        },
      } as IParsedQuery;

      expect(() => adaptor.buildSequelizeQuery(infQuery)).toThrow();
    });

    it('-Infinity in arithmetic literal should not produce "-Infinity" in SQL', () => {
      const negInfQuery: IParsedQuery = {
        table: 'test',
        filter: {
          leftExpression: {
            type: 'arithmetic',
            arithmetic: {
              operator: 'add',
              left: { type: 'field', field: { name: 'price' } },
              right: { type: 'literal', value: -Infinity },
            },
          },
          operator: 'gt',
          rightExpression: { type: 'literal', value: 0 },
        },
      } as IParsedQuery;

      expect(() => adaptor.buildSequelizeQuery(negInfQuery)).toThrow();
    });
  });

  // ==========================================================================
  // 8. SAFE BY DESIGN: Simple field comparisons
  //    Code path: buildCondition → { [fieldName]: { [Op.xx]: value } }
  //    Sequelize parameterises the value, so string injection is impossible.
  //    These tests confirm the safe path remains safe.
  // ==========================================================================
  describe('8 – simple field comparisons (safe by design)', () => {
    it('SQL in string value is parameterised', () => {
      const result = adaptor.buildSequelizeQuery(
        makeSimpleFieldQuery('name', "'; DROP TABLE users; --"),
      );
      // Value is stored as a parameterised value, not interpolated
      expect(result.where['name'][Op.eq]).toBe("'; DROP TABLE users; --");
    });

    it('field name with injection chars is just an object key', () => {
      const result = adaptor.buildSequelizeQuery(
        makeSimpleFieldQuery('x"; DROP TABLE t;--', 'test'),
      );
      expect(result.where['x"; DROP TABLE t;--'][Op.eq]).toBe('test');
    });

    it('boolean value true is not vulnerable', () => {
      const result = adaptor.buildSequelizeQuery(makeSimpleFieldQuery('active', true));
      expect(result.where['active'][Op.eq]).toBe(true);
    });

    it('null value is safe', () => {
      const result = adaptor.buildSequelizeQuery(makeSimpleFieldQuery('deleted', null));
      expect(result.where['deleted'][Op.eq]).toBeNull();
    });

    it('numeric zero is safe', () => {
      const result = adaptor.buildSequelizeQuery(makeSimpleFieldQuery('count', 0));
      expect(result.where['count'][Op.eq]).toBe(0);
    });
  });
});
