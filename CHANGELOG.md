# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features
- Unit and integration test suite
- Backend API proxy for API key security
- Local storage caching for audit results
- Export functionality (CSV, PDF reports)
- Batch lead processing
- Advanced filtering and sorting
- User authentication and saved searches
- Multi-language support
- API rate limiting and retry logic
- Error boundaries for better error handling

### Planned Improvements
- Mobile-responsive UI optimizations
- Virtual scrolling for large lead lists
- Lazy loading for components
- PWA support for offline capabilities
- Dark/light theme toggle
- Accessibility enhancements (WCAG 2.1 AA)

### Known Issues to Fix
- JSON parsing errors with unexpected AI response formats
- Concurrent audit race conditions
- Missing input validation
- No retry logic for failed API calls
- Small screen interaction improvements needed

---

## [0.1.0] - 2024-12-30

### Added - Initial MVP Release

#### Core Features
- **Lead Discovery System**
  - Google Maps integration via Gemini AI
  - Search by industry niche and geographic location
  - Returns up to 12 business leads per search
  - Real-time loading states and error handling

- **Opportunity Classification**
  - Automatic lead categorization into three types:
    - Low Reputation (rating < 4.0)
    - Undervalued (rating > 4.5, reviews < 20)
    - Missing Info (no website)
  - Visual badges with icons for quick identification

- **Digital Presence Audit**
  - AI-powered website and social media analysis
  - Automated detection of digital gaps:
    - Missing booking systems
    - Absence of AI chatbots
    - Outdated website elements
    - Social media inactivity
  - Google Search grounding with verifiable sources
  - Structured gap identification

- **Sales Pitch Generation**
  - Two pitch focus types:
    - Automation pitch (AI tools, chatbots, booking systems)
    - Website design pitch (for businesses without websites)
  - Customizable parameters:
    - Tone: Formal / Friendly / Urgent
    - Length: Short / Medium / Long
  - Context-aware copy based on audit findings
  - Copy-to-clipboard functionality

#### UI/UX
- **Modern Dashboard Design**
  - Cyberpunk-inspired glass morphism aesthetic
  - Three-panel layout: header, leads list, detail view
  - Responsive grid system with Tailwind CSS
  - Custom gradient backgrounds and neon effects
  - Smooth transitions and animations

- **Interactive Components**
  - Sticky navigation header with inline search
  - Scrollable lead list with selection states
  - Expandable detail panel with tabs
  - Real-time loading indicators
  - Toast notifications for errors
  - Refresh buttons for data updates

#### Technical Implementation
- **Frontend Stack**
  - React 19.2.3 with TypeScript 5.8.2
  - Vite 6.2.0 for build tooling
  - Tailwind CSS via CDN
  - Lucide React icons
  - ESM modules with import maps

- **AI Integration**
  - Google Gemini API integration
  - Models used:
    - `gemini-2.5-flash-lite-latest` (Google Maps tool)
    - `gemini-3-flash-preview` (Google Search tool)
  - Structured JSON response parsing
  - Grounding metadata extraction

- **State Management**
  - React hooks (useState, useEffect, useCallback)
  - Component-level state management
  - Loading states for async operations
  - Error state handling

- **Type Safety**
  - Comprehensive TypeScript interfaces
  - Type definitions for all data structures
  - Enum-based opportunity classification
  - Strict type checking enabled

#### Development Configuration
- **Build System**
  - Vite configuration with environment variable injection
  - Path aliases for cleaner imports
  - Dev server on port 3000
  - Host accessible from network (0.0.0.0)

- **TypeScript Configuration**
  - ES2022 target with ESNext modules
  - React JSX support
  - Bundler module resolution
  - Experimental decorators enabled

- **Environment Variables**
  - `.env.local` support for API keys
  - Automatic injection into process.env
  - Dual naming (API_KEY and GEMINI_API_KEY)

#### Project Structure
```
LocalLeadGenAI/
├── App.tsx                   # Main application component
├── components/
│   └── OpportunityBadge.tsx  # Badge component for opportunities
├── services/
│   └── geminiService.ts      # AI service layer
├── types.ts                  # TypeScript definitions
├── index.tsx                 # App entry point
├── index.html                # HTML template
├── vite.config.ts            # Build configuration
├── tsconfig.json             # TypeScript config
└── package.json              # Dependencies
```

#### Dependencies
- `react` v19.2.3 - UI framework
- `react-dom` v19.2.3 - React rendering
- `@google/genai` v1.34.0 - Gemini API client
- `lucide-react` v0.562.0 - Icon library
- `vite` v6.2.0 - Build tool
- `typescript` v5.8.2 - Type checker
- `@vitejs/plugin-react` v5.0.0 - React plugin
- `@types/node` v22.14.0 - Node types

---

## Version History Summary

| Version | Release Date | Highlights |
|---------|--------------|------------|
| 0.1.0   | 2024-12-30   | Initial MVP with lead discovery, audits, and pitch generation |

---

## Migration Guides

### Migrating to v0.1.0 (Initial Setup)

This is the initial release. To get started:

1. **Clone the repository**
   ```bash
   git clone https://github.com/Krosebrook/LocalLeadGenAI.git
   cd LocalLeadGenAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   echo "GEMINI_API_KEY=your_key_here" > .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

---

## Deprecation Notices

None at this time.

---

## Breaking Changes

None at this time.

---

## Security Updates

None at this time. See [README.md](README.md#security) for security best practices.

---

## Contributors

Thanks to all contributors who helped with this release!

- Initial development by [@Krosebrook](https://github.com/Krosebrook)

---

## Links

- [Repository](https://github.com/Krosebrook/LocalLeadGenAI)
- [AI Studio Demo](https://ai.studio/apps/drive/1lByE8RWb5hBlszWGbwjrtZxjzCRM1TG5)
- [Issues](https://github.com/Krosebrook/LocalLeadGenAI/issues)
- [Roadmap](ROADMAP.md)

---

**Note**: This changelog will be updated with each release. For upcoming features, see the [ROADMAP.md](ROADMAP.md).
