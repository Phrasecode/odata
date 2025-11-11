import { Express, Router } from 'express';
import { DataSource, ODataControler } from '../core';
import { QueryParser } from '../serializers/query';
import { IExpressRouterConfig, IMethod } from '../types';
import { STATUS_CODES } from '../utils/constant';
import { AppError } from '../utils/error-management';
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
  private controllers: ODataControler[];
  private dataSource: DataSource;

  /**
   * Creates a new ExpressRouter and sets up all routes.
   *
   * @param app - Express application instance
   * @param config - Router configuration with controllers and data source
   */
  constructor(app: Express, config: IExpressRouterConfig) {
    this.config = config;
    this.app = app;
    this.controllers = config.controllers;
    this.dataSource = config.dataSource;
    Logger.forceSetupLogger(config.logger);
    this.setUpMetaDataRouters();
    this.setUpRouters();
  }

  private setUpMetaDataRouters() {
    this.app.get('/$metadata', (req, res) => {
      try {
        const metadata = this.dataSource.getMetadata();
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

  private setUpRouters() {
    this.controllers.forEach(controller => {
      const router = Router();
      const allowedMethods: IMethod[] = controller.getAllowedMethod();
      const endpoint = controller.getEndpoint();
      const model = controller.getBaseModel();
      allowedMethods.forEach((method: IMethod) => {
        if (method === 'get') {
          router.get('/', async (req, res) => {
            try {
              const perfLogger = new PerfLogger();
              perfLogger.start();
              const queryParser = new QueryParser(
                `${req.baseUrl}${req.url}`,
                this.dataSource,
                model,
                this.config.queryOptions,
              );
              const responce = await controller.get(queryParser);
              const executionTime = perfLogger.end();
              responce.meta.totalExecutionTime = executionTime;
              res.send(responce);
            } catch (error) {
              Logger.getLogger().error('Error processing request', error);

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
      const routePath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      this.app.use(routePath, router);
    });
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
