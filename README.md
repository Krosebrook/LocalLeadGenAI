<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎯 LocalLeadGenAI - AI-Powered Local Business Lead Generation

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff)](https://vitejs.dev/)

**LocalLeadGenAI** is a cutting-edge dashboard application that leverages Google's Gemini AI to identify local business opportunities, audit their digital presence, and generate personalized sales pitches. Built for sales professionals, digital agencies, and business developers.

View your app in AI Studio: https://ai.studio/apps/drive/1lByE8RWb5hBlszWGbwjrtZxjzCRM1TG5

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Configuration](#-configuration)
- [Usage Guide](#-usage-guide)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## ✨ Features

### 🔍 **Intelligent Lead Discovery**
- Search local businesses by niche and location using Google Maps integration
- Automatically identify opportunities (low reputation, undervalued, missing info)
- Real-time lead scoring and categorization

### 🔎 **Digital Presence Auditing**
- Comprehensive website and social media analysis
- Identify missing features (AI chatbots, booking systems, outdated design)
- Source grounding with verifiable references
- Gap analysis with actionable insights

### 💬 **AI-Powered Pitch Generation**
- Personalized sales pitches based on audit findings
- Multiple tones (Formal, Friendly, Urgent) and lengths (Short, Medium, Long)
- Two pitch types: Automation focus and Website development focus
- Context-aware messaging using business intelligence

### 🎨 **Modern UI/UX**
- Sleek, cyberpunk-inspired dark theme
- Real-time loading states and error handling
- Responsive design for all devices
- Smooth animations and transitions

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Google Gemini API Key** - [Get API Key](https://aistudio.google.com/app/apikey)

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
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview
```

---

## 🏗️ Architecture

LocalLeadGenAI follows a modern React architecture with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│           User Interface (React)         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ Search  │  │ Audit   │  │ Pitch   │ │
│  │ View    │  │ View    │  │ View    │ │
│  └─────────┘  └─────────┘  └─────────┘ │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│        Service Layer (Gemini AI)        │
│  ┌──────────────────────────────────┐  │
│  │  findLeads()                      │  │
│  │  auditBusiness()                  │  │
│  │  generatePitch()                  │  │
│  └──────────────────────────────────┘  │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         Google Gemini API               │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │ Google Maps  │  │ Google Search   │ │
│  │ Grounding    │  │ Grounding       │ │
│  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────┘
```

For detailed architecture documentation, see [ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 🛠️ Technology Stack

### Core Technologies
- **React 19.2** - UI library with latest features
- **TypeScript 5.8** - Type-safe development
- **Vite 6.2** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling (via CDN)

### AI & APIs
- **Google Gemini API** - Advanced AI models
  - `gemini-2.5-flash-lite-latest` - Fast lead discovery
  - `gemini-3-flash-preview` - Deep analysis and pitch generation
- **Google Maps Grounding** - Accurate local business data
- **Google Search Grounding** - Web presence verification

### UI Components
- **Lucide React** - Beautiful icon library
- **Custom Glass Morphism** - Modern UI effects

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | ✅ Yes |

### Configuration Files

- **`config/constants.ts`** - Application-wide constants
- **`vite.config.ts`** - Vite build configuration
- **`tsconfig.json`** - TypeScript compiler options

### Customization

Edit `config/constants.ts` to customize:
- Default search parameters
- Lead scoring thresholds
- AI model selections
- UI text and labels

---

## 📖 Usage Guide

### 1. Finding Leads

1. Enter a business niche (e.g., "Dentist", "Roofer", "Restaurant")
2. Enter a location (e.g., "Austin, TX", "New York, NY")
3. Click **"FIND LEADS"**
4. Review the results with opportunity badges:
   - 🔴 **Low Reputation** - Rating < 4.0
   - 🔵 **Undervalued** - High rating, low reviews
   - 🟡 **Missing Info** - No website listed

### 2. Auditing a Business

1. Click on any lead from the list
2. The system automatically:
   - Searches for the business online
   - Analyzes their website and social media
   - Identifies digital gaps and opportunities
   - Provides grounded sources
3. Review the audit results and identified gaps

### 3. Generating Sales Pitches

1. After auditing, configure your pitch:
   - **Tone**: Formal, Friendly, or Urgent
   - **Length**: Short, Medium, or Long
2. Choose pitch type:
   - **Automation Pitch** - For businesses with digital gaps
   - **Website Launchpad** - For businesses without websites
3. Click to generate
4. Copy the personalized pitch to clipboard

---

## 📁 Project Structure

```
LocalLeadGenAI/
├── components/          # Reusable React components
│   └── OpportunityBadge.tsx
├── config/             # Configuration files
│   └── constants.ts    # App-wide constants
├── services/           # API and business logic
│   └── geminiService.ts
├── utils/              # Utility functions
│   ├── validation.ts   # Input/data validation
│   └── leadAnalyzer.ts # Lead scoring logic
├── docs/               # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── agents.md
│   └── gemini.md
├── App.tsx             # Main application component
├── types.ts            # TypeScript type definitions
├── index.tsx           # Application entry point
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

---

## 💻 Development

### Available Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build
```

### Code Style

- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Keep components modular and reusable
- Document complex logic with comments
- Use meaningful variable and function names

### Adding New Features

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes following project structure
3. Test thoroughly
4. Update documentation
5. Submit pull request

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

---

## 📚 API Documentation

### Core Services

#### `findLeads(niche: string, city: string): Promise<BusinessLead[]>`
Searches for local businesses using Google Maps grounding.

#### `auditBusiness(lead: BusinessLead): Promise<BusinessAudit>`
Performs comprehensive digital presence audit with grounded sources.

#### `generatePitch(lead, audit, focus, tone, length): Promise<string>`
Generates personalized sales pitch based on audit findings.

For complete API documentation, see [API.md](docs/API.md).

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests if applicable
5. Update documentation
6. Submit a pull request

---

## 🗺️ Roadmap

See [ROADMAP.md](docs/ROADMAP.md) for our product vision from MVP to V1.0+

### Coming Soon
- 📊 Export leads to CSV
- 🔄 Batch processing
- 📧 Email integration
- 💾 Save and manage campaigns
- 📈 Analytics dashboard

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Google Gemini AI for powerful AI capabilities
- React team for the amazing framework
- Vite for blazing fast development experience
- The open-source community

---

## 📞 Support

- **Documentation**: Check our [docs](docs/) folder
- **Issues**: [GitHub Issues](https://github.com/Krosebrook/LocalLeadGenAI/issues)
- **AI Studio**: [View Live App](https://ai.studio/apps/drive/1lByE8RWb5hBlszWGbwjrtZxjzCRM1TG5)

---

<div align="center">
Made with ❤️ by the LocalLeadGenAI team
</div>
