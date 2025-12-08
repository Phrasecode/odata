---
sidebar_position: 2
---

# $orderby

The `$orderby` query option specifies the order in which results should be returned. You can sort by one or more fields in ascending or descending order.

## Basic Usage

```
GET /users?$orderby=name
```

Returns users sorted by name in ascending order (default).

## Syntax

```
$orderby=field [asc|desc]
$orderby=field1 [asc|desc],field2 [asc|desc]
```

- `asc` - Ascending order (A-Z, 0-9, oldest-newest) - **default**
- `desc` - Descending order (Z-A, 9-0, newest-oldest)

## Examples

### Ascending Order (Default)

```
GET /users?$orderby=name
GET /users?$orderby=name asc
```

Both queries return users sorted by name A-Z.

### Descending Order

```
GET /products?$orderby=price desc
```

Returns products sorted by price from highest to lowest.

### Multiple Sort Fields

```
GET /users?$orderby=lastName asc,firstName asc
```

Sorts by lastName first, then by firstName for users with the same lastName.

```
GET /products?$orderby=category asc,price desc
```

Sorts by category A-Z, then by price highest to lowest within each category.
