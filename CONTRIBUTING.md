# Contributing to CourtSide

Thank you for your interest in contributing to CourtSide! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (browser, OS, etc.)

### Suggesting Features

1. Check if the feature has been suggested
2. Create a new issue describing:
   - The problem it solves
   - Proposed solution
   - Alternative solutions considered
   - Impact on existing functionality

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following our coding standards
4. Test your changes locally
5. Commit with clear messages: `git commit -m "Add feature: description"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request with:
   - Clear description of changes
   - Link to related issues
   - Screenshots for UI changes
   - Test results

### Coding Standards

#### TypeScript
- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible

#### React Components
- Use functional components with hooks
- Keep components small and focused
- Use meaningful component names
- Add JSDoc comments for complex components

#### Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain dark mode support

#### API Routes
- Add proper error handling
- Validate input data
- Use appropriate HTTP status codes
- Add comments for complex logic

#### Database
- Use Mongoose models
- Add proper indexes
- Include validation
- Document schema changes

### Testing

Before submitting PR:
- [ ] Code builds without errors: `npm run build`
- [ ] TypeScript checks pass: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Tested on Chrome, Firefox, Safari
- [ ] Tested on mobile devices
- [ ] No console errors

### Commit Messages

Follow conventional commits:
- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `style: format code`
- `refactor: restructure code`
- `test: add tests`
- `chore: update dependencies`

## Development Setup

1. Clone your fork
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`
4. Set up MongoDB Atlas (free tier)
5. Run dev server: `npm run dev`

## Questions?

Open an issue or discussion on GitHub.

Thank you for contributing to CourtSide! 🎉
