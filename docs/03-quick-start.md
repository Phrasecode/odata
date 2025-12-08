---
sidebar_position: 3
---

# Quick Start Guide

Build your first OData API with Express.js in 5 minutes! This guide uses the **ExpressRouter** for a complete, production-ready solution.

## What You'll Build

A fully functional REST API with OData v4 query capabilities for a simple blog system with Users and Posts.

**Features you'll get:**

- ✅ Full OData query support ($filter, $select, $expand, $orderby, $top, $skip)
- ✅ Automatic metadata endpoint
- ✅ Type-safe models with decorators
- ✅ Relationship support (one-to-many)
- ✅ Connection pooling for performance

## Step 1: Create a New Project

```bash
# Create project directory
mkdir my-odata-api
cd my-odata-api

# Initialize npm project
npm init -y

# Install dependencies
npm install @phrasecode/odata express sqlite3
npm install --save-dev typescript @types/express @types/node ts-node nodemon

# Initialize TypeScript
npx tsc --init
```

## Step 2: Configure TypeScript

Update your `tsconfig.json` to enable decorators:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## Step 3: Define Your Models

Create `src/models/user.ts`:

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

Create `src/models/post.ts`:

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

## Step 4: Create Controllers

Create `src/controllers/user.controller.ts`:

```typescript
import { ODataControler, QueryParser } from '@phrasecode/odata';
import { User } from '../models/user';

export class UserController extends ODataControler {
  constructor() {
    super({
      model: User,
      allowedMethod: ['get'],
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

Create `src/controllers/post.controller.ts`:

```typescript
import { ODataControler } from '@phrasecode/odata';
import { Post } from '../models/post';

export class PostController extends ODataControler {
  constructor() {
    super({
      model: Post,
      allowedMethod: ['get'],
    });
  }
}
```

## Step 5: Set Up Express Server

Create `src/server.ts`:

```typescript
import express from 'express';
import { DataSource, ExpressRouter } from '@phrasecode/odata';
import { User } from './models/user';
import { Post } from './models/post';
import { UserController } from './controllers/user.controller';
import { PostController } from './controllers/post.controller';

const app = express();
const PORT = 3000;

// Parse JSON request bodies
app.use(express.json());

// Create DataSource with connection pooling
const dataSource = new DataSource({
  dialect: 'sqlite',
  storage: './database.sqlite',
  models: [User, Post],
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
});

// Initialize controllers
const userController = new UserController();
const postController = new PostController();

// Set up ExpressRouter with controllers
new ExpressRouter(app, {
  controllers: [userController, postController],
  dataSource,
  logger: {
    enabled: true,
    logLevel: 'INFO',
    advancedOptions: {
      logDbExecutionTime: true,
    },
  },
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

## Step 6: Add NPM Scripts

Update your `package.json`:

```json
{
  "name": "my-odata-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "@phrasecode/odata": "^0.2.1",
    "express": "^4.18.0",
    "sqlite3": "^5.1.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/node": "^20.0.0",
    "nodemon": "^3.0.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.1.0"
  }
}
```

## Step 7: Run Your API

```bash
npm run dev
```

You should see:

```
🚀 Server running on http://localhost:3000
📊 Metadata: http://localhost:3000/$metadata
👥 Users: http://localhost:3000/User
📝 Posts: http://localhost:3000/Post
```

## Step 8: Test Your API

### Get Metadata

```bash
curl http://localhost:3000/$metadata
```

Returns OData v4 compliant XML metadata describing your entities.

### Get All Users

```bash
curl http://localhost:3000/User
```

### Select Specific Fields

```bash
curl "http://localhost:3000/User?\$select=name,email"
```

### Filter Users

```bash
# Users older than 25
curl "http://localhost:3000/User?\$filter=age gt 25"

# Users with specific email
curl "http://localhost:3000/User?\$filter=email eq 'john@example.com'"
```

### Expand Relationships

```bash
# Get users with their posts
curl "http://localhost:3000/User?\$expand=posts"

# Get posts with user information
curl "http://localhost:3000/Post?\$expand=user"
```

### Combine Multiple Options

```bash
# Get users over 25, select name and email, include posts, order by name
curl "http://localhost:3000/User?\$filter=age gt 25&\$select=name,email&\$expand=posts&\$orderby=name asc"
```

### Pagination

```bash
# Get first 10 users
curl "http://localhost:3000/User?\$top=10"

# Skip first 10, get next 10
curl "http://localhost:3000/User?\$top=10&\$skip=10"
```

### Count Results

```bash
# Get total count of users
curl "http://localhost:3000/User?\$count=true"
```

## Understanding the Response

All responses follow this structure:

```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30
    }
  ],
  "meta": {
    "count": 1,
    "totalExecutionTime": "45ms"
  }
}
```

- **data**: Array of results
- **meta.count**: Total number of records (when `$count=true`)
- **meta.totalExecutionTime**: Query execution time

## Project Structure

Your final project structure should look like:

```
my-odata-api/
├── src/
│   ├── models/
│   │   ├── user.ts
│   │   └── post.ts
│   ├── controllers/
│   │   ├── user.controller.ts
│   │   └── post.controller.ts
│   └── server.ts
├── package.json
├── tsconfig.json
```

## What Just Happened?

Let's break down what the **ExpressRouter** did for you automatically:

### 1. Automatic Route Registration

```typescript
new ExpressRouter(app, {
  controllers: [userController, postController],
  dataSource,
});
```

This single line:

- ✅ Registered `/User` endpoint for the User model
- ✅ Registered `/Post` endpoint for the Post model
- ✅ Set up `/$metadata` endpoint automatically
- ✅ Configured OData query parsing for all endpoints
- ✅ Added error handling and logging

### 2. OData Query Support

Each endpoint automatically supports:

- **$select** - Choose which fields to return
- **$filter** - Filter results with complex conditions
- **$expand** - Include related entities
- **$orderby** - Sort results
- **$top** - Limit number of results
- **$skip** - Skip results for pagination
- **$count** - Get total count

### 3. Metadata Endpoint

The `/$metadata` endpoint provides:

- Complete schema information
- Entity definitions
- Property types
- Relationship mappings
- OData v4 compliant XML

## Key Concepts

### Controllers

Controllers define which HTTP methods are allowed and can add custom business logic:

```typescript
export class UserController extends ODataControler {
  constructor() {
    super({
      model: User, // The model this controller handles
      allowedMethod: ['get'], // Only allow GET requests
    });
  }

  // Override to add custom logic
  public async get(query: QueryParser) {
    // Add authentication, validation, etc.
    const result = await this.queryable<User>(query);
    return result;
  }
}
```

### DataSource

The DataSource manages database connections and model registration:

```typescript
const dataSource = new DataSource({
  dialect: 'sqlite', // Database type
  database: 'my-database',
  models: [User, Post], // Register all models
  pool: {
    // Connection pooling for performance
    max: 5,
    min: 0,
    idle: 10000,
  },
});
```

### Models

Models define your data structure using decorators:

```typescript
@Table({ tableName: 'users' })
export class User extends Model<User> {
  @Column({
    dataType: DataTypes.INTEGER,
    isPrimaryKey: true,
    isAutoIncrement: true,
  })
  id!: number;

  @HasMany(() => Post, {
    relation: [
      {
        foreignKey: 'id',
        sourceKey: 'userId',
      },
    ],
  })
  posts!: Post[];
}
```

### Adding Authentication

Add authentication middleware to your controller:

```typescript
export class UserController extends ODataControler {
  constructor() {
    super({
      model: User,
      allowedMethod: ['get'],
    });
  }

  public async get(query: QueryParser) {
    // Add authentication check
    const token = query.getHeaders()?.authorization;
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Verify token...

    const result = await this.queryable<User>(query);
    return result;
  }
}
```

## Summary

In this quick start, you:

- ✅ Created a TypeScript project with OData support
- ✅ Defined models with decorators and relationships
- ✅ Set up controllers for business logic
- ✅ Configured ExpressRouter for automatic endpoint registration
- ✅ Tested OData queries ($filter, $select, $expand, etc.)
- ✅ Learned about metadata endpoints
- ✅ Understood the response structure

**Time to build:** ~5 minutes
**Lines of code:** ~150 lines
**Features gained:** Full OData v4 API with relationships, filtering, pagination, custom raw queries, and more!
