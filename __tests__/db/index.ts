/**
 * SQLite Test Database Helper
 * Creates and manages a SQLite database for testing
 *
 * This module provides two levels of database access:
 * 1. Raw SQLite database (no src/ dependencies) - for pure database testing
 * 2. DataSource wrapper (requires src/) - for OData functionality testing
 */

import sqlite3 from 'better-sqlite3';
import * as fs from 'fs';
import path from 'path';

let testDb: sqlite3.Database | null = null;

const DB_PATH = path.join(__dirname, 'test.db');
// Use different database files for unit tests vs E2E tests to avoid conflicts

/**
 * Helper to run SQL queries with promises
 */
async function runQuery(db: sqlite3.Database, sql: string): Promise<void> {
  await db.exec(sql);
}

/**
 * Create a new SQLite database with schema and seed data
 */
export async function createTestDatabase(): Promise<sqlite3.Database> {
  // Remove existing test database if it exists
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }

  // Create native SQLite database
  testDb = new sqlite3(DB_PATH);

  // Create tables and seed data using native SQLite
  await createSchema(testDb);
  await seedData(testDb);

  return testDb;
}

/**
 * Create database schema using native SQLite3
 */
async function createSchema(db: sqlite3.Database): Promise<void> {
  // Drop all tables if they exist (for clean slate)
  await runQuery(db, 'DROP TABLE IF EXISTS role_permissions');
  await runQuery(db, 'DROP TABLE IF EXISTS user_roles');
  await runQuery(db, 'DROP TABLE IF EXISTS note_tags');
  await runQuery(db, 'DROP TABLE IF EXISTS notes');
  await runQuery(db, 'DROP TABLE IF EXISTS categories');
  await runQuery(db, 'DROP TABLE IF EXISTS tags');
  await runQuery(db, 'DROP TABLE IF EXISTS permissions');
  await runQuery(db, 'DROP TABLE IF EXISTS roles');
  await runQuery(db, 'DROP TABLE IF EXISTS users');
  await runQuery(db, 'DROP TABLE IF EXISTS departments');

  // Create departments table
  await runQuery(
    db,
    `
    CREATE TABLE departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      department_name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
  );

  // Create users table
  await runQuery(
    db,
    `
    CREATE TABLE users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name VARCHAR(100),
      department_id INTEGER,
      is_active BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
    )
  `,
  );

  // Create categories table
  await runQuery(
    db,
    `
    CREATE TABLE categories (
      category_id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
    )
  `,
  );

  // Create notes table
  await runQuery(
    db,
    `
    CREATE TABLE notes (
      note_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      is_pinned BOOLEAN DEFAULT 0,
      is_archived BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
    )
  `,
  );

  // Create tags table
  await runQuery(
    db,
    `
    CREATE TABLE tags (
      tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
      tag_name VARCHAR(50) NOT NULL UNIQUE
    )
  `,
  );

  // Create roles table
  await runQuery(
    db,
    `
    CREATE TABLE roles (
      role_id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_name VARCHAR(50) NOT NULL UNIQUE,
      description TEXT
    )
  `,
  );

  // Create permissions table
  await runQuery(
    db,
    `
    CREATE TABLE permissions (
      permission_id INTEGER PRIMARY KEY AUTOINCREMENT,
      permission_name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT
    )
  `,
  );

  // Create junction table: note_tags
  await runQuery(
    db,
    `
    CREATE TABLE note_tags (
      note_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (note_id, tag_id),
      FOREIGN KEY (note_id) REFERENCES notes(note_id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
    )
  `,
  );

  // Create junction table: user_roles
  await runQuery(
    db,
    `
    CREATE TABLE user_roles (
      user_id INTEGER NOT NULL,
      role_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, role_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
    )
  `,
  );

  // Create junction table: role_permissions
  await runQuery(
    db,
    `
    CREATE TABLE role_permissions (
      role_id INTEGER NOT NULL,
      permission_id INTEGER NOT NULL,
      PRIMARY KEY (role_id, permission_id),
      FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
    )
  `,
  );

  // Create indexes for better query performance
  await runQuery(db, 'CREATE INDEX idx_users_department_id ON users(department_id)');
  await runQuery(db, 'CREATE INDEX idx_notes_user_id ON notes(user_id)');
  await runQuery(db, 'CREATE INDEX idx_notes_category_id ON notes(category_id)');
  await runQuery(db, 'CREATE INDEX idx_note_tags_note_id ON note_tags(note_id)');
  await runQuery(db, 'CREATE INDEX idx_user_roles_user_id ON user_roles(user_id)');
}

/**
 * Seed test data into the database using native SQLite3
 */
async function seedData(db: sqlite3.Database): Promise<void> {
  // Insert Departments
  await runQuery(
    db,
    `
    INSERT INTO departments (id, department_name, description, created_at) VALUES
    (1, 'Engineering', 'Software Development and Engineering', datetime('now', '-6 months')),
    (2, 'Marketing', 'Marketing and Communications', datetime('now', '-5 months')),
    (3, 'Sales', 'Sales and Business Development', datetime('now', '-4 months')),
    (4, 'Human Resources', 'HR and People Operations', datetime('now', '-3 months')),
    (5, 'Finance', 'Finance and Accounting', datetime('now', '-2 months'))
  `,
  );

  // Insert Users
  await runQuery(
    db,
    `
    INSERT INTO users (user_id, username, email, password_hash, full_name, department_id, is_active, created_at, updated_at) VALUES
    (1, 'john.doe', 'john.doe@company.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'John Doe', 1, 1, datetime('now', '-180 days'), datetime('now', '-1 day')),
    (2, 'jane.smith', 'jane.smith@company.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'Jane Smith', 1, 1, datetime('now', '-150 days'), datetime('now', '-2 days')),
    (3, 'bob.johnson', 'bob.johnson@company.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'Bob Johnson', 2, 1, datetime('now', '-120 days'), datetime('now', '-3 days')),
    (4, 'alice.williams', 'alice.williams@company.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'Alice Williams', 2, 1, datetime('now', '-100 days'), datetime('now', '-4 days')),
    (5, 'charlie.brown', 'charlie.brown@company.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'Charlie Brown', 3, 1, datetime('now', '-90 days'), datetime('now', '-5 days')),
    (6, 'diana.davis', 'diana.davis@company.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'Diana Davis', 3, 1, datetime('now', '-80 days'), datetime('now', '-6 days')),
    (7, 'eve.miller', 'eve.miller@company.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'Eve Miller', 4, 1, datetime('now', '-70 days'), datetime('now', '-7 days')),
    (8, 'frank.wilson', 'frank.wilson@company.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'Frank Wilson', 5, 1, datetime('now', '-60 days'), datetime('now', '-8 days')),
    (9, 'grace.moore', 'grace.moore@company.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'Grace Moore', 1, 0, datetime('now', '-50 days'), datetime('now', '-30 days')),
    (10, 'admin', 'admin@company.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'System Administrator', 1, 1, datetime('now', '-365 days'), datetime('now'))
  `,
  );

  // Insert Categories
  await runQuery(
    db,
    `
    INSERT INTO categories (category_id, category_name, description, created_by, created_at) VALUES
    (1, 'Work', 'Work-related notes and tasks', 1, datetime('now', '-150 days')),
    (2, 'Personal', 'Personal notes and reminders', 1, datetime('now', '-140 days')),
    (3, 'Projects', 'Project documentation and planning', 2, datetime('now', '-130 days')),
    (4, 'Meetings', 'Meeting notes and action items', 2, datetime('now', '-120 days')),
    (5, 'Ideas', 'Ideas and brainstorming', 3, datetime('now', '-110 days')),
    (6, 'Research', 'Research notes and findings', 3, datetime('now', '-100 days')),
    (7, 'Documentation', 'Technical documentation', 1, datetime('now', '-90 days')),
    (8, 'Training', 'Training materials and notes', 4, datetime('now', '-80 days'))
  `,
  );

  // Insert Notes
  await runQuery(
    db,
    `
    INSERT INTO notes (note_id, user_id, category_id, title, content, is_pinned, is_archived, created_at, updated_at) VALUES
    (1, 1, 1, 'Sprint Planning Q4', 'Planning for Q4 sprint. Focus on new features and bug fixes. Team capacity: 5 developers.', 1, 0, datetime('now', '-30 days'), datetime('now', '-1 day')),
    (2, 1, 4, 'Team Meeting Notes', 'Discussed project timeline and resource allocation. Action items: Review architecture, Update documentation.', 1, 0, datetime('now', '-25 days'), datetime('now', '-2 days')),
    (3, 2, 3, 'API Design Document', 'RESTful API design for the new microservice. Endpoints, authentication, rate limiting considerations.', 0, 0, datetime('now', '-20 days'), datetime('now', '-3 days')),
    (4, 2, 7, 'Database Schema Updates', 'Proposed changes to the user table. Add new fields for profile completion tracking.', 1, 0, datetime('now', '-15 days'), datetime('now', '-4 days')),
    (5, 3, 5, 'Marketing Campaign Ideas', 'Brainstorming session results. Social media strategy, content calendar, influencer partnerships.', 0, 0, datetime('now', '-10 days'), datetime('now', '-5 days')),
    (6, 3, 4, 'Client Meeting - Acme Corp', 'Requirements gathering session. Client needs custom reporting dashboard. Timeline: 6 weeks.', 1, 0, datetime('now', '-8 days'), datetime('now', '-1 day')),
    (7, 4, 2, 'Personal Goals 2024', 'Career development goals. Learn new technologies, contribute to open source, attend conferences.', 0, 0, datetime('now', '-7 days'), datetime('now', '-7 days')),
    (8, 4, 6, 'React Performance Research', 'Research on React performance optimization. Memoization, lazy loading, code splitting techniques.', 0, 0, datetime('now', '-6 days'), datetime('now', '-2 days')),
    (9, 5, 1, 'Sales Pipeline Review', 'Q3 sales pipeline analysis. Top prospects, conversion rates, revenue projections.', 1, 0, datetime('now', '-5 days'), datetime('now', '-1 day')),
    (10, 5, 4, 'Product Demo Preparation', 'Preparing demo for enterprise client. Key features to highlight, common objections, pricing discussion.', 0, 0, datetime('now', '-4 days'), datetime('now', '-4 days')),
    (11, 6, 1, 'Territory Planning', 'Sales territory assignments for new quarter. Coverage analysis, account distribution.', 0, 0, datetime('now', '-3 days'), datetime('now', '-3 days')),
    (12, 7, 8, 'Onboarding Process Updates', 'Improvements to employee onboarding. New hire checklist, mentor assignment, first week schedule.', 1, 0, datetime('now', '-2 days'), datetime('now', '-2 days')),
    (13, 8, 1, 'Budget Review Q4', 'Quarterly budget review and forecast. Department spending, cost optimization opportunities.', 1, 0, datetime('now', '-1 day'), datetime('now', '-1 day')),
    (14, 1, 3, 'Mobile App Roadmap', 'Feature roadmap for mobile application. User feedback integration, platform parity goals.', 0, 0, datetime('now', '-12 days'), datetime('now', '-6 days')),
    (15, 2, 1, 'Code Review Guidelines', 'Updated code review process and best practices. Review checklist, response time expectations.', 0, 1, datetime('now', '-60 days'), datetime('now', '-60 days'))
  `,
  );

  // Insert Tags
  await runQuery(
    db,
    `
    INSERT INTO tags (tag_id, tag_name) VALUES
    (1, 'important'),
    (2, 'urgent'),
    (3, 'follow-up'),
    (4, 'meeting'),
    (5, 'project'),
    (6, 'documentation'),
    (7, 'research'),
    (8, 'planning'),
    (9, 'review'),
    (10, 'action-required')
  `,
  );

  // Insert Note-Tag relationships
  await runQuery(
    db,
    `
    INSERT INTO note_tags (note_id, tag_id) VALUES
    (1, 1), (1, 5), (1, 8),
    (2, 1), (2, 4), (2, 10),
    (3, 5), (3, 6),
    (4, 1), (4, 6),
    (5, 8), (5, 7),
    (6, 1), (6, 4), (6, 3),
    (7, 8),
    (8, 7), (8, 6),
    (9, 1), (9, 9),
    (10, 5), (10, 8),
    (11, 8),
    (12, 1), (12, 6),
    (13, 1), (13, 9),
    (14, 5), (14, 8),
    (15, 6)
  `,
  );

  // Insert Roles
  await runQuery(
    db,
    `
    INSERT INTO roles (role_id, role_name, description) VALUES
    (1, 'Admin', 'System administrator with full access'),
    (2, 'Manager', 'Department manager with team oversight'),
    (3, 'Developer', 'Software developer with code access'),
    (4, 'User', 'Standard user with basic access'),
    (5, 'Viewer', 'Read-only access to resources')
  `,
  );

  // Insert Permissions
  await runQuery(
    db,
    `
    INSERT INTO permissions (permission_id, permission_name, description) VALUES
    (1, 'users.read', 'Read user information'),
    (2, 'users.write', 'Create and update users'),
    (3, 'users.delete', 'Delete users'),
    (4, 'notes.read', 'Read notes'),
    (5, 'notes.write', 'Create and update notes'),
    (6, 'notes.delete', 'Delete notes'),
    (7, 'categories.read', 'Read categories'),
    (8, 'categories.write', 'Create and update categories'),
    (9, 'categories.delete', 'Delete categories'),
    (10, 'departments.read', 'Read departments'),
    (11, 'departments.write', 'Create and update departments'),
    (12, 'departments.delete', 'Delete departments'),
    (13, 'roles.read', 'Read roles'),
    (14, 'roles.write', 'Create and update roles'),
    (15, 'permissions.read', 'Read permissions')
  `,
  );

  // Insert Role-Permission relationships
  // Admin has all permissions (1-15)
  await runQuery(
    db,
    `
    INSERT INTO role_permissions (role_id, permission_id) VALUES
    (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12), (1, 13), (1, 14), (1, 15)
  `,
  );

  // Manager has read/write but not delete
  await runQuery(
    db,
    `
    INSERT INTO role_permissions (role_id, permission_id) VALUES
    (2, 1), (2, 2), (2, 4), (2, 5), (2, 7), (2, 8), (2, 10), (2, 11), (2, 13), (2, 15)
  `,
  );

  // Developer has read/write for notes and categories
  await runQuery(
    db,
    `
    INSERT INTO role_permissions (role_id, permission_id) VALUES
    (3, 1), (3, 4), (3, 5), (3, 7), (3, 8), (3, 10), (3, 13), (3, 15)
  `,
  );

  // User has read/write for own notes
  await runQuery(
    db,
    `
    INSERT INTO role_permissions (role_id, permission_id) VALUES
    (4, 1), (4, 4), (4, 5), (4, 7), (4, 10), (4, 13), (4, 15)
  `,
  );

  // Viewer has read-only access
  await runQuery(
    db,
    `
    INSERT INTO role_permissions (role_id, permission_id) VALUES
    (5, 1), (5, 4), (5, 7), (5, 10), (5, 13), (5, 15)
  `,
  );

  // Insert User-Role relationships
  await runQuery(
    db,
    `
    INSERT INTO user_roles (user_id, role_id) VALUES
    (10, 1),
    (1, 2),
    (2, 3),
    (3, 2),
    (4, 3),
    (5, 4),
    (6, 4),
    (7, 4),
    (8, 4),
    (9, 5)
  `,
  );
}

/**
 * Close the test database connection and clean up
 */
export async function closeTestDatabase(): Promise<void> {
  console.log('🛑 Stopping test database...');
  if (testDb) {
    testDb.close();
    testDb = null;
  }

  // Remove test database file
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }
}
