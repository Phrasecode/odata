import { ColumnOptions } from '../types';
import { BadRequestError } from '../utils/error-management';

/**
 * Decorator to define column-level metadata for a Model property.
 * This decorator configures how a property maps to a database column.
 *
 * @param options - Configuration options for the column
 * @returns A property decorator function
 *
 * @example
 * ```typescript
 * @Table({ tableName: 'users' })
 * class User extends Model<User> {
 *   @Column({
 *     dataType: DataTypes.INTEGER,
 *     isPrimaryKey: true,
 *     isAutoIncrement: true
 *   })
 *   id: number;
 *
 *   @Column({
 *     dataType: DataTypes.STRING,
 *     field: 'email_address',
 *     isNullable: false,
 *     isUnique: true
 *   })
 *   email: string;
 *
 *   @Column({
 *     dataType: DataTypes.INTEGER,
 *     defaultValue: 0
 *   })
 *   age: number;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Simple column definition
 * @Column({ dataType: DataTypes.STRING })
 * name: string;
 * ```
 */
export function Column(options: ColumnOptions): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol) {
    if (typeof propertyKey === 'symbol') {
      throw new BadRequestError('Symbol properties are not supported');
    }

    const metadata: ColumnOptions = {
      dataType: options.dataType,
      field: options.field,
      isPrimaryKey: options.isPrimaryKey ?? false,
      isNullable: options.isNullable ?? true,
      isUnique: options.isUnique ?? false,
      isAutoIncrement: options.isAutoIncrement ?? false,
      defaultValue: options.defaultValue,
    };

    const constructor = target.constructor as any;
    if (typeof constructor.addColumnMetadata === 'function') {
      constructor.addColumnMetadata(propertyKey, metadata);
    }
  };
}
