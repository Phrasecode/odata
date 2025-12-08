---
sidebar_position: 1
---

# Contributing

Thank you for your interest in contributing!

## Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/odata.git`
3. Add upstream: `git remote add upstream https://github.com/Phrasecode/odata.git`
4. Install dependencies: `npm install`
5. Run tests: `npm test`

## Branching Strategy

We use a simplified Git Flow:

### Branch Types

- `main` - Production-ready code (protected)
- `develop` - Integration branch (protected)
- `feature/*` - New features (merge to `develop`)
- `bugfix/*` - Bug fixes (merge to `develop`)
- `hotfix/*` - Critical fixes (merge to `main` and `develop`)

### Working on a Feature

```bash
# Start from develop
git checkout develop
git pull upstream develop

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, commit, and push
git add .
git commit -m "feat(scope): your message"
git push origin feature/your-feature-name

# Create PR to develop branch
```

### Working on a Bug Fix

```bash
git checkout develop
git pull upstream develop
git checkout -b bugfix/issue-description

# Fix, commit, push
git commit -m "fix(scope): your fix description"
git push origin bugfix/issue-description

# Create PR to develop branch
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore
Scopes: core, query, filter, metadata, provider, security
```

**Examples:**

```bash
feat(query): add aggregation support
fix(security): prevent SQL injection in $orderby
docs(readme): update installation guide
test(filter): add edge case tests
```

## Pull Request Process

1. **Before creating PR:**
   - Run `npm test` - All tests must pass
   - Run `npm run lint` - No linting errors
   - Run `npm run build` - Build must succeed
   - Update documentation if needed

2. **Create PR:**
   - Base: `develop` (for features/bugfixes)
   - Fill out the PR template
   - Link related issues (e.g., "Closes #123")

3. **PR Requirements:**
   - All automated checks pass
   - Code review approval
   - Test coverage maintained

## Release Process (Maintainers Only)

### Regular Release

```bash
# 1. Create release branch from develop
git checkout develop
git pull upstream develop
git checkout -b release/v1.x.0

# 2. Update version
npm version minor  # or patch/major

# 3. Update CHANGELOG.md

# 4. Push and create PR to main
git push origin release/v1.x.0

# 5. After merge, merge main back to develop
```

### Hotfix Release

```bash
# 1. Create hotfix from main
git checkout main
git pull upstream main
git checkout -b hotfix/critical-fix

# 2. Fix and update version
npm version patch

# 3. Update CHANGELOG.md

# 4. Push and create PR to main
git push origin hotfix/critical-fix

# 5. After merge, merge to develop
```

## Code Style

- Use TypeScript with explicit types
- Follow existing code patterns
- Add JSDoc comments for public APIs
- Write tests for new features

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Need Help?

- 💬 Ask in [Discussions](https://github.com/Phrasecode/odata/discussions)
- 🐛 Report bugs in [Issues](https://github.com/Phrasecode/odata/issues)
- 📧 Email: dev@phrasecode.com

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

Thank you for contributing to @phrasecode/odata! 🎉