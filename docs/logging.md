# Logging Configuration

Configure logging to monitor database operations and query performance.

## Express Router Logging

```typescript
import {
  DataSource,
  ExpressRouter,
  ODataControler,
  LOG_LEVELS,
  LOG_FORMATS,
} from '@phrasecode/odata';

// Configure logging in ExpressRouter
new ExpressRouter(app, {
  controllers: [userController],
  dataSource,
  logger: {
    enabled: true,
    logLevel: LOG_LEVELS.INFO,
    format: LOG_FORMATS.JSON,
    advancedOptions: {
      logSqlQuery: true,
      logDbExecutionTime: true,
      logDbQueryParameters: true,
    },
  },
});
```

## Logger Configuration Options

### Basic Options

| Option     | Type    | Description                                    | Default |
| ---------- | ------- | ---------------------------------------------- | ------- |
| `enabled`  | boolean | Enable or disable logging                      | false   |
| `logLevel` | string  | Log level: ERROR, WARN, INFO, DEBUG            | INFO    |
| `format`   | string  | Log format: JSON, TEXT                         | TEXT    |

### Advanced Options

You can selectively enable logs for certain operations, even if your global log level is set to error or warn.

| Option                 | Type    | Description                                               | Default |
| ---------------------- | ------- | --------------------------------------------------------- | ------- |
| `logSqlQuery`          | boolean | Logs the actual SQL queries sent to the database          | false   |
| `logDbExecutionTime`   | boolean | Logs the time taken to execute each query in milliseconds | false   |
| `logDbQueryParameters` | boolean | Logs the parameters and bindings used in queries          | false   |

## Log Levels

```typescript
import { LOG_LEVELS } from '@phrasecode/odata';

LOG_LEVELS.ERROR  // Only errors
LOG_LEVELS.WARN   // Warnings and errors
LOG_LEVELS.INFO   // Info, warnings, and errors
LOG_LEVELS.DEBUG  // All logs including debug information
```

## Log Formats

```typescript
import { LOG_FORMATS } from '@phrasecode/odata';

LOG_FORMATS.JSON  // Structured JSON format
LOG_FORMATS.TEXT  // Human-readable text format
```

## Development Configuration

Enable detailed logging during development:

```typescript
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

## Production Configuration

Use minimal logging in production:

```typescript
if (process.env.NODE_ENV === 'production') {
  new ExpressRouter(app, {
    controllers: [userController],
    dataSource,
    logger: {
      enabled: true,
      logLevel: LOG_LEVELS.ERROR,
      format: LOG_FORMATS.JSON,
      advancedOptions: {
        logSqlQuery: false,
        logDbExecutionTime: true,
        logDbQueryParameters: false,
      },
    },
  });
}
```

## Example Log Output

### JSON Format

```json
{
  "level": "INFO",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "message": "Query executed successfully",
  "sql": "SELECT * FROM users WHERE age > 18",
  "executionTime": 85,
  "parameters": { "age": 18 }
}
```

### Text Format

```
[INFO] 2024-01-15 10:30:45 - Query executed successfully
SQL: SELECT * FROM users WHERE age > 18
Execution Time: 85ms
Parameters: { age: 18 }
```

## Monitoring Query Performance

Use `logDbExecutionTime` to identify slow queries:

```typescript
new ExpressRouter(app, {
  controllers: [userController],
  dataSource,
  logger: {
    enabled: true,
    logLevel: LOG_LEVELS.INFO,
    format: LOG_FORMATS.JSON,
    advancedOptions: {
      logSqlQuery: true,
      logDbExecutionTime: true,
      logDbQueryParameters: false,
    },
  },
});
```

This will log execution times for all queries, helping you identify performance bottlenecks.

## Next Steps

- [Review best practices](./best-practices.md)
- [View real-world examples](./examples.md)
- [Learn about OData querying](./querying.md)

