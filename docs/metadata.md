# Metadata Endpoint

The framework automatically provides an OData v4 compliant `$metadata` endpoint that describes all your entities, their properties, data types, and relationships.

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
    const metadata = odataRouter.getMetaData();
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

const router = new OpenRouter({ dataSource });

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

The metadata endpoint returns a JSON object describing all entities:

```json
{
  "entities": [
    {
      "name": "User",
      "keys": ["id"],
      "properties": [
        {
          "name": "id",
          "type": "INTEGER",
          "nullable": false,
          "primaryKey": true,
          "autoIncrement": true
        },
        {
          "name": "name",
          "type": "STRING",
          "nullable": false
        },
        {
          "name": "email",
          "type": "STRING",
          "nullable": false,
          "unique": true
        }
      ],
      "navigationProperties": [
        {
          "name": "orders",
          "type": "Collection(Order)",
          "reference": [
            {
              "sourceKey": "id",
              "targetKey": "userId"
            }
          ]
        }
      ]
    }
  ]
}
```

## Metadata Structure

### Entity Object

| Field                  | Type     | Description                                                |
| ---------------------- | -------- | ---------------------------------------------------------- |
| `name`                 | string   | The entity name (model class name)                         |
| `keys`                 | string[] | Array of primary key property names                        |
| `properties`           | array    | Array of property definitions (columns)                    |
| `navigationProperties` | array    | Array of relationship definitions (optional, if relations) |

### Property Object

| Field           | Type    | Description                                  |
| --------------- | ------- | -------------------------------------------- |
| `name`          | string  | Property name                                |
| `type`          | string  | Data type (INTEGER, STRING, BOOLEAN, etc.)   |
| `nullable`      | boolean | Whether the property can be null             |
| `primaryKey`    | boolean | Whether this is a primary key (optional)     |
| `autoIncrement` | boolean | Whether the value auto-increments (optional) |
| `unique`        | boolean | Whether the value must be unique (optional)  |
| `defaultValue`  | any     | Default value for the property (optional)    |

### Navigation Property Object

| Field       | Type   | Description                                                                |
| ----------- | ------ | -------------------------------------------------------------------------- |
| `name`      | string | Navigation property name                                                   |
| `type`      | string | Target entity type. `Collection(EntityName)` for one-to-many relationships |
| `reference` | array  | Array of key mappings between source and target entities (optional)        |

## Use Cases

1. **API Documentation**: Generate automatic documentation for your API
2. **Client Code Generation**: Auto-generate TypeScript/JavaScript client libraries
3. **OData Client Tools**: Enable OData-compliant tools to discover your API structure
4. **Validation**: Validate queries against the schema before execution
5. **Schema Discovery**: Allow developers to explore available entities and their relationships

## Using Metadata Programmatically

```typescript
// Fetch and use metadata
const response = await fetch('http://localhost:3000/$metadata');
const metadata = await response.json();

// Find all entities
console.log('Available entities:', metadata.entities.map(e => e.name));

// Find all properties of User entity
const userEntity = metadata.entities.find(e => e.name === 'User');
console.log('User properties:', userEntity.properties.map(p => p.name));

// Find all relationships of User entity
console.log('User relationships:', userEntity.navigationProperties.map(n => n.name));

// Find primary keys
console.log('User primary keys:', userEntity.keys);
```

## Next Steps

- [Learn about OData querying](./querying.md)
- [Set up logging](./logging.md)
- [Review best practices](./best-practices.md)

