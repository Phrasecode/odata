# Future Releases

## Recently Completed ✅

- [x] **Custom SQL Queries** - `@Query` decorator for raw SQL endpoints
- [x] **QueryModel** - Virtual models for complex query results
- [x] **QueryController** - Controller for custom SQL-only endpoints
- [x] **rawQueryable()** - Execute raw SQL with OData response format
- [x] **Endpoint Naming Conventions** - KEBAB_CASE, LOWER_CASE, AS_MODEL_NAME

## Planned Features

### 1. Core Query Options (Priority 1 - Essential)

- [ ] $apply
- [ ] $count - partially implemented
- [ ] $compute

### 2. Core Query Options (Priority 2 - Important)

- [ ] $search

### 3. Core Query Options (Priority 3 - Nice to Have)

- [ ] $format

### 4. Core filter operators (Priority 2 - Important)

- [ ] $filter - geo operators
- [ ] $filter - collection operators
- [ ] $filter - type operators
- [ ] $filter - lambda operators
- [ ] $filter - search operators

### 5. CRUD Operations (Priority 2)

- [ ] POST - Create entity
- [ ] PATCH - Update entity (partial)
- [ ] PUT - Replace entity (full)
- [ ] DELETE - Remove entity

### 6. API authentication and authorization

- [ ] Authentication
- [ ] Authorization

### 7. API rate limiting

### 8. API retry logic

### 9. Delta Support

### 10. Support for groupby, aggregate operations for analytics scenarios

### 11. OpenAPI/Swagger integration

### 12. Query Options Configuration

- [ ] expandDepth
- [ ] selectDepth
- [ ] maxTop
- [ ] maxSkip
