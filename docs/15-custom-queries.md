---
sidebar_position: 15
---

# Custom Queries

When standard OData queries aren't sufficient for your needs, the framework provides powerful tools for executing custom SQL queries while maintaining the OData response format.

## Overview

Custom queries are useful when you need to:

- Execute complex SQL joins across multiple tables
- Use specific features not supported by OData
- Aggregate data in ways OData doesn't support
- Optimize performance with hand-tuned SQL

## Core Architecture

The custom query system is built around these core components that work together:

| Component              | Role                                                                       |
| ---------------------- | -------------------------------------------------------------------------- |
| `QueryModel`     | Defines the response shape for queries that don't match existing tables    |
| `QueryController` | Controller designed for custom SQL-only endpoints (no OData query support) |
| `@Query` decorator    | Identifies custom API endpoints and defines their options (method, params) |
| `rawQueryable()`       | Executes raw SQL and maps results to the model                             |

### How They Work Together

```
Request → @Query decorator (identifies endpoint & validates params)
                ↓
        Controller method receives QueryControllerEvent
                ↓
        rawQueryable() executes SQL query
                ↓
        Results mapped to Model (QueryModel or Model<T>)
                ↓
Response in OData format
```

### Choosing the Right Model

| Scenario                                      | Use                   |
| --------------------------------------------- | --------------------- |
| Query returns columns matching existing table | `Model<T>`            |
| Query joins tables or has custom columns      | `QueryModel<T>` |

## @Query Decorator

The `@Query` decorator is the key to identifying and configuring custom API endpoints. It:

1. **Identifies** a method as a custom endpoint (not a standard OData query)
2. **Defines** the HTTP method and endpoint path
3. **Configures** query parameters with validation and default values
4. **Routes** requests to the decorated method with parsed parameters

### Decorator Options

```typescript
@Query({
  method: 'get' | 'post' | 'put' | 'delete',
  endpoint: '/custom-path',
  parameters: [
    {
      name: 'paramName',
      type: DataTypes.STRING,  // or INTEGER, BOOLEAN, etc.
      required: true,          // default: false
      defaultValue: 'default'  // optional
    }
  ]
})
```

| Option       | Type                          | Description                          |
| ------------ | ----------------------------- | ------------------------------------ |
| `method`     | `IMethod`                     | HTTP method for the endpoint         |
| `endpoint`   | `string`                      | Path appended to controller endpoint |
| `parameters` | `CustomParameterDefinition[]` | Query parameter definitions          |

### Parameter Definition

| Property       | Type        | Description                                          |
| -------------- | ----------- | ---------------------------------------------------- |
| `name`         | `string`    | Parameter name in query string                       |
| `type`         | `IDataType` | Data type (DataTypes.STRING, INTEGER, BOOLEAN, etc.) |
| `required`     | `boolean`   | Whether parameter is required (default: `false`)     |
| `defaultValue` | `any`       | Default value if not provided                        |

### QueryControllerEvent

Custom methods receive a `QueryControllerEvent` object:

```typescript
interface QueryControllerEvent {
  fullPath: string; // Full request
  path: string; // Full request path
  basepath: string; // Base path
  queryParams: Record<string, unknown>; // Parsed query parameters
}
```

## rawQueryable() Method

The `rawQueryable()` method is the execution engine for custom queries. It:

1. **Executes** raw SQL against the database with parameterized queries
2. **Maps** query results to the controller's model (either `Model<T>` or `QueryModel<T>`)
3. **Returns** results in standard OData response format

### Syntax

```typescript
protected async rawQueryable<T>(
  sql: string,
  params: Record<string, unknown>
): Promise<IQueryExecutionResponse<T>>
```

### Named Parameters

Use `$paramName` syntax for parameter placeholders:

```typescript
// Single parameter
this.rawQueryable('SELECT * FROM users WHERE id = $userId', { userId: 123 });

// Multiple parameters
this.rawQueryable(
  'SELECT * FROM orders WHERE user_id = $userId AND status = $status LIMIT $limit',
  { userId: 123, status: 'active', limit: 10 },
);
```

### Response Format

Returns the same format as standard OData queries:

```json
{
  "@odata.context": "$metadata#Product",
  "value": [
    { "id": 1, "name": "Product A", "salesCount": 150 },
    { "id": 2, "name": "Product B", "salesCount": 120 }
  ],
  "meta": {
    "queryExecutionTime": 15,
    "totalExecutionTime": 20
  }
}
```

## QueryModel

`QueryModel` is the core component for defining response shapes when your SQL query results don't match any existing database table. It's essential for complex queries involving joins, aggregations, or computed columns.

### When to Use QueryModel vs Model<T>

| Use `Model<T>`                            | Use `QueryModel<T>`              |
| ----------------------------------------- | -------------------------------------- |
| Query returns columns from a single table | Query joins multiple tables            |
| Result matches existing model structure   | Result has computed/aggregated columns |

### Why Use QueryModel?

- **Defines response shape** for complex query results
- **Not mapped to a database table** (skipped in Sequelize - no table created)
- **Provides type safety** for raw SQL query results
- **Used for response serialization** in OData format

### Basic Usage

```typescript
import { QueryModel, Table, Column, DataTypes } from '@phrasecode/odata';

@Table({ underscored: true })
export class UserStats extends QueryModel<UserStats> {
  @Column({ dataType: DataTypes.INTEGER })
  userId!: number;

  @Column({ dataType: DataTypes.STRING })
  username!: string;

  @Column({ dataType: DataTypes.STRING })
  departmentName!: string;

  @Column({ dataType: DataTypes.INTEGER })
  orderCount!: number;

  @Column({ dataType: DataTypes.DECIMAL })
  totalSpent!: number;
}
```

### Registration

Register `QueryModel` with DataSource like regular models:

```typescript
const dataSource = new DataSource({
  dialect: 'postgres',
  database: 'mydb',
  models: [
    User, // Regular model - table created
    Order, // Regular model - table created
    UserStats, // QueryModel - NO table created
  ],
});
```

## QueryController

`QueryController` is the core controller for custom SQL-only endpoints. Unlike `ODataControler`, it doesn't provide standard OData query support (`$filter`, `$select`, etc.) - it's designed specifically for custom SQL endpoints defined with `@Query` decorator.

### When to Use

| Use `ODataControler`                     | Use `QueryController`            |
| ---------------------------------------- | ------------------------------------- |
| Need standard OData queries + custom SQL | Only need custom SQL endpoints        |
| Query results match the model structure  | Query results need `QueryModel` |
| Want both `/model` and `/model/custom`   | Only want `/endpoint/custom` routes   |

### Basic Usage

```typescript
import { QueryController, Custom, QueryControllerEvent, DataTypes } from '@phrasecode/odata';
import { UserStats } from './models/UserStats';

export class UserStatsController extends QueryController {
  constructor() {
    super({
      model: UserStats,
      endpoint: '/user-stats',
    });
  }

  @Query({
    method: 'get',
    endpoint: '/by-department',
    parameters: [{ name: 'departmentId', type: DataTypes.INTEGER, required: true }],
  })
  public async getStatsByDepartment(event: QueryControllerEvent) {
    return this.rawQueryable(
      `SELECT 
        u.id as user_id,
        u.username,
        d.name as department_name,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.total), 0) as total_spent
       FROM users u
       INNER JOIN departments d ON u.department_id = d.id
       LEFT JOIN orders o ON o.user_id = u.id
       WHERE d.id = $departmentId
       GROUP BY u.id, u.username, d.name`,
      { departmentId: event.queryParams.departmentId },
    );
  }
}
```

## Complete Example

### 1. Define the QueryModel

```typescript
// models/SalesReport.ts
import { QueryModel, Table, Column, DataTypes } from '@phrasecode/odata';

@Table({ underscored: true })
export class SalesReport extends QueryModel<SalesReport> {
  @Column({ dataType: DataTypes.STRING })
  productName!: string;

  @Column({ dataType: DataTypes.STRING })
  categoryName!: string;

  @Column({ dataType: DataTypes.INTEGER })
  totalOrders!: number;

  @Column({ dataType: DataTypes.INTEGER })
  totalQuantity!: number;

  @Column({ dataType: DataTypes.DECIMAL })
  totalRevenue!: number;
}
```

### 2. Create the Controller

```typescript
// controllers/SalesReportController.ts
import { QueryController, Custom, QueryControllerEvent, DataTypes } from '@phrasecode/odata';
import { SalesReport } from '../models/SalesReport';

export class SalesReportController extends QueryController {
  constructor() {
    super({
      model: SalesReport,
      endpoint: '/sales-report',
    });
  }

  @Query({
    method: 'get',
    endpoint: '/by-date-range',
    parameters: [
      { name: 'startDate', type: DataTypes.STRING, required: true },
      { name: 'endDate', type: DataTypes.STRING, required: true },
      { name: 'categoryId', type: DataTypes.INTEGER },
    ],
  })
  public async getSalesByDateRange(event: QueryControllerEvent) {
    const { queryParams } = event;

    let whereClause = 'WHERE o.order_date BETWEEN $startDate AND $endDate';
    if (queryParams.categoryId) {
      whereClause += ' AND c.id = $categoryId';
    }

    return this.rawQueryable(
      `SELECT 
        p.name as product_name,
        c.name as category_name,
        COUNT(DISTINCT o.id) as total_orders,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.price * oi.quantity) as total_revenue
       FROM products p
       INNER JOIN categories c ON p.category_id = c.id
       INNER JOIN order_items oi ON oi.product_id = p.id
       INNER JOIN orders o ON oi.order_id = o.id
       ${whereClause}
       GROUP BY p.id, p.name, c.name
       ORDER BY total_revenue DESC`,
      queryParams,
    );
  }
}
```

### 3. Register with Router

```typescript
// server.ts
import { DataSource, ExpressRouter } from '@phrasecode/odata';
import { Product, Category, Order, OrderItem } from './models';
import { SalesReport } from './models/SalesReport';
import { SalesReportController } from './controllers/SalesReportController';

const dataSource = new DataSource({
  dialect: 'postgres',
  database: 'mydb',
  models: [Product, Category, Order, OrderItem, SalesReport],
});

new ExpressRouter(app, {
  controllers: [new SalesReportController()],
  dataSource,
});
```

### 4. Query the Endpoint

```bash
GET /sales-report/by-date-range?startDate=2024-01-01&endDate=2024-12-31&categoryId=5
```

**Response:**

```json
{
  "@odata.context": "$metadata#SalesReport",
  "value": [
    {
      "productName": "Widget Pro",
      "categoryName": "Electronics",
      "totalOrders": 150,
      "totalQuantity": 450,
      "totalRevenue": 67500.0
    }
  ],
  "meta": {
    "queryExecutionTime": 45,
    "totalExecutionTime": 50
  }
}
```

## Using @Query with Regular Model<T>

When your SQL query returns columns that match an existing model's structure, you can use `@Query` decorator directly on an `ODataControler` with a regular `Model<T>`. No need for `QueryModel`.

```typescript
import { ODataControler, Custom, QueryControllerEvent, DataTypes } from '@phrasecode/odata';
import { Product } from './models/Product';

export class ProductController extends ODataControler {
  constructor() {
    super({ model: Product, allowedMethod: ['get'] });
  }

  // Standard OData query still works
  // GET /product?$filter=price gt 100

  // Custom endpoint returning Product columns
  // GET /product/featured
  @Query({ method: 'get', endpoint: '/featured' })
  async getFeatured(event: QueryControllerEvent) {
    // Query returns Product columns → maps to Product model
    return this.rawQueryable(
      'SELECT * FROM products WHERE is_featured = true ORDER BY created_at DESC LIMIT 10',
      {},
    );
  }

  // Custom endpoint with parameters
  // GET /product/low-stock?threshold=10
  @Query({
    method: 'get',
    endpoint: '/low-stock',
    parameters: [{ name: 'threshold', type: DataTypes.INTEGER, required: true }],
  })
  async getLowStock(event: QueryControllerEvent) {
    // Query returns Product columns → maps to Product model
    return this.rawQueryable(
      'SELECT * FROM products WHERE stock <= $threshold ORDER BY stock ASC',
      { threshold: event.queryParams.threshold },
    );
  }
}
```

**Key Point:** The `rawQueryable()` method maps results to the controller's model. If your SQL returns columns that match `Product`, use `ODataControler` with `Product`. If your SQL returns a different shape (joins, aggregations), use `QueryController` with `QueryModel`.

## Combining OData and Custom Endpoints

A single `ODataControler` can have both standard OData queries and custom SQL endpoints.

```typescript
export class ProductController extends ODataControler {
  constructor() {
    super({ model: Product, allowedMethod: ['get'] });
  }

  // Standard OData: GET /product?$filter=price gt 100
  async get(query: QueryParser) {
    return this.queryable<Product>(query);
  }

  // Custom: GET /product/featured
  @Query({ method: 'get', endpoint: '/featured' })
  async getFeatured(event: QueryControllerEvent) {
    return this.rawQueryable(
      'SELECT * FROM products WHERE is_featured = true ORDER BY created_at DESC LIMIT 10',
      {},
    );
  }

  // Custom: GET /product/low-stock?threshold=10
  @Query({
    method: 'get',
    endpoint: '/low-stock',
    parameters: [{ name: 'threshold', type: DataTypes.INTEGER, required: true }],
  })
  async getLowStock(event: QueryControllerEvent) {
    return this.rawQueryable(
      'SELECT * FROM products WHERE stock <= $threshold ORDER BY stock ASC',
      { threshold: event.queryParams.threshold },
    );
  }
}
```

## Best Practices

### 1. Use QueryModel for Complex Joins

Always define a `QueryModel` when your query result shape differs from existing models.

### 2. Validate Required Parameters

The framework automatically validates required parameters and returns 400 errors:

```typescript
parameters: [{ name: 'userId', type: DataTypes.INTEGER, required: true }];
// Returns 400 if userId is missing
```

### 3. Use Default Values

Provide sensible defaults for optional parameters:

```typescript
parameters: [
  { name: 'limit', type: DataTypes.INTEGER, defaultValue: 20 },
  { name: 'offset', type: DataTypes.INTEGER, defaultValue: 0 },
];
```

### 4. Match Column Names

Ensure `QueryModel` column names match your SQL query aliases:

```typescript
// SQL: SELECT u.id as user_id, COUNT(*) as order_count
// Model:
@Column({ dataType: DataTypes.INTEGER })
userId!: number;  // Matches 'user_id' with underscored: true

@Column({ dataType: DataTypes.INTEGER })
orderCount!: number;  // Matches 'order_count' with underscored: true
```

### 5. Use Parameterized Queries

Always use named parameters to prevent SQL injection:

```typescript
// ✅ Good - parameterized
this.rawQueryable('SELECT * FROM users WHERE id = $userId', { userId });

// ❌ Bad - string concatenation
this.rawQueryable(`SELECT * FROM users WHERE id = ${userId}`, {});
```
