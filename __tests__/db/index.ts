/**
 * SQLite Test Database Helper
 * Creates and manages a SQLite database for testing
 * Schema is loaded from schema.sqlite.sql (SQLite-compatible version of your Neon schema)
 */

import sqlite3 from 'better-sqlite3';
import * as fs from 'fs';
import path from 'path';

let testDb: sqlite3.Database | null = null;

const DB_PATH = path.join(__dirname, 'test.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sqlite.sql');
const SEED_PATH = path.join(__dirname, 'seed.sql'); // optional

/**
 * Helper to run SQL queries
 */
async function runQuery(db: sqlite3.Database, sql: string): Promise<void> {
  await db.exec(sql);
}

/**
 * Load and execute SQL from a file
 */
function loadSqlFile(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`SQL file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Convert basic PostgreSQL syntax to SQLite-compatible syntax.
 * Handles the most common differences from pg_dump output.
 */
function convertPostgresToSQLite(sql: string): string {
  return (
    sql
      // Remove PostgreSQL-specific settings
      .replace(/^SET\s+.+;$/gm, '')
      .replace(/^SELECT pg_catalog\..+;$/gm, '')
      .replace(/^--.*$/gm, '') // remove comments (optional)

      // Data types
      .replace(/\bSERIAL\b/gi, 'INTEGER')
      .replace(/\bBIGSERIAL\b/gi, 'INTEGER')
      .replace(/\bSMALLSERIAL\b/gi, 'INTEGER')
      .replace(/\bBIGINT\b/gi, 'INTEGER')
      .replace(/\bSMALLINT\b/gi, 'INTEGER')
      .replace(/\bDOUBLE PRECISION\b/gi, 'REAL')
      .replace(/\bFLOAT\b/gi, 'REAL')
      .replace(/\bBYTEA\b/gi, 'BLOB')
      .replace(/\bJSONB?\b/gi, 'TEXT')
      .replace(/\bUUID\b/gi, 'TEXT')
      .replace(/\bCITEXT\b/gi, 'TEXT')
      .replace(/\bTIMESTAMPTZ\b/gi, 'TIMESTAMP')
      .replace(/\bTIMESTAMP WITH TIME ZONE\b/gi, 'TIMESTAMP')
      .replace(/\bBOOLEAN\b/gi, 'INTEGER') // SQLite has no native BOOLEAN

      // Default values
      .replace(/DEFAULT TRUE/gi, 'DEFAULT 1')
      .replace(/DEFAULT FALSE/gi, 'DEFAULT 0')
      .replace(/NOW\(\)/gi, "datetime('now')")
      .replace(/CURRENT_TIMESTAMP/gi, "datetime('now')")

      // Remove PostgreSQL-only clauses
      .replace(/\bIF NOT EXISTS\b/gi, '') // SQLite supports this, but keep if needed
      .replace(/\bON UPDATE CURRENT_TIMESTAMP\b/gi, '')

      // Sequences and ownership (not needed in SQLite)
      .replace(/^CREATE SEQUENCE.+;$/gms, '')
      .replace(/^ALTER SEQUENCE.+;$/gms, '')
      .replace(/^ALTER TABLE.+OWNER TO.+;$/gm, '')

      // Remove schema prefix (e.g., public.users → users)
      .replace(/\bpublic\./g, '')

      // Clean up multiple blank lines
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

/**
 * Create a new SQLite database using schema.sqlite.sql
 */
export async function createTestDatabase(): Promise<sqlite3.Database> {
  // Remove existing test database if it exists
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }

  // Create native SQLite database
  testDb = new sqlite3(DB_PATH);

  // Enable foreign keys (disabled by default in SQLite)
  testDb.exec('PRAGMA foreign_keys = ON;');

  // Load and run schema
  const rawSchema = loadSqlFile(SCHEMA_PATH);

  // Auto-detect if schema is PostgreSQL (from pg_dump) or already SQLite-compatible
  const isPostgresSchema =
    rawSchema.includes('SERIAL') ||
    rawSchema.includes('pg_catalog') ||
    rawSchema.includes('SET statement_timeout');

  const schema = isPostgresSchema ? convertPostgresToSQLite(rawSchema) : rawSchema;

  await runQuery(testDb, schema);
  console.log('✅ Schema loaded from', SCHEMA_PATH);

  // Load seed data if seed.sql exists
  if (fs.existsSync(SEED_PATH)) {
    const seed = loadSqlFile(SEED_PATH);
    await runQuery(testDb, seed);
    console.log('✅ Seed data loaded from', SEED_PATH);
  } else {
    console.log('ℹ️  No seed.sql found, skipping seed data');
  }

  return testDb;
}

/**
 * Get the current test database instance
 */
export function getTestDatabase(): sqlite3.Database {
  if (!testDb) {
    throw new Error('Test database not initialized. Call createTestDatabase() first.');
  }
  return testDb;
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

  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }
}
