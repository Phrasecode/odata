import { QueryParser } from '../serializers/query';
import { BaseControler } from './baseController';

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
export class ODataControler extends BaseControler {
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
}
