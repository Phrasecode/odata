import { Express, Router } from 'express';
import { BaseControler, ODataControler } from '../controller';
import { DataSource } from '../core';
import { getQueryMethods } from '../decorators/query.decorator';
import { decodeUrl } from '../serializers/decodeUrl';
import { QueryParser } from '../serializers/query';
import {
  ControllerEndpointInfo,
  IExpressRouterConfig,
  IMethod,
  QueryControllerEvent,
  QueryMethodMetadata,
  QueryParameterDefinition,
} from '../types';
import { EndpointNamingConvention, STATUS_CODES } from '../utils/constant';
import { AppError, BadRequestError } from '../utils/error-management';
import { Logger } from '../utils/logger';
import { PerfLogger } from '../utils/perfLogger';

/**
 * ExpressRouter integrates OData endpoints into an Express.js application.
 * Automatically sets up routes for all registered controllers.
 *
 * @example
 * ```typescript
 * import express from 'express';
 *
 * const app = express();
 *
 * const userController = new ODataControler({
 *   endpoint: '/users',
 *   allowedMethod: ['get'],
 *   model: User
 * });
 *
 * const router = new ExpressRouter(app, {
 *   controllers: [userController],
 *   dataSource: dataSource
 * });
 *
 * app.listen(3000);
 * // Now you can access: GET http://localhost:3000/users?$select=name&$filter=age gt 18
 * ```
 */
export class ExpressRouter {
  private config: IExpressRouterConfig;
  private app: Express;
  private controllers: BaseControler[];
  private dataSource: DataSource;
  private endpointNamingConvention?: EndpointNamingConvention;

  /**
   * Creates a new ExpressRouter and sets up all routes.
   *
   * @param app - Express application instance
   * @param config - Router configuration with controllers and data source
   */
  constructor(app: Express, config: IExpressRouterConfig) {
    this.config = config;
    this.endpointNamingConvention = config.endpointNamingConvention;
    this.app = app;
    this.controllers = config.controllers;
    this.dataSource = config.dataSource;
    Logger.forceSetupLogger(config.logger);
    this.setUpRouters();
    this.setUpMetaDataRouters();
  }

  private setUpMetaDataRouters() {
    // Register metadata endpoint directly on the app
    // Using string path to avoid regex interpretation of $
    this.app.get('/\\$metadata', (_req, res) => {
      try {
        const controllerEndpoints = this.buildControllerEndpointInfo();
        const metadata = this.dataSource.getMetadata(controllerEndpoints);
        res.send(metadata);
      } catch (error) {
        if (error instanceof AppError) {
          res.status(error.statusCode).json({
            error: error.message,
            code: error.code,
            details: error.details,
          });
        } else {
          res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
        }
      }
    });
  }

  /**
   * Build controller endpoint information for metadata generation
   */
  private buildControllerEndpointInfo(): ControllerEndpointInfo[] {
    const endpoints: ControllerEndpointInfo[] = [];

    this.controllers.forEach(controller => {
      const modelName = controller.getBaseModel().getModelName();
      const endpoint = controller.getEndpoint();
      const routePath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

      // Check if this is a QueryModel
      const model = controller.getBaseModel();
      const isQueryModelType = (model as any).isCustomQuery === true;

      // Get query methods
      const queryMethods = getQueryMethods(controller);
      const queryMethodInfos: import('../types').QueryMethodEndpointInfo[] = [];

      queryMethods.forEach((metadata, methodName) => {
        queryMethodInfos.push({
          methodName,
          endpoint: metadata.endpoint,
          httpMethod: metadata.method,
        });
      });

      endpoints.push({
        modelName,
        endpoint: routePath,
        isQueryModel: isQueryModelType,
        queryMethods: queryMethodInfos.length > 0 ? queryMethodInfos : undefined,
      });
    });

    return endpoints;
  }

  private setUpRouters() {
    this.controllers.forEach(controller => {
      const router = Router();

      controller.setDataSource(this.dataSource);

      if (this.endpointNamingConvention) {
        controller.setEndpointNamingConvention(this.endpointNamingConvention);
      }

      if (controller instanceof ODataControler) {
        this.setUpODataRouters(router, controller);
      }

      const endpoint = controller.getEndpoint();

      // Set up custom method routes
      this.setUpCustomRoutes(router, controller);

      const routePath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      this.app.use(routePath, router);
    });
  }

  private setUpODataRouters(router: Router, controller: ODataControler) {
    const allowedMethods: IMethod[] = controller.getAllowedMethod();
    const model = controller.getBaseModel();

    // Set up standard OData routes
    allowedMethods.forEach((method: IMethod) => {
      if (method === 'get') {
        router.get('/', async (req, res) => {
          try {
            const perfLogger = new PerfLogger();
            perfLogger.start();
            const queryParser = new QueryParser(
              `${req.baseUrl}${req.url}`,
              model,
              this.config.queryOptions,
            );
            const response = await controller.get(queryParser);
            const executionTime = perfLogger.end();
            response.meta.totalExecutionTime = executionTime;
            res.send(response);
          } catch (error) {
            Logger.getLogger().error(
              'Unable to process the OData request. Please verify the request path, query syntax, and model route configuration.',
              error,
            );

            if (error instanceof AppError) {
              res.status(error.statusCode).json({
                error: error.message,
                code: error.code,
                details: error.details,
              });
            } else {
              res
                .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
                .json({ error: 'Internal Server Error' });
            }
          }
        });
        return;
      }
    });

    // Return 405 Method Not Allowed for unsupported HTTP methods
    router.all('/', (_req, res) => {
      res
        .status(STATUS_CODES.METHOD_NOT_ALLOWED)
        .set('Allow', allowedMethods.map(m => m.toUpperCase()).join(', '))
        .json({ error: 'Method Not Allowed' });
    });
  }

  /**
   * Set up routes for query methods decorated with @Query
   */
  private setUpCustomRoutes(router: Router, controller: BaseControler) {
    const queryMethods = getQueryMethods(controller);
    queryMethods.forEach((metadata: QueryMethodMetadata, methodName: string) => {
      const handler = async (req: any, res: any) => {
        try {
          const perfLogger = new PerfLogger();
          perfLogger.start();

          // Parse and validate parameters
          const event = this.parseQueryParameters(req, metadata.parameters);

          // Call the custom method
          const method = (controller as any)[methodName];
          if (typeof method !== 'function') {
            throw new Error(`Method ${methodName} not found on controller`);
          }

          const response = await method.call(controller, event);
          const executionTime = perfLogger.end();
          response.meta.totalExecutionTime = executionTime;
          res.send(response);
        } catch (error) {
          Logger.getLogger().error(`Error processing custom request ${methodName}`, error);

          if (error instanceof AppError) {
            res.status(error.statusCode).json({
              error: error.message,
              code: error.code,
              details: error.details,
            });
          } else {
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
          }
        }
      };

      // Register the route based on HTTP method
      switch (metadata.method) {
        case 'get':
          router.get(metadata.endpoint, handler);
          break;
        case 'post':
          router.post(metadata.endpoint, handler);
          break;
        case 'put':
          router.put(metadata.endpoint, handler);
          break;
        case 'delete':
          router.delete(metadata.endpoint, handler);
          break;
      }

      Logger.getLogger().info(
        `Registered custom route: ${metadata.method.toUpperCase()} ${metadata.endpoint}`,
      );
    });
  }

  /**
   * Parse and validate parameters from request based on parameter definitions
   */
  private parseQueryParameters(
    req: any,
    parameterDefs: QueryParameterDefinition[],
  ): QueryControllerEvent {
    const path = `${req.baseUrl}${req.url}`;
    const { fullPath, basepath, queryParams } = decodeUrl(path);
    const params: Record<string, unknown> = {};

    // Merge query params and body params
    const rawParams = queryParams;

    for (const paramDef of parameterDefs) {
      let value: unknown = rawParams[paramDef.name];

      // Use default value if not provided
      if (value === undefined || value === null || value === '') {
        if (paramDef.required) {
          throw new BadRequestError(`Required parameter '${paramDef.name}' is missing`);
        }
        value = paramDef.defaultValue;
      }

      params[paramDef.name] = value;
    }

    return {
      path: fullPath,
      basepath,
      queryParams: params,
    };
  }

  /**
   * Get the Express application instance.
   * @returns The Express app
   */
  public getApp() {
    return this.app;
  }

  /**
   * Get the router configuration.
   * @returns The router configuration
   */
  public getConfig() {
    return this.config;
  }
}
