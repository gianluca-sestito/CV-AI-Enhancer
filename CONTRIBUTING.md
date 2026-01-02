# Contributing to CV AI Enhancer

Thank you for your interest in contributing to CV AI Enhancer! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/cv-ai-enancher.git
   cd cv-ai-enancher
   ```
3. **Set up your development environment**:
   - Follow the installation instructions in [README.md](./README.md)
   - Make sure all tests pass (if applicable)
   - Create a new branch for your changes: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

- Node.js 20.9+ or Bun
- Supabase account (free tier works)
- Trigger.dev account (free tier works)
- OpenAI API key

### Installation

1. Install dependencies:
   ```bash
   bun install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. Set up the database:
   ```bash
   bun run db:push
   # Apply Supabase migrations (see README.md for details)
   ```

4. Start development servers:
   ```bash
   # Terminal 1: Next.js dev server
   bun run dev

   # Terminal 2: Trigger.dev dev server
   bun run trigger:dev
   ```

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use strict TypeScript settings (already configured)
- Prefer explicit types over `any`

### React/Next.js

- Use functional components with hooks
- Prefer Server Components when possible
- Use Client Components (`"use client"`) only when necessary
- Follow Next.js 16 App Router conventions

### Code Formatting

- The project uses ESLint (Next.js config)
- Run `bun run lint` before committing
- Use meaningful variable and function names
- Add comments for complex logic

### File Organization

- Follow the existing project structure
- Place components in appropriate directories
- Keep related files together
- Use descriptive file names

## Pull Request Process

1. **Update your fork** with the latest changes from the main repository:
   ```bash
   git remote add upstream https://github.com/original-owner/cv-ai-enancher.git
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**:
   - Write clean, maintainable code
   - Add comments where necessary
   - Update documentation if needed
   - Test your changes thoroughly

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```
   - Use clear, descriptive commit messages
   - Reference issue numbers if applicable (e.g., "Fix #123: ...")

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**:
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template (if available)
   - Describe your changes clearly
   - Link any related issues

### Pull Request Guidelines

- **Keep PRs focused**: One feature or bug fix per PR
- **Write clear descriptions**: Explain what and why, not just how
- **Update documentation**: If you add features, update README.md or relevant docs
- **Test your changes**: Make sure everything works before submitting
- **Be responsive**: Address review comments promptly

## Issue Reporting

### Before Creating an Issue

1. Check if the issue already exists
2. Search closed issues - it might have been fixed
3. Make sure you're using the latest version

### Creating a Good Issue

When creating an issue, please include:

- **Clear title**: Brief description of the issue
- **Description**: Detailed explanation of the problem
- **Steps to reproduce**: How to trigger the issue
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: OS, Node.js version, browser (if applicable)
- **Screenshots**: If applicable, add screenshots or error messages

### Issue Labels

- `bug`: Something isn't working
- `feature`: New feature or enhancement request
- `documentation`: Documentation improvements
- `question`: Questions or discussions
- `help wanted`: Extra attention is needed

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or changes

### Commit Messages

Follow conventional commit format when possible:

- `feat: Add new CV theme`
- `fix: Resolve PDF generation issue`
- `docs: Update installation instructions`
- `refactor: Simplify profile validation`
- `test: Add tests for CV import`

## Testing

- Test your changes locally before submitting
- Test edge cases and error scenarios
- Ensure existing functionality still works
- Test in different browsers (if applicable)

## Code Review

All submissions require review. We use GitHub pull requests for this purpose.

### Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged

### Review Criteria

- Code quality and style
- Functionality and correctness
- Documentation updates
- Test coverage (if applicable)
- Performance considerations

## Questions?

If you have questions about contributing:

- Open a discussion in GitHub Discussions
- Check existing issues and PRs
- Review the codebase for examples

## Code of Conduct

Please note that this project follows a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to CV AI Enhancer! 🎉

