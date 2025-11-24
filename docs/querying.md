# OData Querying

Once your endpoints are set up, you can query them using OData v4 query syntax.

## Query Parameters

### $select - Select Specific Fields

Choose which fields to return in the response.

**Syntax:** `$select=field1,field2,field3`

**Examples:**

```
GET /User?$select=name,email
GET /User?$select=id,name,email,age
GET /User?$expand=department&$select=name,department/departmentName
```

**Nested Select:**

```
# Select fields from expanded relations
GET /User?$expand=department($select=departmentName,budget)&$select=name,email

# Multiple expansions with selects
GET /User?$expand=department($select=departmentName),orders($select=orderId,total)&$select=name,email
```

### $filter - Filter Results

Filter results based on conditions.

**Syntax:** `$filter=<condition>`

**Basic Examples:**

```
GET /User?$filter=age gt 18
GET /User?$filter=name eq 'John'
GET /User?$filter=age gt 18 and age lt 65
GET /User?$filter=departmentId in (1,2,3)
GET /User?$filter=contains(name,'John')
```

**Advanced Filter Features:**

**1. Navigation Property Count:**

```
# Filter by count of related entities
GET /User?$filter=notes/$count gt 5
GET /Department?$filter=users/$count eq 0
GET /Category?$filter=products/$count gt 10 and products/$count lt 100
```

**2. Arithmetic Expressions:**

```
# Basic arithmetic
GET /Product?$filter=(price mul quantity) gt 1000
GET /User?$filter=(age add 5) lt 30
GET /Order?$filter=(total sub discount) ge 500

# Arithmetic with functions
GET /Note?$filter=(length(content) div 2) eq length(title)
GET /Product?$filter=(price mul 1.2) gt 100

# Parenthesized arithmetic
GET /User?$filter=(userId mod 3) eq 0
GET /Order?$filter=((price mul quantity) sub discount) gt 1000
```

**3. Nested Filters in $expand:**

```
# Filter expanded relations
GET /User?$expand=notes($filter=isArchived eq false)
GET /Department?$expand=users($filter=isActive eq true and age gt 25)

# Combine with select
GET /User?$expand=notes($filter=isPinned eq true;$select=title,content)
```

### $expand - Include Related Entities

Include related entities in the response (similar to SQL JOIN).

**Syntax:** `$expand=relationName`

**Basic Examples:**

```
GET /User?$expand=department
GET /User?$expand=orders
GET /User?$expand=department,orders
GET /User?$expand=department($select=departmentName)
GET /User?$expand=department($filter=budget gt 100000)
```

**Advanced Expansion Features:**

**1. Nested Expansions:**

```
# Two-level expansion
GET /User?$expand=department($expand=company)

# Three-level expansion
GET /User?$expand=notes($expand=category($expand=creator))

# Multiple nested expansions
GET /Department?$expand=users($expand=notes($expand=category))
```

**2. Expansion with Multiple Options:**

```
# Combine filter, select, and orderby
GET /User?$expand=notes($filter=isArchived eq false;$select=title,content;$orderby=createdAt desc)

# Expansion with top and skip
GET /Department?$expand=users($filter=isActive eq true;$top=10;$orderby=username asc)

# Complex nested expansion with options
GET /User?$expand=notes($filter=isPinned eq true;$expand=category($select=categoryName);$select=title,content)
```

**3. Deep Nested Expansions (5+ levels):**

```
# Five-level expansion
GET /Department?$expand=users($expand=notes($expand=category($expand=creator($expand=department))))

# With filters and selects at each level
GET /Department?$filter=users/$count gt 0&$expand=users($filter=isActive eq true;$expand=notes($filter=isArchived eq false;$expand=category($select=categoryName;$expand=creator($select=username,email))))
```

### $orderby - Sort Results

Sort results by one or more fields.

**Syntax:** `$orderby=field1 asc,field2 desc`

**Examples:**

```
GET /User?$orderby=name asc
GET /User?$orderby=age desc
GET /User?$orderby=name asc,age desc
GET /User?$orderby=createdAt desc,name asc
```

**Nested Orderby:**

```
# Order expanded relations
GET /User?$expand=notes($orderby=createdAt desc)
GET /Department?$expand=users($orderby=username asc,age desc)
```

### $top - Limit Results

Limit the number of results returned.

**Syntax:** `$top=<number>`

**Examples:**

```
GET /User?$top=10
GET /User?$top=100
```

**Nested Top:**

```
# Limit expanded relations
GET /User?$expand=notes($top=5)
GET /Department?$expand=users($top=10;$orderby=username asc)
```

### $skip - Skip Results (Pagination)

Skip a specified number of results (useful for pagination).

**Syntax:** `$skip=<number>`

**Examples:**

```
GET /User?$skip=20
GET /User?$top=10&$skip=20  // Page 3 (skip 20, take 10)
```

**Nested Skip:**

```
# Paginate expanded relations
GET /User?$expand=notes($top=10;$skip=20)
GET /Department?$expand=users($top=20;$skip=40;$orderby=username asc)
```

### $count - Get Total Count

Get the total count of entities matching the filter.

**Syntax:** `$count=true`

**Examples:**

```
GET /User?$count=true
GET /User?$filter=age gt 18&$count=true
GET /Product?$filter=category eq 'Electronics'&$count=true
```

**Note:** The count is returned in the response metadata.

## Filter Operators

### Comparison Operators

| Operator | Description           | Example                        |
| -------- | --------------------- | ------------------------------ |
| `eq`     | Equal to              | `$filter=age eq 25`            |
| `ne`     | Not equal to          | `$filter=status ne 'inactive'` |
| `gt`     | Greater than          | `$filter=price gt 100`         |
| `ge`     | Greater than or equal | `$filter=age ge 18`            |
| `lt`     | Less than             | `$filter=price lt 1000`        |
| `le`     | Less than or equal    | `$filter=age le 65`            |

**Examples:**

```
GET /Product?$filter=price eq 99.99
GET /User?$filter=age ne 30
GET /Order?$filter=total gt 500
GET /User?$filter=age ge 18
GET /Product?$filter=stock lt 10
GET /User?$filter=age le 65
```

### Logical Operators

| Operator | Description | Example                                             |
| -------- | ----------- | --------------------------------------------------- |
| `and`    | Logical AND | `$filter=age gt 18 and age lt 65`                   |
| `or`     | Logical OR  | `$filter=status eq 'active' or status eq 'pending'` |
| `not`    | Logical NOT | `$filter=not (status eq 'deleted')`                 |

**Examples:**

```
GET /User?$filter=age gt 18 and age lt 65
GET /User?$filter=status eq 'active' or status eq 'pending'
GET /User?$filter=age gt 18 and (status eq 'active' or status eq 'pending')
GET /Product?$filter=not (category eq 'discontinued')
```

### IN Operator

| Operator | Description   | Example                                             |
| -------- | ------------- | --------------------------------------------------- |
| `in`     | Value in list | `$filter=status in ('active','pending','approved')` |

**Examples:**

```
GET /User?$filter=departmentId in (1,2,3)
GET /Product?$filter=category in ('Electronics','Computers','Phones')
GET /Order?$filter=status in ('pending','processing','shipped')
```

### String Functions

| Function     | Description                           | Example                                  |
| ------------ | ------------------------------------- | ---------------------------------------- |
| `contains`   | Check if string contains substring    | `$filter=contains(name,'John')`          |
| `startswith` | Check if string starts with substring | `$filter=startswith(email,'admin')`      |
| `endswith`   | Check if string ends with substring   | `$filter=endswith(email,'@gmail.com')`   |
| `tolower`    | Convert to lowercase                  | `$filter=contains(tolower(name),'john')` |
| `toupper`    | Convert to uppercase                  | `$filter=contains(toupper(name),'JOHN')` |
| `trim`       | Remove whitespace                     | `$filter=trim(name) eq 'John'`           |
| `length`     | Get string length                     | `$filter=length(name) gt 5`              |
| `indexof`    | Find substring position               | `$filter=indexof(email,'@') gt 0`        |
| `concat`     | Concatenate strings                   | `$filter=concat(firstName,' ',lastName)` |
| `substring`  | Extract substring                     | `$filter=substring(name,0,3) eq 'Joh'`   |

**Examples:**

```
# Contains
GET /User?$filter=contains(name,'John')
GET /Product?$filter=contains(description,'premium')

# Starts with
GET /User?$filter=startswith(email,'admin')
GET /Product?$filter=startswith(sku,'PROD-')

# Ends with
GET /User?$filter=endswith(email,'@gmail.com')
GET /File?$filter=endswith(filename,'.pdf')

# To lower
GET /User?$filter=contains(tolower(name),'john')
GET /Product?$filter=tolower(category) eq 'electronics'

# Length
GET /User?$filter=length(username) gt 5
GET /Product?$filter=length(description) le 100
```

### Arithmetic Operators

| Operator | Description    | Example                                |
| -------- | -------------- | -------------------------------------- |
| `add`    | Addition       | `$filter=(price add tax) gt 100`       |
| `sub`    | Subtraction    | `$filter=(total sub discount) ge 50`   |
| `mul`    | Multiplication | `$filter=(price mul quantity) gt 1000` |
| `div`    | Division       | `$filter=(total div itemCount) lt 50`  |
| `mod`    | Modulo         | `$filter=(userId mod 2) eq 0`          |

**Examples:**

```
# Basic arithmetic
GET /Order?$filter=(price mul quantity) gt 1000
GET /Product?$filter=(price add tax) le 500
GET /Invoice?$filter=(total sub discount) ge 100

# Arithmetic with parentheses
GET /User?$filter=(userId mod 3) eq 0
GET /Order?$filter=((price mul quantity) sub discount) gt 500

# Arithmetic with functions
GET /Note?$filter=(length(content) div 2) eq length(title)
GET /Product?$filter=(price mul 1.2) gt originalPrice
```

### Date/Time Functions

| Function | Description       | Example                                       |
| -------- | ----------------- | --------------------------------------------- |
| `year`   | Extract year      | `$filter=year(createdAt) eq 2024`             |
| `month`  | Extract month     | `$filter=month(createdAt) eq 12`              |
| `day`    | Extract day       | `$filter=day(createdAt) eq 25`                |
| `hour`   | Extract hour      | `$filter=hour(createdAt) ge 9`                |
| `minute` | Extract minute    | `$filter=minute(createdAt) eq 30`             |
| `second` | Extract second    | `$filter=second(createdAt) lt 30`             |
| `date`   | Extract date part | `$filter=date(createdAt) eq date(now())`      |
| `time`   | Extract time part | `$filter=time(createdAt) gt time('09:00:00')` |
| `now`    | Current date/time | `$filter=createdAt lt now()`                  |

**Examples:**

```
# Year filtering
GET /Order?$filter=year(orderDate) eq 2024
GET /User?$filter=year(createdAt) ge 2020

# Month filtering
GET /Order?$filter=month(orderDate) eq 12
GET /Event?$filter=month(eventDate) in (6,7,8)

# Day filtering
GET /Order?$filter=day(orderDate) eq 1
GET /Event?$filter=day(eventDate) le 15

# Time filtering
GET /Event?$filter=hour(startTime) ge 9 and hour(startTime) lt 17
GET /Log?$filter=hour(timestamp) eq 0

# Current date/time
GET /Order?$filter=orderDate lt now()
GET /Event?$filter=eventDate ge now()
```

### Math Functions

| Function  | Description          | Example                         |
| --------- | -------------------- | ------------------------------- |
| `round`   | Round to nearest int | `$filter=round(price) eq 100`   |
| `floor`   | Round down           | `$filter=floor(price) lt 100`   |
| `ceiling` | Round up             | `$filter=ceiling(price) gt 100` |

**Examples:**

```
# Round
GET /Product?$filter=round(price) eq 100
GET /Order?$filter=round(total) ge 1000

# Floor
GET /Product?$filter=floor(price) lt 100
GET /Metric?$filter=floor(average) eq 50

# Ceiling
GET /Product?$filter=ceiling(price) gt 100
GET /Metric?$filter=ceiling(average) le 75
```

## API Response Format

All API responses follow the OData v4 standard format:

### Success Response

```json
{
  "@odata.context": "/$metadata#User",
  "@odata.count": 1,
  "value": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "department": {
        "id": 1,
        "departmentName": "Engineering"
      }
    }
  ],
  "meta": {
    "queryExecutionTime": 85
  }
}
```

### Response Structure

- **@odata.context**: OData context URL indicating the entity type
- **@odata.count**: Total number of records returned
- **value**: Array of records matching the query
- **meta**: Metadata about the query execution
  - `queryExecutionTime`: Time spent executing the database query (milliseconds)

### Error Response

```json
{
  "error": "Invalid filter syntax",
  "message": "Failed to parse OData query"
}
```

## Next Steps

- [View real-world examples](./examples.md)
- [Configure metadata endpoint](./metadata.md)
- [Review best practices](./best-practices.md)
