-- Sample Data Seeder for OData Express App Testing
-- This script populates the database with test data for comprehensive API testing
-- Clear existing data (in reverse order of dependencies)
TRUNCATE TABLE note_tags CASCADE;

TRUNCATE TABLE role_permissions CASCADE;

TRUNCATE TABLE user_roles CASCADE;

TRUNCATE TABLE notes CASCADE;

TRUNCATE TABLE categories CASCADE;

TRUNCATE TABLE tags CASCADE;

TRUNCATE TABLE permissions CASCADE;

TRUNCATE TABLE roles CASCADE;

TRUNCATE TABLE users CASCADE;

TRUNCATE TABLE departments CASCADE;

-- Insert Departments
INSERT INTO
    departments (id, department_name, description, created_at)
VALUES
    (
        1,
        'Engineering',
        'Software Development and Engineering',
        NOW () - INTERVAL '6 months'
    ),
    (
        2,
        'Marketing',
        'Marketing and Communications',
        NOW () - INTERVAL '5 months'
    ),
    (
        3,
        'Sales',
        'Sales and Business Development',
        NOW () - INTERVAL '4 months'
    ),
    (
        4,
        'Human Resources',
        'HR and People Operations',
        NOW () - INTERVAL '3 months'
    ),
    (
        5,
        'Finance',
        'Finance and Accounting',
        NOW () - INTERVAL '2 months'
    );

-- Reset sequence
SELECT
    setval (
        'departments_id_seq',
        (
            SELECT
                MAX(id)
            FROM
                departments
        )
    );

-- Insert Users
INSERT INTO
    users (
        user_id,
        username,
        email,
        password_hash,
        full_name,
        department_id,
        is_active,
        created_at,
        updated_at
    )
VALUES
    (
        1,
        'john.doe',
        'john.doe@company.com',
        '$2a$10$abcdefghijklmnopqrstuvwxyz',
        'John Doe',
        1,
        true,
        NOW () - INTERVAL '180 days',
        NOW () - INTERVAL '1 day'
    ),
    (
        2,
        'jane.smith',
        'jane.smith@company.com',
        '$2a$10$abcdefghijklmnopqrstuvwxyz',
        'Jane Smith',
        1,
        true,
        NOW () - INTERVAL '150 days',
        NOW () - INTERVAL '2 days'
    ),
    (
        3,
        'bob.johnson',
        'bob.johnson@company.com',
        '$2a$10$abcdefghijklmnopqrstuvwxyz',
        'Bob Johnson',
        2,
        true,
        NOW () - INTERVAL '120 days',
        NOW () - INTERVAL '3 days'
    ),
    (
        4,
        'alice.williams',
        'alice.williams@company.com',
        '$2a$10$abcdefghijklmnopqrstuvwxyz',
        'Alice Williams',
        2,
        true,
        NOW () - INTERVAL '100 days',
        NOW () - INTERVAL '4 days'
    ),
    (
        5,
        'charlie.brown',
        'charlie.brown@company.com',
        '$2a$10$abcdefghijklmnopqrstuvwxyz',
        'Charlie Brown',
        3,
        true,
        NOW () - INTERVAL '90 days',
        NOW () - INTERVAL '5 days'
    ),
    (
        6,
        'diana.davis',
        'diana.davis@company.com',
        '$2a$10$abcdefghijklmnopqrstuvwxyz',
        'Diana Davis',
        3,
        true,
        NOW () - INTERVAL '80 days',
        NOW () - INTERVAL '6 days'
    ),
    (
        7,
        'eve.miller',
        'eve.miller@company.com',
        '$2a$10$abcdefghijklmnopqrstuvwxyz',
        'Eve Miller',
        4,
        true,
        NOW () - INTERVAL '70 days',
        NOW () - INTERVAL '7 days'
    ),
    (
        8,
        'frank.wilson',
        'frank.wilson@company.com',
        '$2a$10$abcdefghijklmnopqrstuvwxyz',
        'Frank Wilson',
        5,
        true,
        NOW () - INTERVAL '60 days',
        NOW () - INTERVAL '8 days'
    ),
    (
        9,
        'grace.moore',
        'grace.moore@company.com',
        '$2a$10$abcdefghijklmnopqrstuvwxyz',
        'Grace Moore',
        1,
        false,
        NOW () - INTERVAL '50 days',
        NOW () - INTERVAL '30 days'
    ),
    (
        10,
        'admin',
        'admin@company.com',
        '$2a$10$abcdefghijklmnopqrstuvwxyz',
        'System Administrator',
        1,
        true,
        NOW () - INTERVAL '365 days',
        NOW ()
    );

-- Reset sequence
SELECT
    setval (
        'users_user_id_seq',
        (
            SELECT
                MAX(user_id)
            FROM
                users
        )
    );

-- Insert Categories
INSERT INTO
    categories (
        category_id,
        category_name,
        description,
        created_by,
        created_at
    )
VALUES
    (
        1,
        'Work',
        'Work-related notes and tasks',
        1,
        NOW () - INTERVAL '150 days'
    ),
    (
        2,
        'Personal',
        'Personal notes and reminders',
        1,
        NOW () - INTERVAL '140 days'
    ),
    (
        3,
        'Projects',
        'Project documentation and planning',
        2,
        NOW () - INTERVAL '130 days'
    ),
    (
        4,
        'Meetings',
        'Meeting notes and action items',
        2,
        NOW () - INTERVAL '120 days'
    ),
    (
        5,
        'Ideas',
        'Ideas and brainstorming',
        3,
        NOW () - INTERVAL '110 days'
    ),
    (
        6,
        'Research',
        'Research notes and findings',
        3,
        NOW () - INTERVAL '100 days'
    ),
    (
        7,
        'Documentation',
        'Technical documentation',
        1,
        NOW () - INTERVAL '90 days'
    ),
    (
        8,
        'Training',
        'Training materials and notes',
        4,
        NOW () - INTERVAL '80 days'
    );

-- Reset sequence
SELECT
    setval (
        'categories_category_id_seq',
        (
            SELECT
                MAX(category_id)
            FROM
                categories
        )
    );

-- Insert Notes
INSERT INTO
    notes (
        note_id,
        user_id,
        category_id,
        title,
        content,
        is_pinned,
        is_archived,
        created_at,
        updated_at
    )
VALUES
    (
        1,
        1,
        1,
        'Sprint Planning Q4',
        'Planning for Q4 sprint. Focus on new features and bug fixes. Team capacity: 5 developers.',
        true,
        false,
        NOW () - INTERVAL '30 days',
        NOW () - INTERVAL '1 day'
    ),
    (
        2,
        1,
        4,
        'Team Meeting Notes',
        'Discussed project timeline and resource allocation. Action items: Review architecture, Update documentation.',
        true,
        false,
        NOW () - INTERVAL '25 days',
        NOW () - INTERVAL '2 days'
    ),
    (
        3,
        2,
        3,
        'API Design Document',
        'RESTful API design for the new microservice. Endpoints, authentication, rate limiting considerations.',
        false,
        false,
        NOW () - INTERVAL '20 days',
        NOW () - INTERVAL '3 days'
    ),
    (
        4,
        2,
        7,
        'Database Schema Updates',
        'Proposed changes to the user table. Add new fields for profile completion tracking.',
        true,
        false,
        NOW () - INTERVAL '15 days',
        NOW () - INTERVAL '4 days'
    ),
    (
        5,
        3,
        5,
        'Marketing Campaign Ideas',
        'Brainstorming session results. Social media strategy, content calendar, influencer partnerships.',
        false,
        false,
        NOW () - INTERVAL '10 days',
        NOW () - INTERVAL '5 days'
    ),
    (
        6,
        3,
        4,
        'Client Meeting - Acme Corp',
        'Requirements gathering session. Client needs custom reporting dashboard. Timeline: 6 weeks.',
        true,
        false,
        NOW () - INTERVAL '8 days',
        NOW () - INTERVAL '1 day'
    ),
    (
        7,
        4,
        2,
        'Personal Goals 2024',
        'Career development goals. Learn new technologies, contribute to open source, attend conferences.',
        false,
        false,
        NOW () - INTERVAL '7 days',
        NOW () - INTERVAL '7 days'
    ),
    (
        8,
        4,
        6,
        'React Performance Research',
        'Research on React performance optimization. Memoization, lazy loading, code splitting techniques.',
        false,
        false,
        NOW () - INTERVAL '6 days',
        NOW () - INTERVAL '2 days'
    ),
    (
        9,
        5,
        1,
        'Sales Pipeline Review',
        'Q3 sales pipeline analysis. Top prospects, conversion rates, revenue projections.',
        true,
        false,
        NOW () - INTERVAL '5 days',
        NOW () - INTERVAL '1 day'
    ),
    (
        10,
        5,
        4,
        'Product Demo Preparation',
        'Preparing demo for enterprise client. Key features to highlight, common objections, pricing discussion.',
        false,
        false,
        NOW () - INTERVAL '4 days',
        NOW () - INTERVAL '4 days'
    ),
    (
        11,
        6,
        1,
        'Territory Planning',
        'Sales territory assignments for new quarter. Coverage analysis, account distribution.',
        false,
        false,
        NOW () - INTERVAL '3 days',
        NOW () - INTERVAL '3 days'
    ),
    (
        12,
        7,
        8,
        'Onboarding Process Updates',
        'Improvements to employee onboarding. New hire checklist, mentor assignment, first week schedule.',
        true,
        false,
        NOW () - INTERVAL '2 days',
        NOW () - INTERVAL '2 days'
    ),
    (
        13,
        8,
        1,
        'Budget Review Q4',
        'Quarterly budget review and forecast. Department spending, cost optimization opportunities.',
        true,
        false,
        NOW () - INTERVAL '1 day',
        NOW () - INTERVAL '1 day'
    ),
    (
        14,
        1,
        3,
        'Mobile App Roadmap',
        'Feature roadmap for mobile application. User feedback integration, platform parity goals.',
        false,
        false,
        NOW () - INTERVAL '12 days',
        NOW () - INTERVAL '6 days'
    ),
    (
        15,
        2,
        1,
        'Code Review Guidelines',
        'Updated code review process and best practices. Review checklist, response time expectations.',
        false,
        true,
        NOW () - INTERVAL '60 days',
        NOW () - INTERVAL '60 days'
    );

-- Reset sequence
SELECT
    setval (
        'notes_note_id_seq',
        (
            SELECT
                MAX(note_id)
            FROM
                notes
        )
    );

-- Insert Tags
INSERT INTO
    tags (tag_id, tag_name)
VALUES
    (1, 'important'),
    (2, 'urgent'),
    (3, 'follow-up'),
    (4, 'meeting'),
    (5, 'project'),
    (6, 'documentation'),
    (7, 'research'),
    (8, 'planning'),
    (9, 'review'),
    (10, 'action-required');

-- Reset sequence
SELECT
    setval (
        'tags_tag_id_seq',
        (
            SELECT
                MAX(tag_id)
            FROM
                tags
        )
    );

-- Insert Note-Tag relationships
INSERT INTO
    note_tags (note_id, tag_id)
VALUES
    (1, 1),
    (1, 5),
    (1, 8),
    (2, 1),
    (2, 4),
    (2, 10),
    (3, 5),
    (3, 6),
    (4, 1),
    (4, 6),
    (5, 8),
    (5, 7),
    (6, 1),
    (6, 4),
    (6, 3),
    (7, 8),
    (8, 7),
    (8, 6),
    (9, 1),
    (9, 9),
    (10, 5),
    (10, 8),
    (11, 8),
    (12, 1),
    (12, 6),
    (13, 1),
    (13, 9),
    (14, 5),
    (14, 8),
    (15, 6);

-- Insert Roles
INSERT INTO
    roles (role_id, role_name, description)
VALUES
    (
        1,
        'Admin',
        'System administrator with full access'
    ),
    (
        2,
        'Manager',
        'Department manager with team oversight'
    ),
    (
        3,
        'Developer',
        'Software developer with code access'
    ),
    (4, 'User', 'Standard user with basic access'),
    (5, 'Viewer', 'Read-only access to resources');

-- Reset sequence
SELECT
    setval (
        'roles_role_id_seq',
        (
            SELECT
                MAX(role_id)
            FROM
                roles
        )
    );

-- Insert Permissions
INSERT INTO
    permissions (permission_id, permission_name, description)
VALUES
    (1, 'users.read', 'Read user information'),
    (2, 'users.write', 'Create and update users'),
    (3, 'users.delete', 'Delete users'),
    (4, 'notes.read', 'Read notes'),
    (5, 'notes.write', 'Create and update notes'),
    (6, 'notes.delete', 'Delete notes'),
    (7, 'categories.read', 'Read categories'),
    (
        8,
        'categories.write',
        'Create and update categories'
    ),
    (9, 'categories.delete', 'Delete categories'),
    (10, 'departments.read', 'Read departments'),
    (
        11,
        'departments.write',
        'Create and update departments'
    ),
    (12, 'departments.delete', 'Delete departments'),
    (13, 'roles.read', 'Read roles'),
    (14, 'roles.write', 'Create and update roles'),
    (15, 'permissions.read', 'Read permissions');

-- Reset sequence
SELECT
    setval (
        'permissions_permission_id_seq',
        (
            SELECT
                MAX(permission_id)
            FROM
                permissions
        )
    );

-- Insert Role-Permission relationships
-- Admin has all permissions
INSERT INTO
    role_permissions (role_id, permission_id)
SELECT
    1,
    permission_id
FROM
    permissions;

-- Manager has read/write but not delete
INSERT INTO
    role_permissions (role_id, permission_id)
VALUES
    (2, 1),
    (2, 2),
    (2, 4),
    (2, 5),
    (2, 7),
    (2, 8),
    (2, 10),
    (2, 11),
    (2, 13),
    (2, 15);

-- Developer has read/write for notes and categories
INSERT INTO
    role_permissions (role_id, permission_id)
VALUES
    (3, 1),
    (3, 4),
    (3, 5),
    (3, 7),
    (3, 8),
    (3, 10),
    (3, 13),
    (3, 15);

-- User has read/write for own notes
INSERT INTO
    role_permissions (role_id, permission_id)
VALUES
    (4, 1),
    (4, 4),
    (4, 5),
    (4, 7),
    (4, 10),
    (4, 13),
    (4, 15);

-- Viewer has read-only access
INSERT INTO
    role_permissions (role_id, permission_id)
VALUES
    (5, 1),
    (5, 4),
    (5, 7),
    (5, 10),
    (5, 13),
    (5, 15);

-- Insert User-Role relationships
INSERT INTO
    user_roles (user_id, role_id)
VALUES
    (10, 1), -- admin is Admin
    (1, 2), -- john.doe is Manager
    (2, 3), -- jane.smith is Developer
    (3, 2), -- bob.johnson is Manager
    (4, 3), -- alice.williams is Developer
    (5, 4), -- charlie.brown is User
    (6, 4), -- diana.davis is User
    (7, 4), -- eve.miller is User
    (8, 4), -- frank.wilson is User
    (9, 5);