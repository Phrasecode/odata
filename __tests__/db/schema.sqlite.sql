-- ============================================================
-- schema.sqlite.sql
-- SQLite-compatible schema (mirrors your Neon PostgreSQL schema)
-- Used by the test database helper
-- ============================================================

PRAGMA foreign_keys = ON;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS note_tags;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;

-- Departments
CREATE TABLE departments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  department_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMP DEFAULT (datetime('now'))
);

-- Users
CREATE TABLE users (
  user_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     VARCHAR(100),
  department_id INTEGER,
  is_active     INTEGER DEFAULT 1,  -- SQLite has no BOOLEAN; 1=true, 0=false
  created_at    TIMESTAMP DEFAULT (datetime('now')),
  updated_at    TIMESTAMP DEFAULT (datetime('now')),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Categories
CREATE TABLE categories (
  category_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  description   TEXT,
  created_by    INTEGER,
  created_at    TIMESTAMP DEFAULT (datetime('now')),
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Notes
CREATE TABLE notes (
  note_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL,
  category_id INTEGER,
  title       VARCHAR(200) NOT NULL,
  content     TEXT NOT NULL,
  is_pinned   INTEGER DEFAULT 0,
  is_archived INTEGER DEFAULT 0,
  created_at  TIMESTAMP DEFAULT (datetime('now')),
  updated_at  TIMESTAMP DEFAULT (datetime('now')),
  FOREIGN KEY (user_id)     REFERENCES users(user_id)           ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)  ON DELETE SET NULL
);

-- Tags
CREATE TABLE tags (
  tag_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_name VARCHAR(50) NOT NULL UNIQUE
);

-- Roles
CREATE TABLE roles (
  role_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  role_name   VARCHAR(50) NOT NULL UNIQUE,
  description TEXT
);

-- Permissions
CREATE TABLE permissions (
  permission_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  permission_name VARCHAR(100) NOT NULL UNIQUE,
  description     TEXT
);

-- Junction: note_tags
CREATE TABLE note_tags (
  note_id INTEGER NOT NULL,
  tag_id  INTEGER NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES notes(note_id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(tag_id)   ON DELETE CASCADE
);

-- Junction: user_roles
CREATE TABLE user_roles (
  user_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- Junction: role_permissions
CREATE TABLE role_permissions (
  role_id       INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id)       REFERENCES roles(role_id)           ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_users_department_id  ON users(department_id);
CREATE INDEX idx_notes_user_id        ON notes(user_id);
CREATE INDEX idx_notes_category_id    ON notes(category_id);
CREATE INDEX idx_note_tags_note_id    ON note_tags(note_id);
CREATE INDEX idx_user_roles_user_id   ON user_roles(user_id);
