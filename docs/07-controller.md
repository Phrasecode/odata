---
sidebar_position: 7
---

# Controller

The `ODataControler` class is the bridge between your HTTP endpoints and your data models. It handles incoming requests, manages allowed HTTP methods, and executes OData queries against your database.

## Basic Usage

```typescript
import { ODataControler } from '@phrasecode/odata';
import { User } from './models/User';

const userController = new ODataControler({
  endpoint: '/users',
  allowedMethod: ['get'],
  model: User,
});
```

## Configuration Options

| Option          | Type        | Default      | Description                                                                        |
| --------------- | ----------- | ------------ | ---------------------------------------------------------------------------------- |
| `endpoint`      | `string`    | Model name   | Custom endpoint path for the controller. Otherwise use Model name as the base path |
| `allowedMethod` | `IMethod[]` | `['get']`    | HTTP methods allowed for this endpoint                                             |
| `model`         | `Model`     | **Required** | The Model class this controller operates on                                        |

### HTTP Methods

The framework supports the following HTTP methods:

| Method   | Description                     | Status         |
| -------- | ------------------------------- | -------------- |
| `get`    | Retrieve data (query execution) | ✅ Supported   |
| `post`   | Create new records              | 🚧 Coming Soon |
| `put`    | Update existing records         | 🚧 Coming Soon |
| `delete` | Delete records                  | 🚧 Coming Soon |

## Creating Controllers

### Minimal Configuration

If you don't specify an endpoint, the controller uses the model name:

```typescript
const userController = new ODataControler({
  model: User,
});
// Endpoint: /User (uses model class name)
// Allowed methods: ['get'] (default)
```

## Custom Controllers (Recommended)

For more control over query execution, you can extend `ODataControler` to create custom controllers. This is the recommended approach when you need to:

- Add custom business logic before/after queries
- Implement authorization checks
- Transform or filter results
- Add logging or metrics
- Handle errors in a specific way

### Basic Custom Controller

```typescript
import { ODataControler, IControllerConfig, QueryParser } from '@phrasecode/odata';

class CustomUserController extends ODataControler {
  constructor(config: IControllerConfig) {
    super(config);
  }

  // Override the get method to customize behavior
  async get(query: QueryParser) {
    // Execute the query using the parent method
    const result = await this.queryable(query);
    return result;
  }
}

// Usage
const userController = new CustomUserController({
  endpoint: '/users',
  allowedMethod: ['get'],
  model: User,
});
```

### Adding Pre/Post Processing

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

### Adding Authorization

```typescript
import { ODataControler, IControllerConfig, QueryParser } from '@phrasecode/odata';

class SecureController extends ODataControler {
  private userRole: string;

  constructor(config: IControllerConfig, userRole: string) {
    super(config);
    this.userRole = userRole;
  }

  async get(query: QueryParser) {
    // Check authorization before executing query
    if (this.userRole !== 'admin' && this.userRole !== 'viewer') {
      throw new Error('Unauthorized access');
    }

    const result = await this.queryable(query);
    return result;
  }
}
```

### Transforming Results

```typescript
import { ODataControler, IControllerConfig, QueryParser } from '@phrasecode/odata';

class TransformingController extends ODataControler {
  constructor(config: IControllerConfig) {
    super(config);
  }

  async get(query: QueryParser) {
    const result = await this.queryable(query);

    // Transform the results - e.g., mask sensitive data
    if (result.value) {
      result.value = result.value.map((item: any) => ({
        ...item,
        email: item.email ? this.maskEmail(item.email) : undefined,
      }));
    }

    return result;
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    return `${local.substring(0, 2)}***@${domain}`;
  }
}
```

## Using Controllers with Routers

Controllers are designed to work with routers that handle the HTTP layer integration.

### Express.js Integration

```typescript
import express from 'express';
import { DataSource, ODataControler, ExpressRouter } from '@phrasecode/odata';
import { User, Order, Product } from './models';

const app = express();

// Create DataSource
const dataSource = new DataSource({
  dialect: 'postgres',
  database: 'mydb',
  username: 'user',
  password: 'password',
  host: 'localhost',
  port: 5432,
  schema: 'public',
  pool: { max: 5, min: 0, idle: 10000 },
  models: [User, Order, Product],
});

// Create controllers for each model
const userController = new ODataControler({
  endpoint: '/users',
  allowedMethod: ['get'],
  model: User,
});

const orderController = new ODataControler({
  endpoint: '/orders',
  allowedMethod: ['get'],
  model: Order,
});

const productController = new ODataControler({
  endpoint: '/products',
  allowedMethod: ['get'],
  model: Product,
});

// Register controllers with ExpressRouter
new ExpressRouter(app, {
  controllers: [userController, orderController, productController],
  dataSource: dataSource,
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

Now you can access:

- `GET http://localhost:3000/users?$select=name,email&$filter=age gt 18`
- `GET http://localhost:3000/orders?$expand=items`
- `GET http://localhost:3000/products?$top=10&$orderby=price desc`

## Controller Methods

### get(query)

Handles GET requests to retrieve data. This is the primary method for querying data.

```typescript
// Internal usage - typically called by the router
const results = await controller.get(queryParser);
```

### post(Still not supported)

Handles POST requests to create new records.

```typescript
const result = await controller.post(queryParser);
```

### put(Still not supported)

Handles PUT requests to update existing records.

```typescript
const result = await controller.put(queryParser);
```

### delete(Still not supported)

Handles DELETE requests to remove records.

```typescript
const result = await controller.delete(queryParser);
```

### queryable(query)

Executes an OData query and returns results. This is the core method that processes queries.

```typescript
const results = await controller.queryable(queryParser);
```

## QueryController

Use `QueryController` when you only need custom SQL endpoints without standard OData query support. This is ideal for reporting endpoints or complex aggregations.
📖 **[Learn more about Custom Queries](./15-custom-queries.md)**

| Controller             | Use Case               | Description                                     |
| ---------------------- | ---------------------- | ----------------------------------------------- |
| `ODataControler`       | Standard OData queries | Full OData query support with automatic routing |
| `QueryController` | Raw SQL queries only   | For custom SQL queries without OData endpoints  |

```typescript
import { QueryController, Custom, QueryControllerEvent, DataTypes } from '@phrasecode/odata';
import { SalesReport } from './models/SalesReport';

export class SalesReportController extends QueryController {
  constructor() {
    super({
      model: SalesReport,
      endpoint: '/sales-report',
    });
  }

  @Query({
    method: 'get',
    endpoint: '/by-category',
    parameters: [
      { name: 'categoryId', type: DataTypes.INTEGER, required: true },
      { name: 'year', type: DataTypes.INTEGER, defaultValue: 2024 },
    ],
  })
  public async getSalesByCategory(event: QueryControllerEvent) {
    return this.rawQueryable(
      `SELECT c.name, SUM(oi.quantity) as total_sold, SUM(oi.price * oi.quantity) as revenue
       FROM categories c
       INNER JOIN products p ON p.category_id = c.id
       INNER JOIN order_items oi ON oi.product_id = p.id
       INNER JOIN orders o ON oi.order_id = o.id
       WHERE c.id = $categoryId AND EXTRACT(YEAR FROM o.order_date) = $year
       GROUP BY c.id, c.name`,
      { categoryId: event.queryParams.categoryId, year: event.queryParams.year },
    );
  }
}
```

## Response Format

Controllers return responses in OData format:

```json
{
  "@odata.context": "User",
  "@odata.count": 100,
  "value": [
    { "id": 1, "name": "John", "email": "john@example.com" },
    { "id": 2, "name": "Jane", "email": "jane@example.com" }
  ],
  "meta": {
    "queryExecutionTime": 15,
    "totalExecutionTime": 20
  }
}
```

| Field                     | Description                                   |
| ------------------------- | --------------------------------------------- |
| `@odata.context`          | The entity type being returned                |
| `@odata.count`            | Total count of records (when `$count=true`)   |
| `value`                   | Array of results                              |
| `meta.queryExecutionTime` | Database query execution time in milliseconds |
| `meta.totalExecutionTime` | Total request processing time in milliseconds |
