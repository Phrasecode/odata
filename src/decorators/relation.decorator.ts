import { Model } from '../core';
import { RelationOptions } from '../types';
import { BadRequestError } from '../utils/error-management';

/**
 * Decorator to define a one-to-many relationship between models.
 * Use this when the current model has multiple instances of the related model.
 *
 * @param target - Function that returns the related Model class
 * @param options - Relationship configuration including foreign key mappings
 * @returns A property decorator function
 *
 * @example
 * ```typescript
 * @Table({ tableName: 'users' })
 * class User extends Model<User> {
 *   @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
 *   id: number;
 *
 *   @HasMany(() => Order, {
 *     relation: [{
 *       foreignKey: 'userId',  // Column in Order table
 *       sourceKey: 'id'        // Column in User table
 *     }]
 *   })
 *   orders: Order[];
 * }
 *
 * @Table({ tableName: 'orders' })
 * class Order extends Model<Order> {
 *   @Column({ dataType: DataTypes.INTEGER })
 *   userId: number;
 * }
 * ```
 */
export function HasMany(target: () => typeof Model, options?: RelationOptions): PropertyDecorator {
  return function (targetObject: object, propertyKey: string | symbol) {
    if (typeof propertyKey === 'symbol') {
      throw new BadRequestError('Symbol properties are not supported');
    }

    const metadata: RelationOptions = {
      relation: options?.relation || [],
    };

    // Store metadata directly on the model class
    const constructor = targetObject.constructor as any;
    if (typeof constructor.addRelationMetadata === 'function') {
      constructor.addRelationMetadata(propertyKey, 'hasMany', target, metadata);
    }
  };
}

/**
 * Decorator to define a one-to-one relationship between models.
 * Use this when the current model has exactly one instance of the related model.
 *
 * @param target - Function that returns the related Model class
 * @param options - Relationship configuration including foreign key mappings
 * @returns A property decorator function
 *
 * @example
 * ```typescript
 * @Table({ tableName: 'users' })
 * class User extends Model<User> {
 *   @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
 *   id: number;
 *
 *   @HasOne(() => Profile, {
 *     relation: [{
 *       foreignKey: 'userId',  // Column in Profile table
 *       sourceKey: 'id'        // Column in User table
 *     }]
 *   })
 *   profile: Profile;
 * }
 *
 * @Table({ tableName: 'profiles' })
 * class Profile extends Model<Profile> {
 *   @Column({ dataType: DataTypes.INTEGER })
 *   userId: number;
 * }
 * ```
 */
export function HasOne(target: () => typeof Model, options?: RelationOptions): PropertyDecorator {
  return function (targetObject: object, propertyKey: string | symbol) {
    if (typeof propertyKey === 'symbol') {
      throw new BadRequestError('Symbol properties are not supported');
    }

    const metadata: RelationOptions = {
      relation: options?.relation || [],
    };

    // Store metadata directly on the model class
    const constructor = targetObject.constructor as any;
    if (typeof constructor.addRelationMetadata === 'function') {
      constructor.addRelationMetadata(propertyKey, 'hasOne', target, metadata);
    }
  };
}

/**
 * Decorator to define a many-to-one relationship between models.
 * Use this when the current model belongs to a single instance of the related model.
 * This is the inverse of HasMany.
 *
 * @param target - Function that returns the related Model class
 * @param options - Relationship configuration including foreign key mappings
 * @returns A property decorator function
 *
 * @example
 * ```typescript
 * @Table({ tableName: 'orders' })
 * class Order extends Model<Order> {
 *   @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
 *   id: number;
 *
 *   @Column({ dataType: DataTypes.INTEGER })
 *   userId: number;
 *
 *   @BelongsTo(() => User, {
 *     relation: [{
 *       foreignKey: 'userId',  // Column in Order table
 *       sourceKey: 'id'        // Column in User table
 *     }]
 *   })
 *   user: User;
 * }
 *
 * @Table({ tableName: 'users' })
 * class User extends Model<User> {
 *   @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
 *   id: number;
 * }
 * ```
 */
export function BelongsTo(
  target: () => typeof Model,
  options?: RelationOptions,
): PropertyDecorator {
  return function (targetObject: object, propertyKey: string | symbol) {
    if (typeof propertyKey === 'symbol') {
      throw new BadRequestError('Symbol properties are not supported');
    }

    const metadata: RelationOptions = {
      relation: options?.relation || [],
    };

    const constructor = targetObject.constructor as any;
    if (typeof constructor.addRelationMetadata === 'function') {
      constructor.addRelationMetadata(propertyKey, 'belongsTo', target, metadata);
    }
  };
}
