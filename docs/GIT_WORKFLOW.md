# Git Workflow

## Branch Strategy

We use a **feature branch workflow** to enable parallel development without breaking the demo-ready `main` branch.

### Branches

| Branch | Purpose | Owner |
|--------|---------|-------|
| `main` | Production-ready, demo-stable frontend/wireframes | Frontend team |
| `middleware` | M365 integration and backend services | Middleware team |

### Rules

1. **`main` stays stable** - Always deployable for client demos
2. **Work in feature branches** - Create branches for new work
3. **Merge via Pull Request** - Review before merging to `main`

## Daily Workflow

### Starting Work (Middleware Branch)

```bash
# Make sure you're on the middleware branch
git checkout middleware

# Pull latest changes
git pull origin middleware

# If you need frontend updates from main:
git merge main
```

### Committing Changes

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "Add M365 authentication service"

# Push to remote
git push origin middleware
```

### Syncing with Main

When frontend has updates you need:

```bash
git checkout middleware
git merge main
# Resolve any conflicts if needed
git push origin middleware
```

### Merging Middleware to Main

When middleware features are ready for production:

1. Push all changes to `middleware` branch
2. Create a Pull Request on GitHub: `middleware` → `main`
3. Have partner review the PR
4. Merge when approved

## Common Commands

```bash
# See which branch you're on
git branch

# Switch branches
git checkout main
git checkout middleware

# See status of your changes
git status

# See recent commits
git log --oneline -10

# Discard local changes to a file
git checkout -- <filename>
```

## Tips

- **Commit often** - Small, frequent commits are easier to review
- **Write clear commit messages** - Future you will thank present you
- **Pull before you push** - Avoid merge conflicts
- **When in doubt, ask** - Better to clarify than break something
