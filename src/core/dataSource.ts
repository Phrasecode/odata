import { SequelizerAdaptor } from '../adaptors';
import { generateMetadata } from '../serializers/metadata';
import { QueryParser } from '../serializers/query';
import { convertQueryParser } from '../serializers/queryConverter';
import { parseResponse } from '../serializers/responseBuilder';
import { IDbConfig, IQueryExecutionResponse } from '../types';
import { NotFoundError } from '../utils/error-management';
import { Logger } from '../utils/logger';
import { PerfLogger } from '../utils/perfLogger';
import { Model } from './model';

/**
 * DataSource manages the database connection and model registration.
 * It serves as the central point for database operations and entity management.
 *
 * @example
 * ```typescript
 * const dataSource = new DataSource({
 *   database: 'mydb',
 *   username: 'user',
 *   password: 'pass',
 *   host: 'localhost',
 *   dialect: 'postgres',
 *   port: 5432,
 *   pool: { max: 5, min: 0, idle: 10000 },
 *   schema: 'public',
 *   models: [User, Order, Product]
 * });
 * ```
 */
export class DataSource {
  private dbConfig = {};
  private sequelizerAdaptor: SequelizerAdaptor;
  /** Map of model names to Model classes */
  public entityMap: Map<string, typeof Model<any>> = new Map();
  /** Map of model names to database table names */
  public entityNameMap: Map<string, string> = new Map();

  /**
   * Creates a new DataSource instance.
   * Initializes the database connection and registers all models.
   *
   * @param dbConfig - Database configuration including credentials and models
   */
  constructor(dbConfig: IDbConfig) {
    this.dbConfig = dbConfig;
    this.sequelizerAdaptor = new SequelizerAdaptor(dbConfig);
    this.defineEntityModels(dbConfig);
    this.defineRelations();
  }

  private defineEntityModels(dbConfig: IDbConfig) {
    if (!dbConfig.models) {
      return;
    }
    dbConfig.models.forEach((entity: typeof Model<any>) => {
      const { tableMetadata, columnMetadata } = entity.getMetadata();
      this.sequelizerAdaptor.define(tableMetadata.tableIdentifier, columnMetadata);
      this.entityMap.set(tableMetadata.modelName, entity);
      this.entityNameMap.set(tableMetadata.modelName, tableMetadata.tableIdentifier);
    });
  }

  private defineRelations() {
    this.entityMap.forEach((entity: typeof Model<any>, _key: string) => {
      const { relationMetadata, tableMetadata } = entity.getMetadata();
      for (let index = 0; index < relationMetadata.length; index++) {
        const relation = relationMetadata[index];
        if (relation.type === 'belongsTo') {
          continue;
        }
        const targetModelName = relation.targetModel.getModelName();
        const targetModel = this.entityMap.get(targetModelName);
        const targetModelIdentifier = targetModel?.getMetadata().tableMetadata.tableIdentifier;
        if (!targetModelIdentifier) {
          throw new NotFoundError(`Target model ${targetModelName} not found`);
        }
        const relations = relation.relation.map(relation => {
          return {
            targetKey: targetModel.getColumnByName(relation.targetKey).columnIdentifier,
            sourceKey: entity.getColumnByName(relation.sourceKey).columnIdentifier,
          };
        });
        this.sequelizerAdaptor.defineRelation(
          tableMetadata.tableIdentifier,
          targetModelIdentifier,
          relation.type,
          relations,
          relation.propertyKey,
        );
      }
    });

    this.entityMap.forEach((entity: typeof Model<any>, _key: string) => {
      const { relationMetadata, tableMetadata } = entity.getMetadata();
      for (let index = 0; index < relationMetadata.length; index++) {
        const relation = relationMetadata[index];
        if (relation.type === 'hasOne' || relation.type === 'hasMany') {
          continue;
        }
        const targetModelName = relation.targetModel.getModelName();
        const targetModel = this.entityMap.get(targetModelName);
        const targetModelIdentifier = targetModel?.getMetadata().tableMetadata.tableIdentifier;
        if (!targetModelIdentifier) {
          throw new NotFoundError(`Target model ${targetModelName} not found`);
        }
        const relations = relation.relation.map(relation => {
          return {
            targetKey: targetModel.getColumnByName(relation.targetKey).columnIdentifier,
            sourceKey: entity.getColumnByName(relation.sourceKey).columnIdentifier,
          };
        });
        this.sequelizerAdaptor.defineRelation(
          tableMetadata.tableIdentifier,
          targetModelIdentifier,
          relation.type,
          relations,
          relation.propertyKey,
        );
      }
    });
  }

  /**
   * Get a registered entity/model by name.
   *
   * @template T - The model type
   * @param entityName - Name of the model class
   * @returns The Model class or undefined if not found
   *
   * @example
   * ```typescript
   * const UserModel = dataSource.getEntity('User');
   * ```
   */
  public getEntity<T extends Model<any>>(entityName: string): Model<T> | undefined {
    if (!this.entityMap.has(entityName)) {
      return undefined;
    }
    return this.entityMap.get(entityName);
  }

  /**
   * Get the database configuration.
   * @returns The database configuration object
   */
  public getDbConfig() {
    return this.dbConfig;
  }

  /**
   * Generate OData V4 metadata in JSON format.
   * This method creates a complete metadata object describing all entities,
   * their properties, and relationships.
   *
   * @returns JSON object representing the OData V4 metadata
   *
   * @example
   * ```typescript
   * const metadata = dataSource.getMetadata();
   * // Returns metadata as JSON object
   * ```
   */
  public getMetadata(): any {
    return generateMetadata(this.entityMap);
  }

  /**
   * Execute a parsed OData query against the database.
   * This is the main method for retrieving data based on OData queries.
   *
   * @template T - The model type
   * @param query - QueryParser instance containing the parsed query
   * @returns Promise resolving to an array of model instances
   * @throws Error if the model is not found
   *
   * @example
   * ```typescript
   * const queryParser = new QueryParser(
   *   '/users?$select=name&$filter=age gt 18',
   *   dataSource,
   *   User
   * );
   * const results = await dataSource.execute(queryParser);
   * ```
   */
  public async execute<T extends Model<T>>(
    query: QueryParser,
  ): Promise<IQueryExecutionResponse<T>> {
    try {
      const parsedQuery = query.getParams();

      // Validate table name exists in entityNameMap first
      if (!this.entityNameMap.has(parsedQuery.table)) {
        throw new NotFoundError(`Table '${parsedQuery.table}' not found in entity registry`);
      }

      const baseModel = this.entityMap.get(parsedQuery.table);
      if (!baseModel) {
        throw new NotFoundError(`Model class for table '${parsedQuery.table}' not found`);
      }

      const convertedQuery = convertQueryParser(this.entityMap, query);
      const perfLogger = new PerfLogger();
      perfLogger.start();
      const {
        data,
        count,
      }: {
        data: object[];
        count?: number;
      } = await this.sequelizerAdaptor.executeSelect(convertedQuery);
      const executionTime: number = perfLogger.end();
      Logger.getLogger().info(
        `Query executed: ${executionTime}ms`,
        undefined,
        'logDbExecutionTime',
      );

      const response = parseResponse(data, baseModel, executionTime, count);

      return response;
    } catch (err) {
      // Preserve error context and add data source information
      const error = err as Error;
      error.message = `DataSource execution failed for table '${
        query.getParams().table
      }': ${error.message}`;
      throw error;
    }
  }
}
