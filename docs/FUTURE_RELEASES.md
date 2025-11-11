1. Core Query Options (Priority 1 - Essential)
   - [x] $select
   - [x] $filter
   - [x] $orderby
   - [x] $expand
   - [x] $skip
   - [x] $top
   - [ ] $apply
   - [ ] $count
   - [ ] $compute

Operators to implement:

Comparison: eq (equals), ne (not equals), gt (greater than), ge (greater or equal), lt (less than), le (less or equal)
Logical: and, or, not
Arithmetic: add, sub, mul, div, mod
String functions: contains, startswith, endswith, length, indexof, substring, tolower, toupper, trim, concat
Date functions: year, month, day, hour, minute, second
Collection: any, all

2. Entity Data Model (EDM) / Metadata (Priority 1)
   - [ ] Expose EDM as JSON endpoint
   - [ ] Include all supported query options in EDM
   - [ ] Document metadata format and expose via API
   - [ ] Include model and relation information
   - [ ] Include supported query options for each entity
   - [ ] Include function and property information
   - [ ] Include navigation properties
   - [ ] Include any other relevant information
   - [ ] Include documentation for each entity

<?xml version="1.0" encoding="UTF-8"?>
<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">
  <edmx:DataServices>
    <Schema Namespace="MyService" xmlns="http://docs.oasis-open.org/odata/ns/edm">
      <EntityType Name="Product">
        <Key>
          <PropertyRef Name="Id"/>
        </Key>
        <Property Name="Id" Type="Edm.Int32" Nullable="false"/>
        <Property Name="Name" Type="Edm.String"/>
        <Property Name="Price" Type="Edm.Decimal" Nullable="false"/>
        <Property Name="ReleaseDate" Type="Edm.DateTimeOffset"/>
        <NavigationProperty Name="Category" Type="MyService.Category"/>
      </EntityType>
      
      <EntityType Name="Category">
        <Key>
          <PropertyRef Name="Id"/>
        </Key>
        <Property Name="Id" Type="Edm.Int32" Nullable="false"/>
        <Property Name="Name" Type="Edm.String"/>
        <NavigationProperty Name="Products" Type="Collection(MyService.Product)"/>
      </EntityType>
      
      <EntityContainer Name="Container">
        <EntitySet Name="Products" EntityType="MyService.Product">
          <NavigationPropertyBinding Path="Category" Target="Categories"/>
        </EntitySet>
        <EntitySet Name="Categories" EntityType="MyService.Category">
          <NavigationPropertyBinding Path="Products" Target="Products"/>
        </EntitySet>
      </EntityContainer>
    </Schema>
  </edmx:DataServices>
</edmx:Edmx>

3. Standard Data Types (Priority 1)
   - [ ] Edm.String
   - [ ] Edm.Int32
   - [ ] Edm.Int64
   - [ ] Edm.Boolean
   - [ ] Edm.DateTimeOffset
   - [ ] Edm.Decimal
   - [ ] Edm.Double
   - [ ] Edm.Single
   - [ ] Edm.Guid
   - [ ] Edm.Binary
   - [ ] Edm.Stream

4. JSON Response Format (Priority 1)
{
  "@odata.context": "http://localhost/odata/$metadata#Products",
  "@odata.count": 100,
  "value": [
    {
      "@odata.id": "http://localhost/odata/Products(1)",
      "@odata.editLink": "Products(1)",
      "Id": 1,
      "Name": "Laptop",
      "Price": 999.99,
      "ReleaseDate": "2024-01-15T00:00:00Z"
    },
    {
      "@odata.id": "http://localhost/odata/Products(2)",
      "@odata.editLink": "Products(2)",
      "Id": 2,
      "Name": "Mouse",
      "Price": 29.99,
      "ReleaseDate": "2024-02-01T00:00:00Z"
    }
  ]
}

5. CRUD Operations (Priority 2)
GET - Retrieve entities
GET /Products              // Collection
GET /Products(1)           // Single entity by key
GET /Products(1)/Name      // Single property
GET /Products(1)/Name/$value  // Raw value
POST - Create entity
PATCH - Update entity (partial)
PUT - Replace entity (full)
DELETE - Remove entity

6. Advanced Features (Priority 3)
Delta Support
Delta support allows clients to query services and receive just the set of changes from a previous state
GET /Products?$deltatoken=abc123
Aggregation (Extension)
Support for groupby, aggregate operations for analytics scenarios.
OpenAPI/Swagger integration

