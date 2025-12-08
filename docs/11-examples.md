---
sidebar_position: 11
---

# Real-World Examples

This guide provides practical examples for common use cases.

## Basic Query Examples

### Get Active Users with Departments

```
GET /User?$filter=status eq 'active'&$expand=department&$select=name,email,department/departmentName&$orderby=name asc&$top=20
```

### Get High-Value Orders with Customer Details

```
GET /Order?$filter=total gt 1000&$expand=customer($select=name,email)&$orderby=total desc&$top=10
```

### Get Products in Specific Categories

```
GET /Product?$filter=category in ('Electronics','Computers') and stock gt 0&$select=name,price,stock&$orderby=price asc
```

### Complex Nested Expansion

```
GET /User?$expand=department($expand=employees;$select=departmentName)&$filter=age gt 25
```

### String Function Combinations

```
GET /User?$filter=contains(tolower(name),'john') and length(email) gt 10 and endswith(email,'@company.com')
```

## Advanced Query Examples

### Navigation Property Count with Filters

Get departments with more than 5 active users:

```
GET /Department?$filter=users/$count gt 5&$expand=users($filter=isActive eq true;$select=username,email)&$select=departmentName
```

Get users with no notes:

```
GET /User?$filter=notes/$count eq 0&$select=username,email
```

Get categories with products in stock:

```
GET /Category?$filter=products/$count gt 0&$expand=products($filter=stock gt 0;$select=name,price,stock)
```

### Arithmetic Expressions in Filters

Get orders where total after discount is greater than 1000:

```
GET /Order?$filter=((price mul quantity) sub discount) gt 1000&$select=orderId,price,quantity,discount
```

Get users whose ID is divisible by 3:

```
GET /User?$filter=(userId mod 3) eq 0&$select=userId,username
```

Get notes where content is twice as long as title:

```
GET /Note?$filter=(length(content) div 2) eq length(title)&$select=noteId,title,content
```

### Deep Nested Expansions

Three-level expansion with filters at each level:

```
GET /Department?$expand=users($filter=isActive eq true;$expand=notes($filter=isArchived eq false;$expand=category($select=categoryName)))&$select=departmentName
```

Five-level expansion:

```
GET /Department?$expand=users($expand=notes($expand=category($expand=creator($expand=department))))&$top=5
```

Complex nested with multiple options:

```
GET /User?$expand=notes($filter=isPinned eq true;$expand=category($select=categoryName,description);$select=title,content;$orderby=createdAt desc;$top=10)&$select=username,email
```

### Combining Multiple Advanced Features

Navigation count + arithmetic + nested expansion:

```
GET /Department?$filter=users/$count gt 0&$expand=users($filter=(userId mod 2) eq 0 and isActive eq true;$expand=notes($filter=isArchived eq false);$select=userId,username)&$select=departmentName&$top=10
```

String functions + date functions + expansion:

```
GET /User?$filter=contains(tolower(email),'@company.com') and year(createdAt) eq 2024&$expand=department($select=departmentName)&$orderby=createdAt desc
```

Arithmetic + string functions + nested filters:

```
GET /Note?$filter=(length(content) div 2) gt 100 and contains(tolower(title),'important')&$expand=user($select=username),category($select=categoryName)&$orderby=createdAt desc&$top=20
```

### Pagination with Complex Filters

Paginated results with multiple filters and expansions:

```
GET /Order?$filter=year(orderDate) eq 2024 and (total sub discount) gt 500&$expand=customer($select=name,email),items($select=productName,quantity,price)&$orderby=orderDate desc&$top=25&$skip=50
```

Paginated nested expansion:

```
GET /Department?$expand=users($filter=isActive eq true;$top=10;$skip=0;$orderby=username asc)&$select=departmentName&$orderby=departmentName asc&$top=20
```

## Industry-Specific Examples

### E-commerce: Active Products with Reviews

```
GET /Product?$filter=isActive eq true and stock gt 0 and averageRating ge 4.0&$expand=reviews($filter=rating ge 4;$top=5;$orderby=createdAt desc;$select=rating,comment,userName)&$select=name,price,stock,averageRating&$orderby=averageRating desc,price asc&$top=20
```

### CRM: High-Value Customers with Recent Orders

```
GET /Customer?$filter=orders/$count gt 10 and totalSpent gt 10000&$expand=orders($filter=year(orderDate) eq 2024;$top=5;$orderby=orderDate desc;$select=orderId,total,orderDate)&$select=customerId,name,email,totalSpent&$orderby=totalSpent desc&$top=50
```

### Blog: Popular Posts with Comments

```
GET /Post?$filter=comments/$count gt 20 and year(publishedAt) eq 2024&$expand=author($select=name,avatar),comments($filter=isApproved eq true;$top=10;$orderby=createdAt desc;$select=content,authorName,createdAt)&$select=title,content,publishedAt,viewCount&$orderby=viewCount desc&$top=10
```

### Project Management: Active Projects with Tasks

```
GET /Project?$filter=status eq 'active' and tasks/$count gt 0&$expand=tasks($filter=status ne 'completed';$expand=assignee($select=name,email);$select=taskName,status,dueDate;$orderby=dueDate asc)&$select=projectName,startDate,endDate&$orderby=startDate desc
```

### Analytics: User Activity Report

```
GET /User?$filter=year(lastLoginAt) eq 2024 and notes/$count gt 5&$expand=notes($filter=year(createdAt) eq 2024;$select=title,createdAt),department($select=departmentName)&$select=username,email,lastLoginAt&$orderby=lastLoginAt desc&$top=100
```

## Custom Query Examples

For complex queries that OData can't express, use the `@Query` decorator with `rawQueryable()`:

📖 **[Learn more about Custom Queries](./15-custom-queries.md)**

## Custom Query with QueryModel Example

### UserActivity Report

```typescript
// models/UserActivity.ts
import { QueryModel, Table, Column, DataTypes } from '@phrasecode/odata';

@Table({ underscored: true })
export class UserActivity extends QueryModel<UserActivity> {
  @Column({ dataType: DataTypes.INTEGER })
  userId!: number;

  @Column({ dataType: DataTypes.STRING })
  username!: string;

  @Column({ dataType: DataTypes.STRING })
  email!: string;

  @Column({ dataType: DataTypes.STRING })
  departmentName!: string;

  @Column({ dataType: DataTypes.INTEGER })
  totalOrders!: number;

  @Column({ dataType: DataTypes.DECIMAL })
  totalSpent!: number;

  @Column({ dataType: DataTypes.DATE })
  lastOrderDate!: Date;

  @Column({ dataType: DataTypes.INTEGER })
  daysInactive!: number;
}

// controllers/UserActivityController.ts
import { QueryController, Custom, QueryControllerEvent, DataTypes } from '@phrasecode/odata';

export class UserActivityController extends QueryController {
  constructor() {
    super({
      model: UserActivity,
      endpoint: '/user-activity',
    });
  }

  @Query({
    method: 'get',
    endpoint: '/inactive',
    parameters: [
      { name: 'days', type: DataTypes.INTEGER, defaultValue: 30 },
      { name: 'limit', type: DataTypes.INTEGER, defaultValue: 50 },
    ],
  })
  public async getInactiveUsers(event: QueryControllerEvent) {
    const { queryParams } = event;
    return this.rawQueryable(
      `SELECT 
        u.id as user_id,
        u.username,
        u.email,
        d.name as department_name,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total), 0) as total_spent,
        MAX(o.order_date) as last_order_date,
        EXTRACT(DAY FROM NOW() - MAX(o.order_date)) as days_inactive
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN orders o ON o.user_id = u.id
       GROUP BY u.id, u.username, u.email, d.name
       HAVING MAX(o.order_date) IS NULL 
          OR EXTRACT(DAY FROM NOW() - MAX(o.order_date)) > $days
       ORDER BY days_inactive DESC
       LIMIT $limit`,
      queryParams,
    );
  }
}
```

## Complete Application Examples

### Express.js Application

```typescript
import express from 'express';
import { DataSource, ExpressRouter, ODataControler } from '@phrasecode/odata';
import { User, Order, Product, Department } from './models';

const app = express();

const dataSource = new DataSource({
  dialect: 'postgres',
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  pool: {
    max: 10,
    min: 2,
    idle: 10000,
  },
  models: [User, Order, Product, Department],
});

const userController = new ODataControler({
  model: User,
  allowedMethod: ['get'],
});

const orderController = new ODataControler({
  model: Order,
  allowedMethod: ['get'],
});

new ExpressRouter(app, {
  controllers: [userController, orderController],
  dataSource,
  logger: {
    enabled: true,
    logLevel: 'INFO',
    advancedOptions: {
      logDbExecutionTime: true,
    },
  },
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Next.js Application

```typescript
// lib/db-setup.ts
import { DataSource, OpenRouter } from '@phrasecode/odata';
import { User, Order, Product } from '../models';

let odataRouter: OpenRouter;

export const initializeODataRouter = () => {
  if (odataRouter) return odataRouter;

  const dataSource = new DataSource({
    dialect: 'postgres',
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    pool: { max: 10, min: 2, idle: 10000 },
    models: [User, Order, Product],
  });

  odataRouter = new OpenRouter({ dataSource });
  return odataRouter;
};

// pages/api/users.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { initializeODataRouter } from '../../lib/db-setup';
import { User } from '../../models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const router = initializeODataRouter();
    const result = await router.queryble(User)(req.url);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
```

### AWS Lambda Application

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DataSource, OpenRouter } from '@phrasecode/odata';
import { User, Order } from './models';

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
    pool: { max: 5, min: 1, idle: 10000 },
    models: [User, Order],
  });

  odataRouter = new OpenRouter({ dataSource });
  return odataRouter;
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const router = initRouter();
    const path =
      event.path +
      (event.queryStringParameters
        ? '?' + new URLSearchParams(event.queryStringParameters).toString()
        : '');

    const result = await router.queryble(User)(path);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```
