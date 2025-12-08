---
sidebar_position: 8
---

# Data Types

The `@phrasecode/odata` framework uses Sequelize DataTypes under the hood. This guide covers all available data types, their options, and database compatibility.

## Importing DataTypes

```typescript
import { DataTypes } from '@phrasecode/odata';
```

## String Types

### STRING

Variable-length string with optional maximum length.

```typescript
// Default length (255 characters)
@Column({ dataType: DataTypes.STRING })
name: string;

// Custom length
@Column({ dataType: DataTypes.STRING({ length: 100 }) })
shortName: string;

// Binary string
@Column({ dataType: DataTypes.STRING({ binary: true }) })
binaryData: string;
```

| Option   | Type      | Default | Description                    |
| -------- | --------- | ------- | ------------------------------ |
| `length` | `number`  | 255     | Maximum string length          |
| `binary` | `boolean` | false   | Store as binary (case-sensitive) |

**Database Mapping:**
| Database   | SQL Type                    |
| ---------- | --------------------------- |
| PostgreSQL | `VARCHAR(n)`                |
| MySQL      | `VARCHAR(n)`                |
| SQLite     | `TEXT`                      |
| SQL Server | `NVARCHAR(n)`               |

### TEXT

Unlimited length text. Use for long content like descriptions, articles, or JSON strings.

```typescript
// Default text
@Column({ dataType: DataTypes.TEXT })
description: string;

// Text with size hint (MySQL/MariaDB)
@Column({ dataType: DataTypes.TEXT('tiny') })
shortNote: string;  // TINYTEXT (~255 bytes)

@Column({ dataType: DataTypes.TEXT('medium') })
article: string;    // MEDIUMTEXT (~16MB)

@Column({ dataType: DataTypes.TEXT('long') })
document: string;   // LONGTEXT (~4GB)
```

| Size Hint | MySQL Type   | Max Size |
| --------- | ------------ | -------- |
| `'tiny'`  | TINYTEXT     | 255 bytes |
| (default) | TEXT         | 65KB     |
| `'medium'`| MEDIUMTEXT   | 16MB     |
| `'long'`  | LONGTEXT     | 4GB      |

### CHAR

Fixed-length string. Always uses the specified length (padded with spaces if shorter).

```typescript
@Column({ dataType: DataTypes.CHAR({ length: 2 }) })
countryCode: string;  // Always 2 characters

@Column({ dataType: DataTypes.CHAR({ length: 10, binary: true }) })
fixedCode: string;
```

## Numeric Types

### INTEGER

Standard 32-bit integer.

```typescript
@Column({ dataType: DataTypes.INTEGER })
count: number;

// Unsigned integer (MySQL/MariaDB)
@Column({ dataType: DataTypes.INTEGER({ unsigned: true }) })
positiveCount: number;

// Zero-filled (MySQL/MariaDB)
@Column({ dataType: DataTypes.INTEGER({ zerofill: true }) })
paddedNumber: number;
```

| Option     | Type      | Default | Description                |
| ---------- | --------- | ------- | -------------------------- |
| `unsigned` | `boolean` | false   | Only positive values       |
| `zerofill` | `boolean` | false   | Pad with zeros             |

**Range:** -2,147,483,648 to 2,147,483,647 (signed)

### SMALLINT

16-bit integer for smaller values.

```typescript
@Column({ dataType: DataTypes.SMALLINT })
age: number;

@Column({ dataType: DataTypes.SMALLINT({ unsigned: true }) })
quantity: number;
```

**Range:** -32,768 to 32,767 (signed)

### MEDIUMINT

24-bit integer (MySQL/MariaDB only).

```typescript
@Column({ dataType: DataTypes.MEDIUMINT })
mediumValue: number;
```

**Range:** -8,388,608 to 8,388,607 (signed)

### BIGINT

64-bit integer for very large numbers.

```typescript
@Column({ dataType: DataTypes.BIGINT })
largeNumber: bigint;

@Column({ dataType: DataTypes.BIGINT({ unsigned: true }) })
veryLargeNumber: bigint;
```

**Range:** -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807 (signed)

> **Note:** JavaScript numbers lose precision beyond 2^53. Use `bigint` type or string for very large values.

### TINYINT

8-bit integer.

```typescript
@Column({ dataType: DataTypes.TINYINT })
smallValue: number;

@Column({ dataType: DataTypes.TINYINT({ unsigned: true }) })
byteValue: number;  // 0-255
```

**Range:** -128 to 127 (signed), 0 to 255 (unsigned)

### FLOAT

Single-precision floating-point number.

```typescript
@Column({ dataType: DataTypes.FLOAT })
rating: number;

// With precision (total digits) and scale (decimal places)
@Column({ dataType: DataTypes.FLOAT({ precision: 7, scale: 4 }) })
coordinate: number;
```

### DOUBLE

Double-precision floating-point number. More precise than FLOAT.

```typescript
@Column({ dataType: DataTypes.DOUBLE })
preciseValue: number;

@Column({ dataType: DataTypes.DOUBLE({ precision: 15, scale: 10 }) })
scientificValue: number;
```

### DECIMAL

Exact decimal number. Best for financial data where precision matters.

```typescript
@Column({ dataType: DataTypes.DECIMAL({ precision: 10, scale: 2 }) })
price: number;  // Up to 99,999,999.99

@Column({ dataType: DataTypes.DECIMAL({ precision: 19, scale: 4 }) })
exchangeRate: number;
```

| Option      | Type     | Default | Description                    |
| ----------- | -------- | ------- | ------------------------------ |
| `precision` | `number` | 10      | Total number of digits         |
| `scale`     | `number` | 0       | Number of decimal places       |

**Common Configurations:**
| Use Case       | Precision | Scale | Example Value      |
| -------------- | --------- | ----- | ------------------ |
| Currency (USD) | 10        | 2     | 99,999,999.99      |
| Percentage     | 5         | 2     | 100.00             |
| Exchange Rate  | 19        | 6     | 1.234567           |
| Coordinates    | 10        | 7     | 123.4567890        |

### REAL

Alias for FLOAT in most databases.

```typescript
@Column({ dataType: DataTypes.REAL })
measurement: number;
```

## Boolean Type

### BOOLEAN

True/false values.

```typescript
@Column({ dataType: DataTypes.BOOLEAN })
isActive: boolean;

@Column({ dataType: DataTypes.BOOLEAN, defaultValue: true })
isEnabled: boolean;

@Column({ dataType: DataTypes.BOOLEAN, defaultValue: false })
isDeleted: boolean;
```

**Database Mapping:**
| Database   | SQL Type           |
| ---------- | ------------------ |
| PostgreSQL | `BOOLEAN`          |
| MySQL      | `TINYINT(1)`       |
| SQLite     | `INTEGER` (0 or 1) |
| SQL Server | `BIT`              |

## Date and Time Types

### DATE

Date and time with timezone support.

```typescript
@Column({ dataType: DataTypes.DATE })
createdAt: Date;

// With precision (fractional seconds)
@Column({ dataType: DataTypes.DATE({ precision: 6 }) })
preciseTimestamp: Date;
```

| Option      | Type     | Default | Description                    |
| ----------- | -------- | ------- | ------------------------------ |
| `precision` | `number` | 0       | Fractional seconds (0-6)       |

**Database Mapping:**
| Database   | SQL Type                    |
| ---------- | --------------------------- |
| PostgreSQL | `TIMESTAMP WITH TIME ZONE`  |
| MySQL      | `DATETIME`                  |
| SQLite     | `TEXT` (ISO 8601)           |
| SQL Server | `DATETIMEOFFSET`            |

### DATEONLY

Date without time component.

```typescript
@Column({ dataType: DataTypes.DATEONLY })
birthDate: Date;

@Column({ dataType: DataTypes.DATEONLY })
orderDate: Date;
```

**Format:** `YYYY-MM-DD`

### TIME

Time without date component.

```typescript
@Column({ dataType: DataTypes.TIME })
startTime: string;

@Column({ dataType: DataTypes.TIME({ precision: 3 }) })
preciseTime: string;
```

**Format:** `HH:MM:SS`

### NOW

Special default value for current timestamp.

```typescript
@Column({ 
  dataType: DataTypes.DATE, 
  defaultValue: DataTypes.NOW 
})
createdAt: Date;
```

## UUID Type

### UUID

Universally Unique Identifier (128-bit).

```typescript
// UUID with auto-generation (v4)
@Column({
  dataType: DataTypes.UUID,
  defaultValue: DataTypes.UUIDV4,
  isPrimaryKey: true
})
id: string;

// UUID v1 (time-based)
@Column({
  dataType: DataTypes.UUID,
  defaultValue: DataTypes.UUIDV1
})
timeBasedId: string;

// UUID without default (must be provided)
@Column({ dataType: DataTypes.UUID })
externalId: string;
```

**Database Mapping:**
| Database   | SQL Type     |
| ---------- | ------------ |
| PostgreSQL | `UUID`       |
| MySQL      | `CHAR(36)`   |
| SQLite     | `TEXT`       |
| SQL Server | `UNIQUEIDENTIFIER` |

## JSON Types

### JSON

Stores JSON data. Validated on insert/update.

```typescript
@Column({ dataType: DataTypes.JSON })
metadata: object;

@Column({ dataType: DataTypes.JSON })
settings: Record<string, any>;

@Column({ dataType: DataTypes.JSON })
tags: string[];
```

### JSONB

Binary JSON (PostgreSQL only). Faster queries and indexing.

```typescript
@Column({ dataType: DataTypes.JSONB })
searchableData: object;

@Column({ dataType: DataTypes.JSONB })
preferences: Record<string, any>;
```

**JSON vs JSONB (PostgreSQL):**
| Feature        | JSON          | JSONB              |
| -------------- | ------------- | ------------------ |
| Storage        | Text          | Binary             |
| Insert Speed   | Faster        | Slower             |
| Query Speed    | Slower        | Faster             |
| Indexing       | No            | Yes (GIN indexes)  |
| Key Order      | Preserved     | Not preserved      |
| Duplicates     | Allowed       | Last value wins    |

## Enum Type

### ENUM

Predefined set of allowed values.

```typescript
@Column({
  dataType: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled')
})
status: 'pending' | 'active' | 'completed' | 'cancelled';

@Column({
  dataType: DataTypes.ENUM('low', 'medium', 'high', 'critical')
})
priority: 'low' | 'medium' | 'high' | 'critical';

@Column({
  dataType: DataTypes.ENUM('draft', 'published', 'archived'),
  defaultValue: 'draft'
})
state: 'draft' | 'published' | 'archived';
```

**Database Mapping:**
| Database   | SQL Type                    |
| ---------- | --------------------------- |
| PostgreSQL | Custom ENUM type            |
| MySQL      | `ENUM('val1', 'val2', ...)` |
| SQLite     | `TEXT` with CHECK           |
| SQL Server | `VARCHAR` with CHECK        |

## Binary Types

### BLOB

Binary Large Object for storing files, images, etc.

```typescript
@Column({ dataType: DataTypes.BLOB })
fileData: Buffer;

// With size hint (MySQL/MariaDB)
@Column({ dataType: DataTypes.BLOB('tiny') })
thumbnail: Buffer;    // TINYBLOB (~255 bytes)

@Column({ dataType: DataTypes.BLOB('medium') })
image: Buffer;        // MEDIUMBLOB (~16MB)

@Column({ dataType: DataTypes.BLOB('long') })
video: Buffer;        // LONGBLOB (~4GB)
```

| Size Hint | MySQL Type   | Max Size |
| --------- | ------------ | -------- |
| `'tiny'`  | TINYBLOB     | 255 bytes |
| (default) | BLOB         | 65KB     |
| `'medium'`| MEDIUMBLOB   | 16MB     |
| `'long'`  | LONGBLOB     | 4GB      |

## Array Type (PostgreSQL Only)

### ARRAY

Native array support in PostgreSQL.

```typescript
// Array of integers
@Column({ dataType: DataTypes.ARRAY(DataTypes.INTEGER) })
scores: number[];

// Array of strings
@Column({ dataType: DataTypes.ARRAY(DataTypes.STRING) })
tags: string[];

// Array of UUIDs
@Column({ dataType: DataTypes.ARRAY(DataTypes.UUID) })
relatedIds: string[];

// Array of decimals
@Column({ dataType: DataTypes.ARRAY(DataTypes.DECIMAL({ precision: 10, scale: 2 })) })
prices: number[];
```

> **Note:** ARRAY type is only supported in PostgreSQL. For other databases, use JSON type instead.

## Special Types

### VIRTUAL

Computed field that doesn't exist in the database.

```typescript
@Column({
  dataType: DataTypes.VIRTUAL,
  get() {
    return `${this.firstName} ${this.lastName}`;
  }
})
fullName: string;

@Column({
  dataType: DataTypes.VIRTUAL(DataTypes.INTEGER),
  get() {
    return this.items?.length || 0;
  }
})
itemCount: number;
```

### GEOMETRY (PostgreSQL with PostGIS)

Geographic data types.

```typescript
@Column({ dataType: DataTypes.GEOMETRY })
location: object;

@Column({ dataType: DataTypes.GEOMETRY('POINT') })
coordinates: object;

@Column({ dataType: DataTypes.GEOMETRY('POLYGON') })
boundary: object;
```

### GEOGRAPHY (PostgreSQL with PostGIS)

Geographic data with earth curvature calculations.

```typescript
@Column({ dataType: DataTypes.GEOGRAPHY })
geoLocation: object;
```

## Database Compatibility Matrix

| Data Type   | PostgreSQL | MySQL | SQLite | SQL Server | Oracle |
| ----------- | ---------- | ----- | ------ | ---------- | ------ |
| STRING      | ✅         | ✅    | ✅     | ✅         | ✅     |
| TEXT        | ✅         | ✅    | ✅     | ✅         | ✅     |
| CHAR        | ✅         | ✅    | ✅     | ✅         | ✅     |
| INTEGER     | ✅         | ✅    | ✅     | ✅         | ✅     |
| BIGINT      | ✅         | ✅    | ✅     | ✅         | ✅     |
| SMALLINT    | ✅         | ✅    | ✅     | ✅         | ✅     |
| TINYINT     | ✅         | ✅    | ✅     | ✅         | ✅     |
| MEDIUMINT   | ❌         | ✅    | ❌     | ❌         | ❌     |
| FLOAT       | ✅         | ✅    | ✅     | ✅         | ✅     |
| DOUBLE      | ✅         | ✅    | ✅     | ✅         | ✅     |
| DECIMAL     | ✅         | ✅    | ✅     | ✅         | ✅     |
| BOOLEAN     | ✅         | ✅    | ✅     | ✅         | ✅     |
| DATE        | ✅         | ✅    | ✅     | ✅         | ✅     |
| DATEONLY    | ✅         | ✅    | ✅     | ✅         | ✅     |
| TIME        | ✅         | ✅    | ✅     | ✅         | ✅     |
| UUID        | ✅         | ✅    | ✅     | ✅         | ✅     |
| JSON        | ✅         | ✅    | ✅     | ✅         | ✅     |
| JSONB       | ✅         | ❌    | ❌     | ❌         | ❌     |
| ENUM        | ✅         | ✅    | ✅     | ✅         | ✅     |
| BLOB        | ✅         | ✅    | ✅     | ✅         | ✅     |
| ARRAY       | ✅         | ❌    | ❌     | ❌         | ❌     |
| GEOMETRY    | ✅*        | ✅*   | ❌     | ✅*        | ✅*    |

*Requires spatial extension (PostGIS, MySQL Spatial, etc.)

## Best Practices

### Choosing the Right Type

```typescript
// ✅ Use DECIMAL for money
@Column({ dataType: DataTypes.DECIMAL({ precision: 10, scale: 2 }) })
price: number;

// ❌ Don't use FLOAT for money (precision issues)
@Column({ dataType: DataTypes.FLOAT })
price: number;

// ✅ Use UUID for distributed systems
@Column({ dataType: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 })
id: string;

// ✅ Use JSONB for searchable JSON (PostgreSQL)
@Column({ dataType: DataTypes.JSONB })
metadata: object;

// ✅ Use appropriate integer size
@Column({ dataType: DataTypes.SMALLINT })  // For age, quantity
age: number;

@Column({ dataType: DataTypes.BIGINT })    // For large IDs, timestamps
externalId: bigint;
```

### Default Values

```typescript
// Timestamps
@Column({ dataType: DataTypes.DATE, defaultValue: DataTypes.NOW })
createdAt: Date;

// UUIDs
@Column({ dataType: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 })
id: string;

// Booleans
@Column({ dataType: DataTypes.BOOLEAN, defaultValue: false })
isDeleted: boolean;

// Numbers
@Column({ dataType: DataTypes.INTEGER, defaultValue: 0 })
viewCount: number;

// Strings
@Column({ dataType: DataTypes.STRING, defaultValue: 'pending' })
status: string;
```
