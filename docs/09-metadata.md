---
sidebar_position: 9
---

# Metadata Endpoint

The framework automatically provides an OData v4 compliant `$metadata` endpoint that describes all your entities, their properties, data types, relationships, and query functions in CSDL+JSON format.

## Accessing Metadata

### With Express Router

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

### With OpenRouter (Next.js, Serverless)

For OpenRouter, you need to manually create a metadata endpoint:

**Next.js Example:**

```typescript
// pages/api/$metadata.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { initializeODataRouter } from '../../lib/db-setup';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const odataRouter = initializeODataRouter();
    const metadata = odataRouter.getMetaData('http://localhost:3000');
    res.status(200).json(metadata);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Now accessible at: GET /api/$metadata
```

**Serverless Example (AWS Lambda):**

```typescript
// lambda/metadata.ts
import { OpenRouter } from '@phrasecode/odata';
import { dataSource } from './db-setup';

const router = new OpenRouter({ dataSource, pathMapping: { '/user': User } });

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

## Metadata Response Format

The metadata endpoint returns an OData v4 CSDL+JSON format response:

```json
{
  "$Version": "4.0",
  "$EntityContainer": "OData.Container",
  "entities": {
    "User": {
      "$Kind": "EntityType",
      "$Key": ["id"],
      "$Endpoint": "/user",
      "id": {
        "$Kind": "Property",
        "$Type": "Edm.Int32",
        "$Nullable": false,
        "$AutoIncrement": true
      },
      "name": {
        "$Kind": "Property",
        "$Type": "Edm.String",
        "$Nullable": false
      },
      "email": {
        "$Kind": "Property",
        "$Type": "Edm.String",
        "$Nullable": true
      },
      "departmentId": {
        "$Kind": "Property",
        "$Type": "Edm.Int32",
        "$Nullable": true
      },
      "orders": {
        "$Kind": "NavigationProperty",
        "$Type": "Collection(Order)",
        "$ReferentialConstraint": {
          "id": "Order/userId"
        }
      },
      "department": {
        "$Kind": "NavigationProperty",
        "$Type": "Department",
        "$ReferentialConstraint": {
          "departmentId": "Department/id"
        }
      }
    },
    "Order": {
      "$Kind": "EntityType",
      "$Key": ["id"],
      "$Endpoint": "/order",
      "id": {
        "$Kind": "Property",
        "$Type": "Edm.Int32",
        "$Nullable": false
      },
      "userId": {
        "$Kind": "Property",
        "$Type": "Edm.Int32",
        "$Nullable": false
      },
      "total": {
        "$Kind": "Property",
        "$Type": "Edm.Decimal",
        "$Nullable": false
      },
      "user": {
        "$Kind": "NavigationProperty",
        "$Type": "User",
        "$ReferentialConstraint": {
          "userId": "User/id"
        }
      }
    }
  },
  "functions": {
    "User_getActiveUsers": {
      "$Kind": "QueryModel",
      "resultModel": "User",
      "$Endpoint": "/user/active",
      "properties": {
        "id": { "$Type": "Edm.Int32", "$Nullable": false },
        "name": { "$Type": "Edm.String", "$Nullable": false },
        "email": { "$Type": "Edm.String", "$Nullable": true }
      }
    },
    "getUserStats": {
      "$Kind": "QueryModel",
      "resultModel": "UserStats",
      "$Endpoint": "/user-stats/summary",
      "properties": {
        "userId": { "$Type": "Edm.Int32", "$Nullable": false },
        "orderCount": { "$Type": "Edm.Int32", "$Nullable": false },
        "totalSpent": { "$Type": "Edm.Decimal", "$Nullable": false }
      }
    }
  },
  "metadata": {
    "title": "OData API",
    "baseUrl": "http://localhost:3000",
    "generatedAt": "2024-12-07T10:30:00Z",
    "format": "CSDL+JSON",
    "$Endpoint": "/$metadata"
  }
}
```

## Metadata Structure

### Root Object

| Field              | Type   | Description                                    |
| ------------------ | ------ | ---------------------------------------------- |
| `$Version`         | string | OData version (always "4.0")                   |
| `$EntityContainer` | string | Container name (always "OData.Container")      |
| `entities`         | object | Map of entity names to entity type definitions |
| `functions`        | object | Map of function names to query functions       |
| `metadata`         | object | API metadata information                       |

### Entity Type Object

| Field        | Type     | Description                                |
| ------------ | -------- | ------------------------------------------ |
| `$Kind`      | string   | Always "EntityType"                        |
| `$Key`       | string[] | Array of primary key property names        |
| `$Endpoint`  | string   | API endpoint path for this entity          |
| `[property]` | object   | Property or NavigationProperty definitions |

### Property Object

| Field            | Type    | Description                                  |
| ---------------- | ------- | -------------------------------------------- |
| `$Kind`          | string  | Always "Property"                            |
| `$Type`          | string  | OData EDM type (Edm.Int32, Edm.String, etc.) |
| `$Nullable`      | boolean | Whether the property can be null             |
| `$AutoIncrement` | boolean | Whether the value auto-increments (optional) |
| `$DefaultValue`  | any     | Default value for the property (optional)    |

### Navigation Property Object

| Field                    | Type   | Description                                              |
| ------------------------ | ------ | -------------------------------------------------------- |
| `$Kind`                  | string | Always "NavigationProperty"                              |
| `$Type`                  | string | Target entity type. `Collection(Entity)` for one-to-many |
| `$ReferentialConstraint` | object | Key mappings: `{ sourceKey: "TargetEntity/targetKey" }`  |

### Function Object (Query Endpoints)

| Field         | Type   | Description                               |
| ------------- | ------ | ----------------------------------------- |
| `$Kind`       | string | Always "QueryModel"                       |
| `resultModel` | string | The model name for result mapping         |
| `$Endpoint`   | string | Full endpoint path for this function      |
| `properties`  | object | Map of property names to type definitions |

### Metadata Info Object

| Field         | Type   | Description                               |
| ------------- | ------ | ----------------------------------------- |
| `title`       | string | API title                                 |
| `baseUrl`     | string | Base URL of the API (if provided)         |
| `generatedAt` | string | ISO timestamp when metadata was generated |
| `format`      | string | Always "CSDL+JSON"                        |
| `$Endpoint`   | string | Metadata endpoint path                    |

## OData EDM Types

The framework maps database types to OData EDM types:

| Database Type               | OData EDM Type     |
| --------------------------- | ------------------ |
| INTEGER, INT                | Edm.Int32          |
| BIGINT                      | Edm.Int64          |
| SMALLINT, TINYINT           | Edm.Int16          |
| DECIMAL, NUMERIC            | Edm.Decimal        |
| FLOAT, DOUBLE, REAL         | Edm.Double         |
| BOOLEAN, BOOL               | Edm.Boolean        |
| DATE                        | Edm.Date           |
| DATETIME, TIMESTAMP         | Edm.DateTimeOffset |
| TIME                        | Edm.TimeOfDay      |
| UUID, GUID                  | Edm.Guid           |
| BLOB, BINARY                | Edm.Binary         |
| VARCHAR, TEXT, CHAR, STRING | Edm.String         |

## Use Cases

1. **API Documentation**: Generate automatic documentation for your API
2. **Client Code Generation**: Auto-generate TypeScript/JavaScript client libraries
3. **OData Client Tools**: Enable OData-compliant tools to discover your API structure
4. **Validation**: Validate queries against the schema before execution
5. **Schema Discovery**: Allow developers to explore available entities and their relationships
6. **Query Function Discovery**: Discover custom query endpoints and their parameters

## Using Metadata Programmatically

```typescript
// Fetch and use metadata
const response = await fetch('http://localhost:3000/$metadata');
const metadata = await response.json();

// Get OData version
console.log('OData Version:', metadata.$Version);

// Find all entities
console.log('Available entities:', Object.keys(metadata.entities));

// Find all properties of User entity
const userEntity = metadata.entities.User;
const properties = Object.entries(userEntity)
  .filter(([_, value]) => value.$Kind === 'Property')
  .map(([name]) => name);
console.log('User properties:', properties);

// Find all navigation properties
const navProperties = Object.entries(userEntity)
  .filter(([_, value]) => value.$Kind === 'NavigationProperty')
  .map(([name]) => name);
console.log('User relationships:', navProperties);

// Find primary keys
console.log('User primary keys:', userEntity.$Key);

// Find all query functions
if (metadata.functions) {
  console.log('Available functions:', Object.keys(metadata.functions));

  // Get function endpoint
  const func = metadata.functions['User_getActiveUsers'];
  console.log('Function endpoint:', func.$Endpoint);
}

// Get API info
console.log('API generated at:', metadata.metadata.generatedAt);
```

## Query Functions in Metadata

When you use `@Query` decorator on controllers, the metadata automatically includes these as functions:

```typescript
export class UserController extends ODataControler {
  constructor() {
    super({ model: User, allowedMethod: ['get'] });
  }

  @Query({
    method: 'get',
    endpoint: '/active',
    parameters: [{ name: 'limit', type: DataTypes.INTEGER, defaultValue: 10 }],
  })
  async getActiveUsers(event: QueryControllerEvent) {
    return this.rawQueryable('SELECT * FROM users WHERE is_active = true LIMIT $limit', {
      limit: event.queryParams.limit,
    });
  }
}
```

This will appear in metadata as:

```json
{
  "functions": {
    "User_getActiveUsers": {
      "$Kind": "QueryModel",
      "resultModel": "User",
      "$Endpoint": "/user/active",
      "properties": {
        "id": { "$Type": "Edm.Int32", "$Nullable": false },
        "name": { "$Type": "Edm.String", "$Nullable": false }
      }
    }
  }
}
```
