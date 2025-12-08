---
sidebar_position: 6
---

# DataSource

The DataSource manages your database connection and registers all models.

## Basic Configuration

```typescript
import { DataSource } from '@phrasecode/odata';

const dataSource = new DataSource({
  dialect: 'postgres', // Database type: 'postgres' | 'mysql' | 'sqlite' | 'mariadb' | 'mssql' | 'oracle'
  database: 'mydb', // Database name
  username: 'user',
  password: 'password',
  host: 'localhost',
  port: 5432,
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
  schema: 'public', // Database schema
  ssl: true, // Enable SSL
  models: [User, Order, Product], // Array of model classes
});
```

## Configuration Options

### Database Connection

| Option     | Type    | Description                                                                   |
| ---------- | ------- | ----------------------------------------------------------------------------- |
| `dialect`  | string  | Type of database: `'postgres'`, `'mysql'`, `'sqlite'`, `'mariadb'`, `'mssql'`, `'oracle'` |
| `database` | string  | Name of the database                                                          |
| `username` | string  | Database username                                                             |
| `password` | string  | Database password                                                             |
| `host`     | string  | Database server hostname or IP                                                |
| `port`     | number  | Database port number                                                          |
| `schema`   | string  | Database schema name (optional)                                               |
| `ssl`      | boolean | Enable SSL connection (optional)                                              |
| `models`   | array   | Array of Model classes to register                                            |

### Connection Pool Configuration

Connection pooling is critical for production applications. It reuses database connections instead of creating new ones for each query.

| Option    | Type   | Description                                 | Recommended |
| --------- | ------ | ------------------------------------------- | ----------- |
| `max`     | number | Maximum number of connections               | 5-20        |
| `min`     | number | Minimum number of connections               | 1-5         |
| `idle`    | number | Maximum time (ms) a connection can be idle  | 10000       |
| `acquire` | number | Maximum time (ms) to wait for a connection  | 30000       |
| `evict`   | number | Interval (ms) to check for idle connections | 1000        |

**Example with connection pooling:**

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

## Database-Specific Examples

### PostgreSQL

```typescript
const dataSource = new DataSource({
  dialect: 'postgres',
  database: 'mydb',
  username: 'postgres',
  password: 'password',
  host: 'localhost',
  port: 5432,
  schema: 'public',
  ssl: true,
  models: [User, Order],
});
```

### MySQL

```typescript
const dataSource = new DataSource({
  dialect: 'mysql',
  database: 'mydb',
  username: 'root',
  password: 'password',
  host: 'localhost',
  port: 3306,
  models: [User, Order],
});
```

### SQLite

```typescript
const dataSource = new DataSource({
  dialect: 'sqlite',
  database: './database.sqlite',
  models: [User, Order],
});
```

### Microsoft SQL Server

```typescript
const dataSource = new DataSource({
  dialect: 'mssql',
  database: 'mydb',
  username: 'sa',
  password: 'password',
  host: 'localhost',
  port: 1433,
  models: [User, Order],
});
```
