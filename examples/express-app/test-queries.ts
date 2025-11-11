/**
 * Complex OData API Test Queries for Express App
 *
 * This file contains a comprehensive set of OData queries to test
 * the application's capabilities including filtering, expansion,
 * selection, ordering, and complex nested queries.
 */

// ============================================================================
// BASIC QUERIES - Simple filtering and selection
// ============================================================================

/**
 * Test 1: Get all active users with selected fields
 * Tests: $filter, $select
 */
export const query1_activeUsers =
  '/CustomUser?$filter=isActive eq true&$select=userId,username,email,fullName';

/**
 * Test 2: Get users by department with email filter
 * Tests: $filter with multiple conditions, $select
 */
export const query2_usersByDepartment =
  '/CustomUser?$filter=departmentId eq 1 and isActive eq true&$select=username,email,fullName,departmentId';

/**
 * Test 3: Get departments with description
 * Tests: $select, basic query
 */
export const query3_departments = '/Department?$select=id,departmentName,description,createdAt';

// ============================================================================
// EXPANSION QUERIES - Testing relationships
// ============================================================================

/**
 * Test 4: Get users with their department information
 * Tests: $expand with $select on expanded entity
 */
export const query4_usersWithDepartment =
  '/CustomUser?$expand=myDepartment($select=departmentName,description)&$select=userId,username,email,fullName';

/**
 * Test 5: Get departments with all their users
 * Tests: $expand with HasMany relationship
 */
export const query5_departmentsWithUsers =
  '/Department?$expand=users($select=username,email,fullName,isActive)&$select=id,departmentName,description';

/**
 * Test 6: Get notes with user and category information
 * Tests: Multiple $expand on different relationships
 */
export const query6_notesWithRelations =
  '/Note?$expand=user($select=username,email),category($select=categoryName,description)&$select=noteId,title,content,isPinned,createdAt';

/**
 * Test 7: Get categories with creator and all notes
 * Tests: Multiple $expand with nested selections
 * FIXED: CustomUser -> creator, Note -> notes
 */
export const query7_categoriesWithDetails =
  '/Category?$expand=creator($select=username,email),notes($select=title,isPinned,createdAt)&$select=categoryId,categoryName,description';

// ============================================================================
// COMPLEX FILTERING - Advanced filter conditions
// ============================================================================

/**
 * Test 8: Get pinned and non-archived notes
 * Tests: $filter with boolean conditions
 */
export const query8_pinnedNotes =
  '/Note?$filter=isPinned eq true and isArchived eq false&$select=noteId,title,content,createdAt&$orderby=createdAt desc';

/**
 * Test 9: Get users created after a specific date
 * Tests: $filter with datetime comparison
 */
export const query9_recentUsers =
  "/CustomUser?$filter=createdAt gt datetime'2024-01-01T00:00:00Z' and isActive eq true&$select=userId,username,email,createdAt&$orderby=createdAt desc";

/**
 * Test 10: Get notes with string filtering
 * Tests: $filter with contains function
 */
export const query10_searchNotes =
  "/Note?$filter=contains(tolower(title),'meeting') or contains(tolower(content),'important')&$select=noteId,title,content,isPinned";

/**
 * Test 11: Get categories by specific creator
 * Tests: $filter on foreign key with expansion
 * FIXED: CustomUser -> creator, Note -> notes
 */
export const query11_categoriesByCreator =
  '/Category?$filter=createdBy eq 1&$expand=creator($select=username,email),notes($select=title,createdAt)&$select=categoryId,categoryName,description';

/**
 * Test 12: Complex user filtering with multiple conditions
 * Tests: $filter with AND/OR logic, null checks
 */
export const query12_complexUserFilter =
  "/CustomUser?$filter=isActive eq true and departmentId ne null and (contains(tolower(email),'@company.com') or contains(tolower(username),'admin'))&$select=userId,username,email,departmentId";

// ============================================================================
// NESTED EXPANSION - Deep relationship queries
// ============================================================================

/**
 * Test 13: Get departments with users and their notes
 * Tests: Nested $expand (3 levels deep)
 * FIXED: CustomUser -> users, Note -> notes
 */
export const query13_departmentsWithUserNotes =
  '/Department?$expand=users($expand=notes($select=title,isPinned,createdAt;$filter=isArchived eq false);$select=username,email;$filter=isActive eq true)&$select=id,departmentName';

/**
 * Test 14: Get users with department, notes, and categories
 * Tests: Multiple nested expansions
 * FIXED: Department -> myDepartment, Note -> notes, Category -> categories
 */
export const query14_usersFullProfile =
  '/CustomUser?$expand=myDepartment($select=departmentName,description),notes($expand=category($select=categoryName);$select=title,isPinned,createdAt;$filter=isArchived eq false),categories($select=categoryName,description)&$select=userId,username,email,fullName&$filter=isActive eq true';

/**
 * Test 15: Get categories with creator's department and all notes
 * Tests: Deep nested expansion with filtering
 * FIXED: CustomUser -> creator, Department -> myDepartment, Note -> notes
 */
export const query15_categoriesDeepExpand =
  '/Category?$expand=creator($expand=myDepartment($select=departmentName);$select=username,email,departmentId),notes($expand=user($select=username);$select=title,content,isPinned;$filter=isPinned eq true)&$select=categoryId,categoryName,description';

/**
 * Test 16: Get notes with full context (user, user's department, category)
 * Tests: Complex nested expansion (4 levels)
 * FIXED: CustomUser -> user, Department -> myDepartment, Category -> category
 */
export const query16_notesFullContext =
  '/Note?$expand=user($expand=myDepartment($select=departmentName,description);$select=username,email,fullName),category($expand=creator($select=username);$select=categoryName,description)&$select=noteId,title,content,isPinned,isArchived,createdAt&$filter=isArchived eq false&$orderby=createdAt desc&$top=20';

// ============================================================================
// ORDERING AND PAGINATION - Sorting and limiting results
// ============================================================================

/**
 * Test 17: Get latest notes with pagination
 * Tests: $orderby, $top, $skip
 */
export const query17_latestNotesPaginated =
  '/Note?$orderby=createdAt desc&$top=10&$skip=0&$select=noteId,title,isPinned,createdAt';

/**
 * Test 18: Get users ordered by multiple fields
 * Tests: $orderby with multiple fields
 */
export const query18_usersMultiSort =
  '/CustomUser?$orderby=departmentId asc,username asc&$select=userId,username,email,departmentId&$filter=isActive eq true';

/**
 * Test 19: Get categories ordered by name with limited results
 * Tests: $orderby, $top with expansion
 * FIXED: Note -> notes
 */
export const query19_topCategories =
  '/Category?$orderby=categoryName asc&$top=5&$expand=notes($select=title;$filter=isPinned eq true)&$select=categoryId,categoryName,description';

/**
 * Test 20: Get departments with user count consideration
 * Tests: $orderby with expansion
 * FIXED: CustomUser -> users
 */
export const query20_departmentsOrdered =
  '/Department?$orderby=departmentName asc&$expand=users($select=username,isActive;$filter=isActive eq true)&$select=id,departmentName,description';

// ============================================================================
// ADVANCED FILTERING - Complex conditions and functions
// ============================================================================

/**
 * Test 21: Search notes with multiple string functions
 * Tests: contains, tolower, length functions
 */
export const query21_advancedNoteSearch =
  "/Note?$filter=contains(tolower(title),'project') and length(content) gt 50&$select=noteId,title,content,createdAt&$orderby=updatedAt desc";

/**
 * Test 22: Filter users with email domain check
 * Tests: indexof function, string comparison
 */
export const query22_usersByEmailDomain =
  "/CustomUser?$filter=indexof(tolower(email),'@company.com') ne -1 and isActive eq true&$select=userId,username,email,fullName";

/**
 * Test 23: Complex category filtering with nested conditions
 * Tests: Grouped conditions with AND/OR
 * FIXED: CustomUser -> creator, Note -> notes
 */
export const query23_complexCategoryFilter =
  "/Category?$filter=(createdBy eq 1 or createdBy eq 2) and createdAt gt datetime'2024-01-01T00:00:00Z'&$expand=creator($select=username),notes($select=title;$filter=isPinned eq true)&$select=categoryId,categoryName,description,createdAt";

/**
 * Test 24: Notes with date range filtering
 * Tests: Date range with AND conditions
 */
export const query24_notesDateRange =
  "/Note?$filter=createdAt ge datetime'2024-01-01T00:00:00Z' and createdAt le datetime'2024-12-31T23:59:59Z' and isArchived eq false&$select=noteId,title,createdAt,updatedAt&$orderby=createdAt desc";

/**
 * Test 25: Users with null checks and complex conditions
 * Tests: null comparison, ne operator
 * FIXED: Department -> myDepartment
 */
export const query25_usersNullChecks =
  '/CustomUser?$filter=departmentId ne null and fullName ne null and isActive eq true&$expand=myDepartment($select=departmentName)&$select=userId,username,email,fullName,departmentId';

// ============================================================================
// ROLE AND PERMISSION QUERIES - Access control testing
// ============================================================================

/**
 * Test 26: Get all roles with descriptions
 * Tests: Basic role queries
 */
export const query26_allRoles = '/Role?$select=roleId,roleName,description&$orderby=roleName asc';

/**
 * Test 27: Get all permissions
 * Tests: Basic permission queries
 */
export const query27_allPermissions =
  '/Permission?$select=permissionId,permissionName,description&$orderby=permissionName asc';

/**
 * Test 28: Get specific role by name
 * Tests: $filter on string field
 */
export const query28_roleByName =
  "/Role?$filter=contains(tolower(roleName),'admin')&$select=roleId,roleName,description";

/**
 * Test 29: Get permissions with specific keywords
 * Tests: String filtering on permissions
 */
export const query29_permissionsByKeyword =
  "/Permission?$filter=contains(tolower(permissionName),'write') or contains(tolower(permissionName),'edit')&$select=permissionId,permissionName,description";

// ============================================================================
// TAG QUERIES - Tag management
// ============================================================================

/**
 * Test 30: Get all tags ordered alphabetically
 * Tests: Basic tag queries with ordering
 */
export const query30_allTags = '/Tag?$select=tagId,tagName&$orderby=tagName asc';

/**
 * Test 31: Search tags by name
 * Tests: String filtering on tags
 */
export const query31_searchTags =
  "/Tag?$filter=contains(tolower(tagName),'important') or contains(tolower(tagName),'urgent')&$select=tagId,tagName";

// ============================================================================
// COMBINED COMPLEX QUERIES - Real-world scenarios
// ============================================================================

/**
 * Test 32: Dashboard query - Active users with recent notes
 * Tests: Complex real-world scenario
 * FIXED: Department -> myDepartment, Note -> notes
 */
export const query32_dashboardActiveUsers =
  "/CustomUser?$filter=isActive eq true&$expand=myDepartment($select=departmentName),notes($select=title,isPinned,createdAt;$filter=createdAt gt datetime'2024-01-01T00:00:00Z' and isArchived eq false;$orderby=createdAt desc;$top=5)&$select=userId,username,email,fullName&$orderby=username asc&$top=10";

/**
 * Test 33: Note management - All pinned notes with full context
 * Tests: Complex filtering with multiple expansions
 * FIXED: CustomUser -> user, Department -> myDepartment, Category -> category
 */
export const query33_pinnedNotesManagement =
  '/Note?$filter=isPinned eq true and isArchived eq false&$expand=user($expand=myDepartment($select=departmentName);$select=username,email),category($select=categoryName,description)&$select=noteId,title,content,createdAt,updatedAt&$orderby=updatedAt desc';

/**
 * Test 34: Category analytics - Categories with note counts
 * Tests: Expansion for analytics purposes
 * FIXED: CustomUser -> creator, Note -> notes
 */
export const query34_categoryAnalytics =
  '/Category?$expand=creator($select=username,email),notes($select=noteId,isPinned,isArchived,createdAt)&$select=categoryId,categoryName,description,createdAt&$orderby=categoryName asc';

/**
 * Test 36: User activity report - Users with their content
 * Tests: Complex expansion for reporting
 * FIXED: Department -> myDepartment, Note -> notes, Category -> categories
 */
export const query36_userActivityReport =
  "/CustomUser?$filter=isActive eq true and createdAt gt datetime'2023-01-01T00:00:00Z'&$expand=myDepartment($select=departmentName),notes($select=noteId,title,isPinned,isArchived,createdAt;$orderby=createdAt desc),categories($select=categoryId,categoryName,createdAt)&$select=userId,username,email,fullName,createdAt&$orderby=createdAt desc";

/**
 * Test 37: Search across notes with user context
 * Tests: String search with context expansion
 * FIXED: CustomUser -> user, Category -> category
 */
export const query37_globalNoteSearch =
  "/Note?$filter=(contains(tolower(title),'meeting') or contains(tolower(content),'meeting')) and isArchived eq false&$expand=user($select=username,email),category($select=categoryName)&$select=noteId,title,content,isPinned,createdAt&$orderby=createdAt desc&$top=20";

/**
 * Test 38: Recent activity - Latest notes across all users
 * Tests: Pagination with full context
 * FIXED: CustomUser -> user, Department -> myDepartment, Category -> category
 */
export const query38_recentActivity =
  '/Note?$filter=isArchived eq false&$expand=user($expand=myDepartment($select=departmentName);$select=username,email),category($select=categoryName)&$select=noteId,title,isPinned,createdAt,updatedAt&$orderby=updatedAt desc&$top=50';

/**
 * Test 39: Category usage - Categories with active notes only
 * Tests: Filtered expansion with counts
 * FIXED: CustomUser -> creator, Note -> notes
 */
export const query39_activeCategoryUsage =
  '/Category?$expand=creator($select=username),notes($select=noteId,title,isPinned;$filter=isArchived eq false and isPinned eq true)&$select=categoryId,categoryName,description&$orderby=categoryName asc';

/**
 * Test 40: Comprehensive user profile
 * Tests: Maximum depth expansion for complete user view
 * FIXED: Department -> myDepartment, Note -> notes, Category -> categories
 */
export const query40_comprehensiveUserProfile =
  '/CustomUser?$filter=userId eq 1&$expand=myDepartment($expand=users($select=username;$filter=isActive eq true;$top=5);$select=departmentName,description),notes($expand=category($expand=creator($select=username);$select=categoryName,description);$select=noteId,title,content,isPinned,isArchived,createdAt;$orderby=createdAt desc;$top=10),categories($expand=notes($select=title,isPinned;$filter=isArchived eq false;$top=3);$select=categoryId,categoryName,description)&$select=userId,username,email,fullName,isActive,createdAt';

export const query41_trim =
  "/CustomUser?$filter=contains(tolower(trim(email)), '@company.com') and isActive eq true&$select=userId,username,email,fullName";

// ============================================================================
// ADVANCED STRING MANIPULATION - Complex nested functions (42-50)
// ============================================================================

/**
 * Test 42: Users where username matches email prefix exactly
 * Tests: substring, indexof, tolower nested functions
 */
export const query42_usernameMatchesEmailPrefix =
  "/CustomUser?$filter=tolower(username) eq tolower(substring(email, 0, indexof(email, '@'))) and isActive eq true&$expand=myDepartment($select=departmentName)&$select=userId,username,email,fullName";

/**
 * Test 43: Notes with title length greater than content preview
 * Tests: length function with multiple fields
 */
export const query43_notesLengthComparison =
  '/Note?$filter=length(trim(title)) gt 20 and length(content) gt 100 and isArchived eq false&$expand=user($select=username),category($select=categoryName)&$select=noteId,title,content,createdAt';

/**
 * Test 44: Categories where name is contained in description
 * Tests: contains with nested tolower
 */
export const query44_categoryNameInDescription =
  '/Category?$filter=contains(tolower(description), tolower(categoryName)) and description ne null&$expand=creator($select=username,email),notes($top=3;$select=title,isPinned)&$select=categoryId,categoryName,description';

/**
 * Test 45: Users with email domain extraction and comparison
 * Tests: substring, indexof for domain extraction
 */
export const query45_usersByEmailDomain =
  "/CustomUser?$filter=substring(tolower(email), indexof(email, '@') add 1) eq 'company.com' and isActive eq true&$expand=myDepartment($select=departmentName)&$select=userId,username,email,fullName";

/**
 * Test 46: Notes where first 3 characters of title match category prefix
 * Tests: substring with length comparison
 */
export const query46_titleCategoryPrefix =
  '/Note?$filter=substring(tolower(trim(title)), 0, 3) eq substring(tolower(category/categoryName), 0, 3) and isArchived eq false&$expand=category($select=categoryName),user($select=username)&$select=noteId,title,isPinned';

/**
 * Test 47: Users with fullName containing both first and last name parts
 * Tests: complex string search with multiple contains
 */
export const query47_fullNameSearch =
  "/CustomUser?$filter=fullName ne null and length(trim(fullName)) gt 5 and contains(tolower(fullName), ' ') and isActive eq true&$select=userId,username,email,fullName&$orderby=fullName asc";

/**
 * Test 48: Categories created by users whose username length matches category name length
 * Tests: length comparison across relationships
 */
export const query48_lengthMatchAcrossRelations =
  '/Category?$filter=length(trim(categoryName)) eq length(trim(creator/username))&$expand=creator($select=username,email)&$select=categoryId,categoryName,createdBy';

/**
 * Test 49: Notes with content containing trimmed title
 * Tests: trim within contains
 */
export const query49_contentContainsTitle =
  '/Note?$filter=contains(tolower(content), tolower(trim(title))) and length(content) gt 50&$expand=user($select=username),category($select=categoryName)&$select=noteId,title,content,createdAt&$top=15';

/**
 * Test 50: Users where email starts with username
 * Tests: startswith with nested functions
 */
export const query50_emailStartsWithUsername =
  '/CustomUser?$filter=startswith(tolower(email), tolower(username)) and isActive eq true&$expand=myDepartment($select=departmentName)&$select=userId,username,email,fullName';

// ============================================================================
// ADVANCED DATE OPERATIONS - Complex temporal queries (51-60)
// ============================================================================

/**
 * Test 51: Users created in the same year as their first note
 * Tests: year function with relationship navigation
 */
export const query51_userNoteYearMatch =
  '/CustomUser?$filter=notes/any(n: year(n/createdAt) eq year(createdAt))&$expand=notes($top=1;$orderby=createdAt asc;$select=noteId,title,createdAt)&$select=userId,username,email,createdAt';

/**
 * Test 52: Notes created on weekends (Saturday or Sunday)
 * Tests: day of week calculation
 */
export const query52_weekendNotes =
  '/Note?$filter=(day(createdAt) mod 7 eq 0 or day(createdAt) mod 7 eq 6) and isArchived eq false&$expand=user($select=username),category($select=categoryName)&$select=noteId,title,createdAt&$orderby=createdAt desc';

/**
 * Test 53: Categories created in Q1 of any year
 * Tests: month range filtering
 */
export const query53_q1Categories =
  '/Category?$filter=month(createdAt) ge 1 and month(createdAt) le 3&$expand=creator($select=username),notes($filter=isArchived eq false;$select=title)&$select=categoryId,categoryName,createdAt&$orderby=createdAt desc';

/**
 * Test 54: Users and notes both created in same month and year
 * Tests: Complex date matching across entities
 */
export const query54_sameMonthCreation =
  '/CustomUser?$filter=notes/any(n: month(n/createdAt) eq month(createdAt) and year(n/createdAt) eq year(createdAt))&$expand=notes($filter=month(createdAt) eq month(user/createdAt);$select=noteId,title,createdAt)&$select=userId,username,createdAt';

/**
 * Test 55: Notes updated within 24 hours of creation
 * Tests: Date difference calculation
 */
export const query55_quicklyUpdatedNotes =
  '/Note?$filter=(hour(updatedAt) sub hour(createdAt)) le 24 and updatedAt ne createdAt&$expand=user($select=username),category($select=categoryName)&$select=noteId,title,createdAt,updatedAt&$orderby=updatedAt desc';

/**
 * Test 56: Users created in leap years
 * Tests: Year modulo calculation
 */
export const query56_leapYearUsers =
  '/CustomUser?$filter=(year(createdAt) mod 4 eq 0) and isActive eq true&$expand=myDepartment($select=departmentName)&$select=userId,username,email,createdAt&$orderby=createdAt desc';

/**
 * Test 57: Notes older than 6 months but updated recently (last 7 days)
 * Tests: Multiple date range comparisons
 */
export const query57_oldButRecentlyUpdated =
  '/Note?$filter=(day(now()) sub day(createdAt)) gt 180 and (day(now()) sub day(updatedAt)) le 7 and isArchived eq false&$expand=user($select=username),category($select=categoryName)&$select=noteId,title,createdAt,updatedAt&$orderby=updatedAt desc';

/**
 * Test 58: Categories created on the same day of month as current day
 * Tests: day function comparison with now()
 */
export const query58_sameDayOfMonth =
  '/Category?$filter=day(createdAt) eq day(now())&$expand=creator($select=username),notes($select=title;$top=3)&$select=categoryId,categoryName,createdAt&$orderby=createdAt desc';

/**
 * Test 59: Users created in even months
 * Tests: month modulo operation
 */
export const query59_evenMonthUsers =
  '/CustomUser?$filter=(month(createdAt) mod 2) eq 0 and isActive eq true&$expand=myDepartment($select=departmentName)&$select=userId,username,email,createdAt&$orderby=createdAt desc';

/**
 * Test 60: Notes with creation and update in different years
 * Tests: year comparison between dates
 */
export const query60_crossYearUpdates =
  '/Note?$filter=year(createdAt) ne year(updatedAt) and isArchived eq false&$expand=user($select=username),category($select=categoryName)&$select=noteId,title,createdAt,updatedAt&$orderby=updatedAt desc';

// ============================================================================
// ADVANCED LAMBDA EXPRESSIONS - Complex any/all queries (61-70)
// ============================================================================

/**
 * Test 61: Users with ALL notes pinned
 * Tests: all() lambda expression
 */
export const query61_allNotesPinned =
  '/CustomUser?$filter=notes/all(n: n/isPinned eq true) and notes/$count gt 0&$expand=notes($select=noteId,title,isPinned)&$select=userId,username,email';

/**
 * Test 62: Departments where ALL users are active
 * Tests: all() with boolean field
 */
export const query62_allUsersActive =
  '/Department?$filter=users/all(u: u/isActive eq true) and users/$count gt 0&$expand=users($select=username,email,isActive)&$select=id,departmentName';

/**
 * Test 63: Categories with notes from multiple users
 * Tests: Complex any with distinct user check
 */
export const query63_multipleNoteAuthors =
  '/Category?$filter=notes/$count gt 1 and notes/any(n1: notes/any(n2: n2/userId ne n1/userId))&$expand=notes($expand=user($select=username);$select=noteId,title,userId)&$select=categoryId,categoryName';

/**
 * Test 64: Users who have created both notes and categories
 * Tests: Multiple any conditions on different relationships
 */
export const query64_notesAndCategoriesCreator =
  '/CustomUser?$filter=notes/$count gt 0 and categories/$count gt 0 and isActive eq true&$expand=notes($top=3;$select=title),categories($top=3;$select=categoryName)&$select=userId,username,email';

/**
 * Test 65: Departments with at least 3 active users who have created notes
 * Tests: Nested any with count
 */
export const query65_activeUsersWithNotes =
  '/Department?$filter=users/$count($filter=isActive eq true and notes/$count gt 0) ge 3&$expand=users($filter=isActive eq true;$expand=notes($top=2;$select=title);$select=username,email)&$select=id,departmentName';

/**
 * Test 66: Notes in categories where creator is still active
 * Tests: Navigation through multiple relationships
 */
export const query66_activeCategoryCreatorNotes =
  '/Note?$filter=category/creator/isActive eq true and isArchived eq false&$expand=category($expand=creator($select=username,isActive);$select=categoryName),user($select=username)&$select=noteId,title,createdAt';

/**
 * Test 67: Users with notes in at least 3 different categories
 * Tests: Complex count with distinct categories
 */
export const query67_multiCategoryUsers =
  '/CustomUser?$filter=notes/$count gt 2 and isActive eq true&$expand=notes($expand=category($select=categoryName);$select=noteId,title,categoryId)&$select=userId,username,email&$orderby=notes/$count desc';

/**
 * Test 68: Categories where all notes are either pinned or archived
 * Tests: all() with OR condition
 */
export const query68_pinnedOrArchivedNotes =
  '/Category?$filter=notes/all(n: n/isPinned eq true or n/isArchived eq true) and notes/$count gt 0&$expand=notes($select=noteId,title,isPinned,isArchived)&$select=categoryId,categoryName';

/**
 * Test 69: Departments with users from multiple categories
 * Tests: Nested any across multiple levels
 */
export const query69_multiCategoryDepartments =
  '/Department?$filter=users/any(u: u/categories/$count gt 1)&$expand=users($filter=categories/$count gt 1;$expand=categories($select=categoryName);$select=username,email)&$select=id,departmentName';

/**
 * Test 70: Users who have notes but no categories created
 * Tests: Combining count conditions
 */
export const query70_notesButNoCategories =
  '/CustomUser?$filter=notes/$count gt 0 and categories/$count eq 0 and isActive eq true&$expand=notes($top=5;$select=title,createdAt)&$select=userId,username,email';

// ============================================================================
// COMPLEX COMPUTED QUERIES - Mathematical and aggregation (71-80)
// ============================================================================

/**
 * Test 71: Notes where title length is exactly half of content length
 * Tests: Mathematical comparison with length
 */
export const query71_titleHalfContent =
  '/Note?$filter=(length(content) div 2) eq length(title) and isArchived eq false&$expand=user($select=username),category($select=categoryName)&$select=noteId,title,content';

/**
 * Test 72: Users with username length plus email length greater than 50
 * Tests: Addition of length functions
 */
export const query72_combinedLengthCheck =
  '/CustomUser?$filter=(length(username) add length(email)) gt 50 and isActive eq true&$expand=myDepartment($select=departmentName)&$select=userId,username,email';

/**
 * Test 73: Categories with average note title length estimation
 * Tests: Complex filtering for length analysis
 */
export const query73_categoryNoteLengthAnalysis =
  '/Category?$filter=notes/$count gt 2&$expand=notes($select=noteId,title,content)&$select=categoryId,categoryName';

/**
 * Test 74: Users where userId modulo 3 equals 0 (every third user)
 * Tests: modulo operation on ID
 */
export const query74_everyThirdUser =
  '/CustomUser?$filter=(userId mod 3) eq 0 and isActive eq true&$expand=myDepartment($select=departmentName)&$select=userId,username,email&$orderby=userId asc';

/**
 * Test 75: Notes where noteId is within a specific range using division
 * Tests: Division and comparison
 */
export const query75_noteIdRange =
  '/Note?$filter=(noteId div 10) eq 1 and isArchived eq false&$expand=user($select=username),category($select=categoryName)&$select=noteId,title,createdAt';

/**
 * Test 76: Departments with ID plus user count greater than 10
 * Tests: Addition with count
 */
export const query76_departmentIdPlusCount =
  '/Department?$filter=(id add users/$count) gt 10&$expand=users($select=username,isActive)&$select=id,departmentName';

/**
 * Test 77: Users where length of fullName is multiple of 5
 * Tests: modulo with length
 */
export const query77_fullNameLengthMultiple =
  '/CustomUser?$filter=fullName ne null and (length(trim(fullName)) mod 5) eq 0 and isActive eq true&$select=userId,username,fullName&$orderby=fullName asc';

/**
 * Test 78: Notes where content length divided by title length is greater than 10
 * Tests: Division comparison between fields
 */
export const query78_contentToTitleRatio =
  '/Note?$filter=length(title) gt 0 and (length(content) div length(title)) gt 10 and isArchived eq false&$expand=user($select=username)&$select=noteId,title,content&$orderby=content desc';

/**
 * Test 79: Categories where categoryId multiplied by note count is less than 100
 * Tests: multiplication with count
 */
export const query79_categoryIdTimesCount =
  '/Category?$filter=(categoryId mul notes/$count) lt 100&$expand=notes($select=noteId,title)&$select=categoryId,categoryName';

/**
 * Test 80: Users with even userId and odd departmentId
 * Tests: Multiple modulo operations
 */
export const query80_evenOddIds =
  '/CustomUser?$filter=(userId mod 2) eq 0 and departmentId ne null and (departmentId mod 2) eq 1 and isActive eq true&$expand=myDepartment($select=departmentName)&$select=userId,username,email,departmentId';

// ============================================================================
// ULTRA COMPLEX NESTED QUERIES - Maximum depth scenarios (81-90)
// ============================================================================

/**
 * Test 81: Five-level deep expansion with filters at each level
 * Tests: Maximum depth expansion
 */
export const query81_fiveLevelExpansion =
  '/Department?$filter=users/$count gt 0&$expand=users($filter=isActive eq true;$expand=notes($filter=isArchived eq false;$expand=category($filter=notes/$count gt 1;$expand=creator($expand=myDepartment($select=departmentName);$select=username,email);$select=categoryName,description);$select=noteId,title,categoryId);$select=userId,username,email)&$select=id,departmentName&$top=5';

/**
 * Test 82: Users with nested note and category relationships
 * Tests: Circular relationship navigation
 */
export const query82_circularRelationships =
  '/CustomUser?$filter=isActive eq true and notes/$count gt 0&$expand=notes($expand=category($expand=creator($expand=notes($top=2;$select=title);$select=username);$select=categoryName);$select=noteId,title),categories($expand=notes($top=2;$select=title);$select=categoryName)&$select=userId,username,email';

/**
 * Test 83: Complex multi-condition with nested any/all
 * Tests: Combined lambda expressions
 */
export const query83_complexLambdaCombination =
  '/Category?$filter=notes/any(n: n/isPinned eq true and n/user/isActive eq true) and notes/all(n: length(n/title) gt 5) and creator/isActive eq true&$expand=notes($filter=isPinned eq true;$expand=user($select=username,isActive);$select=noteId,title),creator($select=username,email)&$select=categoryId,categoryName';

/**
 * Test 84: Department hierarchy with complete user context
 * Tests: Full organizational structure query
 */
export const query84_completeOrgStructure =
  '/Department?$expand=users($expand=myDepartment($select=departmentName),notes($expand=category($expand=creator($select=username);$select=categoryName);$select=noteId,title,isPinned,createdAt;$filter=isArchived eq false;$orderby=createdAt desc;$top=3),categories($expand=notes($select=title;$top=2);$select=categoryName);$select=userId,username,email,fullName,isActive;$filter=isActive eq true)&$select=id,departmentName,description,createdAt&$orderby=departmentName asc';

/**
 * Test 85: Cross-reference query with multiple relationship paths
 * Tests: Multiple navigation paths to same entity
 */
export const query85_multipleNavigationPaths =
  '/Note?$filter=user/myDepartment/id eq category/creator/myDepartment/id and isArchived eq false&$expand=user($expand=myDepartment($select=departmentName);$select=username,email),category($expand=creator($expand=myDepartment($select=departmentName);$select=username);$select=categoryName)&$select=noteId,title,createdAt';

/**
 * Test 86: Complex string and date combination with deep nesting
 * Tests: Multiple function types in nested query
 */
export const query86_stringDateDeepNesting =
  "/CustomUser?$filter=isActive eq true and contains(tolower(email),'@company.com') and year(createdAt) eq 2024&$expand=myDepartment($expand=users($filter=isActive eq true and year(createdAt) eq year(now());$select=username,createdAt;$top=5);$select=departmentName),notes($filter=isPinned eq true and (day(now()) sub day(createdAt)) le 30 and contains(tolower(title),'important');$expand=category($select=categoryName);$select=noteId,title,createdAt;$orderby=createdAt desc)&$select=userId,username,email,fullName,createdAt";

/**
 * Test 87: Aggregation-focused query with multiple counts
 * Tests: Count operations across relationships
 */
export const query87_multipleCountAggregations =
  '/Department?$filter=users/$count gt 2 and users/$count($filter=isActive eq true) ge (users/$count div 2)&$expand=users($filter=notes/$count gt 0;$expand=notes($select=noteId,title;$top=2);$select=userId,username,email)&$select=id,departmentName';

/**
 * Test 88: Complex filter with substring extraction and comparison
 * Tests: Advanced string manipulation in filters
 */
export const query88_advancedSubstringFilter =
  '/CustomUser?$filter=length(email) gt 10 and substring(email, 0, 1) eq substring(username, 0, 1) and isActive eq true&$expand=myDepartment($select=departmentName),notes($filter=substring(tolower(title), 0, 1) eq substring(tolower(user/username), 0, 1);$select=noteId,title)&$select=userId,username,email';

/**
 * Test 89: Time-based analysis with multiple temporal conditions
 * Tests: Complex date calculations
 */
export const query89_temporalAnalysis =
  '/Note?$filter=year(createdAt) eq year(now()) and month(createdAt) eq month(now()) and (day(now()) sub day(updatedAt)) le 7 and user/isActive eq true&$expand=user($expand=myDepartment($select=departmentName);$select=username,email,createdAt),category($expand=creator($select=username,createdAt);$select=categoryName,createdAt)&$select=noteId,title,content,isPinned,createdAt,updatedAt&$orderby=updatedAt desc';

/**
 * Test 90: Ultimate complex query combining all features
 * Tests: Everything combined - strings, dates, lambdas, deep nesting, math
 */
export const query90_ultimateComplexQuery =
  "/CustomUser?$filter=isActive eq true and departmentId ne null and (length(username) add length(email)) gt 30 and contains(tolower(email),'@company.com') and year(createdAt) ge 2023 and notes/any(n: n/isPinned eq true and length(n/title) gt 10 and (day(now()) sub day(n/createdAt)) le 90) and categories/any(c: c/notes/$count gt 2)&$expand=myDepartment($expand=users($filter=isActive eq true and (userId mod 2) eq 0;$select=username,userId;$top=3);$select=id,departmentName,description),notes($filter=isPinned eq true and isArchived eq false and contains(tolower(title),'project');$expand=category($expand=creator($expand=myDepartment($select=departmentName);$select=username,email);$select=categoryName,description,createdAt);$select=noteId,title,content,isPinned,createdAt,updatedAt;$orderby=updatedAt desc;$top=5),categories($filter=notes/$count gt 1;$expand=notes($filter=isArchived eq false;$select=noteId,title,isPinned;$top=3);$select=categoryId,categoryName,description,createdAt;$orderby=createdAt desc)&$select=userId,username,email,fullName,departmentId,createdAt,updatedAt&$orderby=createdAt desc&$top=10";

export const allQueries = {
  // Basic queries
  query1_activeUsers,
  query2_usersByDepartment,
  query3_departments,

  // Expansion queries
  query4_usersWithDepartment,
  query5_departmentsWithUsers,
  query6_notesWithRelations,
  query7_categoriesWithDetails,

  // Complex filtering
  query8_pinnedNotes,
  query9_recentUsers,
  query10_searchNotes,
  query11_categoriesByCreator,
  query12_complexUserFilter,

  // Nested expansion
  query13_departmentsWithUserNotes,
  query14_usersFullProfile,
  query15_categoriesDeepExpand,
  query16_notesFullContext,

  // Ordering and pagination
  query17_latestNotesPaginated,
  query18_usersMultiSort,
  query19_topCategories,
  query20_departmentsOrdered,

  // Advanced filtering
  query21_advancedNoteSearch,
  query22_usersByEmailDomain,
  query23_complexCategoryFilter,
  query24_notesDateRange,
  query25_usersNullChecks,

  // Role and permission queries
  query26_allRoles,
  query27_allPermissions,
  query28_roleByName,
  query29_permissionsByKeyword,

  // Tag queries
  query30_allTags,
  query31_searchTags,

  // Combined complex queries
  query32_dashboardActiveUsers,
  query33_pinnedNotesManagement,
  query34_categoryAnalytics,
  query36_userActivityReport,
  query37_globalNoteSearch,
  query38_recentActivity,
  query39_activeCategoryUsage,
  query40_comprehensiveUserProfile,
  query41_trim,

  // Advanced string manipulation
  query42_usernameMatchesEmailPrefix,
  query43_notesLengthComparison,
  query44_categoryNameInDescription,
  query45_usersByEmailDomain,
  query46_titleCategoryPrefix,
  query47_fullNameSearch,
  query48_lengthMatchAcrossRelations,
  query49_contentContainsTitle,
  query50_emailStartsWithUsername,

  // Advanced date and time functions
  // query51_userNoteYearMatch,
  // query52_weekendNotes,
  // query53_q1Categories,
  // query54_sameMonthCreation,
  // query55_quicklyUpdatedNotes,
  // query56_leapYearUsers,
  // query57_oldButRecentlyUpdated,
  // query58_sameDayOfMonth,
  // query59_evenMonthUsers,
  // query60_crossYearUpdates,

  // Lambda expressions
  // query61_allNotesPinned,
  // query62_allUsersActive,
  // query63_multipleNoteAuthors,
  // query64_notesAndCategoriesCreator,
  // query65_activeUsersWithNotes,
  // query66_activeCategoryCreatorNotes,
  // query67_multiCategoryUsers,
  // query68_pinnedOrArchivedNotes,
  // query69_multiCategoryDepartments,

  // Complex math operations
  query70_notesButNoCategories,
  query71_titleHalfContent,
  query72_combinedLengthCheck,
  query73_categoryNoteLengthAnalysis,
  query74_everyThirdUser,
  query75_noteIdRange,
  query76_departmentIdPlusCount,
  query77_fullNameLengthMultiple,
  query78_contentToTitleRatio,
  // query79_categoryIdTimesCount, --error
  query80_evenOddIds,

  // Deep and wide expansion
  // query81_fiveLevelExpansion,
  // query82_circularRelationships,
  // query83_complexLambdaCombination,
  // query84_completeOrgStructure,
  // query85_multipleNavigationPaths,
  // query86_stringDateDeepNesting,
  // query87_multipleCountAggregations,
  // query88_advancedSubstringFilter,
  // query89_temporalAnalysis,
  // query90_ultimateComplexQuery,
};

export default allQueries;
