---
sidebar_position: 2
---

# Next.js Getting Started Guide

Complete guide to integrating OData APIs with Next.js using the **OpenRouter** solution.

## Overview

The **OpenRouter** provides a framework-agnostic solution perfect for Next.js applications. It gives you:

- ✅ Full control over route registration and paths
- ✅ Compatibility with both App Router and Pages Router
- ✅ Direct model querying without controllers
- ✅ Flexible middleware integration
- ✅ Support for custom authentication and authorization

## Prerequisites

- Node.js 16+ installed
- Next.js 13+ project (App Router or Pages Router)
- Basic knowledge of Next.js API routes
- Database server running (PostgreSQL, MySQL, SQLite, etc.)

## Installation

### 1. Install the package

```bash
npm install @phrasecode/odata
```

### 2. Install your database driver

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

Create your data models using decorators.

**lib/models/user.ts:**

```typescript
import { Model, Table, Column, DataTypes, HasMany } from '@phrasecode/odata';
import type { Order } from './order';

@Table({ tableName: 'users' })
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

  @Column({ dataType: DataTypes.INTEGER })
  age: number;

  @HasMany(() => require('./order').Order, {
    relation: [{ foreignKey: 'userId', sourceKey: 'id' }],
  })
  orders: Order[];
}
```

**lib/models/order.ts:**

```typescript
import { Model, Table, Column, DataTypes, BelongsTo } from '@phrasecode/odata';
import type { User } from './user';

@Table({ tableName: 'orders' })
export class Order extends Model<Order> {
  @Column({
    dataType: DataTypes.INTEGER,
    isPrimaryKey: true,
    isAutoIncrement: true,
  })
  id: number;

  @Column({ dataType: DataTypes.INTEGER })
  userId: number;

  @Column({ dataType: DataTypes.DECIMAL })
  total: number;

  @BelongsTo(() => require('./user').User, {
    relation: [{ foreignKey: 'id', sourceKey: 'userId' }],
  })
  user: User;
}
```

### Step 2: Create DataSource Singleton

**IMPORTANT:** In Next.js, create a singleton DataSource to avoid multiple database connections.

**lib/datasource.ts:**

```typescript
import { DataSource } from '@phrasecode/odata';
import { User } from './models/user';
import { Order } from './models/order';

let dataSource: DataSource | null = null;

export function getDataSource(): DataSource {
  if (!dataSource) {
    dataSource = new DataSource({
      dialect: 'postgres',
      database: process.env.DB_NAME!,
      username: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      host: process.env.DB_HOST!,
      port: parseInt(process.env.DB_PORT || '5432'),

      // Connection pooling is CRITICAL for Next.js
      pool: {
        max: 10,
        min: 2,
        idle: 10000,
        acquire: 30000,
      },

      schema: 'public',
      ssl: process.env.NODE_ENV === 'production',

      models: [User, Order],
    });
  }

  return dataSource;
}
```

### Step 3: Create OpenRouter Instance

The OpenRouter requires a `pathMapping` configuration that maps URL paths to models.

**lib/odata-router.ts:**

```typescript
import { OpenRouter } from '@phrasecode/odata';
import { getDataSource } from './datasource';
import { User } from './models/user';
import { Order } from './models/order';

let router: OpenRouter | null = null;

export function getODataRouter(): OpenRouter {
  if (!router) {
    router = new OpenRouter({
      dataSource: getDataSource(),
      // Map URL paths to models
      pathMapping: {
        '/api/odata/user': User,
        '/api/odata/order': Order,
      },
      logger: {
        enabled: true,
        logLevel: process.env.NODE_ENV === 'production' ? 'ERROR' : 'INFO',
        format: 'JSON',
      },
    });
  }

  return router;
}
```

### Understanding pathMapping

The `pathMapping` is a key configuration that tells OpenRouter which model to use for each URL path. When a request comes in, the router:

1. **Extracts the path** from the incoming URL (strips query parameters)
2. **Matches the path** against the `pathMapping` keys
3. **Identifies the model** to use for query execution and response mapping

```typescript
pathMapping: {
  '/api/odata/user': User,    // Requests to /api/odata/user → User model
  '/api/odata/order': Order,  // Requests to /api/odata/order → Order model
}
```

**How it works:**

| Incoming Request                            | Matched Path       | Model Used |
| ------------------------------------------- | ------------------ | ---------- |
| `/api/odata/user`                           | `/api/odata/user`  | `User`     |
| `/api/odata/user?$select=name`              | `/api/odata/user`  | `User`     |
| `/api/odata/user?$filter=age gt 18&$top=10` | `/api/odata/user`  | `User`     |
| `/api/odata/order?$expand=user`             | `/api/odata/order` | `Order`    |

**Important:** The path in `pathMapping` must match your API route structure exactly. Query parameters are automatically stripped during matching.

## App Router Implementation (Next.js 13+)

### Step 4A: Create API Routes (App Router)

#### User Endpoint

**app/api/odata/user/route.ts:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getODataRouter } from '@/lib/odata-router';

export async function GET(request: NextRequest) {
  try {
    const router = getODataRouter();
    const path = request.url; // /api/odata/user?$select=name&$filter=age gt 18

    // Use queryable() to execute OData query (path is matched via pathMapping)
    const result = await router.queryable(path);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 });
  }
}
```

#### Order Endpoint

**app/api/odata/order/route.ts:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getODataRouter } from '@/lib/odata-router';

export async function GET(request: NextRequest) {
  try {
    const router = getODataRouter();
    const path = request.url; // /api/odata/order?$expand=user

    const result = await router.queryable(path);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 });
  }
}
```

#### Metadata Endpoint

**app/api/odata/$metadata/route.ts:**

```typescript
import { NextResponse } from 'next/server';
import { getDataSource } from '@/lib/datasource';

export async function GET() {
  try {
    const dataSource = getDataSource();
    const metadata = dataSource.getMetadata();

    return new NextResponse.json(metadata);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Pages Router Implementation (Next.js 12)

### Step 4B: Create API Routes (Pages Router)

#### User Endpoint

**pages/api/odata/user.ts:**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { getODataRouter } from '@/lib/odata-router';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const router = getODataRouter();
    const path = req.url;

    // Path is matched via pathMapping configuration
    const result = await router.queryable(path);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
```

#### Metadata Endpoint

**pages/api/odata/$metadata.ts:**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDataSource } from '@/lib/datasource';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const dataSource = getDataSource();
    const metadata = dataSource.getMetadata();

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(metadata);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
```

## Environment Variables

Create a `.env.local` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mydb
DB_USER=user
DB_PASSWORD=password

# Environment
NODE_ENV=development
```

## Example Queries

Once your API routes are set up, you can query them:

```bash
# Get all users
curl http://localhost:3000/api/odata/user

# Select specific fields
curl http://localhost:3000/api/odata/user?$select=name,email

# Filter by condition
curl http://localhost:3000/api/odata/user?$filter=age gt 18

# Expand relationships
curl http://localhost:3000/api/odata/user?$expand=orders

# Metadata
curl http://localhost:3000/api/odata/$metadata
```

## Adding Authentication

### Middleware Approach (App Router)

**middleware.ts:**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only apply to OData routes
  if (request.nextUrl.pathname.startsWith('/api/odata')) {
    const token = request.headers.get('authorization');

    if (!token || !isValidToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

function isValidToken(token: string): boolean {
  // Implement your token validation logic
  return token === 'Bearer valid-token';
}

export const config = {
  matcher: '/api/odata/:path*',
};
```

### Per-Route Authentication

**app/api/odata/user/route.ts:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getODataRouter } from '@/lib/odata-router';
import { User } from '@/lib/models/user';

async function authenticate(request: NextRequest): Promise<boolean> {
  const token = request.headers.get('authorization');
  // Implement your authentication logic
  return token === 'Bearer valid-token';
}

export async function GET(request: NextRequest) {
  // Check authentication
  if (!(await authenticate(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const router = getODataRouter();
    const queryString = request.nextUrl.searchParams.toString();
    const handler = router.queryable(User);
    const result = await handler(queryString);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 });
  }
}
```

## Custom Query Logic

Add custom logic before executing queries:

```typescript
export async function GET(request: NextRequest) {
  try {
    const router = getODataRouter();
    let queryString = request.nextUrl.searchParams.toString();

    // Example: Force a filter for active users only
    const params = new URLSearchParams(queryString);
    const existingFilter = params.get('$filter');

    if (existingFilter) {
      params.set('$filter', `(${existingFilter}) and status eq 'active'`);
    } else {
      params.set('$filter', "status eq 'active'");
    }

    // Example: Limit maximum results
    const top = params.get('$top');
    if (!top || parseInt(top) > 100) {
      params.set('$top', '100');
    }

    queryString = params.toString();

    const result = await router.queryable(request.url);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 });
  }
}
```

## Raw SQL Queries

For complex queries that OData can't express, use `rawQueryable()` with `QueryModel`:

```typescript
// app/api/reports/top-users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getODataRouter } from '@/lib/odata-router';

export async function GET(request: NextRequest) {
  try {
    const router = getODataRouter();
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await router.rawQueryable(
      '/api/odata/user', // Path must match a pathMapping.
      `SELECT u.*, COUNT(o.id) as order_count 
       FROM users u 
       LEFT JOIN orders o ON o.user_id = u.id 
       GROUP BY u.id 
       ORDER BY order_count DESC 
       LIMIT $limit`,
      { limit },
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

📖 **[Learn more about Custom Queries](../15-custom-queries.md)**
