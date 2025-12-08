# Circular Dependencies

Circular dependencies occur when two or more modules depend on each other, creating a loop. This is common with bidirectional model relationships and can cause issues in bundled environments like Webpack (Next.js, etc.).

## The Problem

When you have models that reference each other:

```typescript
// user.ts
import { Department } from './department';

@Table({ tableName: 'users' })
export class User extends Model<User> {
  @BelongsTo(() => Department, { ... })
  department: Department;
}

// department.ts
import { User } from './user';

@Table({ tableName: 'departments' })
export class Department extends Model<Department> {
  @HasMany(() => User, { ... })
  users: User[];
}
```

This creates a circular dependency: `User → Department → User`.

## Symptoms

- `TypeError: Cannot read property 'name' of undefined`
- `ReferenceError: Cannot access 'User' before initialization`
- Empty or undefined model references
- Build errors in Webpack/bundlers
- Runtime errors only in production builds

## Solution: Lazy Require with Type Import

Use `import type` for TypeScript types and lazy `require()` for runtime references:

```typescript
// user.ts
import type { Department } from './department'; // Type-only import

@Table({ tableName: 'users' })
export class User extends Model<User> {
  @Column({ dataType: DataTypes.INTEGER })
  departmentId: number;

  @BelongsTo(() => require('./department').Department, {
    relation: [{ foreignKey: 'id', sourceKey: 'departmentId' }],
  })
  department: Department; // Type reference only
}
```

```typescript
// department.ts
import type { User } from './user'; // Type-only import

@Table({ tableName: 'departments' })
export class Department extends Model<Department> {
  @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
  id: number;

  @HasMany(() => require('./user').User, {
    relation: [{ foreignKey: 'departmentId', sourceKey: 'id' }],
  })
  users: User[]; // Type reference only
}
```

## Why This Works

1. **`import type`** - Only imports TypeScript type information, removed at compile time. No runtime dependency created.

2. **`() => require('./module').Class`** - Defers the actual module loading until the decorator is evaluated, after all modules are initialized.


## Index File Pattern

Create an index file to export all models:

```typescript
// models/index.ts
export { User } from './user';
export { Department } from './department';
export { Order } from './order';
```

Import from the index in your application code:

```typescript
// app.ts
import { User, Department, Order } from './models';

const dataSource = new DataSource({
  // ... config
  models: [User, Department, Order],
});
```

## When to Use This Pattern

Use lazy require when:

- Models have bidirectional relationships
- Using Webpack, Next.js, or other bundlers
- Experiencing circular dependency errors
- Building for production with tree-shaking