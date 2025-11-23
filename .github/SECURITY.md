# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **hello@phrasecode.com**

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information (as much as you can provide) to help us better understand the issue:

- Type of issue (e.g. SQL injection, XSS, authentication bypass, etc.)
- Full paths of source file(s) related to the issue
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

We prefer all communications to be in English.

## Security Best Practices for Users

When using @phrasecode/odata in your projects:

1. **Keep Dependencies Updated**

```bash
   npm audit
   npm update @phrasecode/odata
```

2. **Use Environment Variables**

```typescript
// ✅ Good
const dataSource = new DataSource({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// ❌ Bad
const dataSource = new DataSource({
  password: 'hardcoded_password',
});
```

3. **Enable SSL for Database Connections**

```typescript
const dataSource = new DataSource({
  // ...
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
    },
  },
});
```

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine the affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported versions
4. Release new versions as soon as possible

## Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request.
