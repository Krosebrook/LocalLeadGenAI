# Contributing to LocalLeadGenAI

Thank you for your interest in contributing to LocalLeadGenAI! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Development Workflow](#development-workflow)
5. [Coding Standards](#coding-standards)
6. [Commit Guidelines](#commit-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Testing Guidelines](#testing-guidelines)
9. [Documentation](#documentation)
10. [Community](#community)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Body size
- Race
- Ethnicity
- Age
- Religion
- Nationality

### Expected Behavior

- Be respectful and considerate
- Use welcoming and inclusive language
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment, trolling, or discriminatory language
- Personal or political attacks
- Public or private harassment
- Publishing others' private information
- Any conduct that could be considered inappropriate in a professional setting

### Enforcement

Violations of the Code of Conduct may be reported to the project maintainers. All complaints will be reviewed and investigated promptly and fairly.

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:
- **Node.js** >= 18.0.0 installed
- **Git** for version control
- A **code editor** (VS Code recommended)
- A **Google Gemini API key** for testing

### Find an Issue to Work On

1. Browse [open issues](https://github.com/Krosebrook/LocalLeadGenAI/issues)
2. Look for issues labeled `good first issue` or `help wanted`
3. Comment on the issue to express interest
4. Wait for assignment/approval before starting work

### Types of Contributions

We welcome:
- 🐛 **Bug fixes**: Fix broken functionality
- ✨ **New features**: Add new capabilities
- 📝 **Documentation**: Improve docs, add examples
- 🎨 **UI/UX**: Enhance design and user experience
- ⚡ **Performance**: Optimize speed and efficiency
- 🧪 **Tests**: Increase test coverage
- 🔒 **Security**: Fix vulnerabilities

---

## Development Setup

### 1. Fork the Repository

Click the "Fork" button on GitHub to create your own copy.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/LocalLeadGenAI.git
cd LocalLeadGenAI
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/Krosebrook/LocalLeadGenAI.git
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY
```

### 6. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 7. Verify Setup

- Try searching for "Dentist" in "Austin, TX"
- Verify leads display correctly
- Click a lead to test audit functionality

---

## Development Workflow

### 1. Sync with Upstream

Before starting work, sync your fork:

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

### 2. Create a Feature Branch

Use a descriptive branch name:

```bash
# Bug fix
git checkout -b fix/issue-123-json-parsing-error

# New feature
git checkout -b feature/export-to-csv

# Documentation
git checkout -b docs/update-readme
```

### 3. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run tests (when available)
npm test

# Build to verify no errors
npm run build

# Manual testing
npm run dev
```

### 5. Commit Your Changes

Follow [commit guidelines](#commit-guidelines):

```bash
git add .
git commit -m "fix: resolve JSON parsing error in geminiService"
```

### 6. Push to Your Fork

```bash
git push origin your-branch-name
```

### 7. Open a Pull Request

- Go to your fork on GitHub
- Click "Compare & pull request"
- Fill out the PR template
- Link related issues

---

## Coding Standards

### TypeScript

**Use explicit types:**
```typescript
// ✅ Good
const leads: BusinessLead[] = [];
function searchLeads(niche: string, city: string): Promise<BusinessLead[]> {}

// ❌ Bad
const leads = [];
function searchLeads(niche, city) {}
```

**Avoid `any` type:**
```typescript
// ✅ Good
catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}

// ❌ Bad
catch (error: any) {
  console.error(error.message);
}
```

**Use interfaces for objects:**
```typescript
// ✅ Good
interface SearchParams {
  niche: string;
  city: string;
}

// ❌ Bad
type SearchParams = {
  niche: string;
  city: string;
}
```

### React

**Use functional components:**
```typescript
// ✅ Good
export const MyComponent: React.FC<Props> = ({ data }) => {
  return <div>{data}</div>;
};

// ❌ Bad
class MyComponent extends React.Component {
  render() {
    return <div>{this.props.data}</div>;
  }
}
```

**Extract complex logic to custom hooks:**
```typescript
// ✅ Good
const { leads, loading, search } = useLeadSearch();

// ❌ Bad
const [leads, setLeads] = useState([]);
const [loading, setLoading] = useState(false);
// 20 more lines of state and logic...
```

**Use meaningful variable names:**
```typescript
// ✅ Good
const selectedBusiness = leads.find(lead => lead.id === selectedId);

// ❌ Bad
const x = leads.find(l => l.id === id);
```

### CSS/Tailwind

**Use consistent utility classes:**
```typescript
// ✅ Good
<div className="flex items-center justify-between px-4 py-2 rounded-lg bg-slate-900">

// ❌ Bad
<div className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-2">
```

**Group related utilities:**
```typescript
// ✅ Good: layout, spacing, colors, effects
className="flex gap-4 p-6 bg-slate-900 border border-white/10 rounded-xl shadow-lg"

// ❌ Bad: random order
className="rounded-xl p-6 flex shadow-lg border border-white/10 gap-4 bg-slate-900"
```

### File Organization

**Component files:**
```
ComponentName.tsx        # Component logic
ComponentName.test.tsx   # Component tests
ComponentName.stories.tsx # Storybook stories (future)
```

**Service files:**
```
serviceName.ts           # Service implementation
serviceName.test.ts      # Service tests
```

### Imports

**Order imports:**
```typescript
// 1. React/external libraries
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

// 2. Internal modules
import { BusinessLead } from '@/types';
import { findLeads } from '@/services/geminiService';

// 3. Components
import { OpportunityBadge } from '@/components/OpportunityBadge';

// 4. Styles (if any)
import './styles.css';
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no feature change)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, config)
- `ci`: CI/CD changes

### Examples

```bash
# Feature
feat(search): add autocomplete for city input

# Bug fix
fix(audit): resolve race condition in concurrent audits

# Documentation
docs(readme): add troubleshooting section

# Refactoring
refactor(app): extract search logic to custom hook

# Performance
perf(leads): implement virtual scrolling for large lists

# Tests
test(gemini): add unit tests for findLeads function

# Chore
chore(deps): upgrade react to 19.2.3
```

### Commit Message Guidelines

- Use imperative mood ("add" not "added" or "adds")
- Keep subject line under 72 characters
- Capitalize subject line
- No period at the end of subject line
- Add body if change is complex
- Reference issues in footer

**Good commit:**
```
feat(pitch): add tone and length customization

Allow users to customize pitch tone (Formal, Friendly, Urgent) 
and length (Short, Medium, Long) for better targeting.

Closes #42
```

**Bad commit:**
```
updated stuff
```

---

## Pull Request Process

### Before Opening a PR

- [ ] Code follows coding standards
- [ ] All tests pass (when available)
- [ ] New features have tests
- [ ] Documentation is updated
- [ ] Commits follow commit guidelines
- [ ] Branch is up to date with main

### PR Title

Use the same format as commit messages:

```
feat(export): add CSV export functionality
fix(ui): resolve mobile layout issues
docs(api): document Gemini integration
```

### PR Description Template

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Related Issue
Closes #123

## Changes Made
- Added X feature
- Fixed Y bug
- Updated Z documentation

## Testing
- [ ] Tested locally
- [ ] Added unit tests
- [ ] Manual testing performed

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings or errors
```

### Review Process

1. **Automated Checks**: CI/CD runs automatically
2. **Code Review**: Maintainer reviews code
3. **Feedback**: Address any requested changes
4. **Approval**: PR is approved
5. **Merge**: PR is merged to main

### After Merge

- Delete your feature branch
- Sync your fork with upstream
- Celebrate! 🎉

---

## Testing Guidelines

### Unit Tests (Future)

Test individual functions in isolation:

```typescript
// services/geminiService.test.ts
import { findLeads } from './geminiService';

describe('findLeads', () => {
  it('should return array of leads', async () => {
    const leads = await findLeads('Dentist', 'Austin, TX');
    expect(Array.isArray(leads)).toBe(true);
  });
  
  it('should classify opportunities correctly', () => {
    const lead = { rating: 3.5, reviews: 50, website: 'test.com' };
    expect(classifyOpportunities(lead)).toContain(OpportunityType.LOW_REPUTATION);
  });
});
```

### Component Tests (Future)

Test React components:

```typescript
// components/OpportunityBadge.test.tsx
import { render, screen } from '@testing-library/react';
import { OpportunityBadge } from './OpportunityBadge';

describe('OpportunityBadge', () => {
  it('renders correct text and icon', () => {
    render(<OpportunityBadge type={OpportunityType.LOW_REPUTATION} />);
    expect(screen.getByText('Low Reputation')).toBeInTheDocument();
  });
});
```

### Manual Testing Checklist

For now, manual testing is required:

- [ ] Search returns valid results
- [ ] Leads display with correct badges
- [ ] Clicking lead triggers audit
- [ ] Audit shows sources and gaps
- [ ] Pitch generation works with all tone/length combos
- [ ] Error states display properly
- [ ] Responsive on mobile devices
- [ ] Copy to clipboard works

---

## Documentation

### When to Update Documentation

Update docs when you:
- Add a new feature
- Change existing behavior
- Fix a bug that affects usage
- Add configuration options
- Modify APIs or interfaces

### Documentation Locations

- **README.md**: Overview, setup, usage
- **ARCHITECTURE.md**: Technical decisions, patterns
- **REFACTORING.md**: Code improvement recommendations
- **agents.md**: AI agent documentation
- **gemini.md**: Gemini API integration
- **ROADMAP.md**: Future plans
- **Inline comments**: Complex code explanations

### Documentation Style

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Keep formatting consistent
- Use proper markdown syntax

---

## Community

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas, show & tell
- **Pull Requests**: Code contributions

### Getting Help

If you need help:
1. Check existing documentation
2. Search closed issues
3. Ask in GitHub Discussions
4. Tag maintainers in urgent cases

### Recognition

Contributors will be:
- Listed in CHANGELOG.md
- Mentioned in release notes
- Featured in README (top contributors)
- Given credit in commit messages

---

## Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Checklist (Maintainers)

1. Update version in package.json
2. Update CHANGELOG.md
3. Run full test suite
4. Build production bundle
5. Create GitHub release
6. Tag release (v0.2.0)
7. Announce on social media

---

## Questions?

If you have questions not covered in this guide:
1. Check [README.md](README.md)
2. Browse [existing issues](https://github.com/Krosebrook/LocalLeadGenAI/issues)
3. Open a new issue with the `question` label

---

## Thank You!

Your contributions make LocalLeadGenAI better for everyone. We appreciate your time and effort!

**Happy coding! 🚀**

---

**Last Updated**: 2024-12-30  
**Document Version**: 1.0
