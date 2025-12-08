# Production Best Practices

Deploy and operate OData APIs in production environments.

## Logging Configuration

Use structured JSON logging in production:

```typescript
new ExpressRouter(app, {
  controllers: [userController],
  dataSource,
  logger: {
    enabled: true,
    logLevel: 'INFO',
    format: 'JSON',
    advancedOptions: {
      logDbExecutionTime: true,
      logSqlQuery: false, // Disable in production
      logDbQueryParameters: false, // Disable in production
    },
  },
});
```

**Development vs Production:**

| Option                 | Development | Production |
| ---------------------- | ----------- | ---------- |
| `logLevel`             | INFO       | WARN/ERROR  |
| `format`               | STRING      | JSON       |
| `logSqlQuery`          | true        | false      |
| `logDbQueryParameters` | true        | false      |
| `logDbExecutionTime`   | true        | true       |

## Database Connection

### SSL Configuration

```typescript
const dataSource = new DataSource({
  dialect: 'postgres',
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
    },
  },
  pool: {
    max: 20,
    min: 5,
    idle: 10000,
    acquire: 30000,
  },
  models: [User, Order, Product],
});
```

### Pool Sizing

| Environment | max | min | Notes                          |
| ----------- | --- | --- | ------------------------------ |
| Development | 5   | 1   | Low traffic                    |
| Staging     | 10  | 2   | Moderate traffic               |
| Production  | 20  | 5   | High traffic, adjust as needed |

## Environment Configuration

```env
# .env.production
NODE_ENV=production
DB_DIALECT=postgres
DB_NAME=prod_db
DB_USER=prod_user
DB_PASSWORD=secure_password
DB_HOST=db.example.com
DB_PORT=5432
DB_SSL=true
DB_POOL_MAX=20
DB_POOL_MIN=5
```

```typescript
const dataSource = new DataSource({
  dialect: process.env.DB_DIALECT as any,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.DB_SSL === 'true',
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    idle: 10000,
    acquire: 30000,
  },
  models: [User, Order, Product],
});
```

## Query Limits

Enforce limits to prevent abuse:

```typescript
new ExpressRouter(app, {
  controllers: [userController],
  dataSource,
  queryOptions: {
    maxTop: 1000, // Maximum records per request
    defaultTop: 100, // Default if not specified
    defaultSkip: 0,
  },
});
```

## Error Handling

The framework returns structured errors:

```json
{
  "error": "Controller [/users] query execution failed: Column 'invalid' not found",
  "code": "NOT_FOUND_ERROR",
  "details": {}
}
```

Add Express error middleware for unhandled errors:

```typescript
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: 'Internal Server Error',
    code: 'INTERNAL_SERVER_ERROR',
  });
});
```

## Webpack/Bundler Configuration

Handle circular dependencies in bundled environments:

```typescript
import type { Department } from './department';

@Table({ tableName: 'users' })
export class User extends Model<User> {
  @BelongsTo(() => require('./department').Department, {
    relation: [{ foreignKey: 'id', sourceKey: 'departmentId' }],
  })
  department: Department;
}
```

## Checklist

- [ ] JSON logging enabled
- [ ] SQL query logging disabled
- [ ] SSL enabled for database
- [ ] Connection pool sized appropriately
- [ ] Query limits configured
- [ ] Error handling middleware added
- [ ] Health check endpoint available
- [ ] Environment variables for all config
