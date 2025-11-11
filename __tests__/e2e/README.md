# End-to-End (E2E) Test Suite

This directory contains comprehensive E2E tests for the OData API implementation.

## 📁 Test Structure

The tests are organized into 9 separate test suites, each focusing on a specific category of OData functionality:

### 01 - Basic Queries (3 tests)

**File:** `api/01-basic-queries.test.ts`

- Query 1: Active Users - Basic filtering and field selection
- Query 2: Users by Department - Multi-condition filtering
- Query 3: All Departments - Simple entity retrieval

**Features Tested:** `$filter`, `$select`, basic queries

### 02 - Expansion Queries (4 tests)

**File:** `api/02-expansion-queries.test.ts`

- Query 4: Users with Department - BelongsTo relationship
- Query 5: Departments with Users - HasMany relationship
- Query 6: Notes with Relations - Multiple expansions
- Query 7: Categories with Details - Complex expansions

**Features Tested:** `$expand`, relationship navigation

### 03 - Complex Filtering (5 tests)

**File:** `api/03-complex-filtering.test.ts`

- Query 8: Pinned Notes - Boolean filtering
- Query 9: Recent Users - DateTime comparison
- Query 10: Search Notes - String functions (contains, tolower)
- Query 11: Categories by Creator - Foreign key filtering
- Query 12: Complex User Filter - AND/OR logic, null checks

**Features Tested:** Advanced `$filter` conditions, string functions

### 04 - Nested Expansion (4 tests)

**File:** `api/04-nested-expansion.test.ts`

- Query 13: Departments with User Notes - 3-level deep expansion
- Query 14: Users Full Profile - Multiple nested expansions
- Query 15: Categories Deep Expand - Deep nested with filtering
- Query 16: Notes Full Context - 4-level deep expansion

**Features Tested:** Deep relationship queries (3+ levels)

### 05 - Ordering and Pagination (4 tests)

**File:** `api/05-ordering-pagination.test.ts`

- Query 17: Latest Notes Paginated - Ordering with pagination
- Query 18: Users Multi Sort - Multiple field ordering
- Query 19: Top Categories - Top N with expansion
- Query 20: Departments Ordered - Ordering with relationships

**Features Tested:** `$orderby`, `$top`, `$skip`

### 06 - Advanced Filtering (5 tests)

**File:** `api/06-advanced-filtering.test.ts`

- Query 21: Advanced Note Search - Multiple string functions
- Query 22: Users by Email Domain - indexof function
- Query 23: Complex Category Filter - Grouped conditions
- Query 24: Notes Date Range - Date range filtering
- Query 25: Users Null Checks - Null comparison

**Features Tested:** Complex conditions, advanced functions

### 07 - Combined Complex Queries (8 tests)

**File:** `api/07-combined-complex.test.ts`

- Query 32: Dashboard Active Users - Real-world dashboard scenario
- Query 33: Pinned Notes Management - Complex filtering with expansions
- Query 34: Category Analytics - Analytics queries
- Query 36: User Activity Report - Reporting queries
- Query 37: Global Note Search - Search with context
- Query 38: Recent Activity - Pagination with full context
- Query 39: Active Category Usage - Filtered expansions
- Query 40: Comprehensive User Profile - Maximum depth expansion

**Features Tested:** Real-world scenarios combining multiple features

### 08 - String Function Queries (10 tests)

**File:** `api/08-string-functions.test.ts`

- Query 41: Trim Function
- Query 42: Username Matches Email Prefix - substring, indexof
- Query 43: Notes Length Comparison - length function
- Query 44: Category Name in Description - contains with nested tolower
- Query 45: Users by Email Domain - Domain extraction
- Query 46: Title Category Prefix - Prefix matching
- Query 47: Full Name Search - Complex string search
- Query 48: Length Match Across Relations - Cross-entity comparison
- Query 49: Content Contains Title - trim within contains
- Query 50: Email Starts With Username - startswith function

**Features Tested:** trim, substring, indexof, contains, tolower, length, startswith

### 09 - Arithmetic Function Queries (10 tests)

**File:** `api/09-arithmetic-functions.test.ts`

- Query 70: Notes But No Categories
- Query 71: Title Half Content - Division comparison
- Query 72: Combined Length Check - Addition
- Query 73: Category Note Length Analysis
- Query 74: Every Third User - Modulo operation
- Query 75: Note ID Range - Arithmetic filtering
- Query 76: Department ID Plus Count
- Query 77: Full Name Length Multiple - Modulo with length
- Query 78: Content to Title Ratio - Division
- Query 80: Even/Odd IDs - Multiple modulo operations

**Features Tested:** add, sub, mul, div, mod operations

## 🚀 Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test suite
npm run test:e2e -- api/01-basic-queries.test.ts

# Run in watch mode
npm run test:e2e:watch
```

## 📊 Test Results

**Total Tests:** 54
**Test Suites:** 9
**Coverage:** All major OData v4 features

## 🔧 Test Configuration

- **Server Port:** 3001 (automatically started/stopped)
- **Timeout:** 60 seconds per test
- **Base URL:** `http://localhost:3001`

## 📝 Test Queries

All test queries are defined in `test-queries.ts` (copied from `examples/express-app/test-queries.ts`).
This ensures tests have a local copy and are not affected by changes to the example queries.

## ✅ What's Tested

- ✅ Basic CRUD operations
- ✅ Filtering ($filter)
- ✅ Field selection ($select)
- ✅ Relationship expansion ($expand)
- ✅ Ordering ($orderby)
- ✅ Pagination ($top, $skip)
- ✅ String functions (trim, substring, indexof, contains, tolower, length, startswith)
- ✅ Arithmetic operations (add, sub, mul, div, mod)
- ✅ Date/time operations
- ✅ Null checks
- ✅ Complex nested queries (up to 4 levels deep)
- ✅ Real-world scenarios
