---
sidebar_position: 3
---

# $expand

The `$expand` query option allows you to include related entities in the response. This is equivalent to SQL JOINs and enables you to fetch parent-child or related data in a single request. Relation names must match the property names defined in your models with relationship decorators


> ### Use navigation property name to expand the table. Not the model name or table name.


## Basic Usage

```
GET /orders?$expand=customer
```

Returns orders with their related customer data included.

## Syntax

```
$expand=relationName
$expand=relation1,relation2
$expand=relation($select=field1,field2;$filter=condition;$orderby=field)
```

## Examples

### Simple Expand

```
GET /orders?$expand=customer
```

**Response:**

```json
{
  "@odata.context": "Order",
  "value": [
    {
      "id": 1,
      "orderDate": "2024-01-15",
      "total": 150.0,
      "customer": {
        "id": 10,
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### Multiple Expands

```
GET /orders?$expand=customer,items
```

Returns orders with both customer and order items.

```
GET /users?$expand=department,roles
```

Returns users with their department and roles.

## Nested Query Options

You can apply query options to expanded entities using parentheses and semicolons.

### $select in Expand

Select specific fields from the expanded entity:

```
GET /orders?$expand=customer($select=id,name,email)
```

Returns orders with only `id`, `name`, and `email` from the customer.

### $filter in Expand

Filter the expanded collection:

```
GET /users?$expand=orders($filter=status eq 'pending')
```

Returns users with only their pending orders.

```
GET /categories?$expand=products($filter=inStock eq true)
```

Returns categories with only in-stock products.

### $orderby in Expand

Sort the expanded collection:

```
GET /users?$expand=orders($orderby=createdAt desc)
```

Returns users with their orders sorted by date (newest first).

```
GET /categories?$expand=products($orderby=price asc)
```

Returns categories with products sorted by price.

### $top and $skip in Expand

Limit the expanded collection:

```
GET /users?$expand=orders($top=5)
```

Returns users with only their 5 most recent orders.

```
GET /categories?$expand=products($top=10;$skip=0)
```

Returns categories with the first 10 products.

### Combining Multiple Options

```
GET /users?$expand=orders($select=id,total,status;$filter=total gt 100;$orderby=createdAt desc;$top=5)
```

Returns users with their top 5 orders over $100, sorted by date, showing only id, total, and status.

## Nested Expands

Expand related entities of related entities:

```
GET /orders?$expand=items($expand=product)
```

Returns orders with items, and each item includes its product.

```
GET /users?$expand=department($expand=manager)
```

Returns users with their department, and each department includes its manager.

### Deep Nesting

```
GET /orders?$expand=items($expand=product($select=name,price))
```

Returns orders → items → products (with only name and price).

## Navigation Path Syntax

You can also use forward slash for navigation:

```
GET /orders?$expand=customer/address
```

Expands customer and then the customer's address.

## Relationship Types

### HasMany (One-to-Many)

```typescript
// Model definition
@HasMany(() => Order, { relation: [{ foreignKey: 'userId', sourceKey: 'id' }] })
orders: Order[];
```

```
GET /users?$expand=orders
```

Returns each user with an array of their orders.

### HasOne (One-to-One)

```typescript
// Model definition
@HasOne(() => Profile, { relation: [{ foreignKey: 'userId', sourceKey: 'id' }] })
profile: Profile;
```

```
GET /users?$expand=profile
```

Returns each user with their single profile object.

### BelongsTo (Many-to-One)

```typescript
// Model definition
@BelongsTo(() => Department, { relation: [{ foreignKey: 'id', sourceKey: 'departmentId' }] })
department: Department;
```

```
GET /users?$expand=department
```

Returns each user with their department.

## Complete Examples

**Order details with customer and items:**

```
GET /orders?$expand=customer($select=name,email),items($select=productName,quantity,price;$orderby=price desc)
```

**Product catalog with categories:**

```
GET /products?$filter=inStock eq true&$expand=category($select=name)&$orderby=name asc
```

**User with recent orders:**

```
GET /users?$select=id,name,email&$expand=orders($filter=createdAt gt datetime'2024-01-01T00:00:00';$orderby=createdAt desc;$top=10)
```

**Category tree with products:**

```
GET /categories?$expand=products($filter=isActive eq true;$select=id,name,price;$orderby=name asc;$top=20)
```

**Nested expansion with filters:**

```
GET /departments?$expand=employees($filter=status eq 'active';$expand=projects($filter=isCompleted eq false))
```

## Combining with Main Query Options

```
GET /orders?$select=id,orderDate,total&$filter=total gt 100&$orderby=orderDate desc&$top=20&$expand=customer($select=name),items($select=productName,quantity)
```

This query:

1. Selects specific order fields
2. Filters orders over $100
3. Orders by date descending
4. Limits to 20 results
5. Expands customer (name only) and items (productName and quantity only)

## Notes

- Relation names must match the property names defined in your models with relationship decorators
- Multiple expand options within parentheses are separated by semicolons (`;`)
- Multiple top-level expands are separated by commas (`,`)
- Nested expands can impact performance - use `$select` to limit returned fields
- The expanded entity structure matches your model relationships
