---
sidebar_position: 1
---

# Express.js Getting Started Guide

Complete guide to building OData APIs with Express.js using the **ExpressRouter** solution.

## Overview

The **ExpressRouter** provides a fully-managed solution for Express.js applications. It automatically:

- ✅ Registers all OData endpoints based on your controllers
- ✅ Sets up the `$metadata` endpoint for API discovery
- ✅ Handles request parsing and response formatting
- ✅ Manages error handling and logging
- ✅ Supports custom controllers with business logic

## Prerequisites

- Node.js 16+ installed
- Basic knowledge of Express.js and TypeScript
- Database server running (PostgreSQL, MySQL, SQLite, etc.)

## Installation

### 1. Install the package

```bash
npm install @phrasecode/odata
```

### 2. Install Express.js and TypeScript dependencies

```bash
npm install express
npm install -D @types/express @types/node typescript ts-node
```

### 3. Install your database driver

Choose one based on your database:

```bash
# PostgreSQL
npm install pg pg-hstore

# MySQL
npm install mysql2

# SQLite
npm install sqlite3
```

**_See the [Installation Guide](../02-installation.md) for details._**

## Step-by-Step Setup

### Step 1: Define Your Models

Create your data models using decorators. Models define your database schema and relationships.

**models/user.ts:**

```typescript
import { Model, Table, Column, DataTypes, HasMany } from '@phrasecode/odata';
import { Post } from './post';

@Table({ tableName: 'users' })
export class User extends Model<User> {
  @Column({
    dataType: DataTypes.INTEGER,
    isPrimaryKey: true,
    isAutoIncrement: true,
  })
  id!: number;

  @Column({
    dataType: DataTypes.STRING,
    isNullable: false,
  })
  name!: string;

  @Column({
    dataType: DataTypes.STRING,
    isNullable: false,
  })
  email!: string;

  @Column({
    dataType: DataTypes.INTEGER,
    isNullable: true,
  })
  age!: number;

  // Define one-to-many relationship
  @HasMany(() => Post, {
    relation: [
      {
        foreignKey: 'userId',
        sourceKey: 'id',
      },
    ],
  })
  posts!: Post[];
}
```

**models/order.ts:**

```typescript
import { Model, Table, Column, DataTypes, BelongsTo } from '@phrasecode/odata';
import { User } from './user';

@Table({ tableName: 'posts' })
export class Post extends Model<Post> {
  @Column({
    dataType: DataTypes.INTEGER,
    isPrimaryKey: true,
    isAutoIncrement: true,
  })
  id!: number;

  @Column({
    dataType: DataTypes.STRING,
    isNullable: false,
  })
  title!: string;

  @Column({
    dataType: DataTypes.TEXT,
    isNullable: true,
  })
  content!: string;

  @Column({
    dataType: DataTypes.INTEGER,
    isNullable: false,
  })
  userId!: number;

  @Column({
    dataType: DataTypes.DATE,
    isNullable: true,
  })
  publishedAt!: Date;

  // Define many-to-one relationship
  @BelongsTo(() => User, {
    relation: [
      {
        foreignKey: 'id',
        sourceKey: 'userId',
      },
    ],
  })
  user!: User;
}
```

📖 **[Learn more about Models](../05-models.md)**

### Step 2: Create Controllers

Controllers define which HTTP methods are allowed and can include custom business logic.

**controllers/user.controller.ts:**

```typescript
import { ODataControler, QueryParser } from '@phrasecode/odata';
import { User } from '../models/user';

export class UserController extends ODataControler {
  constructor() {
    super({
      model: User,
      allowedMethod: ['get'], // Only allow GET requests
    });
  }

  // Optional: Override to add custom logic
  public async get(query: QueryParser) {
    // Add custom business logic here if needed
    const result = await this.queryable<User>(query);
    return result;
  }
}
```

**controllers/order.controller.ts:**

```typescript
import { ODataControler, QueryParser } from '@phrasecode/odata';
import { Order } from '../models/order';

export class OrderController extends ODataControler {
  constructor() {
    super({
      model: Order,
      allowedMethod: ['get'],
    });
  }

  // Example: Custom logic to limit results
  public async get(query: QueryParser) {
    const params = query.getParams();

    // Force a maximum of 100 results
    if (!params.top || params.top > 100) {
      query.setTop(100);
    }

    const result = await this.queryable<Order>(query);
    return result;
  }
}
```

📖 **[Learn more about Controller](../07-controller.md)**

### Step 3: Configure DataSource

Create a DataSource to manage your database connection and register all models.

**db-setup.ts:**

```typescript
import { DataSource } from '@phrasecode/odata';
import { User } from './models/user';
import { Order } from './models/order';

export const dataSource = new DataSource({
  dialect: 'postgres', // or 'mysql', 'sqlite', 'mariadb', 'mssql', 'oracal'
  database: process.env.DB_NAME || 'mydb',
  username: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),

  // Connection pooling (CRITICAL for production!)
  pool: {
    max: 10, // Maximum connections
    min: 2, // Minimum connections
    idle: 10000, // Close idle connections after 10s
    acquire: 30000, // Wait up to 30s for a connection
  },

  schema: 'public',
  ssl: process.env.NODE_ENV === 'production',

  // Register all your models
  models: [User, Order],
});
```

📖 **[Learn more about DataSource Configuration](../06-datasource.md)**

### Step 4: Set Up Express Server

Create your Express server and initialize the ExpressRouter.

**server.ts:**

```typescript
import express from 'express';
import cors from 'cors';
import { ExpressRouter } from '@phrasecode/odata';
import { dataSource } from './db-setup';
import { UserController } from './controllers/user.controller';
import { OrderController } from './controllers/order.controller';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Initialize controllers
const userController = new UserController();
const orderController = new OrderController();

// Set up OData router
new ExpressRouter(app, {
  controllers: [userController, orderController],
  dataSource,
  // Optional: Configure endpoint naming convention
  // endpointNamingConvention: EndpointNamingConvention.KEBAB_CASE,
  logger: {
    enabled: true,
    logLevel: 'INFO',
    format: 'JSON',
    advancedOptions: {
      logSqlQuery: true,
      logDbExecutionTime: true,
      logDbQueryParameters: false,
    },
  },
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
```

### Step 5: Run Your Server

```bash
# Development
npx ts-node server.ts

# Or with nodemon for auto-reload
npx nodemon --exec ts-node server.ts
```

## Available Endpoints

Once your server is running, you'll have these endpoints automatically:

### Metadata Endpoint

```
GET http://localhost:3000/$metadata
```

Returns the complete schema of all your entities.

### Entity Endpoints

```
GET http://localhost:3000/User
GET http://localhost:3000/Order
```

## Example Queries

### Basic Queries

```bash
# Get all users
curl http://localhost:3000/User

# Select specific fields
curl http://localhost:3000/User?$select=name,email

# Filter by condition
curl http://localhost:3000/User?$filter=age gt 18

# Sort results
curl http://localhost:3000/User?$orderby=name asc

# Pagination
curl http://localhost:3000/User?$top=10&$skip=20
```

### Advanced Queries

```bash
# Expand relationships
curl http://localhost:3000/User?$expand=orders

# Complex filters
curl "http://localhost:3000/User?$filter=age gt 18 and status eq 'active'"

# Combine multiple options
curl "http://localhost:3000/User?$select=name,email&$filter=age gt 18&$expand=orders&$orderby=name asc&$top=20"

# Count results
curl http://localhost:3000/User?$count=true

# Filter on navigation properties
curl "http://localhost:3000/User?$filter=orders/\$count gt 5"
```

📖 **[Complete OData Query Guide](../10-querying/10-querying.md)**

## Custom Controller Logic

You can override controller methods to add custom business logic:

```typescript
export class UserController extends ODataControler {
  constructor() {
    super({
      model: User,
      allowedMethod: ['get'],
    });
  }

  public async get(query: QueryParser) {
    // Example 1: Add custom filters
    const params = query.getParams();

    // Only show active users
    if (!params.filter) {
      query.setFilter({
        logicalOperator: 'and',
        conditions: [
          {
            leftExpression: {
              type: 'field',
              field: {
                name: 'status',
                table: 'User',
              },
            },
            operator: 'eq',
            rightExpression: {
              type: 'literal',
              value: 'active',
            },
          },
        ],
      });
    }

    // Example 2: Modify select fields
    const currentSelect = params.select || [];
    query.setSelect([...currentSelect, { field: 'createdAt', table: 'User' }]);

    // Example 3: Enforce maximum results
    if (!params.top || params.top > 100) {
      query.setTop(100);
    }

    // Execute query
    const result = await this.queryable<User>(query);

    // Example 4: Post-process results
    result.data = result.data.map(user => ({
      ...user,
      displayName: `${user.name} (${user.email})`,
    }));

    return result;
  }
}
```

## Environment Variables

Create a `.env` file for configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mydb
DB_USER=user
DB_PASSWORD=password

# Server
PORT=3000
NODE_ENV=development
```

## Endpoint Naming Convention

Configure how endpoint paths are generated from model names:

```typescript
import { ExpressRouter, EndpointNamingConvention } from '@phrasecode/odata';

new ExpressRouter(app, {
  controllers: [userController, productController],
  dataSource,
  endpointNamingConvention: EndpointNamingConvention.KEBAB_CASE,
});
```

| Convention             | Model Name    | Endpoint        |
| ---------------------- | ------------- | --------------- |
| `AS_MODEL_NAME`        | `UserProfile` | `/UserProfile`  |
| `KEBAB_CASE` (default) | `UserProfile` | `/user-profile` |
| `LOWER_CASE`           | `UserProfile` | `/userprofile`  |

## Custom SQL Queries

For complex queries that OData can't express, use the `@Query` decorator:

```typescript
import { ODataControler, Custom, QueryControllerEvent, DataTypes } from '@phrasecode/odata';

export class UserController extends ODataControler {
  constructor() {
    super({ model: User, allowedMethod: ['get'] });
  }

  // Custom endpoint: GET /user/top-contributors?limit=10
  @Query({
    method: 'get',
    endpoint: '/top-contributors',
    parameters: [{ name: 'limit', type: DataTypes.INTEGER, defaultValue: 10 }],
  })
  public async getTopContributors(event: QueryControllerEvent) {
    return this.rawQueryable(
      `SELECT u.*, COUNT(p.id) as post_count 
       FROM users u 
       LEFT JOIN posts p ON p.user_id = u.id 
       GROUP BY u.id 
       ORDER BY post_count DESC 
       LIMIT $limit`,
      { limit: event.queryParams.limit },
    );
  }
}
```

📖 **[Learn more about Custom Queries](../15-custom-queries.md)**

## Production Considerations

### 1. Connection Pooling

Always configure connection pooling for production:

```typescript
pool: {
  max: 20,      // Increase for high traffic
  min: 5,       // Keep minimum connections ready
  idle: 10000,
  acquire: 30000,
  evict: 1000,
}
```

### 2. Logging

Adjust logging for production:

```typescript
logger: {
  enabled: true,
  logLevel: 'ERROR', // Only log errors in production
  format: 'JSON',
  advancedOptions: {
    logSqlQuery: false,        // Disable in production
    logDbExecutionTime: true,  // Keep for monitoring
    logDbQueryParameters: false,
  },
}
```
