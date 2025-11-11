# Publishing Guide for @phrasecode/odata

This guide explains how to publish your npm package following best practices.

## Pre-Publishing Checklist

Before publishing, ensure you've completed these steps:

### 1. **Test Your Package Locally**

```bash
# Run all tests
npm run test:all

# Build the package
npm run build

# Optional: Run full quality checks (lint + typecheck + test)
npm run check

# Optional: Run linting (may show warnings/errors)
npm run lint

# Optional: Check TypeScript types
npm run typecheck
```

**Note:** The `prepublishOnly` script runs tests and build automatically before publishing. Linting is optional but recommended to fix before publishing.

### 2. **Verify Package Contents**

Check what files will be included in your package:

```bash
npm pack --dry-run
```

This should only include:

- `dist/` folder (compiled JavaScript and TypeScript definitions)
- `README.md`
- `LICENSE`
- `package.json`

### 3. **Test Package Installation Locally**

Create a test package and install it locally:

```bash
# Create the package tarball
npm pack

# In a different directory, test the installation
mkdir test-install && cd test-install
npm init -y
npm install ../path-to-your-package/phrasecode-odata-0.7.0.tgz

# Test importing the package
node -e "const odata = require('@phrasecode/odata'); console.log(odata);"
```

### 4. **Update Version Number**

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (0.7.0 → 0.7.1): Bug fixes, no breaking changes

  ```bash
  npm version patch
  ```

- **Minor** (0.7.0 → 0.8.0): New features, no breaking changes

  ```bash
  npm version minor
  ```

- **Major** (0.7.0 → 1.0.0): Breaking changes
  ```bash
  npm version major
  ```

## Publishing to npm

### First-Time Setup

1. **Create an npm account** at [npmjs.com](https://www.npmjs.com/signup)

2. **Login to npm** from your terminal:

   ```bash
   npm login
   ```

3. **Verify your login**:
   ```bash
   npm whoami
   ```

### Publishing Process

#### Option 1: Using npm scripts (Recommended)

```bash
# For patch release (0.7.0 → 0.7.1)
npm run release:patch

# For minor release (0.7.0 → 0.8.0)
npm run release:minor

# For major release (0.7.0 → 1.0.0)
npm run release:major
```

These scripts will:

1. Run all tests
2. Build the package
3. Bump the version
4. Publish to npm

**Note:** Linting is not run automatically. Run `npm run lint:fix` to auto-fix linting issues before publishing if desired.

#### Option 2: Manual Publishing

```bash
# 1. Update version
npm version patch  # or minor/major

# 2. Run pre-publish checks
npm run prepublishOnly

# 3. Publish to npm
npm publish --access public
```

**Note**: Use `--access public` for scoped packages (@phrasecode/odata) to make them publicly available.

### Publishing Beta/Alpha Versions

For pre-release versions:

```bash
# Update to beta version
npm version 0.8.0-beta.0

# Publish with beta tag
npm publish --tag beta --access public

# Users can install with:
# npm install @phrasecode/odata@beta
```

## Post-Publishing

### 1. **Verify Publication**

Check your package on npm:

```bash
npm view @phrasecode/odata
```

Or visit: https://www.npmjs.com/package/@phrasecode/odata

### 2. **Create Git Tag**

```bash
git push origin main
git push --tags
```

### 3. **Create GitHub Release**

1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Select the version tag
4. Add release notes describing changes
5. Publish the release

## Troubleshooting

### Package Name Already Exists

If the package name is taken, you'll need to:

1. Choose a different name
2. Use a scoped package (e.g., `@yourorg/odata`)

### Authentication Errors

```bash
npm logout
npm login
```

### Two-Factor Authentication

If you have 2FA enabled:

```bash
npm publish --otp=123456
```

Replace `123456` with your current OTP code.

## Best Practices

1. ✅ Always test before publishing
2. ✅ Use semantic versioning
3. ✅ Keep a CHANGELOG.md
4. ✅ Tag releases in Git
5. ✅ Never publish with uncommitted changes
6. ✅ Review package contents with `npm pack --dry-run`
7. ✅ Use `.npmignore` to exclude development files
