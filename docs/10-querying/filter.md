---
sidebar_position: 4
---

# $filter

The `$filter` query option allows you to filter the results based on conditions. It supports comparison operators, logical operators, string functions, and arithmetic operations.

## Basic Usage

```
GET /users?$filter=age gt 18
```

Returns users where age is greater than 18.

## Comparison Operators

| Operator | Description           | Example                       |
| -------- | --------------------- | ----------------------------- |
| `eq`     | Equal                 | `$filter=status eq 'active'`  |
| `ne`     | Not equal             | `$filter=status ne 'deleted'` |
| `gt`     | Greater than          | `$filter=age gt 18`           |
| `ge`     | Greater than or equal | `$filter=age ge 18`           |
| `lt`     | Less than             | `$filter=price lt 100`        |
| `le`     | Less than or equal    | `$filter=price le 100`        |
| `in`     | In a list of values   | `$filter=status in ('a','b')` |

### Examples

**Equal:**

```
GET /users?$filter=status eq 'active'
GET /products?$filter=categoryId eq 5
GET /orders?$filter=isCompleted eq true
```

**Not Equal:**

```
GET /users?$filter=role ne 'admin'
GET /products?$filter=stock ne 0
```

**Greater Than / Less Than:**

```
GET /products?$filter=price gt 50
GET /users?$filter=age ge 21
GET /orders?$filter=total lt 1000
GET /products?$filter=quantity le 10
```

**In Operator:**

```
GET /users?$filter=status in ('active', 'pending')
GET /products?$filter=categoryId in (1, 2, 3)
```

## Logical Operators

| Operator | Description | Example                                    |
| -------- | ----------- | ------------------------------------------ |
| `and`    | Logical AND | `$filter=age gt 18 and status eq 'active'` |
| `or`     | Logical OR  | `$filter=role eq 'admin' or role eq 'mod'` |

### Examples

**AND - Both conditions must be true:**

```
GET /users?$filter=age gt 18 and status eq 'active'
GET /products?$filter=price gt 10 and price lt 100
GET /orders?$filter=status eq 'pending' and total gt 500
```

**OR - Either condition must be true:**

```
GET /users?$filter=role eq 'admin' or role eq 'moderator'
GET /products?$filter=category eq 'electronics' or category eq 'computers'
```

**Combining AND and OR with Parentheses:**

```
GET /users?$filter=(role eq 'admin' or role eq 'moderator') and status eq 'active'
GET /products?$filter=inStock eq true and (price lt 50 or onSale eq true)
```

## String Functions

| Function                     | Description                     | Example                                 |
| ---------------------------- | ------------------------------- | --------------------------------------- |
| `contains(field, 'value')`   | Field contains substring        | `$filter=contains(name, 'john')`        |
| `startswith(field, 'value')` | Field starts with string        | `$filter=startswith(email, 'admin')`    |
| `endswith(field, 'value')`   | Field ends with string          | `$filter=endswith(email, '@gmail.com')` |
| `tolower(field)`             | Convert to lowercase            | `$filter=tolower(name) eq 'john'`       |
| `toupper(field)`             | Convert to uppercase            | `$filter=toupper(code) eq 'ABC'`        |
| `length(field)`              | Get string length               | `$filter=length(name) gt 5`             |
| `indexof(field, 'value')`    | Find position of substring      | `$filter=indexof(name, 'a') gt 0`       |
| `substring(field, start)`    | Extract substring from position | `$filter=substring(code, 0) eq 'PRD'`   |

### Examples

**contains - Search for substring:**

```
GET /users?$filter=contains(name, 'john')
GET /products?$filter=contains(description, 'wireless')
GET /articles?$filter=contains(title, 'tutorial')
```

**startswith - Match beginning of string:**

```
GET /users?$filter=startswith(email, 'admin')
GET /products?$filter=startswith(sku, 'PRD-')
```

**endswith - Match end of string:**

```
GET /users?$filter=endswith(email, '@company.com')
GET /files?$filter=endswith(filename, '.pdf')
```

**tolower/toupper - Case-insensitive comparison:**

```
GET /users?$filter=tolower(name) eq 'john doe'
GET /products?$filter=toupper(category) eq 'ELECTRONICS'
```

**length - Filter by string length:**

```
GET /users?$filter=length(username) ge 5
GET /products?$filter=length(description) gt 100
```

**Combining string functions:**

```
GET /users?$filter=contains(tolower(name), 'john')
GET /products?$filter=startswith(tolower(name), 'apple')
```

## Arithmetic Operators

| Operator | Description    | Example                       |
| -------- | -------------- | ----------------------------- |
| `add`    | Addition       | `$filter=price add 10 gt 100` |
| `sub`    | Subtraction    | `$filter=stock sub 5 lt 0`    |
| `mul`    | Multiplication | `$filter=price mul 2 lt 500`  |
| `div`    | Division       | `$filter=total div 2 gt 50`   |
| `mod`    | Modulo         | `$filter=quantity mod 2 eq 0` |

### Examples

```
GET /products?$filter=price add 10 gt 100
GET /products?$filter=price mul 1.1 lt 500
GET /orders?$filter=total sub discount gt 100
GET /products?$filter=quantity mod 2 eq 0
```

## Filtering on Related Entities

Filter on properties of expanded/related entities using navigation paths:

```
GET /orders?$filter=customer/country eq 'USA'
GET /products?$filter=category/name eq 'Electronics'
GET /users?$filter=department/isActive eq true
```

## Working with Data Types

### Strings

Strings must be enclosed in single quotes:

```
$filter=name eq 'John'
$filter=status eq 'active'
```

### Numbers

Numbers are used without quotes:

```
$filter=age eq 25
$filter=price gt 99.99
```

### Booleans

Use `true` or `false` without quotes:

```
$filter=isActive eq true
$filter=isDeleted eq false
```

### Null Values

Use `null` without quotes:

```
$filter=deletedAt eq null
$filter=manager ne null
```

### Dates

Use the `datetime` prefix:

```
$filter=createdAt gt datetime'2024-01-01T00:00:00'
$filter=orderDate lt datetime'2024-12-31T23:59:59'
```

## Complex Filter Examples

**E-commerce product search:**

```
GET /products?$filter=contains(name, 'laptop') and price ge 500 and price le 2000 and inStock eq true
```

**User management:**

```
GET /users?$filter=(role eq 'admin' or role eq 'moderator') and status eq 'active' and lastLogin gt datetime'2024-01-01T00:00:00'
```

**Order filtering:**

```
GET /orders?$filter=status ne 'cancelled' and total gt 100 and customer/country eq 'USA'
```

**Case-insensitive search:**

```
GET /products?$filter=contains(tolower(name), 'phone') or contains(tolower(description), 'phone')
```

## Combining with Other Query Options

```
GET /products?$filter=price gt 50 and inStock eq true&$select=id,name,price&$orderby=price desc&$top=10
```

This query:

1. Filters products with price > 50 that are in stock
2. Selects only id, name, and price fields
3. Orders by price descending
4. Returns top 10 results

## Notes

- String values must be enclosed in single quotes (`'value'`)
- Field names are case-sensitive
- Parentheses can be used to group conditions and control evaluation order
- Boolean functions like `contains`, `startswith`, `endswith` can be used directly without comparison (implicitly compared to `true`)