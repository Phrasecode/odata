# Node OData Framework (TypeScript)

A powerful Node.js framework for building REST APIs with full OData v4 query capabilities. This framework provides a decorator-based approach to define models and automatically generates OData-compliant endpoints with advanced querying features.

> 📖 **Documentation**: For complete guides, tutorials, and API reference, visit **[https://odata.phrasecode.com](https://odata.phrasecode.com)**

## Why This Package?

Building REST APIs with complex querying capabilities can be time-consuming and error-prone. Traditional approaches require you to manually implement filtering, sorting, pagination, and relationship expansion for each endpoint. This package solves these problems by:

- **Eliminating Boilerplate**: Define your data models once using decorators, and get fully functional OData endpoints automatically
- **Type Safety**: Built with TypeScript from the ground up, providing excellent IntelliSense and compile-time type checking
- **Framework Flexibility**: Works with Express.js, Next.js, serverless functions, and any other Node.js framework
- **OData v4 Compliance**: Supports standard OData query options ($filter, $select, $expand, $orderby, $top, $skip, $count) out of the box
- **Database Agnostic**: Currently supports PostgreSQL, MySQL, SQLite, and other Sequelize-compatible databases
- **Developer Experience**: Intuitive decorator-based API that feels natural to TypeScript developers

## Key Features

- ✅ **Decorator-Based Model Definition**: Use TypeScript decorators to define your data models
- ✅ **Full OData v4 Query Support**: `$select`, `$filter`, `$expand`, `$orderby`, `$top`, `$skip`, `$count`
- ✅ **Advanced Filter Capabilities**: Comparison, logical, arithmetic operators, string/date/math functions
- ✅ **Powerful Expansion Features**: Nested expansions (5+ levels), filters on relations, and more
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

You'll also need to install a database driver. See the [Installation Guide](https://odata.phrasecode.com/docs/installation) for details.

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

For more detailed examples, see the [Quick Start Guide](https://odata.phrasecode.com/docs/quick-start).

## Documentation

Full documentation is available at **[https://odata.phrasecode.com](https://odata.phrasecode.com)**

### 🚀 Getting Started

- [Introduction](https://odata.phrasecode.com/docs/intro)
- [Installation](https://odata.phrasecode.com/docs/installation)
- [Quick Start](https://odata.phrasecode.com/docs/quick-start)
- [Express.js Getting Started](https://odata.phrasecode.com/docs/getting-started/express-getting-started)
- [Next.js Getting Started](https://odata.phrasecode.com/docs/getting-started/nextjs-getting-started)

### 📚 Core Concepts

- [DataSource Configuration](https://odata.phrasecode.com/docs/datasource)
- [Defining Models](https://odata.phrasecode.com/docs/models)
- [Controller](https://odata.phrasecode.com/docs/controller)

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

# String functions
GET /User?$filter=contains(name, 'john') or startswith(email, 'admin')

# Arithmetic expressions
GET /Order?$filter=((price mul quantity) sub discount) gt 1000
```

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

See the [Best Practices Guide](https://odata.phrasecode.com/docs/best-practices/) for more optimization tips.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Support

- 📖 [Documentation](https://odata.phrasecode.com)
- 🐛 [GitHub Issues](https://github.com/phrasecode/odata/issues)
- 📧 [Contact](./CONTACT.md)

## Related Resources

- [OData v4 Specification](https://www.odata.org/documentation/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
