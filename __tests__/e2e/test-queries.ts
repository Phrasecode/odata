/**
 * OData API Test Queries for E2E Tests
 *
 * This file contains OData queries used in the E2E test suite.
 * Queries are organized by category and numbered for easy reference.
 */

// ============================================================================
// BASIC QUERIES (1-3) - Simple filtering and selection
// ============================================================================

/**
 * Query 1: Get all active users with selected fields
 * Tests: $filter, $select
 */
export const query1_activeUsers =
  '/CustomUser?$filter=isActive eq true&$select=userId,username,email,fullName';

/**
 * Query 2: Get users by department with email filter
 * Tests: $filter with multiple conditions, $select
 */
export const query2_usersByDepartment =
  '/CustomUser?$filter=departmentId eq 1 and isActive eq true&$select=username,email,fullName,departmentId';

/**
 * Query 3: Get departments with description
 * Tests: $select, basic query
 */
export const query3_departments = '/Department?$select=id,departmentName,description,createdAt';

// ============================================================================
// EXPANSION QUERIES (4-7) - Testing relationships
// ============================================================================

/**
 * Query 4: Get users with their department information
 * Tests: $expand with $select on expanded entity
 */
export const query4_usersWithDepartment =
  '/CustomUser?$expand=myDepartment($select=departmentName,description)&$select=userId,username,email,fullName';

/**
 * Query 5: Get departments with all their users
 * Tests: $expand with HasMany relationship
 */
export const query5_departmentsWithUsers =
  '/Department?$expand=users($select=username,email,fullName,isActive)&$select=id,departmentName,description';

/**
 * Query 6: Get notes with user and category information
 * Tests: Multiple $expand on different relationships
 */
export const query6_notesWithRelations =
  '/Note?$expand=user($select=username,email),category($select=categoryName,description)&$select=noteId,title,content,isPinned,createdAt';

/**
 * Query 7: Get categories with creator and all notes
 * Tests: Multiple $expand with nested selections
 */
export const query7_categoriesWithDetails =
  '/Category?$expand=creator($select=username,email),notes($select=title,isPinned,createdAt)&$select=categoryId,categoryName,description';

// ============================================================================
// COMPLEX FILTERING (8-12) - Advanced filter conditions
// ============================================================================

/**
 * Query 8: Get pinned and non-archived notes
 * Tests: $filter with boolean conditions
 */
export const query8_pinnedNotes =
  '/Note?$filter=isPinned eq true and isArchived eq false&$select=noteId,title,content,createdAt&$orderby=createdAt desc';

/**
 * Query 9: Get users created after a specific date
 * Tests: $filter with datetime comparison
 */
export const query9_recentUsers =
  '/CustomUser?$filter=createdAt gt datetime\'2024-01-01T00:00:00Z\' and isActive eq true&$select=userId,username,email,createdAt&$orderby=createdAt desc';

/**
 * Query 10: Get notes with string filtering
 * Tests: $filter with contains function
 */
export const query10_searchNotes =
  '/Note?$filter=contains(tolower(title),\'meeting\') or contains(tolower(content),\'important\')&$select=noteId,title,content,isPinned';

/**
 * Query 11: Get categories by specific creator
 * Tests: $filter on foreign key with expansion
 */
export const query11_categoriesByCreator =
  '/Category?$filter=createdBy eq 1&$expand=creator($select=username,email),notes($select=title,createdAt)&$select=categoryId,categoryName,description';

/**
 * Query 12: Complex user filtering with multiple conditions
 * Tests: AND/OR logic, null checks
 */
export const query12_complexUserFilter =
  '/CustomUser?$filter=(departmentId eq 1 or departmentId eq 2) and isActive eq true and fullName ne null&$select=userId,username,email,fullName,departmentId';

// ============================================================================
// NESTED EXPANSION (13-16) - Deep relationship queries (3+ levels)
// ============================================================================

/**
 * Query 13: Get departments with users and their notes
 * Tests: 3-level deep expansion
 */
export const query13_departmentsWithUserNotes =
  '/Department?$expand=users($expand=notes($select=title,isPinned);$select=username,email)&$select=id,departmentName';

/**
 * Query 14: Get users with full profile (department, notes, categories)
 * Tests: Multiple nested expansions
 */
export const query14_usersFullProfile =
  '/CustomUser?$expand=myDepartment($select=departmentName),notes($select=title,createdAt),categories($select=categoryName)&$select=userId,username,email,fullName';

/**
 * Query 15: Get categories with deep expansion
 * Tests: Deep nested expansion with filtering
 */
export const query15_categoriesDeepExpand =
  '/Category?$expand=notes($expand=user($select=username,email);$select=title,content,isPinned),creator($select=username,email)&$select=categoryId,categoryName,description';

/**
 * Query 16: Get notes with full context (user, category)
 * Tests: 4-level deep expansion
 */
export const query16_notesFullContext =
  '/Note?$expand=user($expand=myDepartment($select=departmentName,description);$select=username,email,fullName),category($expand=creator($select=username);$select=categoryName,description)&$select=noteId,title,content,isPinned,isArchived,createdAt&$filter=isArchived eq false&$orderby=createdAt desc&$top=20';

// ============================================================================
// ORDERING AND PAGINATION (17-20) - $orderby, $top, $skip
// ============================================================================

/**
 * Query 17: Get latest notes with pagination
 * Tests: $orderby with $top and $skip
 */
export const query17_latestNotesPaginated =
  '/Note?$orderby=createdAt desc&$top=10&$skip=0&$select=noteId,title,createdAt,isPinned';

/**
 * Query 18: Get users with multi-field sorting
 * Tests: Multiple $orderby fields
 */
export const query18_usersMultiSort =
  '/CustomUser?$orderby=departmentId asc,createdAt desc&$select=userId,username,email,departmentId,createdAt';

/**
 * Query 19: Get top categories with expansion
 * Tests: $top with $expand
 */
export const query19_topCategories =
  '/Category?$orderby=categoryName asc&$top=5&$expand=notes($select=title;$filter=isPinned eq true)&$select=categoryId,categoryName,description';

/**
 * Query 20: Get departments ordered with users
 * Tests: $orderby with $expand
 */
export const query20_departmentsOrdered =
  '/Department?$orderby=departmentName asc&$expand=users($select=username,email;$top=3)&$select=id,departmentName,description';

// ============================================================================
// ADVANCED FILTERING (21-25) - Complex conditions and functions
// ============================================================================

/**
 * Query 21: Advanced note search with multiple string functions
 * Tests: Complex string filtering
 */
export const query21_advancedNoteSearch =
  '/Note?$filter=contains(tolower(title),\'project\') and length(content) gt 50 and isArchived eq false&$select=noteId,title,content,createdAt';

/**
 * Query 22: Users by email domain
 * Tests: indexof function
 */
export const query22_usersByEmailDomain =
  '/CustomUser?$filter=indexof(email,\'@example.com\') gt -1&$select=userId,username,email';

/**
 * Query 23: Complex category filter
 * Tests: Grouped conditions
 */
export const query23_complexCategoryFilter =
  '/Category?$filter=(createdBy eq 1 or createdBy eq 2) and createdAt gt datetime\'2024-01-01T00:00:00Z\'&$select=categoryId,categoryName,createdBy,createdAt';

/**
 * Query 24: Notes in date range
 * Tests: Date range filtering
 */
export const query24_notesDateRange =
  '/Note?$filter=createdAt ge datetime\'2024-01-01T00:00:00Z\' and createdAt le datetime\'2024-12-31T23:59:59Z\' and isArchived eq false&$select=noteId,title,createdAt,updatedAt&$orderby=createdAt desc';

/**
 * Query 25: Users with null checks
 * Tests: Null comparison
 */
export const query25_usersNullChecks =
  '/CustomUser?$filter=departmentId ne null and fullName ne null and isActive eq true&$select=userId,username,email,fullName,departmentId&$expand=myDepartment($select=departmentName)';

// ============================================================================
// COMBINED COMPLEX QUERIES (32-40) - Real-world scenarios
// ============================================================================

/**
 * Query 32: Dashboard - Active users with departments and recent notes
 * Tests: Complex real-world dashboard query
 */
export const query32_dashboardActiveUsers =
  '/CustomUser?$filter=isActive eq true&$expand=myDepartment($select=departmentName),notes($filter=isArchived eq false;$select=title,createdAt;$orderby=createdAt desc;$top=5)&$select=userId,username,email,fullName&$orderby=createdAt desc&$top=10';

/**
 * Query 33: Pinned notes management view
 * Tests: Filtering with multiple expansions
 */
export const query33_pinnedNotesManagement =
  '/Note?$filter=isPinned eq true and isArchived eq false&$expand=user($expand=myDepartment($select=departmentName);$select=username,email),category($select=categoryName,description)&$select=noteId,title,content,createdAt,updatedAt&$orderby=updatedAt desc';

/**
 * Query 34: Category analytics with creator and note counts
 * Tests: Analytics queries
 */
export const query34_categoryAnalytics =
  '/Category?$expand=creator($select=username,email),notes($filter=isPinned eq true;$select=title)&$select=categoryId,categoryName,description,createdAt&$filter=(createdBy eq 1 or createdBy eq 2) and createdAt gt datetime\'2024-01-01T00:00:00Z\'';

/**
 * Query 36: User activity report
 * Tests: Reporting queries
 */
export const query36_userActivityReport =
  '/CustomUser?$filter=isActive eq true&$expand=notes($select=title,createdAt,isPinned;$orderby=createdAt desc),categories($select=categoryName,createdAt)&$select=userId,username,email,fullName,createdAt&$orderby=createdAt desc';

/**
 * Query 37: Global note search with full context
 * Tests: Search with context
 */
export const query37_globalNoteSearch =
  '/Note?$filter=(contains(tolower(title),\'meeting\') or contains(tolower(content),\'meeting\')) and isArchived eq false&$expand=user($select=username,email),category($select=categoryName)&$select=noteId,title,content,isPinned,createdAt&$orderby=createdAt desc&$top=20';

/**
 * Query 38: Recent activity across all entities
 * Tests: Pagination with full context
 */
export const query38_recentActivity =
  '/Note?$filter=isArchived eq false&$expand=user($expand=myDepartment($select=departmentName);$select=username,email),category($select=categoryName)&$select=noteId,title,createdAt,updatedAt&$orderby=updatedAt desc&$top=20';

/**
 * Query 39: Active category usage
 * Tests: Filtered expansions
 */
export const query39_activeCategoryUsage =
  '/Category?$expand=notes($filter=isArchived eq false and isPinned eq true;$select=title,createdAt),creator($select=username)&$select=categoryId,categoryName,description&$orderby=createdAt desc';

/**
 * Query 40: Comprehensive user profile
 * Tests: Maximum depth expansion
 */
export const query40_comprehensiveUserProfile =
  '/CustomUser?$filter=userId eq 1&$expand=myDepartment($expand=users($select=username;$filter=isActive eq true;$top=5);$select=departmentName,description),notes($expand=category($expand=creator($select=username);$select=categoryName,description);$select=noteId,title,content,isPinned,isArchived,createdAt;$orderby=createdAt desc;$top=10),categories($expand=notes($select=title,isPinned;$filter=isArchived eq false;$top=3);$select=categoryId,categoryName,description)&$select=userId,username,email,fullName,isActive,createdAt';

// ============================================================================
// STRING FUNCTION QUERIES (41-50) - trim, substring, indexof, contains, etc.
// ============================================================================

/**
 * Query 41: Trim whitespace from usernames
 * Tests: trim function
 */
export const query41_trim =
  '/CustomUser?$filter=trim(username) eq \'john_doe\'&$select=userId,username,email';

/**
 * Query 42: Username matches email prefix
 * Tests: substring, indexof
 */
export const query42_usernameMatchesEmailPrefix =
  '/CustomUser?$filter=substring(email,0,indexof(email,\'@\')) eq username&$select=userId,username,email';

/**
 * Query 43: Notes with length comparison
 * Tests: length function
 */
export const query43_notesLengthComparison =
  '/Note?$filter=length(title) gt 10 and length(content) gt 50&$select=noteId,title,content';

/**
 * Query 44: Category name in description
 * Tests: contains with nested tolower
 */
export const query44_categoryNameInDescription =
  '/Category?$filter=contains(tolower(description),tolower(categoryName))&$select=categoryId,categoryName,description';

/**
 * Query 45: Users by email domain
 * Tests: Domain extraction
 */
export const query45_usersByEmailDomain =
  '/CustomUser?$filter=substring(email,indexof(email,\'@\')) eq \'@example.com\'&$select=userId,username,email';

/**
 * Query 46: Title starts with category prefix
 * Tests: Prefix matching
 */
export const query46_titleCategoryPrefix =
  '/Note?$expand=category($select=categoryName)&$filter=startswith(tolower(title),\'project\')&$select=noteId,title';

/**
 * Query 47: Full name search
 * Tests: Complex string search
 */
export const query47_fullNameSearch =
  '/CustomUser?$filter=contains(tolower(fullName),\'john\') or contains(tolower(fullName),\'smith\')&$select=userId,username,fullName,email';

/**
 * Query 48: Length match across relations
 * Tests: Cross-entity comparison
 */
export const query48_lengthMatchAcrossRelations =
  '/Note?$expand=category($select=categoryName)&$filter=length(title) gt 5&$select=noteId,title';

/**
 * Query 49: Content contains title
 * Tests: trim within contains
 */
export const query49_contentContainsTitle =
  '/Note?$filter=contains(tolower(content),tolower(trim(title)))&$select=noteId,title,content';

/**
 * Query 50: Email starts with username
 * Tests: startswith function
 */
export const query50_emailStartsWithUsername =
  '/CustomUser?$filter=startswith(email,username)&$select=userId,username,email';

// ============================================================================
// ARITHMETIC FUNCTION QUERIES (70-80) - add, sub, mul, div, mod operations
// ============================================================================

/**
 * Query 70: Notes but no categories
 * Tests: Lambda expressions with any
 */
export const query70_notesButNoCategories =
  '/Note?$filter=categoryId eq null&$select=noteId,title,content,createdAt';

/**
 * Query 71: Title is half the length of content
 * Tests: Division comparison
 */
export const query71_titleHalfContent =
  '/Note?$filter=(length(content) div 2) eq length(title) and isArchived eq false&$expand=user($select=username),category($select=categoryName)&$select=noteId,title,content';

/**
 * Query 72: Combined length check
 * Tests: Addition
 */
export const query72_combinedLengthCheck =
  '/CustomUser?$filter=(length(username) add length(email)) gt 50 and isActive eq true&$expand=myDepartment($select=departmentName)&$select=userId,username,email';

/**
 * Query 73: Category note length analysis
 * Tests: Arithmetic with expansion
 */
export const query73_categoryNoteLengthAnalysis =
  '/Category?$expand=notes($filter=length(title) gt 5;$select=title)&$select=categoryId,categoryName';

/**
 * Query 74: Every third user
 * Tests: Modulo operation
 */
export const query74_everyThirdUser =
  '/CustomUser?$filter=mod(userId,3) eq 0&$select=userId,username,email';

/**
 * Query 75: Note ID in range
 * Tests: Arithmetic filtering
 */
export const query75_noteIdRange =
  '/Note?$filter=noteId ge 1 and noteId le 10&$select=noteId,title,createdAt';

/**
 * Query 76: Department ID plus count
 * Tests: Addition in filter
 */
export const query76_departmentIdPlusCount =
  '/Department?$filter=(id add users/$count) gt 10&$expand=users($select=username,isActive)&$select=id,departmentName';

/**
 * Query 77: Full name length is multiple of 5
 * Tests: Modulo with length
 */
export const query77_fullNameLengthMultiple =
  '/CustomUser?$filter=mod(length(fullName),5) eq 0&$select=userId,username,fullName';

/**
 * Query 78: Content to title ratio
 * Tests: Division
 */
export const query78_contentToTitleRatio =
  '/Note?$filter=div(length(content),length(title)) gt 5&$select=noteId,title,content';

/**
 * Query 80: Even and odd IDs
 * Tests: Multiple modulo operations
 */
export const query80_evenOddIds =
  '/CustomUser?$filter=mod(userId,2) eq 0 or mod(userId,3) eq 0&$select=userId,username,email';
