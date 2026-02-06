# Code Guidelines

## Git Commit Format

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <description>

[optional body]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without feature or bug changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, or tooling changes

### Examples

```
feat: add account description field

fix: handle missing config directory on first run

docs: update README with installation instructions

refactor: extract config loading into separate module
```

## Code Style

- Use TypeScript with strict mode
- Use ES modules (`.js` extension in imports)
- Prefer `async/await` over raw promises
- Use descriptive variable names
