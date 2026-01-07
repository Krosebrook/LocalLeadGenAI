# Changelog

All notable changes to LocalLeadGenAI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation suite (README, ARCHITECTURE, API docs)
- Configuration management system with `config/constants.ts`
- Utility modules for validation and lead analysis
- Environment variable validation
- `.env.example` template for easy setup
- Improved `.gitignore` with environment variable protection

### Changed
- Refactored `geminiService.ts` to use centralized constants
- Extracted business logic into utility functions
- Improved error messages with centralized ERROR_MESSAGES
- Updated App.tsx to use UI_CONFIG constants
- Enhanced code modularity and maintainability

### Fixed
- Improved JSON parsing with fallback handling
- Better error handling throughout the application

## [0.0.0] - 2024-12-30

### Added
- Initial release of LocalLeadGenAI dashboard
- Google Maps integration for lead discovery
- Google Search grounding for business auditing
- AI-powered pitch generation with Gemini API
- Three opportunity types: Low Reputation, Undervalued, Missing Info
- Customizable pitch tones (Formal, Friendly, Urgent)
- Customizable pitch lengths (Short, Medium, Long)
- Two pitch focus types: Automation and Website Launchpad
- Modern cyberpunk-inspired UI with glass morphism effects
- Real-time loading states and error handling
- Responsive design for mobile and desktop
- TypeScript support throughout
- Vite-based build system

### Core Features
- Business lead search by niche and location
- Automatic opportunity identification
- Digital presence audit with source grounding
- Gap analysis for missing digital features
- Personalized sales pitch generation
- Copy-to-clipboard functionality
- Lead refresh capability

### Technology Stack
- React 19.2
- TypeScript 5.8
- Vite 6.2
- Google Gemini API
- Tailwind CSS (CDN)
- Lucide React icons

---

## Version History Summary

- **[Unreleased]** - Code refactoring and documentation improvements
- **[0.0.0]** - Initial MVP release with core features

---

## Future Plans

See [ROADMAP.md](ROADMAP.md) for upcoming features and improvements.
