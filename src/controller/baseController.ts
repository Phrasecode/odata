import { DataSource } from '../core/dataSource';
import { Model } from '../core/model';
import { QueryParser } from '../serializers/query';
import { IControllerConfig, IMethod, IQueryExecutionResponse } from '../types';
import { EndpointNamingConvention } from '../utils/constant';
import { convertStringToKebabCase, convertStringToLowerCase } from '../utils/stringUtilFunctions';

/**
 * OData controller for handling HTTP requests to a specific model/entity.
 * Manages CRUD operations and query execution for a single entity type.
 *
 * @example
 * ```typescript
 * const userController = new ODataControler({
 *   endpoint: '/users',
 *   allowedMethod: ['get', 'post'],
 *   model: User
 * });
 * ```
 */
export class BaseControler {
  /** Controller configuration */
  public config: IControllerConfig;

  /** DataSource instance for database operations */
  protected dataSource?: DataSource;

  private endpointFormattingPattern?: EndpointNamingConvention =
    EndpointNamingConvention.KEBAB_CASE;

  /**
   * Creates a new ODataControler instance.
   *
   * @param config - Controller configuration including endpoint, allowed methods, and model
   */
  constructor(config: IControllerConfig) {
    this.config = config;
  }

  /**
   * Set the DataSource for this controller.
   * Called internally by the router when registering controllers.
   *
   * @param dataSource - DataSource instance
   */
  public setDataSource(dataSource: DataSource): void {
    this.dataSource = dataSource;
  }

  /**
   * Get the list of allowed HTTP methods for this controller.
   *
   * @returns Array of allowed HTTP methods. Defaults to ['get'] if not configured
   */
  public getAllowedMethod(): IMethod[] {
    if (this.config.allowedMethod) {
      return this.config.allowedMethod;
    } else {
      return ['get'];
    }
  }

  /**
   * Get the endpoint path for this controller.
   *
   * @returns Endpoint path. Uses model name if not explicitly configured
   */
  public getEndpoint(): string {
    if (this.config.endpoint) {
      return this.config.endpoint;
    }

    switch (this.endpointFormattingPattern) {
      case EndpointNamingConvention.AS_MODEL_NAME:
        return this.config.model.getModelName();
      case EndpointNamingConvention.KEBAB_CASE:
        return convertStringToKebabCase(this.config.model.getModelName());
      case EndpointNamingConvention.LOWER_CASE:
        return convertStringToLowerCase(this.config.model.getModelName());
    }
    return this.config.model.getModelName();
  }

  public setEndpointNamingConvention(pattern: EndpointNamingConvention) {
    this.endpointFormattingPattern = pattern;
  }

  /**
   * Execute an OData query and return results.
   * This is the main method for querying data.
   *
   * @template T - The model type
   * @param query - QueryParser instance with parsed OData query
   * @returns Promise resolving to an array of model instances
   * @throws Error if query execution fails
   */
  public async queryable<T extends Model<T>>(
    query: QueryParser,
  ): Promise<IQueryExecutionResponse<T>> {
    try {
      if (!this.dataSource) {
        throw new Error(
          'DataSource is not set. Ensure the controller is registered with a router.',
        );
      }
      const result: IQueryExecutionResponse<T> = await this.dataSource.execute(query);
      return result;
    } catch (err) {
      // Preserve error context and add controller information
      const error = err as Error;
      error.message = `Controller [${this.getEndpoint()}] query execution failed: ${error.message}`;
      throw error;
    }
  }

  /**
   * Get the base model class for this controller.
   *
   * @returns The Model class this controller operates on
   */
  public getBaseModel() {
    return this.config.model;
  }

  /**
   * Execute a raw SQL query against the database.
   * Use this method in custom controller methods marked with @Custom decorator.
   * Returns response in the same format as standard OData queries.
   *
   * @param sql - The raw SQL query string with parameter placeholders ($1, $2, etc.)
   * @param params - Array of parameter values to bind to the query
   * @returns Promise resolving to the query results in OData format
   *
   * @example
   * ```typescript
   * class ProductController extends ODataControler {
   *   @Custom({
   *     method: 'get',
   *     endpoint: '/expensive',
   *     parameters: [
   *       { name: 'minPrice', type: 'number', required: true }
   *     ]
   *   })
   *   public async getExpensiveProducts(params: Record<string, unknown>) {
   *     return this.rawQueryable(
   *       'SELECT * FROM products WHERE price > $1 ORDER BY price DESC',
   *       [params.minPrice]
   *     );
   *   }
   * }
   * ```
   */
  protected async rawQueryable<T extends Model<T>>(
    sql: string,
    params: Record<string, unknown>,
  ): Promise<IQueryExecutionResponse<T>> {
    if (!this.dataSource) {
      throw new Error('DataSource is not set. Ensure the controller is registered with a router.');
    }

    const result: IQueryExecutionResponse<T> = await this.dataSource.executeRawQuery(
      sql,
      params,
      this.config.model.getModelName(),
    );

    return result;
  }
}
