# Getting Started

This guide will help you get up and running with the Node OData Framework quickly.

## Installation

Install the package using npm:

```bash
npm install @phrasecode/odata
```

## Database Driver Installation

This package uses Sequelize as the ORM layer and requires you to install the appropriate database driver for your database. Install the driver(s) you need:

### PostgreSQL

```bash
npm install pg pg-hstore
```

### MySQL

```bash
npm install mysql2
```

### MariaDB

```bash
npm install mariadb
```

### SQLite

```bash
npm install sqlite3
```

### Microsoft SQL Server

```bash
npm install tedious
```

### Oracle Database

```bash
npm install oracledb
```

> **Note**: You only need to install the driver for the database you're using. The drivers are listed as optional peer dependencies, so npm will show warnings if they're not installed, but you can safely ignore warnings for databases you're not using.

## Quick Start

Here's a minimal example to get you started:

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

## Next Steps

- [Learn about defining models](./models.md)
- [Configure your DataSource](./datasource.md)
- [Explore integration options](./integration.md)
- [Master OData querying](./querying.md)
- [Review best practices](./best-practices.md)

