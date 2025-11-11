import { IDataType } from '.';
import { Model } from '../core';

/**
 * Configuration options for the @Table decorator.
 * Defines how the model class maps to a database table.
 *
 * @example
 * ```typescript
 * @Table({
 *   tableName: 'users',
 *   underscored: true,
 *   timestamps: true
 * })
 * class User extends Model<User> { }
 * ```
 */
export interface TableOptions {
  /** Custom table name. If not provided, uses the class name */
  tableName?: string;
  /** Convert camelCase property names to snake_case column names. Default: false */
  underscored?: boolean;
  /** Automatically add createdAt and updatedAt columns. Default: false */
  timestamps?: boolean;
}

/**
 * Configuration options for relationship decorators (@HasMany, @HasOne, @BelongsTo).
 * Defines the foreign key mappings between related models.
 *
 * @example
 * ```typescript
 * @HasMany(() => Order, {
 *   relation: [{
 *     foreignKey: 'userId',
 *     sourceKey: 'id'
 *   }]
 * })
 * orders: Order[];
 * ```
 */
export interface RelationOptions {
  /** Array of foreign key mappings for the relationship */
  relation: {
    /** Foreign key column name in the target table */
    foreignKey: string;
    /** Source key column name in the current table */
    sourceKey: string;
  }[];
}

/**
 * Configuration options for the @Column decorator.
 * Defines how a model property maps to a database column.
 *
 * @example
 * ```typescript
 * @Column({
 *   dataType: DataTypes.STRING,
 *   field: 'email_address',
 *   isNullable: false,
 *   isUnique: true
 * })
 * email: string;
 * ```
 */
export interface ColumnOptions {
  /** Sequelize data type for the column */
  dataType: IDataType;
  /** Custom column name. If not provided, uses the property name */
  field?: string;
  /** Allow NULL values. Default: true */
  isNullable?: boolean;
  /** Mark as primary key. Default: false */
  isPrimaryKey?: boolean;
  /** Auto-increment for numeric primary keys. Default: false */
  isAutoIncrement?: boolean;
  /** Enforce unique constraint. Default: false */
  isUnique?: boolean;
  /** Default value for the column */
  defaultValue?: any;
}

/**
 * Internal metadata about a table/model.
 * Generated from the @Table decorator and class information.
 *
 * @internal
 */
export interface TableMetadata {
  /** Name of the model class */
  modelName: string;
  /** Actual table name in the database */
  tableIdentifier: string;
  /** Table-level options */
  options: {
    /** Whether timestamps are enabled */
    timestamps?: boolean;
  };
}

/**
 * Internal metadata about a column/property.
 * Generated from the @Column decorator and property information.
 *
 * @internal
 */
export interface ColumnMetadata {
  /** Property name in the model class */
  propertyKey: string;
  /** Sequelize data type */
  dataType: IDataType;
  /** Actual column name in the database */
  columnIdentifier: string;
  /** Custom field name (deprecated, use columnIdentifier) */
  field?: string;
  /** Whether this is a primary key */
  isPrimaryKey?: boolean;
  /** Whether NULL values are allowed */
  isNullable?: boolean;
  /** Whether values must be unique */
  isUnique?: boolean;
  /** Whether the column auto-increments */
  isAutoIncrement?: boolean;
  /** Default value for the column */
  defaultValue?: any;
}

/**
 * Internal metadata about a relationship between models.
 * Generated from relationship decorators (@HasMany, @HasOne, @BelongsTo).
 *
 * @internal
 */
export interface RelationMetadata {
  /** Property name in the model class */
  propertyKey: string;
  /** Type of relationship */
  type: 'hasMany' | 'hasOne' | 'belongsTo';
  /** Target model class for the relationship */
  targetModel: typeof Model;
  /** Foreign key mappings */
  relation: {
    /** Foreign key in the target table */
    targetKey: string;
    /** Source key in the current table */
    sourceKey: string;
  }[];
}
