# Contributing to Book Framework Analyzer

Thank you for your interest in contributing to the Book Framework Analyzer project! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code:
- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Respect different viewpoints and experiences

## Getting Started

### Prerequisites

- Node.js 18.x or later
- Yarn package manager
- Docker and Docker Compose (optional, for local database)

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/book_framework_analyzer.git
   cd book_framework_analyzer
   ```
3. Install dependencies:
   ```bash
   yarn install
   ```
4. Copy the environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
5. Set up the database:
   ```bash
   # Using Docker
   docker-compose up -d db
   
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   ```
6. Start the development server:
   ```bash
   yarn dev
   ```

## Development Workflow

1. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. Make your changes and ensure they follow our coding standards

3. Run tests and linting:
   ```bash
   yarn lint
   yarn tsc --noEmit
   ```

4. Build the application to verify everything works:
   ```bash
   yarn build
   ```

## Submitting Changes

### Before Submitting

- Ensure your code passes all linting checks: `yarn lint`
- Ensure TypeScript compiles without errors: `yarn tsc --noEmit`
- Update documentation if needed
- Add tests for new functionality
- Ensure all tests pass

### Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Build process or auxiliary tool changes

Example:
```
feat: add user authentication

- Implement JWT-based auth
- Add login and logout pages
- Update middleware for route protection
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode in `tsconfig.json`
- Define explicit types for function parameters and return values
- Avoid using `any` type

### React/Next.js

- Use functional components with hooks
- Follow the React naming conventions
- Use Next.js App Router patterns
- Implement proper error boundaries

### Styling

- Use Tailwind CSS for styling
- Follow the existing design system
- Use the `cn()` utility for conditional classes
- Ensure responsive design

### File Organization

```
app/              # Next.js app router pages
components/       # Reusable React components
  ui/            # Base UI components
  forms/         # Form-specific components
lib/             # Utility functions and helpers
hooks/           # Custom React hooks
types/           # TypeScript type definitions
prisma/          # Database schema and migrations
public/          # Static assets
scripts/         # Build and utility scripts
```

## Pull Request Process

1. **Create a PR** from your feature branch to `develop`
2. **Fill out the PR template** completely
3. **Link related issues** using keywords (Fixes #123, Closes #456)
4. **Request review** from at least one maintainer
5. **Address feedback** promptly and professionally
6. **Ensure CI checks pass** before merging
7. **Squash commits** if requested

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review completed
- [ ] Code is commented, particularly in hard-to-understand areas
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added for new functionality
- [ ] All tests pass locally

## Reporting Issues

When reporting bugs, please include:

- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to reproduce the bug
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Environment**: OS, browser, Node.js version
- **Screenshots**: If applicable

## Questions?

If you have questions or need help:

- Check existing [issues](https://github.com/your-org/book_framework_analyzer/issues)
- Open a new issue with the `question` label
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Book Framework Analyzer! 📚