# Security Best Practices

Protect your API and data with these security practices.

## Environment Variables

Never hardcode credentials. Use environment variables:

```typescript
const dataSource = new DataSource({
  dialect: process.env.DB_DIALECT as any,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.DB_SSL === 'true',
  models: [User, Order],
});
```

```env
# .env file
DB_DIALECT=postgres
DB_NAME=mydb
DB_USER=user
DB_PASSWORD=secure_password
DB_HOST=localhost
DB_PORT=5432
DB_SSL=true
```

**Important:** Add `.env` to `.gitignore`.

## SSL Database Connections

Enable SSL for production databases:

```typescript
const dataSource = new DataSource({
  dialect: 'postgres',
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: 5432,
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
    },
  },
  models: [User, Order],
});
```

## Checklist

- [ ] Credentials stored in environment variables
- [ ] `.env` added to `.gitignore`
- [ ] HTTP methods restricted per endpoint
- [ ] Sensitive fields filtered from responses
- [ ] SSL enabled for database connections
- [ ] Pagination limits enforced
- [ ] Express middleware for authentication (if needed)
