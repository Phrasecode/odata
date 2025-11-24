# Best Practices

Follow these best practices to ensure optimal performance and maintainability.

## 1. Use Database Connection Pooling

Connection pooling is critical for production applications. It reuses database connections instead of creating new ones for each query, dramatically improving performance.

### Performance Impact

**Without connection pooling:**
- Query execution time: **1000ms - 1500ms**
- Reason: Each query creates a new database connection

**With connection pooling:**
- Query execution time: **85ms - 110ms**
- Improvement: **10-15x faster**

### Recommended Pool Configuration

```typescript
const dataSource = new DataSource({
  dialect: 'postgres',
  database: 'mydb',
  username: 'user',
  password: 'password',
  host: 'localhost',
  port: 5432,
  pool: {
    max: 10, // Maximum connections
    min: 2, // Minimum connections to maintain
    idle: 10000, // Close idle connections after 10 seconds
    acquire: 30000, // Wait up to 30 seconds for a connection
    evict: 1000, // Check for idle connections every 1 second
  },
  models: [User, Order, Department],
});
```

### Pool Configuration Guidelines

| Setting   | Recommended | Description                               |
| --------- | ----------- | ----------------------------------------- |
| `max`     | 5-20        | Based on concurrent users. Start with 10  |
| `min`     | 1-5         | Keep some connections ready. Start with 2 |
| `idle`    | 10000       | Close idle connections after 10 seconds   |
| `acquire` | 30000       | Wait up to 30 seconds for a connection    |
| `evict`   | 1000        | Check for idle connections every 1 second |

## 2. Enable Advanced Logging for Development

Use advanced logging options during development to monitor query performance:

```typescript
// Development configuration
if (process.env.NODE_ENV === 'development') {
  new ExpressRouter(app, {
    controllers: [userController],
    dataSource,
    logger: {
      enabled: true,
      logLevel: LOG_LEVELS.DEBUG,
      format: LOG_FORMATS.TEXT,
      advancedOptions: {
        logSqlQuery: true,
        logDbExecutionTime: true,
        logDbQueryParameters: true,
      },
    },
  });
}
```

## 3. Use Environment Variables for Configuration

Never hardcode sensitive information. Use environment variables:

```typescript
const dataSource = new DataSource({
  dialect: process.env.DB_DIALECT as any,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.DB_SSL === 'true',
  models: [User, Order, Department],
});
```

Create a `.env` file:

```
DB_DIALECT=postgres
DB_NAME=mydb
DB_USER=user
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_SSL=true
```

## 4. Optimize Queries with $select

Only request the fields you need to reduce data transfer and improve performance:

```
# ❌ DON'T: Fetch all fields
GET /User?$filter=age gt 18

# ✅ DO: Select only needed fields
GET /User?$filter=age gt 18&$select=id,name,email
```

## 5. Use Pagination for Large Datasets

Always use `$top` and `$skip` for large datasets:

```
# ✅ DO: Paginate results
GET /User?$top=20&$skip=0&$orderby=createdAt desc
GET /User?$top=20&$skip=20&$orderby=createdAt desc  // Page 2
```

## 6. Index Database Columns

Create indexes on columns frequently used in `$filter` and `$orderby`:

```sql
-- PostgreSQL example
CREATE INDEX idx_users_age ON users(age);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

## 7. Handle Circular Dependencies in Webpack

When using bundlers like Webpack (e.g., in Next.js), use lazy require for relationships:

```typescript
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

## 8. Limit Nested Expansions

While the framework supports 5+ levels of expansion, limit nesting for better performance:

```
# ❌ AVOID: Too many nested expansions
GET /Department?$expand=users($expand=notes($expand=category($expand=creator($expand=department))))

# ✅ DO: Limit to 2-3 levels
GET /Department?$expand=users($expand=notes)
```

## 9. Use Filters on Expanded Relations

Filter expanded relations to reduce data transfer:

```
# ✅ DO: Filter expanded relations
GET /User?$expand=notes($filter=isArchived eq false;$top=10)
GET /Department?$expand=users($filter=isActive eq true)
```

## 10. Monitor Query Execution Time

Enable `logDbExecutionTime` to identify slow queries:

```typescript
logger: {
  enabled: true,
  logLevel: LOG_LEVELS.INFO,
  advancedOptions: {
    logDbExecutionTime: true,
  },
}
```

Queries taking more than 500ms should be optimized with indexes or query restructuring.

## 11. Reuse DataSource and Router Instances

In serverless environments, reuse instances across invocations:

```typescript
let odataRouter: OpenRouter;

const initRouter = () => {
  if (odataRouter) return odataRouter;  // Reuse existing instance
  
  const dataSource = new DataSource({ /* config */ });
  odataRouter = new OpenRouter({ dataSource });
  return odataRouter;
};
```

## 12. Use Appropriate Data Types

Choose the right data types for your columns:

```typescript
// ✅ DO: Use appropriate types
@Column({ dataType: DataTypes.INTEGER })
age: number;

@Column({ dataType: DataTypes.STRING({ length: 255 }) })
email: string;

@Column({ dataType: DataTypes.DECIMAL({ precision: 10, scale: 2 }) })
price: number;

@Column({ dataType: DataTypes.BOOLEAN })
isActive: boolean;
```

## Next Steps

- [View real-world examples](./examples.md)
- [Learn about OData querying](./querying.md)
- [Configure logging](./logging.md)

