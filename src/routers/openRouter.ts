import { DataSource, Model } from '../core';
import { QueryParser } from '../serializers/query';
import { IOpenRouterConfig, IQueryExecutionResponse } from '../types';
import { InternalServerError } from '../utils/error-management';
import { Logger } from '../utils/logger';
import { PerfLogger } from '../utils/perfLogger';
/**
 * OpenRouter has capble to integrate with any framework.
 * This router supports serverless functions as well as any server framework like NextJs
 * Provides a simple way to create OData API routes in Next.js API routes.
 *
 * @example
 * ```typescript
 * // In pages/api/users.ts
 * import { OpenRouter } from '@phrasecode/odata';
 *
 * const router = new OpenRouter({
 *   dataSource: dataSource
 * });
 *
 * export default async function handler(
 *   req: NextApiRequest,
 *   res: NextApiResponse
 * ) {
 *   const path = req.url; // /api/users?$select=name&$filter=age gt 18
 *   const response = await router.queryable(User)(path);
 *   res.status(200).json(response);
 * }
 *
 * // Now you can access: GET /api/users?$select=name&$filter=age gt 18
 * ```
 */
export class OpenRouter {
  private config: IOpenRouterConfig;
  private dataSource: DataSource;
  /**
   * Creates a new OpenRouter instance.
   *
   * @param config - Router configuration with data source
   */
  constructor(config: IOpenRouterConfig) {
    this.config = config;
    this.dataSource = config.dataSource;
    Logger.forceSetupLogger(config.logger);
  }

  /**
   * Create a queryable handler function for a specific model.
   * Returns a function that process the OData query and returns the result.
   *
   * @template T - The model type
   * @param model - Model class to query
   * @returns Handler function that processes OData queries
   * @example
   * ```typescript
   *   const path = "/users?$select=name&$filter=age gt 18";
   *   const response = await router.queryable(User)(path);
   * ```
   *
   * @param path - The OData query string. Example: /users?$select=name&$filter=age gt 18&$expand=articles
   * @returns Promise resolving to an array of model instances
   *
   *
   */
  public queryable<T extends Model<T>>(
    model: typeof Model<T>,
  ): (path: string) => Promise<IQueryExecutionResponse<T>> {
    return (path: string) => this.process(model, path);
  }

  /**
   * Process an OData query request.
   * @internal
   */
  private async process<T extends Model<T>>(
    model: typeof Model<T>,
    path: string,
  ): Promise<IQueryExecutionResponse<T>> {
    try {
      const perfLogger = new PerfLogger();
      perfLogger.start();
      const queryParser = new QueryParser(path, this.dataSource, model, this.config.queryOptions);
      const response: IQueryExecutionResponse<T> = await this.dataSource.execute(queryParser);
      const executionTime = perfLogger.end();
      response.meta.totalExecutionTime = executionTime;
      return response;
    } catch (error: unknown) {
      throw new InternalServerError(
        'Error processing request',
        { message: (error as Error).message, stack: (error as Error).stack },
        (error as Error).stack,
      );
    }
  }

  /**
   * Get the router configuration.
   * @returns The router configuration
   */
  public getConfig() {
    return this.config;
  }

  /**
   * Get the DataSource instance.
   * @returns The DataSource used by this router
   */
  public getDataSource() {
    return this.dataSource;
  }

  public getMetaData() {
    return this.dataSource.getMetadata();
  }
}
