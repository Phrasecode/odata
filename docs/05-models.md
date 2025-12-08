---
sidebar_position: 5
---

# Model

Models are the core of the framework. They define your data structure and how it maps to database tables.

## Model Types

The framework provides two model types:

| Model Type            | Use Case             | Database Mapping            |
| --------------------- | -------------------- | --------------------------- |
| `Model<T>`            | Standard entities    | Maps to database table      |
| `QueryModel<T>` | Custom query results | No database table (virtual) |

## Model Class

All standard models must extend the `Model<T>` base class:

```typescript
import { Model, Table, Column, DataTypes } from '@phrasecode/odata';

@Table({ tableName: 'users', underscored: true })
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

Defines table-level metadata for your model. This decorator configures how your TypeScript class maps to a database table.

**All Options:**

| Option        | Type      | Default    | Description                                                 |
| ------------- | --------- | ---------- | ----------------------------------------------------------- |
| `tableName`   | `string`  | Class name | Custom table name in the database                           |
| `underscored` | `boolean` | `false`    | Convert camelCase property names to snake_case column names |

**Examples:**

```typescript
// Basic usage - uses class name as table name
@Table()
class Product extends Model<Product> {}
// Table name: "Product"

// With custom table name
@Table({ tableName: 'products' })
class Product extends Model<Product> {}
// Table name: "products"

// With underscored columns
@Table({ tableName: 'users', underscored: true })
class User extends Model<User> {
  @Column({ dataType: DataTypes.STRING })
  firstName: string; // Column name: "first_name"

  @Column({ dataType: DataTypes.STRING })
  lastName: string; // Column name: "last_name"
}
```

### @Column Decorator

Defines column-level metadata for model properties. This decorator configures how a TypeScript property maps to a database column.

**All Options:**

| Option            | Type        | Default       | Description                              |
| ----------------- | ----------- | ------------- | ---------------------------------------- |
| `dataType`        | `IDataType` | **Required**  | Sequelize data type for the column       |
| `field`           | `string`    | Property name | Custom column name in the database       |
| `isPrimaryKey`    | `boolean`   | `false`       | Mark this column as the primary key      |
| `isAutoIncrement` | `boolean`   | `false`       | Auto-increment for numeric primary keys  |
| `isNullable`      | `boolean`   | `true`        | Allow NULL values in this column         |
| `isUnique`        | `boolean`   | `false`       | Enforce unique constraint on this column |
| `defaultValue`    | `any`       | `undefined`   | Default value for the column             |

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

// Decimal with precision
@Column({
  dataType: DataTypes.DECIMAL({ precision: 10, scale: 2 }),
  defaultValue: 0.00
})
price: number;

// Boolean with default
@Column({
  dataType: DataTypes.BOOLEAN,
  defaultValue: true
})
isActive: boolean;

// Date field
@Column({ dataType: DataTypes.DATE })
createdAt: Date;

// Text field for long content
@Column({ dataType: DataTypes.TEXT })
content: string;
```

## Separating Database Names from Model Names

One of the most powerful features is the ability to use different names for your TypeScript models/properties and your actual database tables/columns. This is essential when:

- Working with legacy databases with non-standard naming conventions
- Following different naming conventions in code vs database
- Dealing with reserved keywords or special characters in database names

### Table Name Mapping

Use the `tableName` option in `@Table` to specify a different database table name:

```typescript
// Model class name: "User"
// Database table name: "tbl_users"
@Table({ tableName: 'tbl_users' })
export class User extends Model<User> {
  @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
  id: number;
}
```

**OData Endpoint:** `/User` (uses model class name)
**Database Query:** `SELECT * FROM tbl_users` (uses tableName)

### Column Name Mapping

Use the `field` option in `@Column` to specify a different database column name:

```typescript
@Table({ tableName: 'users' })
export class User extends Model<User> {
  // Property: "id", Column: "user_id"
  @Column({
    dataType: DataTypes.INTEGER,
    field: 'user_id',
    isPrimaryKey: true,
  })
  id: number;

  // Property: "firstName", Column: "first_name"
  @Column({
    dataType: DataTypes.STRING,
    field: 'first_name',
  })
  firstName: string;
}
```

**OData Query:** `GET /User?$select=id,firstName`
**Database Query:** `SELECT user_id, first_name FROM users`

### Automatic snake_case Conversion

Instead of manually specifying `field` for each column, use `underscored: true`:

```typescript
@Table({ tableName: 'users', underscored: true })
export class User extends Model<User> {
  @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
  userId: number; // Column: "user_id"

  @Column({ dataType: DataTypes.STRING })
  firstName: string; // Column: "first_name"

  @Column({ dataType: DataTypes.STRING })
  emailAddress: string; // Column: "email_address"
}
```

All camelCase properties are automatically converted to snake_case columns.

### Combining Both Approaches

You can mix `underscored: true` with explicit `field` mappings:

```typescript
@Table({ tableName: 'user_accounts', underscored: true })
export class User extends Model<User> {
  // Explicit mapping overrides underscored
  @Column({
    dataType: DataTypes.INTEGER,
    field: 'pk_user_id',
    isPrimaryKey: true,
  })
  id: number;

  // Uses underscored: firstName -> first_name
  @Column({ dataType: DataTypes.STRING })
  firstName: string;

  // Uses underscored: lastName -> last_name
  @Column({ dataType: DataTypes.STRING })
  lastName: string;

  // Explicit mapping for special case
  @Column({
    dataType: DataTypes.STRING,
    field: 'email_addr',
  })
  email: string;
}
```

## Relationship Decorators

These decorators define relationships between models, similar to Sequelize's association methods (`hasOne`, `hasMany`, `belongsTo`). The core concept is the same — defining how tables relate to each other — but the syntax uses decorators and a unified `relation` configuration.

### Understanding the `relation` Configuration

The `relation` option uses an array of key mappings. Each mapping has:

| Property     | Description                                                           |
| ------------ | --------------------------------------------------------------------- |
| `foreignKey` | The column in the **target/related** model that references the source |
| `sourceKey`  | The column in the **current** model that is being referenced          |

---

### @HasMany Decorator

Defines a **one-to-many** relationship where the current model (parent) has multiple related records in another model (children).

**When to use:** When one record can have many related records. Example: A User has many Orders.

**Database perspective:** The foreign key lives in the **child** table (Order), pointing back to the parent (User).

```
┌─────────────┐         ┌─────────────┐
│    User     │         │    Order    │
├─────────────┤         ├─────────────┤
│ id (PK)     │◄────────│ userId (FK) │
│ name        │         │ id (PK)     │
│ email       │         │ total       │
└─────────────┘         └─────────────┘
     1                        Many
```

**Example:**

```typescript
@Table({ tableName: 'users' })
class User extends Model<User> {
  @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
  id: number;

  @Column({ dataType: DataTypes.STRING })
  name: string;

  // One User has many Orders
  @HasMany(() => Order, {
    relation: [
      {
        foreignKey: 'userId', // Column in Order table that references User
        sourceKey: 'id', // Column in User table being referenced
      },
    ],
  })
  orders: Order[];
}
```

**OData Query:**

```bash
GET /User?$expand=orders
# Returns users with their orders nested
```

---

### @HasOne Decorator

Defines a **one-to-one** relationship where the current model has exactly one related record in another model.

**When to use:** When one record has exactly one related record. Example: A User has one Profile.

**Database perspective:** The foreign key lives in the **related** table (Profile), pointing back to the source (User). This is similar to `@HasMany` but expects only one record.

```
┌─────────────┐         ┌─────────────┐
│    User     │         │   Profile   │
├─────────────┤         ├─────────────┤
│ id (PK)     │◄────────│ userId (FK) │
│ name        │         │ id (PK)     │
│ email       │         │ bio         │
└─────────────┘         │ avatar      │
     1                  └─────────────┘
                              1
```

**Example:**

```typescript
@Table({ tableName: 'users' })
class User extends Model<User> {
  @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
  id: number;

  @Column({ dataType: DataTypes.STRING })
  name: string;

  // One User has one Profile
  @HasOne(() => Profile, {
    relation: [
      {
        foreignKey: 'userId', // Column in Profile table that references User
        sourceKey: 'id', // Column in User table being referenced
      },
    ],
  })
  profile: Profile;
}

@Table({ tableName: 'profiles' })
class Profile extends Model<Profile> {
  @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
  id: number;

  @Column({ dataType: DataTypes.INTEGER })
  userId: number; // Foreign key column

  @Column({ dataType: DataTypes.TEXT })
  bio: string;
}
```

**OData Query:**

```bash
GET /User?$expand=profile
# Returns users with their profile nested
```

---

### @BelongsTo Decorator

Defines the **inverse** side of a relationship — the model that holds the foreign key. This is the "child" perspective of `@HasMany` or `@HasOne`.

**When to use:** When the current model contains a foreign key column that references another model. Example: An Order belongs to a User.

**Database perspective:** The foreign key lives in the **current** table (Order), pointing to the related table (User).

```
┌─────────────┐         ┌─────────────┐
│    Order    │         │    User     │
├─────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)     │
│ userId (FK) │────────►│ name        │
│ total       │         │ email       │
└─────────────┘         └─────────────┘
     Many                     1
```

**Important:** In `@BelongsTo`, the key mapping perspective is different:

- `sourceKey` = the foreign key column in the **current** model
- `foreignKey` = the primary key column in the **related** model

**Example:**

```typescript
@Table({ tableName: 'orders' })
class Order extends Model<Order> {
  @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
  id: number;

  @Column({ dataType: DataTypes.INTEGER })
  userId: number; // This is the foreign key column

  @Column({ dataType: DataTypes.DECIMAL({ precision: 10, scale: 2 }) })
  total: number;

  // Order belongs to User
  @BelongsTo(() => User, {
    relation: [
      {
        foreignKey: 'id', // Primary key in User table
        sourceKey: 'userId', // Foreign key in Order table (current model)
      },
    ],
  })
  user: User;
}
```

**OData Query:**

```bash
GET /Order?$expand=user
# Returns orders with their user nested
```

---

### Complete Bidirectional Relationship Example

For a complete relationship, you typically define both sides:

```typescript
// Parent model
@Table({ tableName: 'users' })
class User extends Model<User> {
  @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
  id: number;

  @Column({ dataType: DataTypes.STRING })
  name: string;

  // User side: "I have many orders"
  @HasMany(() => Order, {
    relation: [{ foreignKey: 'userId', sourceKey: 'id' }],
  })
  orders: Order[];
}

// Child model
@Table({ tableName: 'orders' })
class Order extends Model<Order> {
  @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
  id: number;

  @Column({ dataType: DataTypes.INTEGER })
  userId: number;

  @Column({ dataType: DataTypes.DECIMAL({ precision: 10, scale: 2 }) })
  total: number;

  // Order side: "I belong to a user"
  @BelongsTo(() => User, {
    relation: [{ foreignKey: 'id', sourceKey: 'userId' }],
  })
  user: User;
}
```

This allows OData queries from both directions:

```bash
# Get users with their orders
GET /User?$expand=orders

# Get orders with their user
GET /Order?$expand=user
```

---

### Quick Reference: Decorator Comparison

| Decorator    | Relationship Type | FK Location      | Use Case                 |
| ------------ | ----------------- | ---------------- | ------------------------ |
| `@HasMany`   | One-to-Many       | In related model | Parent has many children |
| `@HasOne`    | One-to-One        | In related model | Parent has one child     |
| `@BelongsTo` | Many-to-One       | In current model | Child references parent  |

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

## QueryModel

`QueryModel` is a special model type for representing results from custom SQL queries. Unlike regular models, QueryModels are **not mapped to database tables** — they only define the shape of query results.

### When to Use

- Your query joins multiple tables
- The result shape doesn't match any single table
- You need type safety for raw SQL query results

### Basic Usage

```typescript
import { QueryModel, Table, Column, DataTypes } from '@phrasecode/odata';

@Table({ underscored: true })
export class UserStats extends QueryModel<UserStats> {
  @Column({ dataType: DataTypes.INTEGER })
  userId!: number;

  @Column({ dataType: DataTypes.STRING })
  username!: string;

  @Column({ dataType: DataTypes.STRING })
  departmentName!: string;

  @Column({ dataType: DataTypes.INTEGER })
  orderCount!: number;
}
```

Register with DataSource like regular models:

```typescript
const dataSource = new DataSource({
  models: [
    User, // Regular model - table created
    Order, // Regular model - table created
    UserStats, // QueryModel - NO table created
  ],
});
```

📖 **[Learn more about Custom Queries](./15-custom-queries.md)**
