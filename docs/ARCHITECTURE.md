# Architecture Documentation

## Overview

LocalLeadGenAI is a React-based single-page application that leverages Google's Gemini AI models with grounding capabilities to provide intelligent lead generation, business auditing, and personalized pitch creation for local businesses.

---

## System Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Client Browser                         │
│  ┌────────────────────────────────────────────────────┐  │
│  │              React Application (SPA)                │  │
│  │                                                     │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────┐ │  │
│  │  │   Search    │  │    Audit     │  │  Pitch   │ │  │
│  │  │   Module    │→│    Module    │→│  Module  │ │  │
│  │  └─────────────┘  └──────────────┘  └──────────┘ │  │
│  │         ↓                ↓                 ↓       │  │
│  │  ┌──────────────────────────────────────────────┐ │  │
│  │  │         Gemini Service Layer                 │ │  │
│  │  └──────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTPS
                         ↓
┌──────────────────────────────────────────────────────────┐
│                  Google Gemini API                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Model: gemini-2.5-flash-lite-latest                │  │
│  │  - Fast lead discovery                              │  │
│  │  - Google Maps grounding                            │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Model: gemini-3-flash-preview                      │  │
│  │  - Deep business analysis                           │  │
│  │  - Google Search grounding                          │  │
│  │  - Pitch generation                                 │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Application Layer (`App.tsx`)

**Purpose**: Main orchestrator component managing application state and user interactions.

**Responsibilities**:
- State management for leads, audits, and pitches
- Coordinating service calls
- UI rendering and event handling
- Error boundary management

**Key State**:
```typescript
{
  search: { niche: string, city: string },
  leads: BusinessLead[],
  selectedLead: BusinessLead | null,
  audit: BusinessAudit | null,
  pitch: string | null,
  loading: { leads: boolean, audit: boolean, pitch: boolean },
  error: string | null
}
```

### 2. Service Layer (`services/geminiService.ts`)

**Purpose**: Abstraction layer for all Gemini API interactions.

**Architecture Pattern**: Service-oriented architecture with clean separation.

#### Service Functions

##### `findLeads(niche: string, city: string)`
```typescript
Flow:
1. Initialize Gemini client with API key
2. Send prompt with Google Maps grounding enabled
3. Parse JSON response with safe parsing
4. Analyze each lead for opportunities
5. Return structured BusinessLead array
```

**Model**: `gemini-2.5-flash-lite-latest` (optimized for speed)  
**Grounding**: Google Maps  
**Output**: Array of 12 businesses with metadata

##### `auditBusiness(lead: BusinessLead)`
```typescript
Flow:
1. Generate audit prompt with specific criteria
2. Call Gemini with Google Search grounding
3. Extract grounding sources (URIs and titles)
4. Generate follow-up prompt for gap analysis
5. Parse gaps as structured JSON array
6. Return comprehensive BusinessAudit object
```

**Model**: `gemini-3-flash-preview` (optimized for depth)  
**Grounding**: Google Search  
**Output**: Audit content, sources, and identified gaps

##### `generatePitch(lead, audit, focus, tone, length)`
```typescript
Flow:
1. Determine pitch type (automation vs. website)
2. Build context-rich prompt with audit data
3. Apply tone and length constraints
4. Generate personalized sales copy
5. Return formatted pitch text
```

**Model**: `gemini-3-flash-preview`  
**Grounding**: None (creative generation)  
**Output**: Personalized pitch text

### 3. Utility Layer

#### `utils/validation.ts`
- Environment variable validation
- API key verification
- Safe JSON parsing with fallbacks
- Error handling utilities

#### `utils/leadAnalyzer.ts`
- Business opportunity identification
- Lead scoring algorithm
- Unique ID generation

### 4. Configuration Layer (`config/constants.ts`)

Centralized configuration management:
- API model names
- Business logic thresholds
- UI defaults
- Error messages

**Benefits**:
- Single source of truth
- Easy maintenance
- Type-safe constants
- No magic strings

### 5. Component Layer

#### `components/OpportunityBadge.tsx`
Reusable UI component for displaying opportunity types with:
- Dynamic styling based on type
- Icon mapping
- Consistent theming

---

## Data Flow

### Lead Discovery Flow
```
User Input (Niche + City)
    ↓
findLeads() Service Call
    ↓
Gemini API (Google Maps Grounding)
    ↓
JSON Response Parsing
    ↓
Opportunity Analysis
    ↓
State Update (leads array)
    ↓
UI Rendering (Lead List)
```

### Audit Flow
```
User Selects Lead
    ↓
auditBusiness() Service Call
    ↓
Gemini API (Google Search Grounding)
    ↓
Extract Sources + Content
    ↓
Gap Analysis (Secondary API Call)
    ↓
State Update (audit object)
    ↓
UI Rendering (Audit View + Sources)
```

### Pitch Generation Flow
```
User Configures Pitch (Tone + Length + Type)
    ↓
generatePitch() Service Call
    ↓
Gemini API (Creative Generation)
    ↓
Personalized Copy
    ↓
State Update (pitch string)
    ↓
UI Rendering (Pitch View)
```

---

## Design Patterns

### 1. **Service Pattern**
All external API calls isolated in service layer, promoting:
- Testability
- Reusability
- Maintainability

### 2. **Configuration Management**
Constants extracted to dedicated configuration files:
- Prevents magic numbers/strings
- Enables easy updates
- Type-safe access

### 3. **Utility Functions**
Reusable logic extracted to utilities:
- DRY principle
- Single responsibility
- Easy testing

### 4. **Component Composition**
React components follow composition pattern:
- Small, focused components
- Props-based communication
- Reusability

### 5. **Error Handling**
Consistent error handling strategy:
- Try-catch blocks in async operations
- User-friendly error messages
- Graceful degradation

---

## State Management

### Local State (React Hooks)
- Uses `useState` for component-level state
- No external state management library needed (current scale)
- Clear data flow with prop drilling minimized

### Future Considerations
For scaling, consider:
- Context API for shared state
- React Query for server state
- Zustand/Redux for complex state

---

## Performance Considerations

### Current Optimizations
1. **Lazy Loading**: Components load on demand
2. **Memoization**: React's built-in optimizations
3. **Fast Models**: Using lite models where appropriate
4. **Efficient Rendering**: Minimal re-renders with proper state structure

### Future Optimizations
1. **Caching**: Cache audit results
2. **Debouncing**: Debounce search inputs
3. **Pagination**: Paginate large lead lists
4. **Code Splitting**: Split bundles by route

---

## Security Architecture

### Current Security Measures
1. **Environment Variables**: API keys in `.env.local`
2. **Client-Side**: No sensitive data storage
3. **HTTPS**: All API calls over HTTPS
4. **Input Validation**: Basic validation in place

### Security Recommendations
1. **Backend Proxy**: Move API calls to backend
2. **Rate Limiting**: Implement request throttling
3. **Input Sanitization**: Enhanced validation
4. **Auth System**: User authentication
5. **API Key Rotation**: Regular key updates

---

## Scalability

### Current Limitations
- Client-side API calls expose rate limits
- No caching mechanism
- No data persistence
- Single-user design

### Scaling Strategy
1. **Backend API**: Node.js/Express proxy
2. **Database**: PostgreSQL for data persistence
3. **Caching**: Redis for frequently accessed data
4. **Queue System**: Bull/RabbitMQ for batch processing
5. **Load Balancing**: Horizontal scaling capability

---

## Testing Strategy

### Current State
- No automated tests (MVP phase)
- Manual testing performed

### Recommended Testing Pyramid
```
       ┌─────────────┐
       │   E2E Tests │  (Playwright/Cypress)
       └─────────────┘
      ┌───────────────┐
      │ Integration   │   (React Testing Library)
      └───────────────┘
    ┌──────────────────┐
    │   Unit Tests     │    (Jest/Vitest)
    └──────────────────┘
```

### Test Coverage Goals
- Unit Tests: 80%+ for utilities and services
- Integration Tests: Key user flows
- E2E Tests: Critical paths (search → audit → pitch)

---

## Deployment Architecture

### Current Deployment
- Static site hosting via AI Studio
- Client-side rendering only

### Recommended Production Setup
```
┌──────────────┐
│   Cloudflare │  CDN + DDoS Protection
└──────┬───────┘
       ↓
┌──────────────┐
│   Vercel/    │  Static Hosting
│   Netlify    │  (Frontend)
└──────┬───────┘
       ↓
┌──────────────┐
│   Backend    │  Node.js API
│   (Railway/  │  (API Proxy)
│   Render)    │
└──────┬───────┘
       ↓
┌──────────────┐
│  Gemini API  │  AI Processing
└──────────────┘
```

---

## Technology Decisions

### Why React 19?
- Latest features and performance improvements
- Strong ecosystem and community
- Component-based architecture
- Excellent TypeScript support

### Why Vite?
- Lightning-fast HMR
- Modern build tool
- Minimal configuration
- Excellent TypeScript support

### Why Gemini API?
- Google Maps grounding (accurate local data)
- Google Search grounding (real-time web data)
- Cost-effective
- Fast response times
- Structured output support

### Why TypeScript?
- Type safety prevents runtime errors
- Better IDE support
- Self-documenting code
- Refactoring confidence

### Why No Backend (Currently)?
- Faster MVP development
- Lower hosting costs
- Simpler deployment
- Good enough for prototype phase

---

## Future Architecture Evolution

### Phase 1: Current (MVP)
- Client-side SPA
- Direct API calls
- No persistence

### Phase 2: Backend Integration (Q1 2025)
```
Frontend → Backend API → Gemini API
                ↓
            Database
```

### Phase 3: Microservices (Q2 2025)
```
Frontend → API Gateway → [Lead Service]
                      → [Audit Service]
                      → [Pitch Service]
                      → [Analytics Service]
```

### Phase 4: Full Platform (Q3 2025)
- Multi-tenant architecture
- Real-time collaboration
- Advanced analytics
- Mobile apps

---

## Conclusion

LocalLeadGenAI employs a clean, modular architecture suitable for its current MVP stage while being designed with future scalability in mind. The service-oriented approach, centralized configuration, and utility-based design provide a solid foundation for growth.

For questions or suggestions about the architecture, please open an issue on GitHub.
