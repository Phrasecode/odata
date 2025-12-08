---
sidebar_position: 10
---

# OData Querying

This framework implements OData V4 query syntax, allowing you to filter, sort, paginate, and shape your API responses using standardized query parameters.

## Supported Query Options

| Option     | Description                        | Example                 |
| ---------- | ---------------------------------- | ----------------------- |
| `$select`  | Choose which fields to return      | `$select=id,name,email` |
| `$filter`  | Filter results based on conditions | `$filter=age gt 18`     |
| `$orderby` | Sort results                       | `$orderby=name asc`     |
| `$expand`  | Include related entities           | `$expand=orders`        |
| `$top`     | Limit number of results            | `$top=10`               |
| `$skip`    | Skip a number of results           | `$skip=20`              |
| `$count`   | Include total count in response    | `$count=true`           |

## Quick Examples

### Select Specific Fields

```
GET /users?$select=id,name,email
```

Returns only the specified fields. [Learn more →](./select.md)

### Filter Results

```
GET /users?$filter=age gt 18 and status eq 'active'
```

Returns users older than 18 with active status. [Learn more →](./filter.md)

### Sort Results

```
GET /products?$orderby=price desc,name asc
```

Sorts by price descending, then by name ascending. [Learn more →](./orderby.md)

### Include Related Data

```
GET /orders?$expand=customer,items
```

Returns orders with customer and items data included. [Learn more →](./expand.md)

### Pagination

```
GET /products?$top=20&$skip=40&$count=true
```

Returns 20 products starting from the 41st, with total count. [Learn more →](./pagination.md)

## Combining Query Options

Query options can be combined to create powerful queries:

```
GET /products?$select=id,name,price&$filter=price gt 50 and inStock eq true&$orderby=price asc&$top=10&$expand=category($select=name)
```

This query:

1. Selects only `id`, `name`, and `price` fields
2. Filters products with price > 50 that are in stock
3. Sorts by price ascending
4. Limits to 10 results
5. Includes category name

## Detailed Documentation

- **[$select](./select.md)** - Selecting specific fields
- **[$filter](./filter.md)** - Filtering with operators and functions
- **[$orderby](./orderby.md)** - Sorting results
- **[$expand](./expand.md)** - Including related entities
- **[Pagination](./pagination.md)** - Using $top, $skip, and $count
