# Contributing to LocalLeadGenAI

First off, thank you for considering contributing to LocalLeadGenAI! It's people like you that make this tool better for everyone.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

---

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes**:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards others

**Unacceptable behavior includes**:
- Trolling, insulting comments, and personal attacks
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Git**
- **GitHub account**
- **Code editor** (VS Code recommended)
- **Google Gemini API Key** (for testing)

### Fork & Clone

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/LocalLeadGenAI.git
   cd LocalLeadGenAI
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Krosebrook/LocalLeadGenAI.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Set up environment**:
   ```bash
   cp .env.example .env.local
   # Add your GEMINI_API_KEY
   ```

6. **Start development server**:
   ```bash
   npm run dev
   ```

---

## Development Process

### Workflow

1. **Sync your fork**:
   ```bash
   git checkout main
   git fetch upstream
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, documented code
   - Follow coding standards
   - Add tests if applicable

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request** on GitHub

---

## How to Contribute

### Types of Contributions

#### 🐛 Bug Reports

**Before submitting**:
- Check if the bug has already been reported
- Collect relevant information (browser, OS, steps to reproduce)

**Bug Report Template**:
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g. Windows 10]
 - Browser: [e.g. Chrome 120]
 - Version: [e.g. 0.1.0]

**Additional context**
Any other context about the problem.
```

#### ✨ Feature Requests

**Before submitting**:
- Check if the feature has been requested
- Consider if it fits the project scope

**Feature Request Template**:
```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features.

**Additional context**
Mockups, examples, or additional information.
```

#### 📝 Documentation

- Fix typos or clarify explanations
- Add examples or tutorials
- Improve API documentation
- Translate documentation

#### 💻 Code Contributions

**Good First Issues**:
Look for issues labeled:
- `good first issue`
- `help wanted`
- `documentation`

**Areas to contribute**:
- Bug fixes
- Feature development
- Performance improvements
- Test coverage
- Refactoring
- UI/UX improvements

---

## Pull Request Process

### Before Submitting

1. **Update your branch**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Test your changes**:
   ```bash
   npm run build
   # Test manually in browser
   ```

3. **Lint your code** (when linter is added):
   ```bash
   npm run lint
   ```

4. **Update documentation** if needed

### PR Title Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Formatting, missing semicolons, etc.
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding tests
- `chore:` Maintenance tasks

**Examples**:
```
feat: add CSV export functionality
fix: resolve audit parsing error
docs: update API documentation
refactor: extract validation utilities
```

### PR Description Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran.

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests (if applicable)
- [ ] New and existing tests pass

## Screenshots (if applicable)
Add screenshots for UI changes.

## Related Issues
Closes #(issue number)
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainer(s)
3. **Address feedback** if requested
4. **Approval** from at least one maintainer
5. **Merge** by maintainer

---

## Coding Standards

### TypeScript

```typescript
// ✅ Do: Use TypeScript types
interface BusinessLead {
  id: string;
  name: string;
  rating: number;
}

// ✅ Do: Use explicit return types
function calculateScore(lead: BusinessLead): number {
  return lead.rating * 10;
}

// ❌ Don't: Use 'any'
function processData(data: any) { // Avoid this
  // ...
}
```

### React Components

```typescript
// ✅ Do: Use functional components with TypeScript
interface Props {
  title: string;
  onClose: () => void;
}

const Component: React.FC<Props> = ({ title, onClose }) => {
  return <div>{title}</div>;
};

// ✅ Do: Use meaningful names
const [isLoading, setIsLoading] = useState(false);

// ❌ Don't: Use abbreviations
const [ld, setLd] = useState(false);
```

### File Organization

```
component/
  ├── ComponentName.tsx          # Component
  ├── ComponentName.test.tsx     # Tests
  └── types.ts                   # Local types

utils/
  ├── utilityName.ts
  └── utilityName.test.ts
```

### Naming Conventions

- **Files**: PascalCase for components, camelCase for utilities
- **Functions**: camelCase (`getUserData`)
- **Components**: PascalCase (`UserProfile`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINT`)
- **Types/Interfaces**: PascalCase (`BusinessLead`)

### Code Style

```typescript
// ✅ Do: Keep functions small and focused
function identifyOpportunities(rating: number, reviews: number) {
  const opportunities = [];
  
  if (rating < 4.0) {
    opportunities.push(OpportunityType.LOW_REPUTATION);
  }
  
  return opportunities;
}

// ✅ Do: Use early returns
function processLead(lead: BusinessLead | null) {
  if (!lead) return null;
  if (!lead.name) return null;
  
  // Process lead
  return transformedLead;
}

// ✅ Do: Add comments for complex logic
function calculateScore(lead: BusinessLead): number {
  // Weight rating more heavily for businesses with fewer reviews
  // to identify undervalued opportunities
  const weightFactor = Math.max(1, 100 - lead.reviews) / 100;
  return lead.rating * weightFactor;
}
```

### Import Order

```typescript
// 1. External dependencies
import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

// 2. Internal modules
import { findLeads } from './services/geminiService';
import { BusinessLead } from './types';
import { UI_CONFIG } from './config/constants';

// 3. Components
import OpportunityBadge from './components/OpportunityBadge';
```

---

## Testing Guidelines

### Test Structure

```typescript
describe('identifyOpportunities', () => {
  it('should identify low reputation', () => {
    const result = identifyOpportunities(3.5, 100, true);
    expect(result).toContain(OpportunityType.LOW_REPUTATION);
  });

  it('should identify missing website', () => {
    const result = identifyOpportunities(4.5, 50, false);
    expect(result).toContain(OpportunityType.MISSING_INFO);
  });
});
```

### Test Coverage

- Aim for 80%+ coverage on utilities
- Test edge cases and error conditions
- Test user interactions for components
- Mock external dependencies (API calls)

---

## Documentation

### Code Comments

```typescript
/**
 * Analyzes a business and identifies sales opportunities
 * 
 * @param rating - Business rating (0-5 scale)
 * @param reviews - Number of customer reviews
 * @param hasWebsite - Whether business has a website
 * @returns Array of identified opportunity types
 * 
 * @example
 * ```typescript
 * const opportunities = identifyOpportunities(3.8, 50, false);
 * // Returns: [OpportunityType.LOW_REPUTATION, OpportunityType.MISSING_INFO]
 * ```
 */
export function identifyOpportunities(
  rating: number,
  reviews: number,
  hasWebsite: boolean
): OpportunityType[] {
  // Implementation
}
```

### README Updates

- Update if adding new features
- Document new configuration options
- Add usage examples
- Update installation steps if needed

### Changelog

Add entry to CHANGELOG.md:
```markdown
### Added
- New CSV export feature for leads
```

---

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussions
- **Pull Requests**: Code review and collaboration

### Getting Help

- Check existing documentation
- Search closed issues
- Ask in GitHub Discussions
- Be specific and provide context

### Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- GitHub insights

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Questions?

Don't hesitate to ask! Open an issue labeled `question` or start a discussion.

**Thank you for contributing!** 🎉

---

**Last Updated**: December 30, 2024
