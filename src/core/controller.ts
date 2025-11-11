import { QueryParser } from '../serializers/query';
import { IControllerConfig, IMethod, IQueryExecutionResponse } from '../types';
import { Model } from './model';

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
export class ODataControler {
  /** Controller configuration */
  public config: IControllerConfig;

  /**
   * Creates a new ODataControler instance.
   *
   * @param config - Controller configuration including endpoint, allowed methods, and model
   */
  constructor(config: IControllerConfig) {
    this.config = config;
  }

  /**
   * Handle GET requests (retrieve data).
   *
   * @param query - QueryParser instance with parsed OData query
   * @returns Promise resolving to query results
   */
  public async get(query: QueryParser) {
    return this.queryable(query);
  }

  /**
   * Handle POST requests (create data).
   * Note: Currently returns the query as-is. Implementation pending.
   *
   * @param query - QueryParser instance
   * @returns Promise resolving to the query
   */
  public post(query: QueryParser): Promise<QueryParser> {
    return Promise.resolve(query);
  }

  /**
   * Handle DELETE requests (delete data).
   * Note: Currently returns the query as-is. Implementation pending.
   *
   * @param query - QueryParser instance
   * @returns Promise resolving to the query
   */
  public delete(query: QueryParser): Promise<QueryParser> {
    return Promise.resolve(query);
  }

  /**
   * Handle PUT requests (update data).
   * Note: Currently returns the query as-is. Implementation pending.
   *
   * @param query - QueryParser instance
   * @returns Promise resolving to the query
   */
  public put(query: QueryParser): Promise<QueryParser> {
    return Promise.resolve(query);
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
    } else {
      return this.config.model.getModelName();
    }
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
      const result: IQueryExecutionResponse<T> = await query.getDataSource().execute(query);
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
}
