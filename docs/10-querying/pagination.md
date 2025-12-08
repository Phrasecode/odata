---
sidebar_position: 5
---

# Pagination - $top, $skip, and $count

Pagination allows you to retrieve data in manageable chunks. The framework supports `$top`, `$skip`, and `$count` query options for implementing pagination.

## Query Options

| Option   | Description                         | Example       |
| -------- | ----------------------------------- | ------------- |
| `$top`   | Maximum number of records to return | `$top=10`     |
| `$skip`  | Number of records to skip           | `$skip=20`    |
| `$count` | Include total count (without pagination) in response     | `$count=true` |

## $top - Limiting Results

The `$top` option specifies the maximum number of records to return.

```
GET /users?$top=10
```

Returns at most 10 users.

### Examples

```
GET /products?$top=20
GET /orders?$top=50
GET /articles?$top=5
```

### Default and Maximum Values

You can configure default and maximum values for `$top` in the router configuration:

```typescript
new ExpressRouter(app, {
  controllers: [userController],
  dataSource: dataSource,
  queryOptions: {
    defaultTop: 20, // Default if $top not specified
    maxTop: 1000, // Maximum allowed value
  },
});
```

**Note:** The framework enforces a maximum `$top` value of 1000 by default.

## $skip - Skipping Records

The `$skip` option specifies how many records to skip before returning results.

```
GET /users?$skip=10
```

Skips the first 10 users and returns the rest.

### Examples

```
GET /products?$skip=20
GET /orders?$skip=100
```

## Combining $top and $skip

Use both options together for page-based pagination:

```
GET /users?$top=10&$skip=0    // Page 1 (records 1-10)
GET /users?$top=10&$skip=10   // Page 2 (records 11-20)
GET /users?$top=10&$skip=20   // Page 3 (records 21-30)
```

### Pagination Formula

```
$skip = (pageNumber - 1) * pageSize
$top = pageSize
```

**Example for page 5 with 20 items per page:**

```
$skip = (5 - 1) * 20 = 80
$top = 20

GET /products?$top=20&$skip=80
```

## $count - Getting Total Count

The `$count` option includes the total number of matching records in the response.

```
GET /users?$count=true
```

**Response:**

```json
{
  "@odata.context": "User",
  "@odata.count": 150,
  "value": [
    { "id": 1, "name": "John" },
    { "id": 2, "name": "Jane" }
    // ... more users
  ]
}
```

### With Pagination

```
GET /users?$top=10&$skip=20&$count=true
```

**Response:**

```json
{
  "@odata.context": "User",
  "@odata.count": 150,
  "value": [
    // 10 users (records 21-30)
  ]
}
```

The `@odata.count` shows the total (150), while `value` contains only the requested page (10 records).

### With Filters

```
GET /users?$filter=status eq 'active'&$count=true
```

The count reflects the filtered total, not all records.

## Complete Pagination Examples

### Basic Pagination

```
GET /products?$top=20&$skip=0&$count=true
```

### Sorted Pagination

```
GET /products?$orderby=createdAt desc&$top=20&$skip=40&$count=true
```

Returns page 3 (20 items), sorted by newest first, with total count.

### Filtered Pagination

```
GET /products?$filter=categoryId eq 5 and inStock eq true&$orderby=price asc&$top=20&$skip=0&$count=true
```

Returns first page of in-stock products in category 5, sorted by price.

### Full Query with Pagination

```
GET /orders?$select=id,orderDate,total,status&$filter=status ne 'cancelled'&$orderby=orderDate desc&$top=25&$skip=50&$count=true&$expand=customer($select=name)
```

## Configuration Options

Configure pagination defaults in your router:

```typescript
new ExpressRouter(app, {
  controllers: [userController, productController],
  dataSource: dataSource,
  queryOptions: {
    defaultTop: 20, // Default page size when $top not specified
    defaultSkip: 0, // Default skip value
    maxTop: 1000, // Maximum allowed $top value
  },
});
```

| Option        | Type     | Default | Description                      |
| ------------- | -------- | ------- | -------------------------------- |
| `defaultTop`  | `number` | `0`     | Default $top when not specified  |
| `defaultSkip` | `number` | `0`     | Default $skip when not specified |
| `maxTop`      | `number` | `1000`  | Maximum allowed $top value       |

## Best Practices

1. **Always use $count for UI pagination** - Needed to calculate total pages
2. **Combine with $orderby** - Ensure consistent ordering across pages
3. **Set reasonable defaults** - Configure `defaultTop` to prevent returning all records
4. **Limit maximum page size** - Use `maxTop` to prevent performance issues
5. **Use with $filter** - Pagination works with filtered results

```typescript
// Good - paginated with count and ordering
GET /products?$top=20&$skip=0&$count=true&$orderby=name asc

// Avoid - no pagination on large datasets
GET /products
```

## Notes

- `$skip` and `$top` must be non-negative integers
- `$top` cannot exceed 1000 (configurable via `maxTop`)
- `$count=true` adds a small overhead but is essential for pagination UI
- Pagination is applied after filtering and sorting
- When `$top` is 0 or not specified, all matching records are returned (unless `defaultTop` is configured)