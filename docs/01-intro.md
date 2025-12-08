---
sidebar_position: 1
---

# Intro

# Node OData Framework (TypeScript)

A powerful Node.js framework for building REST APIs with full OData v4 query capabilities. This framework provides a decorator-based approach to define models and automatically generates OData-compliant endpoints with advanced querying features.

## Why This Package?

Building REST APIs with complex querying capabilities can be time-consuming and error-prone. Traditional approaches require you to manually implement filtering, sorting, pagination, and relationship expansion for each endpoint. This package solves these problems by:

- **Eliminating Boilerplate**: Define your data models once using decorators, and get fully functional OData endpoints automatically
- **Type Safety**: Built with TypeScript from the ground up, providing excellent IntelliSense and compile-time type checking
- **Framework Flexibility**: Works with Express.js, Next.js, serverless functions, and any other Node.js framework
- **OData v4 Compliance**: Supports standard OData query options ($filter, $select, $expand, $orderby, $top, $skip, $count) out of the box
- **Database Agnostic**: Currently supports PostgreSQL, MySQL, SQLite, and other Sequelize-compatible databases
- **Developer Experience**: Intuitive decorator-based API that feels natural to TypeScript developers

We created this package because existing OData solutions for Node.js were either too complex, lacked TypeScript support, or were tightly coupled to specific frameworks. Our goal was to provide a modern, flexible, and developer-friendly solution that works seamlessly across different Node.js environments.

## Key Features

- ✅ **Decorator-Based Model Definition**: Use TypeScript decorators to define your data models
- ✅ **Full OData v4 Query Support**: `$select`, `$filter`, `$expand`, `$orderby`, `$top`, `$skip`, `$count`
- ✅ **Advanced Filter Capabilities**: Comparison, logical, arithmetic operators, string/date/math functions
- ✅ **Powerful Expansion Features**: Nested expansions (5+ levels), filters on relations, and more
- ✅ **Raw SQL Queries**: `QueryModel` for raw SQL query with parameter validation and more customization
- ✅ **Relationship Support**: One-to-many, one-to-one, and many-to-one relationships
- ✅ **Multiple Integration Options**: Express.js Router and OpenRouter for Next.js/serverless
- ✅ **OData Metadata Endpoint**: Automatic `$metadata` endpoint for API discovery
- ✅ **Type-Safe Query Results**: Full TypeScript support with proper type inference
- ✅ **Database Agnostic**: PostgreSQL, MySQL, SQLite, MariaDB, MSSQL, Oracle
- ✅ **Webpack Compatible**: Special handling for circular dependencies in bundled environments

## Installation

```bash
npm install @phrasecode/odata
```

You'll also need to install a database driver. See the [Installation Guide](./02-installation.md) for details.

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

For more detailed examples, see the [Quick Start Guide](./03-quick-start.md).

## Documentation

### 🚀 Getting Started Guides

Choose your integration approach:

- **[Getting Started Overview](./04-getting-started/04-getting-started.md)** - Choose between ExpressRouter and OpenRouter
- **[Express.js Getting Started](./04-getting-started/express-getting-started.md)** - Complete guide for Express.js applications
- **[Next.js Getting Started](./04-getting-started/nextjs-getting-started.md)** - Complete guide for Next.js (App Router & Pages Router)
- **[Serverless Getting Started](./04-getting-started/serverless-getting-started.md)** - AWS Lambda, Vercel, Netlify deployments

### 📚 Core Documentation

- **[Defining Models](./05-models.md)** - Model decorators, relationships, and best practices
- **[DataSource Configuration](./06-datasource.md)** - Database connection and pooling setup
- **[OData Querying](./10-querying/10-querying.md)** - Complete guide to OData query syntax
- **[Custom SQL Queries](./15-custom-queries.md)** - Raw SQL endpoints with @Query decorator
- **[Metadata Endpoint](./09-metadata.md)** - API discovery and schema introspection
- **[Best Practices](./12-best-practices/12-best-practices.md)** - Performance optimization and tips

## Quick Reference

### OData Query Examples

```
# Select specific fields
GET /User?$select=name,email

# Filter results
GET /User?$filter=age gt 18 and status eq 'active'

# Expand relations
GET /User?$expand=department,orders

# Combine multiple options
GET /User?$filter=age gt 18&$expand=department&$select=name,email&$orderby=name asc&$top=20

# Advanced: Navigation property count
GET /Department?$filter=users/$count gt 5

# Advanced: Arithmetic expressions
GET /Order?$filter=((price mul quantity) sub discount) gt 1000
```

For complete query syntax and examples, see the [OData Querying Guide](./10-querying/10-querying.md).

## Performance Tips

### Connection Pooling

**Critical for production!** Connection pooling improves query performance by 10-15x:

```typescript
const dataSource = new DataSource({
  // ... other config
  pool: {
    max: 10,
    min: 2,
    idle: 10000,
  },
});
```

**Performance Impact:**

- Without pooling: 1000-1500ms per query
- With pooling: 85-110ms per query

See the [Best Practices Guide](./12-best-practices/12-best-practices.md) for more optimization tips.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./14-community/contributing.md) for guidelines.

## Related Resources

- [OData v4 Specification](https://www.odata.org/documentation/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
