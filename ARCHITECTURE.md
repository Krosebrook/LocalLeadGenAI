# Architecture & Design Decisions

This document explains the architectural decisions, design patterns, and technical rationale behind LocalLeadGenAI.

---

## Table of Contents

1. [Architectural Overview](#architectural-overview)
2. [Design Patterns](#design-patterns)
3. [Technology Choices](#technology-choices)
4. [Data Flow](#data-flow)
5. [Component Architecture](#component-architecture)
6. [State Management](#state-management)
7. [API Design](#api-design)
8. [AI Integration Strategy](#ai-integration-strategy)
9. [Security Architecture](#security-architecture)
10. [Scalability Considerations](#scalability-considerations)

---

## Architectural Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React 19 + TypeScript 5.8                  │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │ │
│  │  │   App    │  │Components│  │  Hooks   │             │ │
│  │  │  (Root)  │  │          │  │          │             │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘             │ │
│  │       │             │             │                     │ │
│  │       └─────────────┴─────────────┘                     │ │
│  │                     │                                    │ │
│  │       ┌─────────────┴─────────────┐                     │ │
│  │       │      Service Layer        │                     │ │
│  │       │   (geminiService.ts)      │                     │ │
│  │       └─────────────┬─────────────┘                     │ │
│  └─────────────────────┼──────────────────────────────────┘ │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         │ HTTPS/API Calls
                         │
┌────────────────────────┼─────────────────────────────────────┐
│                        ▼                                      │
│                 GOOGLE GEMINI AI                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  gemini-2.5-flash-lite  │  gemini-3-flash-preview    │   │
│  │  (Google Maps tool)      │  (Google Search tool)      │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

### Layered Architecture

**Presentation Layer** (React Components)
- Responsible for UI rendering
- Handles user interactions
- Displays data from state

**Business Logic Layer** (Custom Hooks)
- Manages application state
- Orchestrates service calls
- Implements business rules

**Service Layer** (geminiService.ts)
- Communicates with external APIs
- Transforms data between formats
- Handles API-specific logic

**External Services** (Gemini AI)
- Provides AI capabilities
- Grounding with Google data
- Structured content generation

---

## Design Patterns

### 1. Hooks Pattern (State Management)

**Pattern**: Custom hooks encapsulate stateful logic

**Rationale**:
- Reusable across components
- Easier to test
- Separates concerns
- Follows React best practices

**Example**:
```typescript
function useLeadSearch() {
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [loading, setLoading] = useState(false);
  
  const search = async (niche: string, city: string) => {
    setLoading(true);
    try {
      const results = await findLeads(niche, city);
      setLeads(results);
    } finally {
      setLoading(false);
    }
  };
  
  return { leads, loading, search };
}
```

### 2. Service Layer Pattern

**Pattern**: Separate data access from UI components

**Rationale**:
- Centralized API logic
- Easy to swap implementations
- Mockable for testing
- Clear boundaries

**Structure**:
```
services/
  ├── geminiService.ts      # Gemini AI integration
  ├── apiClient.ts          # HTTP client wrapper (future)
  └── cacheService.ts       # Caching logic (future)
```

### 3. Compound Components

**Pattern**: Components that work together to form a feature

**Rationale**:
- Encapsulation of related UI
- Flexible composition
- Shared state between children

**Example**:
```typescript
<LeadDetail lead={selectedLead}>
  <LeadDetail.Header />
  <LeadDetail.Audit />
  <LeadDetail.PitchGenerator />
</LeadDetail>
```

### 4. Render Props / Children as Function

**Pattern**: Pass render logic as children

**Rationale**:
- Maximum flexibility
- Inversion of control
- Reusable logic with custom UI

**Example**:
```typescript
<DataFetcher url="/api/leads">
  {({ data, loading, error }) => (
    loading ? <Loader /> : <LeadList leads={data} />
  )}
</DataFetcher>
```

### 5. Error Boundary Pattern

**Pattern**: React error boundaries catch component errors

**Rationale**:
- Graceful error handling
- Prevents full app crash
- User-friendly error UI

**Implementation** (future):
```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

---

## Technology Choices

### Frontend Framework: React 19

**Why React?**
- ✅ Industry standard (large ecosystem)
- ✅ Concurrent features for better UX
- ✅ Strong TypeScript support
- ✅ Component-based architecture
- ✅ Large talent pool

**Why React 19?**
- ✅ Latest features (use, useOptimistic)
- ✅ Improved performance
- ✅ Better dev experience
- ❌ Cutting edge (may have bugs)

**Alternatives Considered**:
- Vue 3: Less ecosystem, but simpler
- Svelte: Faster, but smaller community
- Angular: Too heavyweight for this use case

### Language: TypeScript 5.8

**Why TypeScript?**
- ✅ Type safety catches bugs early
- ✅ Better IDE support (autocomplete)
- ✅ Self-documenting code
- ✅ Easier refactoring
- ✅ Industry best practice

**Configuration Philosophy**:
- Strict mode: Catch more errors
- ESNext modules: Modern syntax
- Bundler resolution: Works with Vite

### Build Tool: Vite 6.2

**Why Vite?**
- ✅ Fastest dev server (ESM-based)
- ✅ Lightning-fast HMR
- ✅ Optimized production builds
- ✅ Built-in TypeScript support
- ✅ Simple configuration

**Alternatives Considered**:
- Webpack: Too slow for dev
- Parcel: Less control
- Rollup: More complex setup

### Styling: Tailwind CSS

**Why Tailwind?**
- ✅ Rapid development (utility-first)
- ✅ Consistent design system
- ✅ Small production bundle (purged)
- ✅ No naming conflicts
- ✅ Responsive by default

**Current Implementation**: CDN (simple)
**Future**: PostCSS with purging (optimized)

### AI Provider: Google Gemini

**Why Gemini?**
- ✅ Native grounding (Google Maps, Search)
- ✅ Fast inference times
- ✅ Cost-effective (Flash models)
- ✅ Structured output support
- ✅ Large context window (1M tokens)

**Alternatives Considered**:
- OpenAI GPT: No native grounding, more expensive
- Claude: Better reasoning, but no grounding
- Open source (Llama): No grounding, self-hosted complexity

### Icons: Lucide React

**Why Lucide?**
- ✅ Beautiful, consistent design
- ✅ Tree-shakeable (small bundle)
- ✅ Wide selection (1000+ icons)
- ✅ Active maintenance
- ✅ TypeScript support

---

## Data Flow

### Lead Discovery Flow

```
User Input (niche, city)
    ↓
Validation
    ↓
findLeads(niche, city)
    ↓
Gemini API (Google Maps tool)
    ↓
Parse JSON Response
    ↓
Classify Opportunities
    ↓
Return BusinessLead[]
    ↓
Update UI State
    ↓
Render Lead List
```

### Audit Flow

```
User Clicks Lead
    ↓
setSelectedLead(lead)
    ↓
auditBusiness(lead)
    ↓
Gemini API (Google Search tool)
    ↓
Extract Grounding Sources
    ↓
Secondary API Call (Gap Extraction)
    ↓
Parse JSON Gaps
    ↓
Return BusinessAudit
    ↓
Update UI State
    ↓
Render Audit Panel
```

### Pitch Generation Flow

```
User Configures Pitch (tone, length, focus)
    ↓
Validate Options
    ↓
generatePitch(lead, audit, options)
    ↓
Build Context-Rich Prompt
    ↓
Gemini API (Creative Generation)
    ↓
Extract Text Response
    ↓
Return Sales Pitch
    ↓
Update UI State
    ↓
Render Pitch with Copy Button
```

---

## Component Architecture

### Component Hierarchy

```
App (Root)
├── SearchHeader
│   ├── SearchInput (niche)
│   ├── SearchInput (city)
│   └── SearchButton
├── LeadList (Sidebar)
│   └── LeadCard[] (map)
│       └── OpportunityBadge[]
└── LeadDetail (Main Content)
    ├── LeadHeader
    ├── AuditPanel
    │   ├── AuditContent
    │   ├── GapsList
    │   └── SourcesList
    ├── PitchConfigurator
    │   ├── ToneSelector
    │   ├── LengthSelector
    │   └── GenerateButton
    └── PitchDisplay
        ├── PitchContent
        └── ActionButtons
```

### Component Responsibilities

**App.tsx**
- Global state management
- Route coordination (future)
- Error boundary wrapper
- Theme provider (future)

**SearchHeader**
- Search form UI
- Input validation
- Submit handling

**LeadList**
- Display search results
- Handle lead selection
- Show loading states

**LeadCard**
- Individual lead preview
- Opportunity badges
- Click handler

**OpportunityBadge**
- Visual indicator
- Icon + label
- Color coding

**LeadDetail**
- Detail view container
- Tabs/sections
- Responsive layout

**AuditPanel**
- Audit results display
- Sources list
- Gaps visualization
- Refresh button

**PitchConfigurator**
- Tone/length controls
- Focus selection
- Generate trigger

**PitchDisplay**
- Formatted pitch text
- Copy to clipboard
- Edit functionality (future)

---

## State Management

### Current Approach: Component State

**Philosophy**: Keep it simple until complexity requires more

**State Location**:
```typescript
// App.tsx (top-level)
const [search, setSearch] = useState<SearchState>({});
const [leads, setLeads] = useState<BusinessLead[]>([]);
const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null);
const [audit, setAudit] = useState<BusinessAudit | null>(null);
const [pitch, setPitch] = useState<string | null>(null);
const [loading, setLoading] = useState({...});
const [error, setError] = useState<string | null>(null);
```

**Pros**:
- Simple to understand
- No external dependencies
- Fast to implement
- Works for current scale

**Cons**:
- Prop drilling (passing props down)
- Difficult to share state across distant components
- No built-in persistence
- Can become unwieldy at scale

### Future: Context + Hooks

**When to migrate**: When prop drilling becomes painful (>3 levels)

**Implementation**:
```typescript
// contexts/LeadContext.tsx
const LeadContext = createContext<LeadContextType | undefined>(undefined);

export const LeadProvider: React.FC<Props> = ({ children }) => {
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null);
  
  const value = { leads, selectedLead, setLeads, setSelectedLead };
  
  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>;
};

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (!context) throw new Error('useLeads must be used within LeadProvider');
  return context;
};
```

### Future: Zustand/Jotai (If Needed)

**When to consider**: If Context causes performance issues

**Benefits**:
- No provider hell
- Better performance (selective subscriptions)
- Built-in devtools
- Simpler API

---

## API Design

### Service Layer Philosophy

**Principles**:
1. Services expose high-level functions
2. Services handle API-specific details
3. Services transform data to match app types
4. Services don't manage UI state

**Example**:
```typescript
// Good: Clean interface, returns typed data
export const findLeads = async (
  niche: string, 
  city: string
): Promise<BusinessLead[]> => {
  // Internal implementation details hidden
};

// Bad: Leaks implementation details
export const callGeminiMapsAPI = (prompt: string): Promise<GeminiResponse> => {
  // Exposes Gemini-specific types
};
```

### Error Handling Strategy

**Levels**:
1. Service layer: Catch API errors, transform to app errors
2. Hook layer: Catch service errors, update error state
3. Component layer: Display error UI
4. Error boundary: Catch React errors

**Error Types**:
```typescript
enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  recoverable: boolean;
}
```

---

## AI Integration Strategy

### Model Selection Matrix

| Task | Model | Reason |
|------|-------|--------|
| Lead Discovery | gemini-2.5-flash-lite | Speed + Google Maps |
| Audit Analysis | gemini-3-flash-preview | Reasoning + Google Search |
| Pitch Generation | gemini-3-flash-preview | Creative writing quality |

### Prompt Engineering Principles

1. **Clear Role Definition**
   ```
   You are a world-class sales copywriter...
   ```

2. **Explicit Constraints**
   ```
   STRICT CONSTRAINTS:
   - TONE: Friendly
   - LENGTH: Medium
   ```

3. **Context Before Task**
   ```
   Context: [business details]
   Task: Write a pitch...
   ```

4. **Output Format Specification**
   ```
   Return ONLY valid JSON. No markdown.
   ```

5. **Examples (Few-shot)**
   ```
   Example 1: {...}
   Example 2: {...}
   Now do: {...}
   ```

### Grounding Strategy

**When to use grounding**:
- ✅ Need factual, up-to-date information
- ✅ Require source citations
- ✅ Real-world data queries

**When NOT to use grounding**:
- ❌ Creative writing (slows down, not needed)
- ❌ Logical reasoning (no external data needed)
- ❌ Simple transformations

---

## Security Architecture

### Current State (v0.1.0)

**Security Gaps**:
- ⚠️ API keys in client bundle (CRITICAL)
- ⚠️ No authentication
- ⚠️ No rate limiting
- ⚠️ No input sanitization

**Mitigations in Place**:
- ✅ Environment variables (not committed)
- ✅ HTTPS (in production)
- ✅ TypeScript (type safety)

### Target State (v0.3.0)

```
┌──────────────────┐
│  React Client    │
│  (Public)        │
└────────┬─────────┘
         │ HTTPS
         │ JWT Token
         ▼
┌──────────────────┐
│  Backend API     │
│  - Auth          │
│  - Rate Limit    │
│  - Validation    │
└────────┬─────────┘
         │ Server-side
         │ API Key (secure)
         ▼
┌──────────────────┐
│  Gemini API      │
└──────────────────┘
```

**Security Layers**:
1. **Client**: Input validation, HTTPS
2. **Backend**: Authentication, rate limiting, sanitization
3. **API**: Server-side API key storage

---

## Scalability Considerations

### Current Scalability

**Bottlenecks**:
- Client-side only (no caching)
- No database (session-based)
- No load balancing
- Single-region deployment

**Current Limits**:
- ~100 concurrent users (Gemini free tier)
- ~1,500 searches/day (API quota)
- No persistent data

### Scaling Path

**Phase 1: Backend API (v0.3)**
- Move to client-server architecture
- Add caching layer (Redis)
- Implement rate limiting

**Phase 2: Database (v0.5)**
- PostgreSQL for persistence
- User accounts
- Search history

**Phase 3: Infrastructure (v0.9)**
- Kubernetes orchestration
- Multi-region deployment
- CDN for static assets
- Read replicas for database

**Target Capacity (v1.0)**:
- 10,000+ concurrent users
- 99.9% uptime
- <2s response time (p95)

---

## Design Decisions Log

### Decision 1: Why React over Vue/Svelte?

**Context**: Need to choose frontend framework

**Decision**: React 19

**Rationale**:
- Largest ecosystem and community
- Better for hiring (more React devs)
- Mature tooling and libraries
- Strong TypeScript support

**Trade-offs**:
- More boilerplate than Vue/Svelte
- Steeper learning curve
- Larger bundle size

### Decision 2: Why Vite over Webpack?

**Context**: Need build tool

**Decision**: Vite 6.2

**Rationale**:
- 10x faster dev server
- Instant HMR
- Simpler configuration
- Modern tooling

**Trade-offs**:
- Less mature than Webpack
- Smaller plugin ecosystem
- Some edge cases not supported

### Decision 3: Why Tailwind over CSS-in-JS?

**Context**: Styling approach

**Decision**: Tailwind CSS

**Rationale**:
- Faster development
- Consistent design system
- Small production bundle
- No runtime cost

**Trade-offs**:
- Verbose HTML
- Learning curve for utility classes
- Less dynamic than CSS-in-JS

### Decision 4: Why Gemini over GPT/Claude?

**Context**: AI provider selection

**Decision**: Google Gemini

**Rationale**:
- Native Google Maps grounding (unique)
- Native Google Search grounding
- Cost-effective Flash models
- Fast inference times

**Trade-offs**:
- Less mature than GPT
- Potentially lower quality for some tasks
- Vendor lock-in risk

---

## Future Architecture Evolution

### v0.5: Client-Server Architecture

```
┌────────────┐      ┌────────────┐      ┌────────────┐
│   React    │─────▶│  Next.js   │─────▶│  Gemini    │
│   Client   │      │   Server   │      │    API     │
└────────────┘      └──────┬─────┘      └────────────┘
                           │
                           ▼
                    ┌────────────┐
                    │ PostgreSQL │
                    └────────────┘
```

### v0.9: Microservices

```
┌────────────┐           ┌─────────────────┐
│   React    │──────────▶│   API Gateway   │
│   Client   │           │  (Rate Limit)   │
└────────────┘           └────────┬────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
            ┌───────────┐ ┌───────────┐ ┌───────────┐
            │   Lead    │ │   Audit   │ │   Pitch   │
            │  Service  │ │  Service  │ │  Service  │
            └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
                  │             │             │
                  └─────────────┼─────────────┘
                                ▼
                    ┌───────────────────────┐
                    │  Shared Data Layer    │
                    │  (DB, Cache, Queue)   │
                    └───────────────────────┘
```

---

## Conclusion

The current architecture prioritizes:
1. **Simplicity**: Easy to understand and modify
2. **Speed**: Fast development and iteration
3. **Type Safety**: TypeScript throughout
4. **Modern Practices**: Latest React, Vite, etc.

Future evolution will add:
1. **Security**: Backend API, auth
2. **Scalability**: Microservices, caching
3. **Resilience**: Error handling, retries
4. **Observability**: Logging, monitoring

The architecture is designed to evolve incrementally without major rewrites.

---

**Last Updated**: 2024-12-30  
**Document Version**: 1.0
