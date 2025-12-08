# Common Errors

This guide covers common errors you may encounter and how to resolve them.

## Error Response Format

All errors follow this structure:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Error Codes

| Code                    | Status | Description                        |
| ----------------------- | ------ | ---------------------------------- |
| `BAD_REQUEST_ERROR`     | 400    | Invalid query syntax or parameters |
| `VALIDATION_ERROR`      | 400    | Data validation failed             |
| `NOT_FOUND_ERROR`       | 404    | Resource or column not found       |
| `INTERNAL_SERVER_ERROR` | 500    | Server-side error                  |

---

## Query Errors

### Invalid OData Query Parameter

**Error:**

```json
{
  "error": "Invalid OData query parameter: $invalid. Valid parameters are: $select, $filter, $orderby, $expand, $skip, $top, $apply, $count, $compute",
  "code": "BAD_REQUEST_ERROR"
}
```

**Cause:** Using an unsupported query parameter.

**Solution:** Use only supported parameters: `$select`, `$filter`, `$orderby`, `$expand`, `$skip`, `$top`, `$count`.

---

### $top Exceeds Maximum

**Error:**

```json
{
  "error": "$top cannot exceed 1000, got: 5000",
  "code": "BAD_REQUEST_ERROR"
}
```

**Cause:** Requesting more records than allowed.

**Solution:** Use `$top` value of 1000 or less, or configure a higher `maxTop` in router options.

---

### Invalid $skip or $top Value

**Error:**

```json
{
  "error": "$skip must be a non-negative integer, got: -10",
  "code": "BAD_REQUEST_ERROR"
}
```

**Cause:** Negative or non-integer value for pagination.

**Solution:** Use non-negative integers for `$skip` and `$top`.

---

### Column Not Found

**Error:**

```json
{
  "error": "Controller [/users] query execution failed: Column 'invalidColumn' not found",
  "code": "NOT_FOUND_ERROR"
}
```

**Cause:** Referencing a column that doesn't exist in the model.

**Solution:** Check your model definition and use correct property names in `$select`, `$filter`, or `$orderby`.

```typescript
// Model definition
@Column({ dataType: DataTypes.STRING })
firstName: string;  // Use 'firstName', not 'first_name'
```

---

### Invalid Filter Syntax

**Error:**

```json
{
  "error": "Expected comparison operator",
  "code": "BAD_REQUEST_ERROR"
}
```

**Cause:** Malformed `$filter` expression.

**Solution:** Check filter syntax:

```
# Wrong
$filter=name John

# Correct
$filter=name eq 'John'
```

---

### Invalid Comparison Operator

**Error:**

```json
{
  "error": "Invalid comparison operator: equals",
  "code": "BAD_REQUEST_ERROR"
}
```

**Cause:** Using invalid operator name.

**Solution:** Use valid operators: `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `in`.

```
# Wrong
$filter=age equals 25

# Correct
$filter=age eq 25
```

---

### Unmatched Parenthesis

**Error:**

```json
{
  "error": "Unmatched parenthesis in expand clause: items($select=name",
  "code": "BAD_REQUEST_ERROR"
}
```

**Cause:** Missing closing parenthesis in query.

**Solution:** Ensure all parentheses are balanced:

```
# Wrong
$expand=items($select=name

# Correct
$expand=items($select=name)
```

---

## Database Errors

### Connection Failed

**Error:**

```
SequelizeConnectionError: connect ECONNREFUSED 127.0.0.1:5432
```

**Cause:** Cannot connect to database.

**Solution:**

1. Verify database is running
2. Check host, port, and credentials
3. Ensure network connectivity

```typescript
const dataSource = new DataSource({
  host: 'localhost', // Verify host
  port: 5432, // Verify port
  database: 'mydb', // Verify database exists
  username: 'user', // Verify credentials
  password: 'password',
  dialect: 'postgres',
});
```

---

### Authentication Failed

**Error:**

```
SequelizeAccessDeniedError: Access denied for user 'user'@'localhost'
```

**Cause:** Invalid database credentials.

**Solution:** Verify username and password in your configuration.

---

### Database Does Not Exist

**Error:**

```
SequelizeDatabaseError: database "mydb" does not exist
```

**Cause:** Specified database doesn't exist.

**Solution:** Create the database or check the database name.

---

### Connection Pool Exhausted

**Error:**

```
SequelizeConnectionAcquireTimeoutError: Operation timeout
```

**Cause:** All connections in pool are in use.

**Solution:** Increase pool size or optimize queries:

```typescript
pool: {
  max: 20,        // Increase max connections
  acquire: 60000, // Increase acquire timeout
}
```

---

## Model Errors

### Table Not Found

**Error:**

```
SequelizeDatabaseError: relation "users" does not exist
```

**Cause:** Table doesn't exist in database.

**Solution:**

1. Create the table in your database
2. Verify `tableName` in `@Table` decorator matches actual table name

```typescript
@Table({ tableName: 'users' }) // Must match database table
export class User extends Model<User> {}
```

---

### Relation Not Found

**Error:**

```json
{
  "error": "Relation 'orders' not found on model 'User'",
  "code": "NOT_FOUND_ERROR"
}
```

**Cause:** Expanding a relation that isn't defined.

**Solution:** Define the relationship in your model:

```typescript
@HasMany(() => Order, {
  relation: [{ foreignKey: 'userId', sourceKey: 'id' }]
})
orders: Order[];
```

---

## Configuration Errors

### Missing Model Registration

**Error:**

```
Model 'User' is not registered with the DataSource
```

**Cause:** Model not included in DataSource configuration.

**Solution:** Add model to the `models` array:

```typescript
const dataSource = new DataSource({
  // ... other config
  models: [User, Order, Product], // Include all models
});
```

---

### Invalid Dialect

**Error:**

```
Error: The dialect postgres is not supported
```

**Cause:** Unsupported or misspelled dialect.

**Solution:** Use a supported dialect: `postgres`, `mysql`, `sqlite`, `mariadb`, `mssql`.

---

## Debugging Tips

### Enable Detailed Logging

```typescript
new ExpressRouter(app, {
  controllers: [userController],
  dataSource,
  logger: {
    enabled: true,
    logLevel: 'DEBUG',
    advancedOptions: {
      logSqlQuery: true,
      logDbExecutionTime: true,
      logDbQueryParameters: true,
    },
  },
});
```

### Check Generated SQL

Enable `logSqlQuery` to see the actual SQL being executed. This helps identify:

- Incorrect column names
- Missing joins
- Filter translation issues

### Validate Query Manually

Test your OData query step by step:

```
# Start simple
GET /users

# Add select
GET /users?$select=id,name

# Add filter
GET /users?$select=id,name&$filter=status eq 'active'

# Add expand
GET /users?$select=id,name&$filter=status eq 'active'&$expand=orders
```

---

## Getting Help

If you encounter an error not covered here:

1. Enable debug logging to get more details
2. Check the generated SQL query
3. Verify your model definitions match database schema
