# Node OData Framework (TypeScript)

A powerful Node.js framework for building REST APIs with full OData v4 query capabilities. This framework provides a decorator-based approach to define models and automatically generates OData-compliant endpoints with advanced querying features.

## Why This Package?

Building REST APIs with complex querying capabilities can be time-consuming and error-prone. Traditional approaches require you to manually implement filtering, sorting, pagination, and relationship expansion for each endpoint. This package solves these problems by:

- **Eliminating Boilerplate**: Define your data models once using decorators, and get fully functional OData endpoints automatically
- **Type Safety**: Built with TypeScript from the ground up, providing excellent IntelliSense and compile-time type checking
- **Framework Flexibility**: Works with Express.js, Next.js, serverless functions, and any other Node.js framework
  - **OData v4 Compliance**: Supports standard OData query options ($filter, $select, $expand, $orderby, $top, $skip, $count) out of the box. Partial support for $apply and $compute is included.
- **Database Agnostic**: Currently supports PostgreSQL, MySQL, SQLite, and other Sequelize-compatible databases
- **Developer Experience**: Intuitive decorator-based API that feels natural to TypeScript developers

We created this package because existing OData solutions for Node.js were either too complex, lacked TypeScript support, or were tightly coupled to specific frameworks. Our goal was to provide a modern, flexible, and developer-friendly solution that works seamlessly across different Node.js environments.

## Features

- ✅ **Decorator-Based Model Definition**: Use TypeScript decorators (@Table, @Column, @HasMany, @HasOne, @BelongsTo) to define your data models
- ✅ **Full OData v4 Query Support**:
  - `$select` - Choose specific fields to return
  - `$filter` - Filter results with complex conditions
  - `$expand` - Include related entities (joins) with nested expansions (5+ levels)
  - `$orderby` - Sort results
  - `$top` - Limit number of results
  - `$skip` - Pagination support
  - `$count` - Get the total count of entities
- ✅ **Advanced Filter Capabilities**:
  - **Comparison Operators**: `eq`, `ne`, `gt`, `ge`, `lt`, `le`
  - **Logical Operators**: `and`, `or`, `not`
  - **Arithmetic Operators**: `add`, `sub`, `mul`, `div`, `mod` with parentheses support
  - **Navigation Property Count**: Filter by count of related entities (e.g., `notes/$count gt 5`)
  - **String Functions**: `contains`, `startswith`, `endswith`, `tolower`, `toupper`, `trim`, `length`, `indexof`, `concat`, `substring`
  - **Date/Time Functions**: `date`, `time`, `day`, `month`, `year`, `hour`, `minute`, `second`, `now`
  - **Math Functions**: `round`, `floor`, `ceiling`
  - **Type Functions**: `cast`
  - **Collection Operators**: `in`, `has` (for enum flags)
- ✅ **Powerful Expansion Features**:
  - Nested expansions (5+ levels deep)
  - Filters on expanded relations
  - Select specific fields from expanded relations
  - Order, top, and skip on expanded relations
  - Multiple expansions in a single query
- ✅ **Relationship Support**: Define one-to-many, one-to-one, and many-to-one relationships
- ✅ **Multiple Integration Options**:
  - Express.js Router (Option 1)
  - OpenRouter for Next.js, serverless, and any framework (Option 2)
- ✅ **OData Metadata Endpoint**: Automatic `$metadata` endpoint for API discovery and schema introspection
- ✅ **Type-Safe Query Results**: Full TypeScript support with proper type inference
- ✅ **Automatic Database Schema Mapping**: Supports underscored column names, custom table names, and timestamps
- ✅ **Webpack Compatible**: Special handling for circular dependencies in bundled environments

## Installation

```bash
npm install @phrasecode/odata
```

### Database Driver Installation

This package uses Sequelize as the ORM layer and requires you to install the appropriate database driver for your database. Install the driver(s) you need:

**PostgreSQL**

```bash
npm install pg pg-hstore
```

**MySQL**

```bash
npm install mysql2
```

**MariaDB**

```bash
npm install mariadb
```

**SQLite**

```bash
npm install sqlite3
```

**Microsoft SQL Server**

```bash
npm install tedious
```

**Oracle Database**

```bash
npm install oracledb
```

> **Note**: You only need to install the driver for the database you're using. The drivers are listed as optional peer dependencies, so npm will show warnings if they're not installed, but you can safely ignore warnings for databases you're not using.

## Quick Start

```typescript
import {
  Model,
  Table,
  Column,
  DataTypes,
  DataSource,
  ExpressRouter,
  ODataControler,
} from '@phrasecode/odata';
import express from 'express';

// Define a model
@Table({ tableName: 'users' })
class User extends Model<User> {
  @Column({
    dataType: DataTypes.INTEGER,
    isPrimaryKey: true,
    isAutoIncrement: true,
  })
  id: number;

  @Column({ dataType: DataTypes.STRING })
  name: string;

  @Column({ dataType: DataTypes.STRING })
  email: string;
}

// Create data source
const dataSource = new DataSource({
  dialect: 'postgres',
  database: 'mydb',
  username: 'user',
  password: 'password',
  host: 'localhost',
  port: 5432,
  models: [User],
});

// Set up Express router
const app = express();
const userController = new ODataControler({
  model: User,
  allowedMethod: ['get'],
});
new ExpressRouter(app, { controllers: [userController], dataSource });

app.listen(3000);
// Now you can query: GET http://localhost:3000/User?$select=name,email&$filter=name eq 'John'
// Metadata endpoint: GET http://localhost:3000/$metadata
```

## Serverless Deployments

### AWS Lambda with API Gateway

**handler.ts:**

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DataSource, OpenRouter } from '@phrasecode/odata';
import { User, Department } from './models';

let odataRouter: OpenRouter;

const initRouter = () => {
  if (odataRouter) return odataRouter;

  const dataSource = new DataSource({
    dialect: 'postgres',
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: true,
    models: [User, Department],
  });

  odataRouter = new OpenRouter({ dataSource });
  return odataRouter;
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const router = initRouter();
    const path = event.path.replace('/api/', '');
    const queryString = event.queryStringParameters
      ? '?' + new URLSearchParams(event.queryStringParameters).toString()
      : '';

    let result;

    if (path.startsWith('User')) {
      result = await router.queryble(User)(`${path}${queryString}`);
    } else if (path.startsWith('Department')) {
      result = await router.queryble(Department)(`${path}${queryString}`);
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Resource not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
```

**serverless.yml:**

```yaml
service: odata-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    DB_NAME: ${env:DB_NAME}
    DB_USER: ${env:DB_USER}
    DB_PASSWORD: ${env:DB_PASSWORD}
    DB_HOST: ${env:DB_HOST}
    DB_PORT: ${env:DB_PORT}

functions:
  odata:
    handler: handler.handler
    events:
      - http:
          path: api/{proxy+}
          method: ANY
          cors: true
    timeout: 30
    memorySize: 512

plugins:
  - serverless-offline
  - serverless-plugin-typescript
```

### Next.js API Routes (Catch-All)

**File Structure:**

```
pages/
└── api/
    └── odata/
        └── [...slug].ts  ← Catch-all route
```

**pages/api/odata/[...slug].ts:**

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { DataSource, OpenRouter } from '@phrasecode/odata';
import { User, Department, Order } from '@/models';

let odataRouter: OpenRouter;

const initRouter = () => {
  if (odataRouter) return odataRouter;

  const dataSource = new DataSource({
    dialect: 'postgres',
    database: process.env.DATABASE_URL!,
    models: [User, Department, Order],
  });

  odataRouter = new OpenRouter({ dataSource });
  return odataRouter;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const router = initRouter();

    // Get the entity name from slug
    const slug = req.query.slug as string[];
    const entityName = slug[0];

    // Build full URL with query params
    const queryString = new URLSearchParams(req.query as any).toString();
    const url = `/${slug.join('/')}${queryString ? '?' + queryString : ''}`;

    // Route to appropriate model
    let result;
    switch (entityName) {
      case 'User':
        result = await router.queryble(User)(url);
        break;
      case 'Department':
        result = await router.queryble(Department)(url);
        break;
      case 'Order':
        result = await router.queryble(Order)(url);
        break;
      default:
        res.status(404).json({ error: 'Resource not found' });
        return;
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error('OData error:', error);
    res.status(500).json({
      error: error.message || 'Internal Server Error',
    });
  }
}
```

## Defining Models

Models are the core of the framework. They define your data structure and how it maps to database tables.

### Model Class

All models must extend the `Model<T>` base class:

```typescript
import { Model, Table, Column, DataTypes } from '@phrasecode/odata';

@Table({ tableName: 'users', underscored: true, timestamps: true })
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

### Decorators

#### @Table Decorator

Defines table-level metadata for your model.

**Options:**

- `tableName?: string` - Custom table name (defaults to class name)
- `underscored?: boolean` - Convert camelCase properties to snake_case columns (default: false)

**Examples:**

```typescript
// Basic usage
@Table()
class Product extends Model<Product> {}

// With custom table name
@Table({ tableName: 'products' })
class Product extends Model<Product> {}

// With underscored columns and timestamps
@Table({ tableName: 'users', underscored: true })
class User extends Model<User> {}
```

#### @Column Decorator

Defines column-level metadata for model properties.

**Options:**

- `dataType: IDataType` - Data type (required)
- `field?: string` - Custom column name (defaults to property name)
- `isPrimaryKey?: boolean` - Mark as primary key (default: false)
- `isAutoIncrement?: boolean` - Auto-increment for numeric keys (default: false)
- `isNullable?: boolean` - Allow NULL values (default: true)
- `isUnique?: boolean` - Enforce unique constraint (default: false)
- `defaultValue?: any` - Default value for the column

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
```

#### @HasMany Decorator

Defines a one-to-many relationship (one parent has many children).

**Parameters:**

- `target: () => typeof Model` - Function returning the related model class
- `options?: RelationOptions` - Relationship configuration

**Example:**

```typescript
@Table({ tableName: 'users' })
class User extends Model<User> {
  @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
  id: number;

  @HasMany(() => Order, {
    relation: [
      {
        foreignKey: 'userId', // Column in Order table
        sourceKey: 'id', // Column in User table
      },
    ],
  })
  orders: Order[];
}

@Table({ tableName: 'orders' })
class Order extends Model<Order> {
  @Column({ dataType: DataTypes.INTEGER })
  userId: number;
}
```

#### @HasOne Decorator

Defines a one-to-one relationship.

**Example:**

```typescript
@Table({ tableName: 'users' })
class User extends Model<User> {
  @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
  id: number;

  @HasOne(() => Profile, {
    relation: [
      {
        foreignKey: 'userId', // Column in Profile table
        sourceKey: 'id', // Column in User table
      },
    ],
  })
  profile: Profile;
}

@Table({ tableName: 'profiles' })
class Profile extends Model<Profile> {
  @Column({ dataType: DataTypes.INTEGER })
  userId: number;
}
```

#### @BelongsTo Decorator

Defines a many-to-one relationship (inverse of HasMany).

**Example:**

```typescript
@Table({ tableName: 'orders' })
class Order extends Model<Order> {
  @Column({ dataType: DataTypes.INTEGER, isPrimaryKey: true })
  id: number;

  @Column({ dataType: DataTypes.INTEGER })
  userId: number;

  @BelongsTo(() => User, {
    relation: [
      {
        foreignKey: 'id', // Column in User table
        sourceKey: 'userId', // Column in Order table
      },
    ],
  })
  user: User;
}
```

### Special Case: Webpack and Circular Dependencies

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

## Defining DataSource

The DataSource manages your database connection and registers all models.

### Configuration

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

### Database Configuration Options

- `dialect`: Type of database (`'postgres'`, `'mysql'`, `'sqlite'`, `'mariadb'`, `'mssql'`)
- `database`: Name of the database
- `username`: Database username
- `password`: Database password
- `host`: Database server hostname or IP
- `port`: Database port number
- `pool`: Connection pool configuration
  - `max`: Maximum number of connections
  - `min`: Minimum number of connections
  - `idle`: Maximum time (ms) a connection can be idle
- `schema`: Database schema name
- `ssl`: Enable SSL connection
- `models`: Array of Model classes to register

## Integration Options

### Option 1: Express.js Router (Simple)

Best for traditional Express.js applications.

#### Setup

```typescript
import express from 'express';
import { DataSource, ExpressRouter, ODataControler } from '@phrasecode/odata';

const app = express();

// Create DataSource
const dataSource = new DataSource({
  dialect: 'postgres',
  database: 'mydb',
  username: 'user',
  password: 'password',
  host: 'localhost',
  port: 5432,
  models: [User, Order],
});

// Create Controllers
class UserController extends ODataControler {
  constructor() {
    super({
      model: User,
      allowedMethod: ['get'],
    });
  }

  // Override only if you need custom logic. Otherwise, don't override.
  public async get(query: QueryParser) {
    const users: User[] = await this.queryble<User>(query);
    return users;
  }
}

class OrderController extends ODataControler {
  constructor() {
    super({
      model: Order,
      allowedMethod: ['get'],
    });
  }

  public async get(query: QueryParser) {
    const data = query.getParams();
    query.setTop(10);
    query.setSelect([...data.select, { field: 'userId', table: 'CustomUser' }]);
    const orders: Order[] = await this.queryble<Order>(query);
    return orders;
  }
}

// Initialize Router
const userController = new UserController();
const orderController = new OrderController();

new ExpressRouter(app, {
  controllers: [userController, orderController],
  dataSource,
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

#### Endpoints

The router automatically creates endpoints based on your model names:

- `GET /User?$select=name&$filter=age gt 18`
- `GET /Order?$expand=user&$top=10`

### Option 2: OpenRouter (Advanced)

Best for Next.js, serverless functions, and any framework. Provides more flexibility and control.

#### Features

- ✅ Works with Next.js API routes
- ✅ Compatible with serverless functions (AWS Lambda, Vercel, Netlify)
- ✅ Framework-agnostic
- ✅ No automatic route registration (you control the endpoints)

#### Setup for Next.js

**1. Create DataSource initialization:**

```typescript
// lib/db-setup.ts
import { DataSource, OpenRouter } from '@phrasecode/odata';
import { User } from './models/user';
import { Department } from './models/department';

let odataRouter: OpenRouter;

export const initializeODataRouter = () => {
  if (odataRouter) {
    return odataRouter;
  }

  const dataSource = new DataSource({
    dialect: 'postgres',
    database: 'mydb',
    username: 'user',
    password: 'password',
    host: 'localhost',
    port: 5432,
    ssl: true,
    models: [User, Department],
  });

  odataRouter = new OpenRouter({ dataSource });
  return odataRouter;
};
```

**2. Create API routes:**

```typescript
// pages/api/users.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { initializeODataRouter } from '../../lib/db-setup';
import { User } from '../../models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const odataRouter = initializeODataRouter();
    const response = await odataRouter.queryble(User)(req.url);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
```

```typescript
// pages/api/departments.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { initializeODataRouter } from '../../lib/db-setup';
import { Department } from '../../models/department';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const odataRouter = initializeODataRouter();
    const response = await odataRouter.queryble(Department)(req.url);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
```

## Metadata Endpoint

The framework automatically provides an OData v4 compliant `$metadata` endpoint that describes all your entities, their properties, data types, and relationships. This endpoint is essential for OData clients to understand your API structure.

### Accessing Metadata

#### With Express Router

The `$metadata` endpoint is automatically registered when you use `ExpressRouter`:

```typescript
import express from 'express';
import { DataSource, ExpressRouter, ODataControler } from '@phrasecode/odata';

const app = express();
const dataSource = new DataSource({
  dialect: 'postgres',
  database: 'mydb',
  username: 'user',
  password: 'password',
  host: 'localhost',
  port: 5432,
  models: [User, Department, Order],
});

new ExpressRouter(app, {
  controllers: [userController, departmentController],
  dataSource,
});

app.listen(3000);

// Metadata is automatically available at:
// GET http://localhost:3000/$metadata
```

#### With OpenRouter (Next.js, Serverless)

For OpenRouter, you need to manually create a metadata endpoint:

```typescript
// pages/api/$metadata.ts (Next.js)
import { NextApiRequest, NextApiResponse } from 'next';
import { initializeODataRouter } from '../../lib/db-setup';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const odataRouter = initializeODataRouter();
    const metadata = odataRouter.getMetaData();
    res.status(200).json(metadata);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Now accessible at: GET /api/$metadata
```

**For serverless functions (AWS Lambda, Vercel, etc.):**

```typescript
// lambda/metadata.ts
import { OpenRouter } from '@phrasecode/odata';
import { dataSource } from './db-setup';

const router = new OpenRouter({ dataSource });

export const handler = async (event: any) => {
  try {
    const metadata = router.getMetaData();
    return {
      statusCode: 200,
      body: JSON.stringify(metadata),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
```

### Metadata Response Format

The metadata endpoint returns a JSON object describing all entities in your data model:

```json
{
  "entities": [
    {
      "name": "User",
      "keys": ["id"],
      "properties": [
        {
          "name": "id",
          "type": "INTEGER",
          "nullable": false,
          "primaryKey": true,
          "autoIncrement": true
        },
        {
          "name": "name",
          "type": "STRING",
          "nullable": false
        },
        {
          "name": "email",
          "type": "STRING",
          "nullable": false,
          "unique": true
        },
        {
          "name": "age",
          "type": "INTEGER",
          "nullable": true
        }
      ],
      "navigationProperties": [
        {
          "name": "orders",
          "type": "Collection(Order)",
          "reference": [
            {
              "sourceKey": "id",
              "targetKey": "userId"
            }
          ]
        },
        {
          "name": "department",
          "type": "Department",
          "reference": [
            {
              "sourceKey": "departmentId",
              "targetKey": "id"
            }
          ]
        }
      ]
    },
    {
      "name": "Order",
      "keys": ["orderId"],
      "properties": [
        {
          "name": "orderId",
          "type": "INTEGER",
          "nullable": false,
          "primaryKey": true,
          "autoIncrement": true
        },
        {
          "name": "userId",
          "type": "INTEGER",
          "nullable": false
        },
        {
          "name": "total",
          "type": "DECIMAL",
          "nullable": false
        }
      ],
      "navigationProperties": [
        {
          "name": "user",
          "type": "User",
          "reference": [
            {
              "sourceKey": "userId",
              "targetKey": "id"
            }
          ]
        }
      ]
    }
  ]
}
```

### Metadata Structure

#### Entity Object

Each entity in the metadata contains:

| Field                  | Type     | Description                                                |
| ---------------------- | -------- | ---------------------------------------------------------- |
| `name`                 | string   | The entity name (model class name)                         |
| `keys`                 | string[] | Array of primary key property names                        |
| `properties`           | array    | Array of property definitions (columns)                    |
| `navigationProperties` | array    | Array of relationship definitions (optional, if relations) |

#### Property Object

Each property describes a column:

| Field           | Type    | Description                                  |
| --------------- | ------- | -------------------------------------------- |
| `name`          | string  | Property name                                |
| `type`          | string  | Data type (INTEGER, STRING, BOOLEAN, etc.)   |
| `nullable`      | boolean | Whether the property can be null             |
| `primaryKey`    | boolean | Whether this is a primary key (optional)     |
| `autoIncrement` | boolean | Whether the value auto-increments (optional) |
| `unique`        | boolean | Whether the value must be unique (optional)  |
| `defaultValue`  | any     | Default value for the property (optional)    |

#### Navigation Property Object

Each navigation property describes a relationship:

| Field       | Type   | Description                                                                |
| ----------- | ------ | -------------------------------------------------------------------------- |
| `name`      | string | Navigation property name                                                   |
| `type`      | string | Target entity type. `Collection(EntityName)` for one-to-many relationships |
| `reference` | array  | Array of key mappings between source and target entities (optional)        |

### Use Cases for Metadata

1. **API Documentation**: Generate automatic documentation for your API
2. **Client Code Generation**: Auto-generate TypeScript/JavaScript client libraries
3. **OData Client Tools**: Enable OData-compliant tools to discover your API structure
4. **Validation**: Validate queries against the schema before execution
5. **Schema Discovery**: Allow developers to explore available entities and their relationships

### Example: Using Metadata Programmatically

```typescript
// Fetch and use metadata
const response = await fetch('http://localhost:3000/$metadata');
const metadata = await response.json();

// Find all entities
console.log(
  'Available entities:',
  metadata.entities.map(e => e.name),
);

// Find all properties of User entity
const userEntity = metadata.entities.find(e => e.name === 'User');
console.log(
  'User properties:',
  userEntity.properties.map(p => p.name),
);

// Find all relationships of User entity
console.log(
  'User relationships:',
  userEntity.navigationProperties.map(n => n.name),
);

// Find primary keys
console.log('User primary keys:', userEntity.keys);
```

## Logging Configuration

Configure logging when setting up your router to monitor database operations and query performance.

### Express Router Logging

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

### Logger Configuration Options

#### Advanced Logging Options. You can selectively enable logs for certain operations, even if your global log level is set to error or warn.

| Option                 | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `logSqlQuery`          | Logs the actual SQL queries sent to the database          |
| `logDbExecutionTime`   | Logs the time taken to execute each query in milliseconds |
| `logDbQueryParameters` | Logs the parameters and bindings used in queries          |

## Using OData Query APIs

Once your endpoints are set up, you can query them using OData v4 query syntax.

### Query Parameters

#### $select - Select Specific Fields

Choose which fields to return in the response.

**Syntax:** `$select=field1,field2,field3`

**Examples:**

```
GET /User?$select=name,email
GET /User?$select=id,name,email,age
GET /User?$expand=department&$select=name,department/departmentName
```

**Nested Select:**

```
# Select fields from expanded relations
GET /User?$expand=department($select=departmentName,budget)&$select=name,email

# Multiple expansions with selects
GET /User?$expand=department($select=departmentName),orders($select=orderId,total)&$select=name,email
```

#### $filter - Filter Results

Filter results based on conditions.

**Syntax:** `$filter=<condition>`

**Basic Examples:**

```
GET /User?$filter=age gt 18
GET /User?$filter=name eq 'John'
GET /User?$filter=age gt 18 and age lt 65
GET /User?$filter=departmentId in (1,2,3)
GET /User?$filter=contains(name,'John')
```

**Advanced Filter Features:**

**1. Navigation Property Count:**

```
# Filter by count of related entities
GET /User?$filter=notes/$count gt 5
GET /Department?$filter=users/$count eq 0
GET /Category?$filter=products/$count gt 10 and products/$count lt 100
```

**2. Arithmetic Expressions:**

```
# Basic arithmetic
GET /Product?$filter=(price mul quantity) gt 1000
GET /User?$filter=(age add 5) lt 30
GET /Order?$filter=(total sub discount) ge 500

# Arithmetic with functions
GET /Note?$filter=(length(content) div 2) eq length(title)
GET /Product?$filter=(price mul 1.2) gt 100

# Parenthesized arithmetic
GET /User?$filter=(userId mod 3) eq 0
GET /Order?$filter=((price mul quantity) sub discount) gt 1000
```

**3. Nested Filters in $expand:**

```
# Filter expanded relations
GET /User?$expand=notes($filter=isArchived eq false)
GET /Department?$expand=users($filter=isActive eq true and age gt 25)

# Combine with select
GET /User?$expand=notes($filter=isPinned eq true;$select=title,content)
```

#### $expand - Include Related Entities

Include related entities in the response (similar to SQL JOIN).

**Syntax:** `$expand=relationName`

**Basic Examples:**

```
GET /User?$expand=department
GET /User?$expand=orders
GET /User?$expand=department,orders
GET /User?$expand=department($select=departmentName)
GET /User?$expand=department($filter=budget gt 100000)
```

**Advanced Expansion Features:**

**1. Nested Expansions:**

```
# Two-level expansion
GET /User?$expand=department($expand=company)

# Three-level expansion
GET /User?$expand=notes($expand=category($expand=creator))

# Multiple nested expansions
GET /Department?$expand=users($expand=notes($expand=category))
```

**2. Expansion with Multiple Options:**

```
# Combine filter, select, and orderby
GET /User?$expand=notes($filter=isArchived eq false;$select=title,content;$orderby=createdAt desc)

# Expansion with top and skip
GET /Department?$expand=users($filter=isActive eq true;$top=10;$orderby=username asc)

# Complex nested expansion with options
GET /User?$expand=notes($filter=isPinned eq true;$expand=category($select=categoryName);$select=title,content)
```

**3. Deep Nested Expansions (5+ levels):**

```
# Five-level expansion
GET /Department?$expand=users($expand=notes($expand=category($expand=creator($expand=department))))

# With filters and selects at each level
GET /Department?$filter=users/$count gt 0&$expand=users($filter=isActive eq true;$expand=notes($filter=isArchived eq false;$expand=category($select=categoryName;$expand=creator($select=username,email))))
```

#### $orderby - Sort Results

Sort results by one or more fields.

**Syntax:** `$orderby=field1 asc,field2 desc`

**Examples:**

```
GET /User?$orderby=name asc
GET /User?$orderby=age desc
GET /User?$orderby=name asc,age desc
GET /User?$orderby=createdAt desc,name asc
```

**Nested Orderby:**

```
# Order expanded relations
GET /User?$expand=notes($orderby=createdAt desc)
GET /Department?$expand=users($orderby=username asc,age desc)
```

#### $top - Limit Results

Limit the number of results returned.

**Syntax:** `$top=<number>`

**Examples:**

```
GET /User?$top=10
GET /User?$top=100
```

**Nested Top:**

```
# Limit expanded relations
GET /User?$expand=notes($top=5)
GET /Department?$expand=users($top=10;$orderby=username asc)
```

#### $skip - Skip Results (Pagination)

Skip a specified number of results (useful for pagination).

**Syntax:** `$skip=<number>`

**Examples:**

```
GET /User?$skip=20
GET /User?$top=10&$skip=20  // Page 3 (skip 20, take 10)
```

**Nested Skip:**

```
# Paginate expanded relations
GET /User?$expand=notes($top=10;$skip=20)
GET /Department?$expand=users($top=20;$skip=40;$orderby=username asc)
```

#### $count - Get Total Count

Get the total count of entities matching the filter.

**Syntax:** `$count=true`

**Examples:**

```
GET /User?$count=true
GET /User?$filter=age gt 18&$count=true
GET /Product?$filter=category eq 'Electronics'&$count=true
```

**Note:** The count is returned in the response metadata.

### Filter Operators

The framework supports a comprehensive set of OData filter operators.

#### COMPARISON Operators

Compare field values with constants.

| Operator | Description           | Example                        |
| -------- | --------------------- | ------------------------------ |
| `eq`     | Equal to              | `$filter=age eq 25`            |
| `ne`     | Not equal to          | `$filter=status ne 'inactive'` |
| `gt`     | Greater than          | `$filter=price gt 100`         |
| `ge`     | Greater than or equal | `$filter=age ge 18`            |
| `lt`     | Less than             | `$filter=price lt 1000`        |
| `le`     | Less than or equal    | `$filter=age le 65`            |

**Examples:**

```
GET /Product?$filter=price eq 99.99
GET /User?$filter=age ne 30
GET /Order?$filter=total gt 500
GET /User?$filter=age ge 18
GET /Product?$filter=stock lt 10
GET /User?$filter=age le 65
```

#### LOGICAL Operators

Combine multiple conditions.

| Operator | Description | Example                                             |
| -------- | ----------- | --------------------------------------------------- |
| `and`    | Logical AND | `$filter=age gt 18 and age lt 65`                   |
| `or`     | Logical OR  | `$filter=status eq 'active' or status eq 'pending'` |
| `not`    | Logical NOT | `$filter=not (status eq 'deleted')`                 |

**Examples:**

```
GET /User?$filter=age gt 18 and age lt 65
GET /User?$filter=status eq 'active' or status eq 'pending'
GET /User?$filter=age gt 18 and (status eq 'active' or status eq 'pending')
GET /Product?$filter=not (category eq 'discontinued')
```

#### IN Operator

Check if a value is in a list.

| Operator | Description   | Example                                             |
| -------- | ------------- | --------------------------------------------------- |
| `in`     | Value in list | `$filter=status in ('active','pending','approved')` |

**Examples:**

```
GET /User?$filter=departmentId in (1,2,3)
GET /Product?$filter=category in ('Electronics','Computers','Phones')
GET /Order?$filter=status in ('pending','processing','shipped')
```

#### STRING FUNCTIONS

Perform string operations in filters.

| Function     | Description                           | Example                                  |
| ------------ | ------------------------------------- | ---------------------------------------- |
| `contains`   | Check if string contains substring    | `$filter=contains(name,'John')`          |
| `startswith` | Check if string starts with substring | `$filter=startswith(email,'admin')`      |
| `endswith`   | Check if string ends with substring   | `$filter=endswith(email,'@gmail.com')`   |
| `tolower`    | Convert to lowercase                  | `$filter=contains(tolower(name),'john')` |
| `toupper`    | Convert to uppercase                  | `$filter=contains(toupper(name),'JOHN')` |
| `trim`       | Remove whitespace                     | `$filter=trim(name) eq 'John'`           |
| `length`     | Get string length                     | `$filter=length(name) gt 5`              |
| `indexof`    | Find substring position               | `$filter=indexof(email,'@') gt 0`        |
| `concat`     | Concatenate strings                   | `$filter=concat(firstName,' ',lastName)` |
| `substring`  | Extract substring                     | `$filter=substring(name,0,3) eq 'Joh'`   |

**Examples:**

```
# Contains
GET /User?$filter=contains(name,'John')
GET /Product?$filter=contains(description,'premium')

# Starts with
GET /User?$filter=startswith(email,'admin')
GET /Product?$filter=startswith(sku,'PROD-')

# Ends with
GET /User?$filter=endswith(email,'@gmail.com')
GET /File?$filter=endswith(filename,'.pdf')

# To lower
GET /User?$filter=contains(tolower(name),'john')
GET /Product?$filter=tolower(category) eq 'electronics'

# To upper
GET /User?$filter=contains(toupper(name),'JOHN')

# Length
GET /User?$filter=length(username) gt 5
GET /Product?$filter=length(description) le 100

# Index of
GET /User?$filter=indexof(email,'@gmail.com') ne -1
GET /Product?$filter=indexof(name,'Pro') eq 0

# Concat
GET /User?$filter=contains(concat(firstName,' ',lastName),'John Doe')

# Substring
GET /User?$filter=substring(email,0,5) eq 'admin'
```

#### ARITHMETIC OPERATORS

Perform arithmetic operations in filters.

| Operator | Description    | Example                                |
| -------- | -------------- | -------------------------------------- |
| `add`    | Addition       | `$filter=(price add tax) gt 100`       |
| `sub`    | Subtraction    | `$filter=(total sub discount) ge 50`   |
| `mul`    | Multiplication | `$filter=(price mul quantity) gt 1000` |
| `div`    | Division       | `$filter=(total div itemCount) lt 50`  |
| `mod`    | Modulo         | `$filter=(userId mod 2) eq 0`          |

**Examples:**

```
# Basic arithmetic
GET /Order?$filter=(price mul quantity) gt 1000
GET /Product?$filter=(price add tax) le 500
GET /Invoice?$filter=(total sub discount) ge 100

# Arithmetic with parentheses
GET /User?$filter=(userId mod 3) eq 0
GET /Order?$filter=((price mul quantity) sub discount) gt 500

# Arithmetic with functions
GET /Note?$filter=(length(content) div 2) eq length(title)
GET /Product?$filter=(price mul 1.2) gt originalPrice

# Complex arithmetic
GET /Order?$filter=((price mul quantity) add tax sub discount) ge 1000
```

#### DATE/TIME FUNCTIONS

Work with date and time values in filters.

| Function | Description       | Example                                       |
| -------- | ----------------- | --------------------------------------------- |
| `year`   | Extract year      | `$filter=year(createdAt) eq 2024`             |
| `month`  | Extract month     | `$filter=month(createdAt) eq 12`              |
| `day`    | Extract day       | `$filter=day(createdAt) eq 25`                |
| `hour`   | Extract hour      | `$filter=hour(createdAt) ge 9`                |
| `minute` | Extract minute    | `$filter=minute(createdAt) eq 30`             |
| `second` | Extract second    | `$filter=second(createdAt) lt 30`             |
| `date`   | Extract date part | `$filter=date(createdAt) eq date(now())`      |
| `time`   | Extract time part | `$filter=time(createdAt) gt time('09:00:00')` |
| `now`    | Current date/time | `$filter=createdAt lt now()`                  |

**Examples:**

```
# Year filtering
GET /Order?$filter=year(orderDate) eq 2024
GET /User?$filter=year(createdAt) ge 2020

# Month filtering
GET /Order?$filter=month(orderDate) eq 12
GET /Event?$filter=month(eventDate) in (6,7,8)

# Day filtering
GET /Order?$filter=day(orderDate) eq 1
GET /Event?$filter=day(eventDate) le 15

# Time filtering
GET /Event?$filter=hour(startTime) ge 9 and hour(startTime) lt 17
GET /Log?$filter=hour(timestamp) eq 0

# Current date/time
GET /Order?$filter=orderDate lt now()
GET /Event?$filter=eventDate ge now()

# Date comparison
GET /Order?$filter=date(orderDate) eq date(now())
```

#### MATH FUNCTIONS

Mathematical operations in filters.

| Function  | Description          | Example                         |
| --------- | -------------------- | ------------------------------- |
| `round`   | Round to nearest int | `$filter=round(price) eq 100`   |
| `floor`   | Round down           | `$filter=floor(price) lt 100`   |
| `ceiling` | Round up             | `$filter=ceiling(price) gt 100` |

**Examples:**

```
# Round
GET /Product?$filter=round(price) eq 100
GET /Order?$filter=round(total) ge 1000

# Floor
GET /Product?$filter=floor(price) lt 100
GET /Metric?$filter=floor(average) eq 50

# Ceiling
GET /Product?$filter=ceiling(price) gt 100
GET /Metric?$filter=ceiling(average) le 75
```

#### TYPE FUNCTIONS

Type conversion in filters.

| Function | Description  | Example                                     |
| -------- | ------------ | ------------------------------------------- |
| `cast`   | Type casting | `$filter=cast(stringId,'Edm.Int32') eq 123` |

**Examples:**

```
# Cast string to number
GET /Product?$filter=cast(stringId,'Edm.Int32') gt 100

# Cast to different types
GET /Entity?$filter=cast(value,'Edm.Double') ge 99.99
```

### Complex Query Examples

Combine multiple query options for powerful data retrieval:

#### Basic Complex Queries

```
# Get active users with their departments, sorted by name, paginated
GET /User?$filter=status eq 'active'&$expand=department&$select=name,email,department/departmentName&$orderby=name asc&$top=20&$skip=0

# Get high-value orders with customer details
GET /Order?$filter=total gt 1000&$expand=customer($select=name,email)&$orderby=total desc&$top=10

# Get products in specific categories with stock info
GET /Product?$filter=category in ('Electronics','Computers') and stock gt 0&$select=name,price,stock&$orderby=price asc

# Complex nested expansion
GET /User?$expand=department($expand=employees;$select=departmentName)&$filter=age gt 25

# String function combinations
GET /User?$filter=contains(tolower(name),'john') and length(email) gt 10 and endswith(email,'@company.com')
```

#### Advanced Complex Queries

**1. Navigation Property Count with Filters:**

```
# Get departments with more than 5 active users
GET /Department?$filter=users/$count gt 5&$expand=users($filter=isActive eq true;$select=username,email)&$select=departmentName

# Get users with no notes
GET /User?$filter=notes/$count eq 0&$select=username,email

# Get categories with products in stock
GET /Category?$filter=products/$count gt 0&$expand=products($filter=stock gt 0;$select=name,price,stock)
```

**2. Arithmetic Expressions in Filters:**

```
# Get orders where total after discount is greater than 1000
GET /Order?$filter=((price mul quantity) sub discount) gt 1000&$select=orderId,price,quantity,discount

# Get users whose ID is divisible by 3
GET /User?$filter=(userId mod 3) eq 0&$select=userId,username

# Get notes where content is twice as long as title
GET /Note?$filter=(length(content) div 2) eq length(title)&$select=noteId,title,content
```

**3. Deep Nested Expansions:**

```
# Three-level expansion with filters at each level
GET /Department?$expand=users($filter=isActive eq true;$expand=notes($filter=isArchived eq false;$expand=category($select=categoryName)))&$select=departmentName

# Five-level expansion
GET /Department?$expand=users($expand=notes($expand=category($expand=creator($expand=department))))&$top=5

# Complex nested with multiple options
GET /User?$expand=notes($filter=isPinned eq true;$expand=category($select=categoryName,description);$select=title,content;$orderby=createdAt desc;$top=10)&$select=username,email
```

**4. Combining Multiple Advanced Features:**

```
# Navigation count + arithmetic + nested expansion
GET /Department?$filter=users/$count gt 0&$expand=users($filter=(userId mod 2) eq 0 and isActive eq true;$expand=notes($filter=isArchived eq false);$select=userId,username)&$select=departmentName&$top=10

# String functions + date functions + expansion
GET /User?$filter=contains(tolower(email),'@company.com') and year(createdAt) eq 2024&$expand=department($select=departmentName)&$orderby=createdAt desc

# Arithmetic + string functions + nested filters
GET /Note?$filter=(length(content) div 2) gt 100 and contains(tolower(title),'important')&$expand=user($select=username),category($select=categoryName)&$orderby=createdAt desc&$top=20
```

**5. Pagination with Complex Filters:**

```
# Paginated results with multiple filters and expansions
GET /Order?$filter=year(orderDate) eq 2024 and (total sub discount) gt 500&$expand=customer($select=name,email),items($select=productName,quantity,price)&$orderby=orderDate desc&$top=25&$skip=50

# Paginated nested expansion
GET /Department?$expand=users($filter=isActive eq true;$top=10;$skip=0;$orderby=username asc)&$select=departmentName&$orderby=departmentName asc&$top=20
```

**6. Real-World Use Cases:**

```
# E-commerce: Get active products with reviews
GET /Product?$filter=isActive eq true and stock gt 0 and averageRating ge 4.0&$expand=reviews($filter=rating ge 4;$top=5;$orderby=createdAt desc;$select=rating,comment,userName)&$select=name,price,stock,averageRating&$orderby=averageRating desc,price asc&$top=20

# CRM: Get high-value customers with recent orders
GET /Customer?$filter=orders/$count gt 10 and totalSpent gt 10000&$expand=orders($filter=year(orderDate) eq 2024;$top=5;$orderby=orderDate desc;$select=orderId,total,orderDate)&$select=customerId,name,email,totalSpent&$orderby=totalSpent desc&$top=50

# Blog: Get popular posts with comments
GET /Post?$filter=comments/$count gt 20 and year(publishedAt) eq 2024&$expand=author($select=name,avatar),comments($filter=isApproved eq true;$top=10;$orderby=createdAt desc;$select=content,authorName,createdAt)&$select=title,content,publishedAt,viewCount&$orderby=viewCount desc&$top=10

# Project Management: Get active projects with tasks
GET /Project?$filter=status eq 'active' and tasks/$count gt 0&$expand=tasks($filter=status ne 'completed';$expand=assignee($select=name,email);$select=taskName,status,dueDate;$orderby=dueDate asc)&$select=projectName,startDate,endDate&$orderby=startDate desc
```

## API Response Format

All API responses follow the OData v4 standard format with data and metadata:

### Success Response

```json
{
  "@odata.context": "/$metadata#User",
  "@odata.count": 1,
  "value": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "department": {
        "id": 1,
        "departmentName": "Engineering"
      }
    }
  ],
  "meta": {
    "queryExecutionTime": 85
  }
}
```

### Response Structure

- **@odata.context**: OData context URL indicating the entity type (e.g., `/$metadata#User`)
- **@odata.count**: Total number of records returned in the response
- **value**: Array of records matching the query
- **meta**: Metadata about the query execution
  - `queryExecutionTime`: Time spent executing the database query (milliseconds)

#### Error Response

```json
{
  "error": "Invalid filter syntax",
  "message": "Failed to parse OData query"
}
```

## Best Practices

### 1. Use Database Connection Pooling

Connection pooling is critical for production applications. It reuses database connections instead of creating new ones for each query, dramatically improving performance.

#### Performance Impact

Without connection pooling:

- Query execution time: **1000ms - 1500ms**
- Reason: Each query creates a new database connection

With connection pooling:

- Query execution time: **85ms - 110ms**
- Improvement: **10-15x faster**

#### Example Query Performance

```sql
SELECT "departments"."id",
       "departments"."department_name",
       "departments"."description",
       "user"."user_id" AS "user.user_id",
       "user"."username" AS "user.username",
       "user"."department_id" AS "user.department_id",
       "user"."email" AS "user.email",
       "user"."full_name" AS "user.full_name"
FROM "public"."departments" AS "departments"
LEFT OUTER JOIN "public"."users" AS "user"
  ON "departments"."id" = "user"."department_id";
```

**Without pooling**: 1000-1500ms
**With pooling**: 85-110ms

#### Recommended Pool Configuration

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

#### Pool Configuration Guidelines

| Setting   | Recommended | Description                               |
| --------- | ----------- | ----------------------------------------- |
| `max`     | 5-20        | Based on concurrent users. Start with 10  |
| `min`     | 1-5         | Keep some connections ready. Start with 2 |
| `idle`    | 10000       | Close idle connections after 10 seconds   |
| `acquire` | 30000       | Wait up to 30 seconds for a connection    |
| `evict`   | 1000        | Check for idle connections every 1 second |

### 2. Enable Advanced Logging for Development

Use advanced logging options during development to monitor query performance:

```typescript
// Development configuration
if (process.env.NODE_ENV === 'development') {
  Logger.forceSetupLogger(true, LOG_LEVELS.INFO, LOG_FORMATS.JSON, {
    logSqlQuery: true, // See generated SQL
    logDbExecutionTime: true, // Monitor query performance
    logDbQueryParameters: true, // Debug parameter binding
  });
}
```

### 3. Optimize $select Queries

Always use `$select` to fetch only the columns you need:

```
# ❌ DON'T: Fetch all columns
GET /User

# ✅ DO: Select only needed columns
GET /User?$select=id,name,email
```

Benefits:

- Reduces network bandwidth
- Faster query execution
- Lower memory usage

### 4. Use $filter for Server-Side Filtering

Filter data at the database level, not in your application:

```
# ❌ DON'T: Fetch all and filter in code
GET /User

# ✅ DO: Filter at database level
GET /User?$filter=status eq 'active' and age gt 18
```

Benefits:

- Reduces data transfer
- Faster query execution
- Lower server memory usage

### 5. Paginate Large Result Sets

Always use `$top` and `$skip` for pagination:

```
# ❌ DON'T: Fetch all records
GET /User

# ✅ DO: Paginate results
GET /User?$top=20&$skip=0
GET /User?$top=20&$skip=20
```

Benefits:

- Reduces memory usage
- Faster response times
- Better user experience

### 6. Monitor Query Execution Times

Use the metadata in responses to identify slow queries:

```typescript
const response = await fetch('/User?$expand=department&$filter=status eq "active"');
const result = await response.json();

console.log(`Query took ${result.meta.queryExecutionTime}ms`);

// Alert if query is slow
if (result.meta.queryExecutionTime > 500) {
  console.warn('Slow query detected!');
}
```

### 7. Use Indexes on Filtered Columns

Ensure database indexes exist on columns used in `$filter`:

```typescript
// If you frequently filter by email, add an index
@Table({ tableName: 'users' })
class User extends Model<User> {
  @Column({
    dataType: DataTypes.STRING,
    isUnique: true, // Creates an index
  })
  email: string;
}
```

### 8. Limit $expand Depth

Avoid deeply nested expansions as they can cause performance issues:

```
# ❌ DON'T: Deep nesting
GET /User?$expand=department($expand=company($expand=industry))

# ✅ DO: Limit expansion depth (2-3 levels recommended)
GET /User?$expand=department
GET /User?$expand=department($expand=company)
```

### 9. Use Navigation Property Count Wisely

Navigation property count (`$count`) generates SQL subqueries. Use them judiciously:

```
# ✅ GOOD: Simple count filter
GET /Department?$filter=users/$count gt 5

# ✅ GOOD: Count with basic expansion
GET /User?$filter=notes/$count gt 0&$expand=notes($top=5)

# ⚠️ CAUTION: Multiple count filters (can be slow)
GET /User?$filter=notes/$count gt 5 and categories/$count gt 2

# ❌ AVOID: Count filter on deeply nested expansion (may cause SQL errors)
GET /Department?$expand=users($expand=notes($expand=category($filter=products/$count gt 10)))
```

**Known Limitation:** When using `$count` filters on nested expansions (3+ levels deep) with further nested includes below them, Sequelize may generate incorrect SQL. This is a Sequelize limitation, not a framework issue.

### 10. Optimize Arithmetic Expressions

Arithmetic expressions are powerful but can impact performance:

```
# ✅ GOOD: Simple arithmetic
GET /Order?$filter=(price mul quantity) gt 1000

# ✅ GOOD: Arithmetic with parentheses
GET /User?$filter=(userId mod 3) eq 0

# ⚠️ CAUTION: Complex nested arithmetic (harder to optimize)
GET /Order?$filter=(((price mul quantity) add tax) sub discount) gt 1000

# 💡 TIP: Use database indexes on columns used in arithmetic
```

### 11. Combine Filters Efficiently

Order your filter conditions from most selective to least selective:

```
# ✅ GOOD: Most selective filter first
GET /User?$filter=userId eq 123 and isActive eq true

# ⚠️ LESS OPTIMAL: Less selective filter first
GET /User?$filter=isActive eq true and userId eq 123

# ✅ GOOD: Use indexes on filtered columns
GET /User?$filter=email eq 'user@example.com' and isActive eq true
```

## TypeScript Configuration

Ensure your `tsconfig.json` has decorator support enabled:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2020",
    "module": "CommonJS",
    "strict": true
  }
}
```

## Quick Reference

### Query Parameters Summary

| Parameter  | Description               | Example                                  |
| ---------- | ------------------------- | ---------------------------------------- |
| `$select`  | Select specific fields    | `$select=name,email`                     |
| `$filter`  | Filter results            | `$filter=age gt 18 and isActive eq true` |
| `$expand`  | Include related entities  | `$expand=department($select=name)`       |
| `$orderby` | Sort results              | `$orderby=name asc,age desc`             |
| `$top`     | Limit results             | `$top=10`                                |
| `$skip`    | Skip results (pagination) | `$skip=20`                               |
| `$count`   | Get total count           | `$count=true`                            |

### Filter Operators Summary

| Category       | Operators/Functions                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| **Comparison** | `eq`, `ne`, `gt`, `ge`, `lt`, `le`                                                                             |
| **Logical**    | `and`, `or`, `not`                                                                                             |
| **Arithmetic** | `add`, `sub`, `mul`, `div`, `mod`                                                                              |
| **Collection** | `in`                                                                                                           |
| **String**     | `contains`, `startswith`, `endswith`, `tolower`, `toupper`, `trim`, `length`, `indexof`, `concat`, `substring` |
| **Date/Time**  | `year`, `month`, `day`, `hour`, `minute`, `second`, `date`, `time`, `now`                                      |
| **Math**       | `round`, `floor`, `ceiling`                                                                                    |
| **Type**       | `cast`                                                                                                         |
| **Navigation** | `$count` (e.g., `notes/$count gt 5`)                                                                           |

### Common Query Patterns

```
# Basic filtering and selection
GET /User?$filter=isActive eq true&$select=name,email&$top=10

# Expansion with nested select
GET /User?$expand=department($select=name)&$select=username,email

# Navigation property count
GET /Department?$filter=users/$count gt 5

# Arithmetic expression
GET /Order?$filter=(price mul quantity) gt 1000

# Complex nested expansion
GET /Department?$expand=users($filter=isActive eq true;$expand=notes($top=5))

# Date filtering
GET /Order?$filter=year(orderDate) eq 2024 and month(orderDate) eq 12

# String functions
GET /User?$filter=contains(tolower(email),'@company.com')

# Pagination
GET /User?$orderby=createdAt desc&$top=20&$skip=40
```

## Known Limitations

1. **Deep Nested Count Filters**: Using `$count` filters on nested expansions (3+ levels deep) with further nested includes may cause SQL generation issues due to Sequelize limitations.

2. **$apply and $compute**: Currently placeholders with partial support. Full implementation planned for future releases.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
