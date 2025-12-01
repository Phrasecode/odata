import {
  ColumnMetadata,
  ColumnOptions,
  RelationMetadata,
  RelationOptions,
  TableMetadata,
  TableOptions,
} from '../types';
import { NotFoundError } from '../utils/error-management';
import { convertStringToSnakeCase } from '../utils/utilFunctions';

/**
 * Internal interface for storing relation metadata.
 * @internal
 */
interface IRelationData {
  propertyKey: string;
  type: 'hasMany' | 'hasOne' | 'belongsTo';
  target: () => typeof Model;
  metadata: RelationOptions;
}

/**
 * Internal interface for storing column metadata.
 * @internal
 */
interface IColumnData {
  propertyKey: string;
  metadata: ColumnOptions;
}

/**
 * Base Model class for defining OData entities.
 * Extend this class and use decorators (@Table, @Column, @HasMany, etc.) to define your data models.
 *
 * @template T - The type of the model itself (for type safety)
 *
 * @example
 * ```typescript
 * @Table({
 *   tableName: 'users',
 *   underscored: true
 * })
 * class User extends Model<User> {
 *   @Column({
 *     dataType: DataTypes.INTEGER,
 *     isPrimaryKey: true,
 *     isAutoIncrement: true
 *   })
 *   id: number;
 *
 *   @Column({ dataType: DataTypes.STRING, isNullable: false })
 *   name: string;
 *
 *   @Column({ dataType: DataTypes.STRING, isUnique: true })
 *   email: string;
 *
 *   @HasMany(() => Order, {
 *     relation: [{ foreignKey: 'userId', sourceKey: 'id' }]
 *   })
 *   orders: Order[];
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class Model<T = any> {
  private static tableMetadata?: TableOptions;
  private static columnOption: IColumnData[] = [];
  private static relationOption: IRelationData[] = [];

  /**
   * Get the name of the model class.
   * @returns The class name
   */
  public static getModelName(): string {
    return this.name;
  }

  /**
   * Set table metadata for the model.
   * This is called internally by the @Table decorator.
   * @param metadata - Table configuration options
   * @internal
   */
  public static setTableMetadata(metadata: TableOptions): void {
    this.tableMetadata = metadata;
  }

  /**
   * Add column metadata for a property.
   * This is called internally by the @Column decorator.
   * @param propertyKey - Name of the property
   * @param metadata - Column configuration options
   * @internal
   */
  public static addColumnMetadata(propertyKey: string, metadata: ColumnOptions): void {
    if (!Object.prototype.hasOwnProperty.call(this, 'columnOption')) {
      this.columnOption = [];
    }
    this.columnOption.push({ propertyKey, metadata });
  }

  /**
   * Add relationship metadata for a property.
   * This is called internally by relationship decorators (@HasMany, @HasOne, @BelongsTo).
   * @param propertyKey - Name of the property
   * @param type - Type of relationship
   * @param target - Function returning the related model class
   * @param metadata - Relationship configuration options
   * @internal
   */
  public static addRelationMetadata(
    propertyKey: string,
    type: 'hasMany' | 'hasOne' | 'belongsTo',
    target: () => typeof Model,
    metadata: RelationOptions,
  ): void {
    if (!Object.prototype.hasOwnProperty.call(this, 'relationOption')) {
      this.relationOption = [];
    }
    this.relationOption.push({
      propertyKey,
      type,
      target,
      metadata,
    });
  }

  /**
   * Get all metadata (table, columns, and relations) for the model.
   * @returns Object containing table, column, and relation metadata
   * @internal
   */
  public static getMetadata(): {
    tableMetadata: TableMetadata;
    columnMetadata: ColumnMetadata[];
    relationMetadata: RelationMetadata[];
  } {
    const tableMetadata = {
      modelName: this.name,
      tableIdentifier: this.getIdentifier(this.name, this.tableMetadata?.tableName),
    };

    const columnMetadata = this.getColumnMetaData();
    const relationMetadata = this.getRelationMetaData();

    return {
      tableMetadata,
      columnMetadata,
      relationMetadata,
    };
  }

  /**
   * Get column metadata by property name.
   * @param columnName - Name of the property/column
   * @returns Column metadata
   * @throws Error if column is not found
   * @internal
   */
  public static getColumnByName(columnName: string): ColumnMetadata {
    const columnMetadata = this.getColumnMetaData();
    const column = columnMetadata.find(column => {
      if (column.propertyKey === columnName) {
        return column.columnIdentifier;
      }
      return undefined;
    });
    if (!column) {
      throw new NotFoundError(`Column ${columnName} not found`);
    }
    return column;
  }

  private static getColumnMetaData(): ColumnMetadata[] {
    return this.columnOption.map((column: IColumnData) => {
      const columnIdentifier = this.getIdentifier(column.propertyKey, column.metadata.field);
      return {
        propertyKey: column.propertyKey,
        dataType: column.metadata.dataType,
        columnIdentifier: columnIdentifier,
        isPrimaryKey: column.metadata.isPrimaryKey,
        isNullable: column.metadata.isNullable,
        isUnique: column.metadata.isUnique,
        isAutoIncrement: column.metadata.isAutoIncrement,
        defaultValue: column.metadata.defaultValue,
      };
    });
  }

  private static getRelationMetaData(): RelationMetadata[] {
    return this.relationOption.map(relation => {
      return {
        propertyKey: relation.propertyKey,
        type: relation.type,
        targetModel: relation.target(),
        relation: this.generateRelationMapping(relation),
      };
    });
  }
  private static generateRelationMapping(relationData: IRelationData) {
    const relation = relationData.metadata.relation.map(relation => {
      return {
        targetKey: relation.foreignKey,
        sourceKey: relation.sourceKey,
      };
    });
    return relation;
  }

  private static getIdentifier(name: string, identifier?: string): string {
    if (identifier) {
      return identifier;
    }
    if (!this.tableMetadata || this.tableMetadata.underscored === false) {
      return identifier || name;
    }

    if (this.tableMetadata?.underscored) {
      return convertStringToSnakeCase(name);
    }
    return name;
  }
}
