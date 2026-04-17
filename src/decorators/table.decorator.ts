import { TableOptions } from '../types';

/**
 * Decorator to define table-level metadata for a Model class.
 * This decorator configures how the model maps to a database table.
 *
 * @param options - Configuration options for the table
 * @returns A class decorator function
 *
 * @example
 * ```typescript
 * @Table({
 *   tableName: 'users',
 *   underscored: true
 * })
 * class User extends Model<User> {
 *   @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
 *   id: number;
 *
 *   @Column({ dataType: DataTypes.STRING })
 *   name: string;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Without options - uses class name as table name
 * @Table()
 * class Product extends Model<Product> { }
 * ```
 */
export function Table(options?: TableOptions): ClassDecorator {
  return function (target: any) {
    const metadata = {
      tableName: options?.tableName,
      underscored: options?.underscored ?? false,
    };

    if (typeof target.setTableMetadata === 'function') {
      target.setTableMetadata(metadata);
    }
  };
}
