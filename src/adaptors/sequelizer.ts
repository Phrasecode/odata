import {
  Model,
  ModelAttributes,
  ModelStatic,
  Op,
  Sequelize,
  DataType as SequelizeDataTypeInterface,
  DataTypes as SequelizeDataTypes,
  col,
  fn,
  literal,
  where,
} from 'sequelize';
import {
  ColumnMetadata,
  ExpandClause,
  FilterClause,
  FilterCondition,
  IDbConfig,
  IEntitySchemaOptions,
  IParsedQuery,
  OrderByClause,
  SelectField,
} from '../types';
import { OPERATORS } from '../utils/constant';
import { BadRequestError } from '../utils/error-management';
import { Logger } from '../utils/logger';

type SequelizeModelController = ModelStatic<Model<any, any>>;

const OPERATOR_MAP = {
  eq: Op.eq,
  ne: Op.ne,
  gt: Op.gt,
  ge: Op.gte,
  lt: Op.lt,
  le: Op.lte,
  contains: Op.like,
  startswith: Op.startsWith,
  endswith: Op.endsWith,
  in: Op.in,
  and: Op.and,
  or: Op.or,
  not: Op.not,
} as const;

type OperatorKey = keyof typeof OPERATOR_MAP;

interface ISequelizeQuery {
  attributes?: string[];
  include?: ISequelizeQuery[];
  where?: any;
  order?: [string, 'DESC' | 'ASC'][];
  limit?: number;
  offset?: number;
  model?: typeof Model;
  as?: string;
}

export class SequelizerAdaptor {
  private sequelize: Sequelize;
  private modelCache = new Map<string, SequelizeModelController>();

  constructor(dbConfig: IDbConfig) {
    // For SQLite, use 'storage' instead of 'database'
    const sequelizeConfig: any = {
      username: dbConfig.username,
      password: dbConfig.password,
      host: dbConfig.host,
      dialect: dbConfig.dialect,
      port: dbConfig.port,
      pool: dbConfig.pool,
      schema: dbConfig.schema,
      ssl: dbConfig.ssl,
      benchmark: true,
      dialectOptions: {
        ssl: {
          require: dbConfig.dialectOptions?.ssl?.require,
          rejectUnauthorized: dbConfig.dialectOptions?.ssl?.rejectUnauthorized,
        },
      },
      logging: (sql: string, timing: any) => {
        Logger.getLogger().info(
          `${sql}`,
          {
            executionTime: timing,
          },
          'logSqlQuery',
        );
      },
    };

    // SQLite uses 'storage' instead of 'database'
    if (dbConfig.dialect === 'sqlite') {
      sequelizeConfig.storage = dbConfig.database;
    } else {
      sequelizeConfig.database = dbConfig.database;
    }

    this.sequelize = new Sequelize(sequelizeConfig);
  }

  public define(modelName: string, attributes: ColumnMetadata[], _options?: IEntitySchemaOptions) {
    try {
      const { formattedAttributes } = this.formatAttributes(attributes);
      const model: SequelizeModelController = this.sequelize.define(
        modelName,
        formattedAttributes,
        {
          freezeTableName: true,
          timestamps: false,
        },
      );
      return model;
    } catch (error) {
      Logger.getLogger().error(
        `Error defining model: ${modelName} in sequelizer`,
        error,
        attributes,
      );
      throw new BadRequestError(`Error defining model: ${modelName}`, error);
    }
  }

  public defineRelation(
    sourceModelName: string,
    targetModelName: string,
    type: 'hasMany' | 'hasOne' | 'belongsTo',
    relations: { targetKey: string; sourceKey: string }[],
    propertyKey: string,
  ) {
    const sourceModel = this.sequelize.models[sourceModelName];
    const targetModel = this.sequelize.models[targetModelName];
    relations.map(relation => {
      if (type === 'belongsTo') {
        sourceModel.belongsTo(targetModel, {
          foreignKey: {
            name: relation.sourceKey,
            allowNull: false,
          },
          targetKey: relation.targetKey,
          constraints: false, // Important: disable automatic constraint creation
          as: propertyKey,
        });
      } else {
        sourceModel[type](targetModel, {
          foreignKey: {
            name: relation.targetKey,
            allowNull: false,
          },
          sourceKey: relation.sourceKey,
          constraints: false, // Important: disable automatic constraint creation
          as: propertyKey,
        });
      }
    });
  }

  private formatAttributes(attributes: ColumnMetadata[]): {
    formattedAttributes: ModelAttributes<Model<any, any>>;
    relations: {
      model: string;
      relation: 'many' | 'one';
      mapping: { sourceKey: string; targetKey: string }[];
    }[];
  } {
    const formattedAttributes: ModelAttributes<Model<any, any>> = {};
    const relations: any = [];
    attributes.map(column => {
      formattedAttributes[column.columnIdentifier] = {
        type: column.dataType,
        field: column.columnIdentifier,
        primaryKey: column.isPrimaryKey || false,
        allowNull: column.isNullable !== false,
        unique: column.isUnique || false,
        autoIncrement: column.isAutoIncrement,
        defaultValue: column.defaultValue,
      };
    });

    return { formattedAttributes, relations };
  }

  public async executeSelect(query: IParsedQuery) {
    try {
      const model = this.getCachedModel(query.table);
      const sequelizeQuery = this.buildSequelizeQuery(query);
      Logger.getLogger().info(
        'Query binds',
        JSON.stringify(sequelizeQuery),
        'logDbQueryParameters',
      );

      if (query.count) {
        const count = await model.count({
          where: sequelizeQuery.where,
          include: sequelizeQuery.include,
        });
        return { count };
      }

      const response = await model.findAll(sequelizeQuery);
      return response.map(item => item.toJSON());
    } catch (error) {
      Logger.getLogger().error('Error executing query', error);
      throw error;
    }
  }

  private getCachedModel(tableName: string): SequelizeModelController {
    if (!this.modelCache.has(tableName)) {
      const model = this.sequelize.modelManager.getModel(tableName) as SequelizeModelController;
      this.modelCache.set(tableName, model);
    }
    return this.modelCache.get(tableName)!;
  }

  public buildSequelizeQuery(query: IParsedQuery): any {
    const formattedQuery: ISequelizeQuery = {
      attributes: this.buildSelect(query.select || []),
      where: this.buildWhere(query.filter),
      order: this.buildOrderBy(query.orderBy || []),
      limit: query.top || undefined,
      offset: query.skip || undefined,
      // $apply and $compute are not fully implemented in the parser, so we ignore them for now
    };
    if (query.expand && query.expand.length > 0) {
      formattedQuery.include = query.expand.map(nestedExpand => this.buildInclude(nestedExpand));
    }
    return formattedQuery;
  }

  private buildSelect(select: SelectField[]): string[] | undefined {
    if (select && select.length > 0) {
      return select.map(field => field.field);
    }
    return undefined;
  }

  private buildOrderBy(orderBy: OrderByClause[]): [string, 'DESC' | 'ASC'][] | undefined {
    if (orderBy && orderBy.length > 0) {
      return orderBy.map(field => {
        return [field.field, field.direction.toUpperCase()] as [string, 'DESC' | 'ASC'];
      });
    }
    return undefined;
  }

  private buildWhere(filter: FilterClause | any | undefined): any {
    if (!filter) return {};

    // Handle single FilterCondition (when there's only one condition without logical operators)
    if (filter.leftExpression && filter.operator && !filter.conditions) {
      return this.buildCondition(filter as FilterCondition);
    }

    const { logicalOperator, conditions } = filter;

    if (!conditions || conditions.length === 0) return {};

    if (logicalOperator === OPERATORS.LOGICAL.NOT && conditions.length === 1) {
      return {
        [Op.not]: this.buildCondition(conditions[0] as FilterCondition),
      };
    }

    if (conditions.length === 1) {
      const condition = conditions[0];
      // Check if it's a nested logical condition (has logicalOperator property)
      if ('logicalOperator' in condition) {
        return this.buildWhere(condition as FilterClause);
      }
      // Simple condition
      return this.buildCondition(condition as FilterCondition);
    }

    // Multiple conditions with logical operator
    const sequelizeOperator = OPERATOR_MAP[logicalOperator as OperatorKey] || Op.and;

    const builtConditions: any[] = conditions.map((condition: FilterClause | FilterCondition) => {
      if ('logicalOperator' in condition) {
        return this.buildWhere(condition);
      }
      return this.buildCondition(condition);
    });

    return {
      [sequelizeOperator]: builtConditions,
    };
  }

  private buildCondition(condition: FilterCondition): any {
    if (!condition) return {};

    const { leftExpression, operator, rightExpression } = condition;

    // Special handling for boolean functions (contains, startswith, endswith)
    // These functions return boolean values and are typically used with 'eq true' or 'eq false'
    if (
      leftExpression.type === 'function' &&
      this.isBooleanFunction(leftExpression.function?.name)
    ) {
      const funcName = leftExpression.function?.name.toLowerCase();
      const args = leftExpression.function?.args || [];

      if (args.length !== 2) {
        throw new BadRequestError(`${funcName ?? 'Unknown'} function requires exactly 2 arguments`);
      }

      const field = this.buildExpression(args[0]);
      const searchValue = this.buildExpression(args[1]);

      // Determine if we're checking for true or false
      const checkForTrue =
        operator === 'eq' ? rightExpression.value === true : rightExpression.value === false;

      let likePattern: string;
      switch (funcName) {
        case 'contains':
          likePattern = checkForTrue ? `%${searchValue}%` : `NOT LIKE '%${searchValue}%'`;
          break;
        case 'startswith':
          likePattern = checkForTrue ? `${searchValue}%` : `NOT LIKE '${searchValue}%'`;
          break;
        case 'endswith':
          likePattern = checkForTrue ? `%${searchValue}` : `NOT LIKE '%${searchValue}'`;
          break;
        default:
          throw new BadRequestError(`Unsupported boolean function: ${funcName}`);
      }

      if (checkForTrue) {
        return where(field, Op.like, likePattern);
      } else {
        // For negative checks, use notLike
        return where(field, Op.notLike, likePattern.replace(/NOT LIKE '?/, ''));
      }
    }

    // Build left side expression
    const leftSide = this.buildExpression(leftExpression);

    // Build right side expression
    const rightSide = this.buildExpression(rightExpression);

    // Map operator to Sequelize operator
    const sequelizeOperator = OPERATOR_MAP[operator as OperatorKey];

    if (!sequelizeOperator) {
      throw new BadRequestError(`Unsupported operator: ${operator}`);
    }

    // Handle special operators
    switch (operator) {
      case 'in':
        return where(leftSide, Op.in, Array.isArray(rightSide) ? rightSide : [rightSide]);
      case 'has':
        // OData V4 'has' operator is for enum flags.
        // For now, we'll treat it as a bitwise AND check for integer flags.
        // This is a simplification and might need refinement based on the actual DB schema.
        return where(literal(`${leftSide} & ${rightSide}`), Op.eq, rightSide);
      default:
        // For simple field comparisons, use object notation
        if (leftExpression.type === 'field' && rightExpression.type === 'literal') {
          const fieldName = leftExpression.field?.name || '';
          return { [fieldName]: { [sequelizeOperator]: rightSide } };
        }
        // For function expressions, use where() with fn()
        return where(leftSide, sequelizeOperator as any, rightSide);
    }
  }

  /**
   * Check if a function name is a boolean function
   */
  private isBooleanFunction(functionName: string | undefined): boolean {
    if (!functionName) return false;
    const booleanFunctions = ['contains', 'startswith', 'endswith'];
    return booleanFunctions.includes(functionName.toLowerCase());
  }

  /**
   * Build a Sequelize expression from a FilterExpression
   */
  private buildExpression(expression: any): any {
    if (!expression) return null;

    switch (expression.type) {
      case 'literal':
        return expression.value;

      case 'field':
        // Check if this is a navigation path field
        if (expression.field?.navigationPath && expression.field?.table) {
          // Use Sequelize's special syntax for joined table fields: $alias.column$
          const alias = expression.field.navigationPath[0]; // Navigation property name
          const columnName = expression.field.name;
          return col(`$${alias}.${columnName}$`);
        }
        // Simple field reference
        return col(expression.field?.name || '');

      case 'count':
        // Handle $count on navigation properties
        // This generates a subquery to count related records
        return this.buildCountExpression(expression.count);

      case 'function':
        return this.buildFunctionExpression(expression.function, expression);

      case 'arithmetic':
        return literal(this.arithmeticToSql(expression.arithmetic));

      default:
        throw new BadRequestError(`Unknown expression type: ${expression.type}`);
    }
  }

  /**
   * Build a count expression for navigation properties (e.g., notes/$count)
   * This generates a Sequelize literal with a subquery to count related records
   */
  private buildCountExpression(countInfo: any): any {
    const { relationType, sourceTable, targetTable, foreignKey, sourceKey } = countInfo;

    // Build the subquery based on the relation type
    let subquery: string;

    if (relationType === 'hasMany' || relationType === 'belongsToMany') {
      // For HasMany: SELECT COUNT(*) FROM related_table WHERE related_table.foreign_key = parent_table.primary_key
      subquery = `(SELECT COUNT(*) FROM "${targetTable}" WHERE "${targetTable}"."${foreignKey}" = "${sourceTable}"."${sourceKey}")`;
    } else if (relationType === 'belongsTo' || relationType === 'hasOne') {
      // For BelongsTo/HasOne: This would always be 0 or 1, but we support it anyway
      subquery = `(SELECT COUNT(*) FROM "${targetTable}" WHERE "${targetTable}"."${sourceKey}" = "${sourceTable}"."${foreignKey}")`;
    } else {
      throw new BadRequestError(`Unsupported relation type for $count: ${relationType}`);
    }

    return literal(subquery);
  }

  /**
   * Helper to convert a filter expression to SQL string for use in literal()
   * This processes the expression tree BEFORE converting to Sequelize objects
   */
  private expressionToSql(expression: any): string {
    if (!expression) return 'NULL';

    switch (expression.type) {
      case 'literal':
        const value = expression.value;
        if (value === null || value === undefined) {
          return 'NULL';
        }
        if (typeof value === 'string') {
          return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
        }
        if (typeof value === 'number' || typeof value === 'boolean') {
          return String(value);
        }
        return String(value);

      case 'field':
        // Check if this is a navigation path field
        if (expression.field?.navigationPath && expression.field?.table) {
          // Use table alias and column name for joined tables
          const alias = expression.field.navigationPath[0]; // Navigation property name
          const columnName = expression.field.name;
          return `"${alias}"."${columnName}"`;
        }
        // Return quoted column name for simple fields
        return `"${expression.field?.name || ''}"`;

      case 'count':
        // Handle $count in SQL string context
        return this.countToSql(expression.count);

      case 'function':
        return this.functionToSql(expression.function);

      case 'arithmetic':
        return this.arithmeticToSql(expression.arithmetic);

      default:
        throw new BadRequestError(`Unknown expression type: ${expression.type}`);
    }
  }

  /**
   * Helper to convert a count expression to SQL string
   */
  private countToSql(countInfo: any): string {
    const { relationType, sourceTable, targetTable, foreignKey, sourceKey } = countInfo;

    // Build the subquery based on the relation type
    if (relationType === 'hasMany' || relationType === 'belongsToMany') {
      return `(SELECT COUNT(*) FROM "${targetTable}" WHERE "${targetTable}"."${foreignKey}" = "${sourceTable}"."${sourceKey}")`;
    } else if (relationType === 'belongsTo' || relationType === 'hasOne') {
      return `(SELECT COUNT(*) FROM "${targetTable}" WHERE "${targetTable}"."${sourceKey}" = "${sourceTable}"."${foreignKey}")`;
    } else {
      throw new BadRequestError(`Unsupported relation type for $count: ${relationType}`);
    }
  }

  /**
   * Helper to convert a filter function to SQL string
   */
  private functionToSql(func: any): string {
    if (!func) return 'NULL';

    const args = func.args.map((arg: any) => this.expressionToSql(arg));

    switch (func.name.toLowerCase()) {
      case 'tolower':
        return `LOWER(${args[0]})`;
      case 'toupper':
        return `UPPER(${args[0]})`;
      case 'trim':
        return `TRIM(${args[0]})`;
      case 'substring':
        // SQL SUBSTRING is 1-indexed, OData is 0-indexed
        if (args.length === 3) {
          return `SUBSTRING(${args[0]} FROM ${args[1]} + 1 FOR ${args[2]})`;
        } else if (args.length === 2) {
          return `SUBSTRING(${args[0]} FROM ${args[1]} + 1)`;
        }
        return `SUBSTRING(${args.join(', ')})`;
      case 'indexof':
        // PostgreSQL STRPOS is 1-indexed, OData is 0-indexed
        if (args.length === 2) {
          return `(STRPOS(${args[0]}, ${args[1]}) - 1)`;
        }
        return `STRPOS(${args.join(', ')})`;
      case 'length':
        return `LENGTH(${args[0]})`;
      case 'concat':
        return `CONCAT(${args.join(', ')})`;
      case 'contains':
        return `(${args[0]} LIKE '%' || ${args[1]} || '%')`;
      case 'startswith':
        return `(${args[0]} LIKE ${args[1]} || '%')`;
      case 'endswith':
        return `(${args[0]} LIKE '%' || ${args[1]})`;
      case 'date':
        return `DATE(${args[0]})`;
      case 'time':
        return `TIME(${args[0]})`;
      case 'day':
        return `EXTRACT(DAY FROM ${args[0]})`;
      case 'month':
        return `EXTRACT(MONTH FROM ${args[0]})`;
      case 'year':
        return `EXTRACT(YEAR FROM ${args[0]})`;
      case 'hour':
        return `EXTRACT(HOUR FROM ${args[0]})`;
      case 'minute':
        return `EXTRACT(MINUTE FROM ${args[0]})`;
      case 'second':
        return `EXTRACT(SECOND FROM ${args[0]})`;
      case 'now':
        return 'NOW()';
      case 'round':
        return `ROUND(${args[0]})`;
      case 'floor':
        return `FLOOR(${args[0]})`;
      case 'ceiling':
        return `CEIL(${args[0]})`;
      case 'cast':
        // OData V4 cast(expression, type) -> SQL CAST(expression AS type)
        // Note: The type argument in OData is a string literal, which will be quoted in expressionToSql.
        // We need to unquote it.
        const typeArg = args[1].replace(/^'|'$/g, '');
        return `CAST(${args[0]} AS ${typeArg})`;
      default:
        throw new BadRequestError(`Unsupported function: ${func.name}`);
    }
  }

  /**
   * Helper to convert an arithmetic expression to SQL string
   */
  private arithmeticToSql(arithmetic: any): string {
    if (!arithmetic) return 'NULL';

    const left = this.expressionToSql(arithmetic.left);
    const right = this.expressionToSql(arithmetic.right);
    let operatorSymbol: string;

    switch (arithmetic.operator.toLowerCase()) {
      case OPERATORS.ARITHMETIC.ADD:
        operatorSymbol = '+';
        break;
      case OPERATORS.ARITHMETIC.SUB:
        operatorSymbol = '-';
        break;
      case OPERATORS.ARITHMETIC.MUL:
        operatorSymbol = '*';
        break;
      case OPERATORS.ARITHMETIC.DIV:
        operatorSymbol = '/';
        break;
      case OPERATORS.ARITHMETIC.MOD:
        operatorSymbol = '%';
        break;
      default:
        throw new BadRequestError(`Unsupported arithmetic operator: ${arithmetic.operator}`);
    }

    return `(${left} ${operatorSymbol} ${right})`;
  }

  /**
   * Check if an expression or any of its nested expressions contains a navigation path
   */
  private hasNavigationPath(expression: any): boolean {
    if (!expression) return false;

    if (expression.type === 'field') {
      return !!(expression.field?.navigationPath && expression.field?.table);
    }

    if (expression.type === 'function' && expression.function?.args) {
      return expression.function.args.some((arg: any) => this.hasNavigationPath(arg));
    }

    return false;
  }

  /**
   * Build a Sequelize function expression from a FilterFunction
   * @param func The function metadata
   * @param fullExpression The full expression tree (used for complex functions that need SQL literals)
   */
  private buildFunctionExpression(func: any, fullExpression?: any): any {
    if (!func) return null;

    const functionName = func.name.toUpperCase();

    // For functions that involve arithmetic operations or complex SQL,
    // we need to build the entire expression as a literal SQL string
    const needsLiteral = ['substring', 'indexof'].includes(func.name.toLowerCase());

    if (needsLiteral && fullExpression) {
      // Check if any argument is a function (nested function call)
      const hasNestedFunction = func.args.some((arg: any) => arg.type === 'function');

      if (hasNestedFunction || func.name.toLowerCase() === 'indexof') {
        // Build the entire expression as a literal SQL string
        return literal(this.functionToSql(func));
      }
    }

    // Check if any argument contains a navigation path
    // If so, we need to use literal SQL to properly reference the joined table
    const hasNavPath = func.args.some((arg: any) => this.hasNavigationPath(arg));

    if (hasNavPath) {
      // Build the entire expression as a literal SQL string
      return literal(this.functionToSql(func));
    }

    // For simple functions, use Sequelize's fn() builder
    const args = func.args.map((arg: any) => this.buildExpression(arg));

    // Map OData function names to Sequelize/SQL function names
    switch (func.name.toLowerCase()) {
      case 'tolower':
        return fn('LOWER', ...args);
      case 'toupper':
        return fn('UPPER', ...args);
      case 'trim':
        return fn('TRIM', ...args);
      case 'substring':
        // SQL SUBSTRING is 1-indexed, OData is 0-indexed
        if (args.length === 3 && typeof args[1] === 'number') {
          return fn('SUBSTRING', args[0], args[1] + 1, args[2]);
        } else if (args.length === 2 && typeof args[1] === 'number') {
          return fn('SUBSTRING', args[0], args[1] + 1);
        }
        // For non-literal start positions, this should have been handled above
        return fn('SUBSTRING', ...args);
      case 'indexof':
        // This should have been handled above as a literal
        // But if we get here, it's a simple case
        if (args.length === 2 && typeof args[0] === 'string' && typeof args[1] === 'string') {
          return literal(`(STRPOS('${args[0]}', '${args[1]}') - 1)`);
        }
        return fn('STRPOS', ...args);
      case 'length':
        return fn('LENGTH', ...args);
      case 'concat':
        return fn('CONCAT', ...args);
      case 'date':
        return fn('DATE', ...args);
      case 'time':
        return fn('TIME', ...args);
      case 'day':
        return fn('EXTRACT', literal('DAY FROM'), ...args);
      case 'month':
        return fn('EXTRACT', literal('MONTH FROM'), ...args);
      case 'year':
        return fn('EXTRACT', literal('YEAR FROM'), ...args);
      case 'hour':
        return fn('EXTRACT', literal('HOUR FROM'), ...args);
      case 'minute':
        return fn('EXTRACT', literal('MINUTE FROM'), ...args);
      case 'second':
        return fn('EXTRACT', literal('SECOND FROM'), ...args);
      case 'now':
        return fn('NOW');
      case 'round':
        return fn('ROUND', ...args);
      case 'floor':
        return fn('FLOOR', ...args);
      case 'ceiling':
        return fn('CEIL', ...args);
      case 'cast':
        // cast(expression, type) -> CAST(expression AS type)
        // Since the type is a literal string, we need to use literal()
        return literal(this.functionToSql(func));
      default:
        return fn(functionName, ...args);
    }
  }

  private buildInclude(expand: ExpandClause): ISequelizeQuery {
    const model = this.getCachedModel(expand.table);
    const include: ISequelizeQuery = {
      model: model,
      as: expand.as,
    };

    // Build attributes for this include
    if (expand.select && expand.select.length > 0) {
      include.attributes = expand.select.map(field => field.field);
    }

    // Build where clause for this include
    if (expand.filter) {
      include.where = this.buildWhere(expand.filter);
    }

    // Build order for this include
    if (expand.orderBy && expand.orderBy.length > 0) {
      include.order = expand.orderBy.map(orderField => {
        return [orderField.field, orderField.direction.toUpperCase()] as [string, 'DESC' | 'ASC'];
      });
    }

    // Set limit and offset for this include
    if (expand.top) {
      include.limit = expand.top;
    }
    if (expand.skip) {
      include.offset = expand.skip;
    }

    // Build nested includes recursively
    if (expand.expand && expand.expand.length > 0) {
      include.include = expand.expand.map(nestedExpand => this.buildInclude(nestedExpand));
    }

    return include;
  }
}

export { SequelizeDataTypeInterface, SequelizeDataTypes, SequelizeModelController };
