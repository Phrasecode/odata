# OData Library - Utilimarc Fork

## Branching Strategy

This is a fork of [Phrasecode/odata](https://github.com/Phrasecode/odata).

- **`main`** — kept in sync with upstream (`Phrasecode/odata` main). Never commit directly to main. Pull from upstream only.
- **`master`** — our primary working branch. All Utilimarc changes go here. This is the default branch on GitHub.
- **Fix branches** — created from `master` for individual fixes. PRs go to both:
  - `Utilimarc/odata master` (our internal merge)
  - `Phrasecode/odata main` (upstream contribution via fork PR)

## Git Remotes

- `origin` — `git@github.com:Utilimarc/odata.git` (our fork)
- `upstream` — `git@github.com:Phrasecode/odata.git` (original repo)

### Syncing main with upstream
```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

### Creating a fix branch
```bash
git checkout master
git checkout -b fix/<issue-number>-<short-description>
# ... make changes ...
git push -u origin fix/<issue-number>-<short-description>
# Create PR to Utilimarc/odata master
# Optionally create PR to Phrasecode/odata main for upstream contribution
```

## Project Context

This library provides an OData v4 server layer on top of Sequelize. We are hardening it for use against our own databases. See GitHub issues for the security review findings.

## Development Rules

- Do NOT run `npm install`, `npm test`, or any npm/node commands locally
- All builds and tests run in containers (CI or local Docker)
- Do not modify `main` branch — it tracks upstream
- All work happens on `master` or branches off `master`

## Key Files

- `src/adaptors/sequelizer.ts` — SQL generation layer (primary security concern)
- `src/serializers/query/parseFilter.ts` — OData filter parser
- `src/serializers/decodeUrl.ts` — URL decoding (has double-decode bug)
- `src/routers/expressRouter.ts` — Express integration
- `src/routers/openRouter.ts` — Serverless/generic integration
- `src/controller/baseController.ts` — Base controller with rawQueryable()

## Security Issues Tracked

See https://github.com/Utilimarc/odata/issues for full list. Key areas:
- SQL injection via `literal()` in sequelizer.ts (issues #1-3)
- Double URL decoding (#4)
- Information disclosure in error responses (#5)
- Resource exhaustion / no depth limits (#6)
