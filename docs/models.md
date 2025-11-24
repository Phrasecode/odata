# Defining Models

Models are the core of the framework. They define your data structure and how it maps to database tables.

## Model Class

All models must extend the `Model<T>` base class:

```typescript
import { Model, Table, Column, DataTypes } from '@phrasecode/odata';

@Table({ tableName: 'users', underscored: true, timestamps: true })
export class User extends Model<User> {
  @Column({
    dataType: DataTypes.INTEGER,
    isPrimaryKey: true,
    isAutoIncrement: true,
  })
  id: number;

  @Column({ dataType: DataTypes.STRING, isNullable: false })
  name: string;

  @Column({ dataType: DataTypes.STRING, isUnique: true })
  email: string;
}
```

## Decorators

### @Table Decorator

Defines table-level metadata for your model.

**Options:**

- `tableName?: string` - Custom table name (defaults to class name)
- `underscored?: boolean` - Convert camelCase properties to snake_case columns (default: false)

**Examples:**

```typescript
// Basic usage
@Table()
class Product extends Model<Product> {}

// With custom table name
@Table({ tableName: 'products' })
class Product extends Model<Product> {}

// With underscored columns and timestamps
@Table({ tableName: 'users', underscored: true })
class User extends Model<User> {}
```

### @Column Decorator

Defines column-level metadata for model properties.

**Options:**

- `dataType: IDataType` - Data type (required)
- `field?: string` - Custom column name (defaults to property name)
- `isPrimaryKey?: boolean` - Mark as primary key (default: false)
- `isAutoIncrement?: boolean` - Auto-increment for numeric keys (default: false)
- `isNullable?: boolean` - Allow NULL values (default: true)
- `isUnique?: boolean` - Enforce unique constraint (default: false)
- `defaultValue?: any` - Default value for the column

**Examples:**

```typescript
// Primary key with auto-increment
@Column({
  dataType: DataTypes.INTEGER,
  isPrimaryKey: true,
  isAutoIncrement: true
})
id: number;

// Required string field
@Column({ dataType: DataTypes.STRING, isNullable: false })
name: string;

// Unique email with custom column name
@Column({
  dataType: DataTypes.STRING,
  field: 'email_address',
  isUnique: true,
  isNullable: false
})
email: string;

// Field with default value
@Column({
  dataType: DataTypes.INTEGER,
  defaultValue: 0
})
age: number;

// String with length
@Column({ dataType: DataTypes.STRING({ length: 100 }) })
description: string;
```

## Relationship Decorators

### @HasMany Decorator

Defines a one-to-many relationship (one parent has many children).

**Parameters:**

- `target: () => typeof Model` - Function returning the related model class
- `options?: RelationOptions` - Relationship configuration

**Example:**

```typescript
@Table({ tableName: 'users' })
class User extends Model<User> {
  @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
  id: number;

  @HasMany(() => Order, {
    relation: [
      {
        foreignKey: 'userId', // Column in Order table
        sourceKey: 'id', // Column in User table
      },
    ],
  })
  orders: Order[];
}

@Table({ tableName: 'orders' })
class Order extends Model<Order> {
  @Column({ dataType: DataTypes.INTEGER })
  userId: number;
}
```

### @HasOne Decorator

Defines a one-to-one relationship.

**Example:**

```typescript
@Table({ tableName: 'users' })
class User extends Model<User> {
  @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
  id: number;

  @HasOne(() => Profile, {
    relation: [
      {
        foreignKey: 'userId', // Column in Profile table
        sourceKey: 'id', // Column in User table
      },
    ],
  })
  profile: Profile;
}

@Table({ tableName: 'profiles' })
class Profile extends Model<Profile> {
  @Column({ dataType: DataTypes.INTEGER })
  userId: number;
}
```

### @BelongsTo Decorator

Defines a many-to-one relationship (inverse of HasMany).

**Example:**

```typescript
@Table({ tableName: 'orders' })
class Order extends Model<Order> {
  @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
  id: number;

  @Column({ dataType: DataTypes.INTEGER })
  userId: number;

  @BelongsTo(() => User, {
    relation: [
      {
        foreignKey: 'id', // Column in User table
        sourceKey: 'userId', // Column in Order table
      },
    ],
  })
  user: User;
}
```

## Special Case: Webpack and Circular Dependencies

When using this framework with bundlers like Webpack (e.g., in Next.js), you need to handle circular dependencies between models carefully.

**Use Lazy Require and Type Import:**

```typescript
// ❌ DON'T: Direct import causes circular dependency issues
import { Department } from './department';

@Table({ tableName: 'users' })
export class User extends Model<User> {
  @BelongsTo(() => Department, { ... })
  department: Department;
}

// ✅ DO: Use type import and lazy require
import type { Department } from './department';

@Table({ tableName: 'users' })
export class User extends Model<User> {
  @BelongsTo(() => require('./department').Department, {
    relation: [{ foreignKey: 'id', sourceKey: 'departmentId' }]
  })
  department: Department;  // Type-only reference
}
```

**Why?**

- `import type` only imports the type information (removed at runtime)
- `() => require('./department').Department` lazily loads the actual class only when needed
- This prevents circular dependency issues during bundling

## Next Steps

- [Configure your DataSource](./datasource.md)
- [Learn about integration options](./integration.md)
- [Explore OData querying](./querying.md)
