<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LocalLeadGenAI

> **AI-Powered Local Business Intelligence Dashboard**  
> Identify high-potential local business leads, audit their digital presence, and generate personalized sales pitches using Google Maps and Search grounding.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue)](https://www.typescriptlang.org/)

View app in AI Studio: [https://ai.studio/apps/drive/1lByE8RWb5hBlszWGbwjrtZxjzCRM1TG5](https://ai.studio/apps/drive/1lByE8RWb5hBlszWGbwjrtZxjzCRM1TG5)

---

## 🎯 Overview

**LocalLeadGenAI** is a sophisticated web application that revolutionizes local business lead generation by combining AI-powered intelligence with real-time data from Google Maps and Google Search. It enables sales teams, marketing agencies, and business development professionals to:

- **Discover** local business opportunities using AI-grounded Google Maps search
- **Analyze** digital presence gaps through automated audits
- **Generate** hyper-personalized sales pitches tailored to each prospect's specific needs
- **Scale** outreach with intelligent automation

### Key Features

🔍 **Intelligent Lead Discovery**
- Real-time Google Maps integration for location-based business discovery
- Customizable search by niche/industry and geographic location
- Automatic opportunity classification (Low Reputation, Undervalued, Missing Info)

🔬 **Automated Digital Audits**
- AI-powered website and social media presence analysis
- Identifies missing digital assets (booking systems, chatbots, etc.)
- Grounded search results with verifiable sources
- Gap identification for targeted sales approaches

✉️ **Personalized Pitch Generation**
- Context-aware sales copy generation using Gemini AI
- Multiple pitch types: Automation focus or Website design focus
- Customizable tone (Formal, Friendly, Urgent) and length (Short, Medium, Long)
- Based on real audit data and business-specific insights

🎨 **Modern UI/UX**
- Cyberpunk-inspired glass morphism design
- Responsive dashboard layout
- Real-time loading states and error handling
- Smooth animations and transitions

---

## 🏗️ Architecture

### Technology Stack

**Frontend**
- **React 19.2.3** - Modern UI framework with concurrent features
- **TypeScript 5.8.2** - Type-safe development
- **Vite 6.2.0** - Lightning-fast build tool and dev server
- **Tailwind CSS 3.x** - Utility-first CSS framework (CDN)
- **Lucide React** - Beautiful icon library

**AI/ML Services**
- **Google Gemini API** (via `@google/genai`)
  - `gemini-2.5-flash-lite-latest` - Lead discovery with Google Maps grounding
  - `gemini-3-flash-preview` - Audit analysis and pitch generation with Google Search grounding

**Development Tools**
- **ESM Modules** - Modern JavaScript module system
- **Import Maps** - Native browser module resolution

### Component Architecture

```
LocalLeadGenAI/
├── App.tsx                      # Main application component (state management, UI orchestration)
├── components/
│   └── OpportunityBadge.tsx     # Visual indicator for lead opportunities
├── services/
│   └── geminiService.ts         # AI service layer (API calls, data transformation)
├── types.ts                     # TypeScript type definitions
├── index.tsx                    # Application entry point
├── index.html                   # HTML template with CDN imports
├── vite.config.ts               # Build configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
```

### Data Flow

1. **Lead Discovery Flow**
   ```
   User Input → findLeads() → Gemini API (Google Maps) → BusinessLead[] → UI Display
   ```

2. **Audit Flow**
   ```
   BusinessLead → auditBusiness() → Gemini API (Google Search) → BusinessAudit → UI Display
   ```

3. **Pitch Generation Flow**
   ```
   BusinessLead + BusinessAudit + User Preferences → generatePitch() → Gemini API → Sales Pitch
   ```

### Core Components

#### App.tsx
The main application component managing:
- Search state (niche, city)
- Leads state (discovered businesses)
- Audit state (analysis results)
- Pitch state (generated sales copy)
- Loading states for async operations
- Error handling and notifications

**Key Features:**
- Three-column responsive layout (header, leads list, detail panel)
- Real-time search with Google Maps grounding
- Click-to-audit lead selection
- Customizable pitch generation parameters

#### OpportunityBadge.tsx
A presentational component that visualizes opportunity types:
- **Low Reputation** (rating < 4.0) - Red badge with alert icon
- **Undervalued** (rating > 4.5, reviews < 20) - Cyan badge with trending icon
- **Missing Info** (no website) - Amber badge with info icon

#### geminiService.ts
Service layer providing three core AI operations:

1. **findLeads(niche, city)**
   - Uses `gemini-2.5-flash-lite-latest` with Google Maps tool
   - Returns array of up to 12 local businesses
   - Automatically classifies opportunity types
   - Generates unique IDs for each lead

2. **auditBusiness(lead)**
   - Uses `gemini-3-flash-preview` with Google Search tool
   - Analyzes website, social media, and digital tools
   - Extracts grounding sources for verification
   - Identifies specific digital gaps

3. **generatePitch(lead, audit, focus, tone, length)**
   - Creates personalized sales copy
   - Two focus types: automation or website design
   - Configurable tone and length
   - Context-aware based on audit findings

### Type System

```typescript
// Opportunity classification enum
enum OpportunityType {
  LOW_REPUTATION = 'Low Reputation',
  UNDERVALUED = 'Undervalued',
  MISSING_INFO = 'Missing Info'
}

// Business lead data structure
interface BusinessLead {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  website?: string;
  opportunities: OpportunityType[];
}

// Audit results
interface BusinessAudit {
  content: string;                        // Full audit text
  sources: { title: string; uri: string }[]; // Grounding sources
  gaps: string[];                         // Missing digital assets
}

// Search parameters
interface SearchState {
  niche: string;
  city: string;
}
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0 (with npm)
- **Google Gemini API Key** - Get yours at [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Krosebrook/LocalLeadGenAI.git
   cd LocalLeadGenAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## 📖 Usage Guide

### 1. Discover Leads

1. Enter your target **Industry/Niche** (e.g., "Dentist", "Roofers", "Coffee Shop")
2. Enter your target **City** (e.g., "Austin, TX", "San Francisco, CA")
3. Click **FIND LEADS**
4. Wait for AI to query Google Maps and return results (~5-10 seconds)

**Example Searches:**
- Dentist in Austin, TX
- HVAC Repair in Phoenix, AZ
- Italian Restaurant in Chicago, IL
- Yoga Studio in Portland, OR

### 2. Audit a Business

1. Click on any lead in the left panel
2. The system automatically triggers a digital presence audit
3. Review the audit findings:
   - **Audit Content**: AI-generated analysis of their digital footprint
   - **Gap Identification**: Missing digital assets (chatbots, booking, etc.)
   - **Grounding Sources**: Verifiable links used for the audit

**Refresh Option:** Click the refresh icon to re-run the audit with fresh data.

### 3. Generate Sales Pitch

1. After an audit is complete, configure pitch parameters:
   - **Tone**: Formal / Friendly / Urgent
   - **Length**: Short / Medium / Long

2. Choose pitch focus:
   - **AUTOMATION PITCH**: For businesses needing AI chatbots, booking systems, etc.
   - **WEBSITE LAUNCHPAD PITCH**: For businesses without a website (only shown if applicable)

3. Click the appropriate button to generate
4. Copy the pitch to your clipboard or edit as needed

**Pro Tips:**
- Use "Friendly" tone for local service businesses
- Use "Formal" tone for medical/legal professionals
- Use "Urgent" tone when highlighting critical gaps

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes | - |

**Note:** The application uses Vite's environment variable system. During build, `GEMINI_API_KEY` is aliased to both `process.env.API_KEY` and `process.env.GEMINI_API_KEY`.

### Vite Configuration

Key settings in `vite.config.ts`:
- **Server Port**: 3000
- **Host**: 0.0.0.0 (accessible from network)
- **Aliases**: `@/` points to project root
- **Environment**: Automatically loads `.env.local`

### TypeScript Configuration

- **Target**: ES2022
- **Module**: ESNext
- **JSX**: react-jsx
- **Strict**: Enabled for type safety
- **Import Extensions**: Allowed for Vite compatibility

---

## 🧪 Testing

Currently, this project does not have automated tests. See [ROADMAP.md](ROADMAP.md) for testing infrastructure plans.

**Manual Testing Checklist:**
- [ ] Search returns valid results from Google Maps
- [ ] Leads display with correct opportunity badges
- [ ] Audit generates grounded analysis with sources
- [ ] Pitch generation respects tone/length settings
- [ ] Error states display properly
- [ ] Responsive design works on mobile
- [ ] Copy to clipboard functionality works

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** following our coding standards
5. **Test your changes** thoroughly
6. **Commit with descriptive messages**
   ```bash
   git commit -m "feat: add XYZ feature"
   ```
7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open a Pull Request** with a clear description

### Coding Standards

**TypeScript**
- Use functional components with hooks
- Define explicit types for props and state
- Avoid `any` types where possible
- Use `interface` for object types

**React**
- Use functional components exclusively
- Leverage React 19 features appropriately
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks

**Styling**
- Use Tailwind utility classes
- Follow existing design system patterns
- Maintain responsive design principles
- Use semantic class names for custom styles

**Git Commits**
- Follow conventional commits format
- Use prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Keep commits atomic and focused

### Areas for Contribution

See [ROADMAP.md](ROADMAP.md) for planned features. Priority areas:
- Unit tests for services and components
- Error boundary implementation
- API rate limiting and retry logic
- Additional pitch templates
- Export functionality (CSV, PDF)
- Multi-language support

---

## 🐛 Known Issues & Limitations

### Current Limitations

1. **API Rate Limits**: No built-in rate limiting for Gemini API calls
2. **Error Recovery**: Limited retry logic for failed API requests
3. **Data Persistence**: No local storage or database (all data is session-based)
4. **Lead Volume**: Limited to 12 leads per search (API constraint)
5. **Offline Mode**: Requires internet connection (no offline capabilities)

### Potential Bugs

1. **Edge Cases in Lead Parsing**: JSON extraction from AI responses may fail with unexpected formats
2. **Source URL Validation**: No validation on grounding source URLs
3. **Concurrent Requests**: Multiple simultaneous audits may cause race conditions
4. **Mobile UX**: Some interactions may be suboptimal on small screens

See [ROADMAP.md](ROADMAP.md) for planned fixes and improvements.

---

## 📊 Performance Considerations

### Current Performance

- **Lead Discovery**: ~5-10 seconds (depends on Google Maps API)
- **Audit Generation**: ~8-15 seconds (depends on Google Search grounding)
- **Pitch Generation**: ~3-5 seconds
- **Bundle Size**: ~500KB (production build)

### Optimization Opportunities

1. **Lazy Loading**: Split large components into separate chunks
2. **Caching**: Implement local cache for recent audits
3. **Request Debouncing**: Prevent duplicate API calls
4. **Virtual Scrolling**: For large lead lists (>50 items)
5. **Image Optimization**: Compress and lazy-load images

---

## 🔒 Security

### Best Practices

✅ **Currently Implemented:**
- API key stored in environment variables (not committed)
- No sensitive data in client-side code
- HTTPS enforcement in production

⚠️ **Recommendations:**
- Implement backend API proxy to hide API keys
- Add request validation and sanitization
- Implement rate limiting per IP/user
- Add CORS configuration for production
- Use Content Security Policy (CSP) headers

### Reporting Security Issues

Please report security vulnerabilities to the repository maintainer via GitHub Issues (mark as confidential) or direct message.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** - Powering intelligent lead discovery and analysis
- **Google Maps API** - Location-based business data
- **Lucide Icons** - Beautiful icon set
- **Tailwind CSS** - Utility-first styling framework
- **Vite** - Modern build tooling

---

## 📞 Support & Contact

- **GitHub Issues**: [Report a bug or request a feature](https://github.com/Krosebrook/LocalLeadGenAI/issues)
- **Documentation**: See additional docs in the `/docs` directory
- **AI Studio**: [View live app](https://ai.studio/apps/drive/1lByE8RWb5hBlszWGbwjrtZxjzCRM1TG5)

---

## 🗺️ Roadmap

See [ROADMAP.md](ROADMAP.md) for detailed development plans from MVP to V1.0+.

**Quick Overview:**
- **Short-term**: Bug fixes, tests, CI/CD, API improvements
- **Mid-term**: Feature expansion, integrations, backend API
- **Long-term**: Performance optimization, scaling, ecosystem tools

---

**Built with ❤️ by the LocalLeadGenAI Team**
