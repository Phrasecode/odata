import { SequelizerAdaptor } from '../../../src/adaptors/sequelizer';

describe('SequelizerAdaptor - Dialect specific SQL generation', () => {
  describe('indexof', () => {
    it('uses STRPOS for PostgreSQL', () => {
      const adaptor = new SequelizerAdaptor({ dialect: 'postgres' } as any);
      // We test the private functionToSql through any to avoid type complaints
      const func = {
        name: 'indexof',
        args: [{ type: 'field', field: { name: 'email' } }, { type: 'literal', value: '@' }]
      };
      const sql = (adaptor as any).functionToSql(func);
      expect(sql).toBe(`(STRPOS("email", '@') - 1)`);
    });

    it('uses INSTR for SQLite', () => {
      const adaptor = new SequelizerAdaptor({ dialect: 'sqlite' } as any);
      const func = {
        name: 'indexof',
        args: [{ type: 'field', field: { name: 'email' } }, { type: 'literal', value: '@' }]
      };
      const sql = (adaptor as any).functionToSql(func);
      expect(sql).toBe(`(INSTR("email", '@') - 1)`);
    });

    it('uses INSTR for MySQL', () => {
      const adaptor = new SequelizerAdaptor({ dialect: 'mysql' } as any);
      const func = {
        name: 'indexof',
        args: [{ type: 'field', field: { name: 'email' } }, { type: 'literal', value: '@' }]
      };
      const sql = (adaptor as any).functionToSql(func);
      expect(sql).toBe(`(INSTR("email", '@') - 1)`);
    });
  });

  describe('substring', () => {
    it('uses cross-dialect SUBSTR syntax with length', () => {
      // Test across dialects just to be sure
      ['postgres', 'sqlite', 'mysql'].forEach(dialect => {
        const adaptor = new SequelizerAdaptor({ dialect } as any);
        const func = {
          name: 'substring',
          args: [
            { type: 'field', field: { name: 'name' } },
            { type: 'literal', value: 1 },
            { type: 'literal', value: 3 }
          ]
        };
        const sql = (adaptor as any).functionToSql(func);
        expect(sql).toBe(`SUBSTR("name", (1) + 1, 3)`);
      });
    });

    it('uses cross-dialect SUBSTR syntax without length', () => {
      ['postgres', 'sqlite', 'mysql'].forEach(dialect => {
        const adaptor = new SequelizerAdaptor({ dialect } as any);
        const func = {
          name: 'substring',
          args: [
            { type: 'field', field: { name: 'name' } },
            { type: 'literal', value: 5 }
          ]
        };
        const sql = (adaptor as any).functionToSql(func);
        expect(sql).toBe(`SUBSTR("name", (5) + 1)`);
      });
    });
  });

  describe('string concatenation functions (contains, startswith, endswith)', () => {
    it('uses || operator for PostgreSQL and SQLite', () => {
      ['postgres', 'sqlite'].forEach(dialect => {
        const adaptor = new SequelizerAdaptor({ dialect } as any);
        const funcContains = {
          name: 'contains',
          args: [{ type: 'field', field: { name: 'title' } }, { type: 'literal', value: 'hello' }]
        };
        const sql = (adaptor as any).functionToSql(funcContains);
        expect(sql).toBe(`("title" LIKE '%' || 'hello' || '%')`);
      });
    });

    it('uses CONCAT() function for MySQL', () => {
      ['mysql'].forEach(dialect => {
        const adaptor = new SequelizerAdaptor({ dialect } as any);
        const funcContains = {
          name: 'contains',
          args: [{ type: 'field', field: { name: 'title' } }, { type: 'literal', value: 'hello' }]
        };
        const sql = (adaptor as any).functionToSql(funcContains);
        expect(sql).toBe(`("title" LIKE CONCAT(CONCAT('%', 'hello'), '%'))`);
        
        const funcStartsWith = {
            name: 'startswith',
            args: [{ type: 'field', field: { name: 'title' } }, { type: 'literal', value: 'hello' }]
        };
        const sqlStartsWith = (adaptor as any).functionToSql(funcStartsWith);
        expect(sqlStartsWith).toBe(`("title" LIKE CONCAT('hello', '%'))`);
      });
    });
  });

  describe('date extraction functions (day, month, year, etc.)', () => {
    it('uses EXTRACT for PostgreSQL and MySQL', () => {
      ['postgres', 'mysql'].forEach(dialect => {
        const adaptor = new SequelizerAdaptor({ dialect } as any);
        const func = {
          name: 'year',
          args: [{ type: 'field', field: { name: 'createdAt' } }]
        };
        const sql = (adaptor as any).functionToSql(func);
        expect(sql).toBe(`EXTRACT(YEAR FROM "createdAt")`);
      });
    });

    it('uses strftime with explicit CAST for SQLite', () => {
      const adaptor = new SequelizerAdaptor({ dialect: 'sqlite' } as any);
      
      const funcYear = { name: 'year', args: [{ type: 'field', field: { name: 'createdAt' } }] };
      expect((adaptor as any).functionToSql(funcYear)).toBe(`CAST(strftime('%Y', "createdAt") AS INTEGER)`);
      
      const funcMonth = { name: 'month', args: [{ type: 'field', field: { name: 'createdAt' } }] };
      expect((adaptor as any).functionToSql(funcMonth)).toBe(`CAST(strftime('%m', "createdAt") AS INTEGER)`);
    });
  });

  describe('now function', () => {
    it('uses NOW() for PostgreSQL and MySQL', () => {
      ['postgres', 'mysql'].forEach(dialect => {
        const adaptor = new SequelizerAdaptor({ dialect } as any);
        const func = { name: 'now', args: [] };
        expect((adaptor as any).functionToSql(func)).toBe(`NOW()`);
      });
    });

    it('uses datetime(\'now\') for SQLite', () => {
      const adaptor = new SequelizerAdaptor({ dialect: 'sqlite' } as any);
      const func = { name: 'now', args: [] };
      expect((adaptor as any).functionToSql(func)).toBe(`datetime('now')`);
    });
  });

  describe('arithmetic functions (div, mod)', () => {
    it('converts div() function to division operator', () => {
      const adaptor = new SequelizerAdaptor({ dialect: 'postgres' } as any);
      const func = {
        name: 'div',
        args: [{ type: 'literal', value: 10 }, { type: 'literal', value: 2 }]
      };
      const sql = (adaptor as any).functionToSql(func);
      expect(sql).toBe(`(10 / 2)`);
    });

    it('converts mod() function to modulo operator', () => {
      const adaptor = new SequelizerAdaptor({ dialect: 'sqlite' } as any);
      const func = {
        name: 'mod',
        args: [{ type: 'literal', value: 10 }, { type: 'literal', value: 3 }]
      };
      const sql = (adaptor as any).functionToSql(func);
      expect(sql).toBe(`(10 % 3)`);
    });

    it('throws bad request error when missing arguments', () => {
      const adaptor = new SequelizerAdaptor({ dialect: 'postgres' } as any);
      const func1 = { name: 'div', args: [{ type: 'literal', value: 10 }] };
      const func2 = { name: 'mod', args: [{ type: 'literal', value: 10 }] };
      
      expect(() => { (adaptor as any).functionToSql(func1); }).toThrow('div() requires exactly 2 arguments');
      expect(() => { (adaptor as any).functionToSql(func2); }).toThrow('mod() requires exactly 2 arguments');
    });
  });
});
