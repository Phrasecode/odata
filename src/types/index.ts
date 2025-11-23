import { DataSource, Model, ODataControler } from '../core';
import { LOG_FORMATS, LOG_LEVELS } from '../utils/logger';
import { IQueryParseOptions } from './queryParser.types';

export * from './entitySchema.types';
export * from './model.types';
export * from './queryParser.types';

/**
 * Supported database dialects for the OData framework.
 * These are the database systems that can be used as the backend data source.
 */
type Dialect =
  | 'mysql'
  | 'postgres'
  | 'sqlite'
  | 'mariadb'
  | 'mssql'
  | 'db2'
  | 'snowflake'
  | 'oracle';

/**
 * Database connection pool configuration options.
 * Controls how database connections are managed and reused.
 */
interface PoolOptions {
  /** Maximum number of connections in the pool. Default varies by dialect */
  max?: number;
  /** Minimum number of connections in the pool. Default: 0 */
  min?: number;
  /** Maximum time (ms) a connection can be idle before being released. Default: 10000 */
  idle?: number;
  /** Maximum time (ms) to wait for a connection before throwing error. Default: 60000 */
  acquire?: number;
  /** Time interval (ms) to check for idle connections to evict. Default: 1000 */
  evict?: number;
  /** Maximum number of times a connection can be used before being destroyed. Default: Infinity */
  maxUses?: number;
}

/**
 * Database configuration for establishing a connection to the data source.
 * This configuration is used to initialize the DataSource with database credentials and settings.
 *
 * @example
 * ```typescript
 * const dbConfig: IDbConfig = {
 *   database: 'mydb',
 *   username: 'user',
 *   password: 'pass',
 *   host: 'localhost',
 *   dialect: 'postgres',
 *   port: 5432,
 *   pool: { max: 5, min: 0, idle: 10000 },
 *   schema: 'public',
 *   models: [User, Order, Product]
 * };
 * ```
 */
interface IDbConfig {
  /** Name of the database to connect to */
  database: string;
  /** Database username for authentication */
  username: string;
  /** Database password for authentication */
  password: string;
  /** Database server hostname or IP address */
  host: string;
  /** Type of database system being used */
  dialect: Dialect;
  /** Port number for database connection */
  port: number;
  /** Connection pool configuration */
  pool: PoolOptions;
  /** Database schema name (for databases that support schemas) */
  schema: string;
  /** Enable SSL connection. Default: false */
  ssl?: boolean;
  /** Array of Model classes to register with the data source */
  models?: (typeof Model<any>)[];
  /** Additional dialect-specific options */
  dialectOptions?: {
    /** SSL configuration options */
    ssl?: {
      /** Require SSL connection */
      require?: boolean;
      /** Reject unauthorized SSL certificates */
      rejectUnauthorized?: boolean;
    };
  };
}

/**
 * HTTP methods supported by OData controllers.
 * Defines which CRUD operations are allowed on an endpoint.
 */
type IMethod = 'get' | 'post' | 'put' | 'delete';

/**
 * Configuration for an OData controller.
 * Defines the endpoint, allowed HTTP methods, and the model it operates on.
 *
 * @example
 * ```typescript
 * const controllerConfig: IControllerConfig = {
 *   endpoint: '/users',
 *   allowedMethod: ['get', 'post'],
 *   model: User
 * };
 * ```
 */
interface IControllerConfig {
  /** Custom endpoint path. If not provided, uses the model name */
  endpoint?: string;
  /** HTTP methods allowed for this controller. Default: ['get'] */
  allowedMethod?: IMethod[];
  /** The Model class this controller operates on */
  model: typeof Model<any>;
}

/**
 * Configuration for Express.js router integration.
 * Used to set up OData endpoints in an Express application.
 *
 * @example
 * ```typescript
 * const routerConfig: IExpressRouterConfig = {
 *   controllers: [userController, orderController],
 *   dataSource: dataSource
 * };
 * new ExpressRouter(app, routerConfig);
 * ```
 */
interface IExpressRouterConfig {
  /** Array of OData controllers to register */
  controllers: ODataControler[];
  /** DataSource instance for database operations */
  dataSource: DataSource;
  /** Options for logging */
  logger?: ILoggerOptions;
  /** Options for query parser
   * @default {
   *   maxTop: 1000,
   *   defaultTop: 0,
   *   defaultSkip: 0,
   * }
   */
  queryOptions?: IQueryParseOptions;
}

/**
 * Configuration for any serverless function or server framework integration.
 * Used to set up OData endpoints in a serverless function or any server framework.
 *
 * @example
 * ```typescript
 * const routerConfig: IOpenRouterConfig = {
 *   dataSource: dataSource
 * };
 * const router = new OpenRouter(routerConfig);
 * export default router.queryable(User);
 * ```
 */
interface IOpenRouterConfig {
  /** DataSource instance for database operations */
  dataSource: DataSource;
  /** Options for logging */
  logger?: ILoggerOptions;
  /** Options for query parser
   * @default {
   *   maxTop: 1000,
   *   defaultTop: 0,
   *   defaultSkip: 0,
   * }
   */
  queryOptions?: IQueryParseOptions;
}

/**
 * Logger configuration options for controlling logging behavior.
 * Allows you to enable/disable logging, set log levels, and configure output format.
 *
 * @example
 * ```typescript
 * const loggerOptions: ILoggerOptions = {
 *   enabled: true,
 *   logLevel: LOG_LEVELS.INFO,
 *   format: LOG_FORMATS.JSON,
 *   advancedOptions: {
 *     logSqlQuery: true,
 *     logDbExecutionTime: true,
 *     logDbQueryParameters: true
 *   }
 * };
 * ```
 */
interface ILoggerOptions {
  /** Enable or disable logging. Default: true */
  enabled?: boolean;
  /** Minimum log level to output. Default: LOG_LEVELS.INFO */
  logLevel?: LOG_LEVELS | 'INFO' | 'ERROR' | 'WARN';
  /** Output format for logs. Default: LOG_FORMATS.JSON */
  format?: LOG_FORMATS | 'JSON' | 'STRING';
  /** Advanced logging options for detailed database and query logging */
  advancedOptions?: IAdvancedLoggerOptions;
}

/**
 * Advanced logging options for detailed database operation tracking.
 * These options enable logging of SQL queries, execution times, and query parameters.
 * Useful for debugging and performance monitoring.
 *
 * @example
 * ```typescript
 * const advancedOptions: IAdvancedLoggerOptions = {
 *   logSqlQuery: true,        // Log the actual SQL queries executed
 *   logDbExecutionTime: true, // Log query execution time in milliseconds
 *   logDbQueryParameters: true // Log query parameters and bindings
 * };
 * ```
 */
interface IAdvancedLoggerOptions {
  /** Log the actual SQL queries executed against the database */
  logSqlQuery?: boolean;
  /** Log the execution time of database queries in milliseconds */
  logDbExecutionTime?: boolean;
  /** Log query parameters and bindings used in database operations */
  logDbQueryParameters?: boolean;
}

interface IQueryExecutionResponse<T> {
  '@odata.count'?: number;
  '@odata.context': string;
  value: T[] | Record<string, never>;
  meta: {
    queryExecutionTime?: number;
    totalExecutionTime?: number;
  };
}

interface MetaData {
  entities: MetaDataEntity[];
}

interface MetaDataEntity {
  name: string;
  properties: MetaDataEntityProperty[];
  keys: string[];
  navigationProperties?: MetaDataEntityRelation[];
}

interface MetaDataEntityProperty {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: any;
  autoIncrement?: boolean;
  unique?: boolean;
  primaryKey?: boolean;
}

interface MetaDataEntityRelation {
  name: string;
  type: string;
  reference?: {
    sourceKey: string;
    targetKey: string;
  }[];
}

export {
  Dialect,
  IAdvancedLoggerOptions,
  IControllerConfig,
  IDbConfig,
  IExpressRouterConfig,
  ILoggerOptions,
  IMethod,
  IOpenRouterConfig,
  IQueryExecutionResponse,
  MetaData,
  MetaDataEntity,
  MetaDataEntityProperty,
  MetaDataEntityRelation,
  PoolOptions,
};
