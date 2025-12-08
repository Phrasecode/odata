---
sidebar_position: 2
---

# Installation Guide

Complete guide to installing and setting up the Node OData Framework in your project.

## Table of Contents

- [System Requirements](#system-requirements)
- [Package Installation](#package-installation)
- [Database Driver Installation](#database-driver-installation)
- [TypeScript Configuration](#typescript-configuration)
- [Framework-Specific Setup](#framework-specific-setup)

## System Requirements

### Node.js Version

- **Minimum**: Node.js 16.0.0 or higher
- **Recommended**: Node.js 18.x or 20.x (LTS versions)
- **TypeScript**: 4.5.0 or higher (5.x recommended)

### Supported Databases

The framework supports the following databases through Sequelize:

- ✅ PostgreSQL 9.5+
- ✅ MySQL 5.7+
- ✅ MariaDB 10.3+
- ✅ SQLite 3.x
- ✅ Microsoft SQL Server 2012+
- ✅ Oracle Database 12c+

## Package Installation

### Using npm

```bash
npm install @phrasecode/odata
```

### Using yarn

```bash
yarn add @phrasecode/odata
```

### Using pnpm

```bash
pnpm add @phrasecode/odata
```

## Database Driver Installation

You must install a database driver for your chosen database. The framework uses Sequelize under the hood, so you'll need the appropriate Sequelize-compatible driver.

### PostgreSQL

**Recommended for production applications**

```bash
npm install pg pg-hstore
```

**Why pg-hstore?** It's required for proper handling of PostgreSQL's HSTORE data type.

**Versions:**

- `pg`: 8.0.0 or higher
- `pg-hstore`: 2.3.0 or higher

### MySQL

```bash
npm install mysql2
```

**Note:** Use `mysql2` instead of the older `mysql` package for better performance and features.

**Versions:**

- `mysql2`: 2.0.0 or higher (3.x also supported)

### MariaDB

```bash
npm install mariadb
```

**Versions:**

- `mariadb`: 3.0.0 or higher

### SQLite

**Great for development and testing**

```bash
npm install sqlite3
```

**Versions:**

- `sqlite3`: 5.0.0 or higher

**Alternative (Better performance):**

```bash
npm install better-sqlite3
```

### Microsoft SQL Server

```bash
npm install tedious
```

**Versions:**

- `tedious`: 6.0.0 or higher

### Oracle Database

```bash
npm install oracledb
```

**Versions:**

- `oracledb`: 5.0.0 or higher

**Note:** Oracle driver requires additional system-level dependencies. See [Oracle's installation guide](https://oracle.github.io/node-oracledb/INSTALL.html).

## TypeScript Configuration

### Enable Decorators

The framework uses TypeScript decorators extensively. You must enable them in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Key Configuration Options

| Option                   | Required    | Description                                      |
| ------------------------ | ----------- | ------------------------------------------------ |
| `experimentalDecorators` | ✅ Yes      | Enables decorator syntax (@Table, @Column, etc.) |
| `emitDecoratorMetadata`  | ✅ Yes      | Emits metadata for decorators                    |
| `target`                 | Recommended | ES2020 or higher for modern JavaScript features  |
| `moduleResolution`       | Recommended | "node" for proper module resolution              |
| `esModuleInterop`        | Recommended | Better compatibility with CommonJS modules       |

## Framework-Specific Setup

### Express.js

Install Express.js and its TypeScript types:

```bash
npm install express
npm install --save-dev @types/express
```

**Minimal package.json dependencies:**

```json
{
  "dependencies": {
    "@phrasecode/odata": "^0.2.1",
    "express": "^4.18.0",
    "pg": "^8.16.0",
    "pg-hstore": "^2.3.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.1.0"
  }
}
```

**See also:** [Express.js Getting Started Guide](./04-getting-started/express-getting-started.md)

### Next.js

```bash
# Create Next.js app with TypeScript
npx create-next-app@latest my-odata-app --typescript

# Navigate to project
cd my-odata-app

# Install OData framework and database driver
npm install @phrasecode/odata pg pg-hstore
```

**Update next.config.js** to enable decorators:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sequelize'],
  },
  webpack: config => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'pg-native': false,
    };
    return config;
  },
};

module.exports = nextConfig;
```

**See also:** [Next.js Getting Started Guide](./04-getting-started/nextjs-getting-started.md)

### Serverless (AWS Lambda, Vercel, Netlify)

For serverless deployments:

```bash
npm install @phrasecode/odata pg pg-hstore
```

**AWS Lambda specific:**

```bash
npm install --save-dev @types/aws-lambda serverless serverless-plugin-typescript
```

**Vercel specific:**

```bash
npm install --save-dev @vercel/node vercel
```

**Netlify specific:**

```bash
npm install --save-dev @netlify/functions netlify-cli
```

**See also:** [Serverless Getting Started Guide](./04-getting-started/serverless-getting-started.md)

### Webpack/Bundler Configuration

If you're using Webpack or other bundlers, you may need to exclude database drivers from bundling:

**webpack.config.js:**

```javascript
module.exports = {
  // ... other config
  externals: {
    pg: 'commonjs pg',
    'pg-hstore': 'commonjs pg-hstore',
    mysql2: 'commonjs mysql2',
    sqlite3: 'commonjs sqlite3',
    tedious: 'commonjs tedious',
    mariadb: 'commonjs mariadb',
    oracledb: 'commonjs oracledb',
  },
};
```

## Installation Checklist

Use this checklist to ensure proper installation:

- [ ] Node.js 14+ installed
- [ ] TypeScript installed (`npm install --save-dev typescript`)
- [ ] `@phrasecode/odata` package installed
- [ ] Database driver installed (pg, mysql2, etc.)
- [ ] `tsconfig.json` has `experimentalDecorators: true`
- [ ] `tsconfig.json` has `emitDecoratorMetadata: true`
- [ ] Environment variables configured (if using)
- [ ] Database connection works

## Version Compatibility

| Package Version | Node.js | TypeScript | Sequelize |
| --------------- | ------- | ---------- | --------- |
| 0.2.x           | 14+     | 4.5+       | 6.x       |
| 0.1.x           | 14+     | 4.5+       | 6.x       |
