# Performance Best Practices

Optimize query execution and response times.

## Connection Pooling

Connection pooling reuses database connections instead of creating new ones per query.

**Impact:**

- Without pooling: 1000-1500ms per query
- With pooling: 85-110ms per query (10-15x faster)

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
    min: 2, // Minimum connections
    idle: 10000, // Close idle after 10s
    acquire: 30000, // Wait up to 30s for connection
    evict: 1000, // Check idle every 1s
  },
  models: [User, Order],
});
```

| Setting   | Recommended | Description                 |
| --------- | ----------- | --------------------------- |
| `max`     | 5-20        | Based on concurrent users   |
| `min`     | 1-5         | Keep connections ready      |
| `idle`    | 10000       | Close idle after 10 seconds |
| `acquire` | 30000       | Wait timeout for connection |

## Use $select

Only request needed fields:

```
# Slow - fetches all columns
GET /users

# Fast - fetches only needed columns
GET /users?$select=id,name,email
```

## Database Indexes

Index columns used in `$filter` and `$orderby`:

```sql
-- Frequently filtered columns
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_email ON users(email);

-- Foreign keys
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Sorted columns
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Composite index for common filter combinations
CREATE INDEX idx_users_status_created ON users(status, created_at);
```

## Limit $expand Depth

Nested expansions increase query complexity:

```
# Avoid - too many levels
GET /departments?$expand=users($expand=orders($expand=items($expand=product)))

# Better - limit to 2-3 levels
GET /departments?$expand=users($expand=orders)
```

## Filter Expanded Relations

Reduce data by filtering expansions:

```
GET /users?$expand=orders($filter=status eq 'pending';$top=10;$select=id,total)
```

## Pagination

Always paginate large datasets:

```
GET /products?$top=20&$skip=0&$orderby=createdAt desc
```

Configure defaults:

```typescript
new ExpressRouter(app, {
  controllers: [productController],
  dataSource,
  queryOptions: {
    defaultTop: 20,
    maxTop: 1000,
  },
});
```

## Monitor Slow Queries

Enable execution time logging:

```typescript
new ExpressRouter(app, {
  controllers: [userController],
  dataSource,
  logger: {
    enabled: true,
    advancedOptions: {
      logDbExecutionTime: true,
      logSqlQuery: true,
    },
  },
});
```

Investigate queries over 500ms.

## Reuse Instances (Serverless)

In serverless environments, reuse DataSource and Router:

```typescript
let router: OpenRouter;

export function getRouter() {
  if (router) return router;

  const dataSource = new DataSource({
    /* config */
  });
  router = new OpenRouter({ dataSource });
  return router;
}
```

## Checklist

- [ ] Connection pooling configured
- [ ] `$select` used in queries
- [ ] Database indexes on filtered/sorted columns
- [ ] `$expand` depth limited
- [ ] Pagination enforced
- [ ] Query execution times monitored
