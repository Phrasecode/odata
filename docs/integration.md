# Integration Options

The framework provides two integration options to suit different use cases.

## Option 1: Express.js Router (Simple)

Best for traditional Express.js applications.

### Setup

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

### Endpoints

The router automatically creates endpoints based on your model names:

- `GET /User?$select=name&$filter=age gt 18`
- `GET /Order?$expand=user&$top=10`
- `GET /$metadata` (automatically registered)

## Option 2: OpenRouter (Advanced)

Best for Next.js, serverless functions, and any framework. Provides more flexibility and control.

### Features

- ✅ Works with Next.js API routes
- ✅ Compatible with serverless functions (AWS Lambda, Vercel, Netlify)
- ✅ Framework-agnostic
- ✅ No automatic route registration (you control the endpoints)

### Setup for Next.js

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

### Next.js Catch-All Routes

For a more flexible setup, use catch-all routes:

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

    const result = await router.queryble(User)(`${path}${queryString}`);

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
    user: handler.handler
    events:
      - http:
          path: api/user
          method: get
          cors: true
    timeout: 30
    memorySize: 512

plugins:
  - serverless-offline
  - serverless-plugin-typescript
```

## Next Steps

- [Learn about OData querying](./querying.md)
- [Configure metadata endpoint](./metadata.md)
- [Set up logging](./logging.md)
- [Review best practices](./best-practices.md)
