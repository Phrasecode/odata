# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features

- Full `$count` query option support
- `$apply` query option for aggregations
- `$compute` query option for calculated fields
- CRUD operations (POST, PUT, PATCH, DELETE)
- Delta support for change tracking
- OpenAPI/Swagger integration

## [0.7.0] - 2025-11-13

### Added

#### Core Framework

- **Decorator-Based Model Definition**: TypeScript decorators for defining data models
  - `@Table` - Define table metadata and options
  - `@Column` - Define column properties with data types
  - `@HasMany` - Define one-to-many relationships
  - `@HasOne` - Define one-to-one relationships
  - `@BelongsTo` - Define many-to-one relationships
- **DataSource**: Core data source management with database connection pooling
- **Model Base Class**: Abstract base class for all entity models with metadata management
- **Type-Safe Query Results**: Full TypeScript support with proper type inference

#### OData v4 Query Support

- **$select**: Choose specific fields to return from entities
- **$filter**: Filter results with complex conditions
  - Comparison operators: `eq`, `ne`, `gt`, `ge`, `lt`, `le`
  - Logical operators: `and`, `or`, `not`
  - Arithmetic operators: `add`, `sub`, `mul`, `div`, `mod` with parentheses support
  - Navigation property count filtering (e.g., `notes/$count gt 5`)
- **$expand**: Include related entities with support for:
  - Nested expansions (5+ levels deep)
  - Filters on expanded relations
  - Select specific fields from expanded relations
  - Order, top, and skip on expanded relations
  - Multiple expansions in a single query
- **$orderby**: Sort results by one or more fields (ascending/descending)
- **$top**: Limit the number of results returned
- **$skip**: Skip a specified number of results for pagination
- **$count**: Get total count of entities (inline with results)

#### Filter Functions

- **String Functions**: `contains`, `startswith`, `endswith`, `tolower`, `toupper`, `trim`, `length`, `indexof`, `concat`, `substring`
- **Date/Time Functions**: `date`, `time`, `day`, `month`, `year`, `hour`, `minute`, `second`, `now`
- **Math Functions**: `round`, `floor`, `ceiling`
- **Type Functions**: `cast`
- **Collection Operators**: `in`, `has` (for enum flags)

#### Integration Options

- **ExpressRouter**: Direct integration with Express.js applications
  - Automatic route registration for controllers
  - Built-in error handling
  - Automatic `$metadata` endpoint
- **OpenRouter**: Framework-agnostic router for:
  - Next.js API routes
  - Serverless functions (AWS Lambda, Azure Functions, Vercel)
  - Any Node.js framework
  - Manual `$metadata` endpoint support via `getMetaData()` method

#### Metadata & Discovery

- **$metadata Endpoint**: OData v4 compliant metadata endpoint
  - JSON format metadata describing all entities
  - Entity properties with data types and constraints
  - Navigation properties with relationship information
  - Primary key definitions
  - Automatic generation from model decorators
- **Schema Introspection**: Programmatic access to entity metadata

#### Database Support

- **Multiple Database Dialects**: Support for Sequelize-compatible databases
  - PostgreSQL
  - MySQL
  - SQLite
  - MariaDB
  - Microsoft SQL Server
  - Oracle
  - Snowflake
  - DB2
- **Database Features**:
  - Connection pooling
  - Underscored column name mapping
  - Custom table names
  - Timestamp support (createdAt, updatedAt)
  - Auto-increment primary keys

#### Response Format

- **OData v4 Compliant Responses**:
  - `@odata.context`: Metadata context URL
  - `@odata.count`: Total count of records
  - `value`: Array of entity data
  - `meta.queryExecutionTime`: Database query execution time in milliseconds

#### Developer Experience

- **Comprehensive Logging**:
  - Configurable log levels (DEBUG, INFO, WARN, ERROR)
  - Multiple log formats (JSON, SIMPLE, DETAILED)
  - Query execution time tracking
  - Database query parameter logging
  - Performance monitoring with PerfLogger
- **Error Management**:
  - Custom error classes (AppError, BadRequestError, NotFoundError, ValidationError, InternalServerError)
  - Structured error responses
  - Detailed error messages with stack traces
- **TypeScript Support**:
  - Full type definitions
  - IntelliSense support
  - Compile-time type checking
- **Webpack Compatibility**: Special handling for circular dependencies in bundled environments

#### Build & Distribution

- **Dual Module Format**:
  - CommonJS (CJS) for Node.js
  - ES Modules (ESM) for modern bundlers
- **Type Definitions**: Complete TypeScript declaration files
- **Tree-Shaking Support**: Side-effect free package for optimal bundling

### Documentation

- Comprehensive README with:
  - Quick start guide
  - Detailed feature documentation
  - Integration examples for Express.js, Next.js, and serverless
  - Query examples for all OData operations
  - Best practices and performance tips
  - Metadata endpoint documentation
- API documentation generated with TypeDoc
- Testing documentation (TESTING.md)
- Build and publishing guides (BUILD_SUMMARY.md, PUBLISHING.md)
- Contributing guidelines (CONTRIBUTING.md)
- Code of Conduct (CODE-OF-CONDUCT.md)

### Testing

- **Unit Tests**: Comprehensive unit test coverage
  - Metadata generation tests
  - Query parser tests (expand, filter, orderby, select)
  - Query converter tests
  - Response builder tests
  - Logger tests
  - Utility function tests
- **E2E Tests**: End-to-end API testing
  - Basic queries
  - Expansion queries
  - Complex filtering
  - Nested expansion
  - Ordering and pagination
  - Advanced filtering
  - Combined complex queries
  - String functions
  - Arithmetic functions
- **Test Infrastructure**:
  - Jest test framework
  - Supertest for API testing
  - SQLite in-memory database for testing
  - Test data seeding
  - Global setup/teardown

### Fixed

- Corrected README documentation for API response format
  - Changed `data` property to `value` (OData v4 standard)
  - Added `@odata.context` and `@odata.count` properties
  - Removed incorrect `totalExecutionTime` reference
  - Fixed query execution time monitoring examples

## [0.1.0] - 2025-11-11

### Added

- Initial release with core OData v4 functionality
- Basic project structure and configuration
- Example Express.js application
- Database schema and seed data

---

## Version History Summary

- **0.7.0** (2025-11-13) - Documentation fixes and metadata endpoint documentation
- **0.1.0** (2025-11-11) - Initial release

---

## Known Issues

- `$apply` and `$compute` query options are not yet implemented
- CRUD operations (POST, PUT, PATCH, DELETE) are not yet supported
- Delta support for change tracking is not available
- `$count` operation not properly working with the complex queries that depth more than 3 levels

---

## Support

- **Issues**: [GitHub Issues](https://github.com/Phrasecode/odata/issues)
- **Documentation**: [README.md](README.md)
- **Contact**: See [CONTACT.md](CONTACT.md)

---

## Acknowledgments

This project is built on top of:

- [Sequelize](https://sequelize.org/) - Promise-based Node.js ORM
- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript at Any Scale

Special thanks to all contributors and the open-source community.

---

[Unreleased]: https://github.com/Phrasecode/odata/compare/v0.7.0...HEAD
[0.7.0]: https://github.com/Phrasecode/odata/compare/v0.1.0...v0.7.0
[0.1.0]: https://github.com/Phrasecode/odata/releases/tag/v0.1.0

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
