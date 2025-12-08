---
sidebar_position: 1
---

# $select

The `$select` query option specifies which properties to include in the response. This is useful for reducing payload size and improving performance by only returning the data you need.

## Basic Usage

```
GET /users?$select=id,name,email
```

Returns only the `id`, `name`, and `email` fields for each user.

## Syntax

```
$select=field1,field2,field3
```

Multiple fields are separated by commas.

## Examples

### Select Single Field

```
GET /products?$select=name
```

**Response:**

```json
{
  "@odata.context": "Product",
  "value": [{ "name": "Laptop" }, { "name": "Phone" }, { "name": "Tablet" }]
}
```

### Select Multiple Fields

```
GET /users?$select=id,firstName,lastName,email
```

**Response:**

```json
{
  "@odata.context": "User",
  "value": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    {
      "id": 2,
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com"
    }
  ]
}
```

### Select All Fields (Default)

When `$select` is not specified, all fields are returned:

```
GET /users
```

## Combining with Other Query Options

### With $filter

```
GET /users?$select=id,name,email&$filter=age gt 18
```

Returns only `id`, `name`, and `email` for users older than 18.

### With $orderby

```
GET /products?$select=name,price&$orderby=price desc
```

Returns `name` and `price`, sorted by price descending.

### With $expand

```
GET /orders?$select=id,orderDate&$expand=items($select=productName,quantity)
```

Returns order `id` and `orderDate`, with expanded items showing only `productName` and `quantity`.

### With $top and $skip

```
GET /users?$select=id,name&$top=10&$skip=20
```

Returns `id` and `name` for 10 users, skipping the first 20.

## Best Practices

1. **Always use $select in production** - Reduces payload size and improves performance
2. **Select only what you need** - Avoid selecting unnecessary fields
3. **Use with $expand** - Apply `$select` to expanded entities to minimize nested data

```typescript
// Good - only fetch needed fields
GET / users ? $select = id, name, email;

// Avoid - fetching all fields when only a few are needed
GET / users;
```

## Notes

- Field names are case-sensitive and must match your model property names
- Invalid field names will result in an error
- The `$select` option applies to the main entity; use nested `$select` within `$expand` for related entities
