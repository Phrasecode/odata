import { DataSource, Model } from '../core';
import { decodeUrl } from '../serializers/decodeUrl';
import { QueryParser } from '../serializers/query';
import { ControllerEndpointInfo, IOpenRouterConfig, IQueryExecutionResponse } from '../types';
import { InternalServerError, NotFoundError } from '../utils/error-management';
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
  private pathMapping: Record<string, typeof Model>;

  /**
   * Creates a new OpenRouter instance.
   *
   * @param config - Router configuration with data source
   */
  constructor(config: IOpenRouterConfig) {
    this.config = config;
    this.dataSource = config.dataSource;
    this.pathMapping = this.formatPathMapping(config.pathMapping);
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
   */
  public async queryable<T extends Model<T>>(path: string): Promise<IQueryExecutionResponse<T>> {
    try {
      const perfLogger = new PerfLogger();
      perfLogger.start();

      const { path: formattedPath } = decodeUrl(path);
      const model = this.getModelByPath(formattedPath);

      const queryParser = new QueryParser(path, model, this.config.queryOptions);
      const response: IQueryExecutionResponse<T> = await this.dataSource.execute(queryParser);

      const executionTime = perfLogger.end();
      response.meta.totalExecutionTime = executionTime;
      return response;
    } catch (error: unknown) {
      Logger.getLogger().error('Error processing request', error);
      throw new InternalServerError('Error processing request');
    }
  }

  /**
   * Execute a raw SQL query and return results in OData response format.
   * Use this for custom queries that cannot be expressed using OData syntax.
   *
   * @template T - The result type
   * @param sql - The raw SQL query string with parameter placeholders ($1, $2, etc.)
   * @param params - Array of parameter values to bind to the query
   * @param context - Optional context string for @odata.context (defaults to '$metadata#RawQuery')
   * @returns Promise resolving to query results in OData format
   *
   * @example
   * ```typescript
   * const response = await router.rawQueryable<User>(
   *   'SELECT * FROM users WHERE status = $1 LIMIT $2',
   *   ['active', 100],
   *   'Users'
   * );
   * res.status(200).json(response);
   * ```
   */
  public async rawQueryable<T extends Model<T>>(
    path: string,
    sql: string,
    params: Record<string, unknown>,
  ): Promise<IQueryExecutionResponse<T>> {
    try {
      const perfLogger = new PerfLogger();
      perfLogger.start();

      const { path: formattedPath } = decodeUrl(path);

      const model = this.getModelByPath(formattedPath);

      const response: IQueryExecutionResponse<T> = await this.dataSource.executeRawQuery(
        sql,
        params,
        model.getModelName(),
      );

      const executionTime = perfLogger.end();
      response.meta.totalExecutionTime = executionTime;

      return response;
    } catch (error: unknown) {
      Logger.getLogger().error('Error processing raw query', error);
      throw new InternalServerError('Error processing raw query');
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

  public getMetaData(baseUrl?: string) {
    const controllerEndpoints = this.buildControllerEndpointInfo();
    return this.dataSource.getMetadata(controllerEndpoints, baseUrl);
  }

  /**
   * Build controller endpoint information for metadata generation
   */
  private buildControllerEndpointInfo(): ControllerEndpointInfo[] {
    const endpoints: ControllerEndpointInfo[] = [];

    Object.entries(this.pathMapping).forEach(([path, model]) => {
      const modelName = model.getModelName();
      const isQueryModelType = (model as any).isCustomQuery === true;

      endpoints.push({
        modelName,
        endpoint: path,
        isQueryModel: isQueryModelType,
      });
    });

    return endpoints;
  }

  private getModelByPath(route: string) {
    const pathMapping = this.pathMapping;
    const model = pathMapping[route];
    if (!model) {
      throw new NotFoundError(`Path: ${route} not registered with the model`);
    }
    return model;
  }

  private formatPathMapping(pathMapping: Record<string, typeof Model>) {
    const formattedPathMapping: Record<string, typeof Model> = {};
    Object.keys(pathMapping).map(key => {
      const { fullPath } = decodeUrl(key);
      formattedPathMapping[fullPath] = pathMapping[key];
    });
    return formattedPathMapping;
  }
}
