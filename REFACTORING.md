# Code Refactoring & Architectural Recommendations

This document provides detailed recommendations for improving the LocalLeadGenAI codebase through refactoring, architectural enhancements, and best practices.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Analysis](#architecture-analysis)
3. [Refactoring Opportunities](#refactoring-opportunities)
4. [Bug Fixes & Edge Cases](#bug-fixes--edge-cases)
5. [Security Improvements](#security-improvements)
6. [Performance Optimizations](#performance-optimizations)
7. [Code Quality Enhancements](#code-quality-enhancements)
8. [Configuration Management](#configuration-management)
9. [Testing Strategy](#testing-strategy)
10. [Implementation Priority](#implementation-priority)

---

## Executive Summary

### Current State Assessment

**Strengths:**
- Clean, modern React/TypeScript codebase
- Well-structured component hierarchy
- Type safety throughout
- Good separation between UI and service layers
- Effective use of AI capabilities

**Areas for Improvement:**
- API keys exposed in client bundle (critical security issue)
- No error boundaries for React errors
- Limited input validation
- No retry logic for failed API calls
- Monolithic components (App.tsx is 420+ lines)
- No configuration abstraction
- Missing accessibility features
- No performance monitoring

**Priority Ranking:**
1. 🔴 **Critical**: Security (API keys)
2. 🟠 **High**: Error handling and validation
3. 🟡 **Medium**: Code organization and modularity
4. 🟢 **Low**: Performance optimizations and polish

---

## Architecture Analysis

### Current Architecture

```
┌─────────────────────────────────────────────────┐
│           Browser (Client-Side Only)            │
├─────────────────────────────────────────────────┤
│  App.tsx (420 lines - UI + State Management)    │
│    ├── Components (OpportunityBadge)            │
│    └── Services (geminiService)                 │
│         └── Gemini API (Direct calls)           │
└─────────────────────────────────────────────────┘
```

**Issues:**
- All logic in client (security risk)
- API keys in bundle
- No separation of concerns at scale
- Difficult to test
- Can't implement rate limiting

### Recommended Architecture

```
┌──────────────────┐      ┌──────────────────┐
│   React Client   │─────▶│   Backend API    │
│   (UI Only)      │      │   (Node.js)      │
└──────────────────┘      └──────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              ┌──────────┐   ┌──────────┐   ┌──────────┐
              │  Gemini  │   │ Database │   │  Cache   │
              │   API    │   │          │   │  (Redis) │
              └──────────┘   └──────────┘   └──────────┘
```

**Benefits:**
- API keys secured on server
- Rate limiting and authentication
- Caching layer for performance
- Data persistence
- Easier monitoring and logging
- Testable business logic

---

## Refactoring Opportunities

### 1. Extract Custom Hooks

**Current Problem:** State logic mixed with UI in App.tsx

**Recommendation:** Extract reusable hooks

```typescript
// hooks/useLeadSearch.ts
export const useLeadSearch = () => {
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLeads = async (niche: string, city: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await findLeads(niche, city);
      setLeads(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { leads, loading, error, searchLeads };
};

// Usage in App.tsx
const { leads, loading, error, searchLeads } = useLeadSearch();
```

**Impact:**
- Reduces App.tsx from 420 to ~300 lines
- Makes logic reusable
- Easier to test in isolation

### 2. Split App.tsx into Multiple Components

**Current Problem:** App.tsx handles everything (search, list, detail, audit, pitch)

**Recommendation:** Create focused components

```typescript
// components/SearchHeader.tsx
export const SearchHeader: React.FC<Props> = ({ onSearch }) => {
  // Search form logic
};

// components/LeadList.tsx
export const LeadList: React.FC<Props> = ({ leads, onSelectLead }) => {
  // Lead list rendering
};

// components/LeadDetail.tsx
export const LeadDetail: React.FC<Props> = ({ lead, audit, pitch }) => {
  // Detail view with tabs
};

// components/AuditPanel.tsx
export const AuditPanel: React.FC<Props> = ({ audit, loading }) => {
  // Audit display logic
};

// components/PitchGenerator.tsx
export const PitchGenerator: React.FC<Props> = ({ onGenerate, pitch }) => {
  // Pitch configuration and display
};

// App.tsx (simplified)
export default function App() {
  const { leads, searchLeads } = useLeadSearch();
  const { selectedLead, selectLead } = useLeadSelection();
  const { audit, auditLead } = useAudit();
  const { pitch, generatePitch } = usePitchGeneration();

  return (
    <div>
      <SearchHeader onSearch={searchLeads} />
      <main>
        <LeadList leads={leads} onSelectLead={selectLead} />
        <LeadDetail lead={selectedLead}>
          <AuditPanel audit={audit} />
          <PitchGenerator onGenerate={generatePitch} pitch={pitch} />
        </LeadDetail>
      </main>
    </div>
  );
}
```

**Benefits:**
- Each component <150 lines
- Single responsibility principle
- Easier to test
- Reusable components

### 3. Create Service Layer with Error Handling

**Current Problem:** geminiService has no retry logic or sophisticated error handling

**Recommendation:** Wrap service with resilience patterns

```typescript
// services/resilientService.ts
import pRetry from 'p-retry';

export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: pRetry.Options = {}
): Promise<T> => {
  return pRetry(fn, {
    retries: 3,
    onFailedAttempt: (error) => {
      console.warn(`Attempt ${error.attemptNumber} failed. Retries left: ${error.retriesLeft}`);
    },
    ...options,
  });
};

export const withCache = async <T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 3600
): Promise<T> => {
  const cached = localStorage.getItem(key);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < ttl * 1000) {
      return data;
    }
  }
  
  const data = await fn();
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  return data;
};

// Enhanced geminiService
export const findLeadsResilient = async (niche: string, city: string) => {
  return withRetry(() => findLeads(niche, city));
};

export const auditBusinessCached = async (lead: BusinessLead) => {
  return withCache(
    `audit_${lead.id}`,
    () => withRetry(() => auditBusiness(lead)),
    3600 // 1 hour cache
  );
};
```

**Benefits:**
- Automatic retries on failure
- Caching reduces API costs
- Better user experience

### 4. Create Configuration Module

**Current Problem:** Magic strings and numbers scattered throughout code

**Recommendation:** Centralize configuration

```typescript
// config/app.config.ts
export const APP_CONFIG = {
  api: {
    retries: 3,
    timeout: 30000,
    cacheTTL: 3600,
  },
  search: {
    maxLeads: 12,
    defaultNiche: 'Dentist',
    defaultCity: 'Austin, TX',
  },
  opportunities: {
    lowReputationThreshold: 4.0,
    undervaluedRatingMin: 4.5,
    undervaluedReviewsMax: 20,
  },
  pitch: {
    tones: ['Formal', 'Friendly', 'Urgent'] as const,
    lengths: ['Short', 'Medium', 'Long'] as const,
    defaultTone: 'Friendly' as const,
    defaultLength: 'Medium' as const,
  },
} as const;

// Usage
if (item.rating < APP_CONFIG.opportunities.lowReputationThreshold) {
  opportunities.push(OpportunityType.LOW_REPUTATION);
}
```

**Benefits:**
- Single source of truth
- Easy to adjust thresholds
- Type-safe configuration
- Enables environment-specific configs

### 5. Add Validation Layer

**Current Problem:** No input validation before API calls

**Recommendation:** Use Zod for runtime validation

```typescript
// validation/schemas.ts
import { z } from 'zod';

export const SearchInputSchema = z.object({
  niche: z.string()
    .min(2, 'Niche must be at least 2 characters')
    .max(100, 'Niche too long'),
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City too long')
    .regex(/^[a-zA-Z\s,]+$/, 'Invalid city format'),
});

export const PitchOptionsSchema = z.object({
  tone: z.enum(['Formal', 'Friendly', 'Urgent']),
  length: z.enum(['Short', 'Medium', 'Long']),
  focus: z.enum(['automation', 'website']),
});

// Usage in component
const handleSearch = () => {
  const result = SearchInputSchema.safeParse({ niche, city });
  if (!result.success) {
    setError(result.error.errors[0].message);
    return;
  }
  searchLeads(result.data.niche, result.data.city);
};
```

**Benefits:**
- Prevents invalid API calls
- Better error messages
- Type safety at runtime
- Self-documenting validation rules

---

## Bug Fixes & Edge Cases

### Critical Bugs

#### 1. Race Condition in Concurrent Audits

**Bug:** Clicking multiple leads rapidly causes incorrect audit display

**Root Cause:** State updates from previous audit overwrite current one

**Fix:**
```typescript
const handleAudit = async (lead: BusinessLead) => {
  const auditId = Date.now(); // Unique ID for this audit
  setCurrentAuditId(auditId);
  setSelectedLead(lead);
  setLoading(true);
  
  try {
    const result = await auditBusiness(lead);
    // Only update if this is still the current audit
    if (currentAuditId === auditId) {
      setAudit(result);
    }
  } finally {
    if (currentAuditId === auditId) {
      setLoading(false);
    }
  }
};
```

#### 2. JSON Parsing Failures

**Bug:** Sometimes Gemini returns non-JSON text, causing crashes

**Current Implementation:**
```typescript
const jsonMatch = text.match(/\[[\s\S]*\]/);
const rawData = JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
```

**Issues:**
- Matches first array, might not be the right one
- No validation of JSON structure
- No fallback for malformed data

**Improved Fix:**
```typescript
const parseGeminiJSON = <T>(text: string, fallback: T): T => {
  try {
    // Try parsing entire response first
    return JSON.parse(text);
  } catch {
    try {
      // Extract JSON from markdown
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                        text.match(/\[[\s\S]*\]/) ||
                        text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
    } catch {
      console.error('Failed to parse Gemini response:', text);
    }
  }
  return fallback;
};

// Usage
const rawData = parseGeminiJSON<any[]>(text, []);
```

### Edge Cases

#### 1. Empty Search Results

**Current:** Shows empty state, but no guidance

**Improvement:**
```typescript
{!loading && leads.length === 0 && searchAttempted && (
  <div className="empty-state">
    <p>No leads found for "{search.niche}" in "{search.city}"</p>
    <div className="suggestions">
      <h4>Try:</h4>
      <ul>
        <li>Using a broader location (e.g., state instead of city)</li>
        <li>Different business type (e.g., "Restaurant" vs "Italian Restaurant")</li>
        <li>Checking spelling of location</li>
      </ul>
    </div>
  </div>
)}
```

#### 2. API Rate Limit Exceeded

**Current:** Generic error message

**Improvement:**
```typescript
catch (err: any) {
  if (err.message?.includes('quota') || err.message?.includes('rate limit')) {
    setError('API rate limit exceeded. Please wait a few minutes and try again.');
    // Show countdown timer
    setRetryAfter(Date.now() + 60000); // 1 minute
  } else if (err.message?.includes('API key')) {
    setError('Invalid API key. Please check your configuration.');
  } else {
    setError('An unexpected error occurred. Please try again.');
  }
}
```

#### 3. Very Long Business Names

**Current:** Text overflows container

**Fix:**
```typescript
<h3 className="font-bold text-slate-100 truncate max-w-[250px]" title={lead.name}>
  {lead.name}
</h3>
```

#### 4. Network Timeout

**Current:** Hangs indefinitely

**Fix:**
```typescript
const fetchWithTimeout = async (fn: () => Promise<any>, timeout = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const result = await fn();
    clearTimeout(timeoutId);
    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  }
};
```

---

## Security Improvements

### 1. Move API Keys to Backend (Critical)

**Current Issue:** API keys in client bundle

**Solution:** Create backend proxy

```typescript
// backend/api/leads.ts (Next.js API route example)
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // Validate request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { niche, city } = req.body;
  
  // Validate inputs
  if (!niche || !city) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (await isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  try {
    // API key is secure on server
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const results = await findLeads(niche, city);
    res.status(200).json({ leads: results });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// client side
const response = await fetch('/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ niche, city }),
});
```

### 2. Add Content Security Policy

```typescript
// vite.config.ts or server config
headers: {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' https://cdn.tailwindcss.com https://esm.sh",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.example.com",
  ].join('; '),
}
```

### 3. Sanitize User Inputs

```typescript
import DOMPurify from 'dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

// Before using in prompt
const safeNiche = sanitizeInput(search.niche);
const safeCity = sanitizeInput(search.city);
```

### 4. Implement Rate Limiting (Client-Side)

```typescript
class RateLimiter {
  private requests: number[] = [];
  
  async checkLimit(maxRequests: number, windowMs: number): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < windowMs);
    
    if (this.requests.length >= maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = windowMs - (now - oldestRequest);
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)}s`);
    }
    
    this.requests.push(now);
  }
}

const rateLimiter = new RateLimiter();

// Before API call
await rateLimiter.checkLimit(10, 60000); // 10 requests per minute
```

---

## Performance Optimizations

### 1. Code Splitting

```typescript
// Lazy load heavy components
const LeadDetail = lazy(() => import('./components/LeadDetail'));
const PitchGenerator = lazy(() => import('./components/PitchGenerator'));

<Suspense fallback={<Loader />}>
  <LeadDetail lead={selectedLead} />
</Suspense>
```

### 2. Memoization

```typescript
// Expensive computations
const sortedLeads = useMemo(() => {
  return leads.sort((a, b) => {
    const aScore = calculateOpportunityScore(a);
    const bScore = calculateOpportunityScore(b);
    return bScore - aScore;
  });
}, [leads]);

// Callbacks
const handleSelectLead = useCallback((lead: BusinessLead) => {
  setSelectedLead(lead);
  auditLead(lead);
}, [auditLead]);
```

### 3. Virtual Scrolling

```typescript
// For large lead lists (>50 items)
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={800}
  itemCount={leads.length}
  itemSize={120}
  width="100%"
>
  {({ index, style }) => (
    <LeadCard lead={leads[index]} style={style} />
  )}
</FixedSizeList>
```

### 4. Debounce Search Input

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (niche: string, city: string) => {
    handleSearch(niche, city);
  },
  500 // Wait 500ms after user stops typing
);
```

---

## Code Quality Enhancements

### 1. Add Error Boundaries

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage in App
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 2. Add PropTypes/Interface Documentation

```typescript
/**
 * OpportunityBadge displays a visual indicator for lead opportunities
 * 
 * @param type - The type of opportunity (LOW_REPUTATION, UNDERVALUED, MISSING_INFO)
 * @example
 * <OpportunityBadge type={OpportunityType.LOW_REPUTATION} />
 */
interface OpportunityBadgeProps {
  /** The opportunity type to display */
  type: OpportunityType;
  /** Optional className for custom styling */
  className?: string;
}
```

### 3. Add Logging Utility

```typescript
// utils/logger.ts
const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, data);
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    // Send to error tracking service in production
  },
};
```

---

## Configuration Management

### Environment Variables Structure

```bash
# .env.local (development)
GEMINI_API_KEY=your_key_here
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENABLE_ANALYTICS=false

# .env.production
GEMINI_API_KEY=prod_key_here
NODE_ENV=production
VITE_API_BASE_URL=https://api.leadgenai.com
VITE_ENABLE_ANALYTICS=true
```

### Validation

```typescript
// config/validateEnv.ts
import { z } from 'zod';

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  VITE_API_BASE_URL: z.string().url(),
});

export const validateEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
};
```

---

## Testing Strategy

### Unit Tests

```typescript
// services/geminiService.test.ts
describe('findLeads', () => {
  it('should return array of business leads', async () => {
    const leads = await findLeads('Dentist', 'Austin, TX');
    expect(Array.isArray(leads)).toBe(true);
    expect(leads[0]).toHaveProperty('name');
    expect(leads[0]).toHaveProperty('rating');
  });
  
  it('should classify opportunities correctly', async () => {
    // Mock lead with rating < 4.0
    const lowRatingLead = { rating: 3.5, reviews: 50, website: 'example.com' };
    const opportunities = classifyOpportunities(lowRatingLead);
    expect(opportunities).toContain(OpportunityType.LOW_REPUTATION);
  });
});
```

### Component Tests

```typescript
// components/OpportunityBadge.test.tsx
import { render, screen } from '@testing-library/react';

describe('OpportunityBadge', () => {
  it('renders low reputation badge correctly', () => {
    render(<OpportunityBadge type={OpportunityType.LOW_REPUTATION} />);
    expect(screen.getByText('Low Reputation')).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
// e2e/lead-search.spec.ts
test('complete lead discovery flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Enter search params
  await page.fill('[placeholder*="Industry"]', 'Dentist');
  await page.fill('[placeholder*="City"]', 'Austin, TX');
  await page.click('button:has-text("FIND LEADS")');
  
  // Wait for results
  await page.waitForSelector('.lead-card', { timeout: 15000 });
  
  // Click first lead
  await page.click('.lead-card:first-child');
  
  // Verify audit loads
  await page.waitForSelector('text=Digital Presence Audit');
});
```

---

## Implementation Priority

### Phase 1: Critical (Week 1)
1. ✅ Move API keys to backend
2. ✅ Add error boundaries
3. ✅ Fix JSON parsing edge cases
4. ✅ Add input validation

### Phase 2: High (Week 2-3)
1. ✅ Extract custom hooks
2. ✅ Add retry logic
3. ✅ Implement rate limiting
4. ✅ Split App.tsx into components

### Phase 3: Medium (Week 4-6)
1. ✅ Add caching layer
2. ✅ Create configuration module
3. ✅ Add comprehensive logging
4. ✅ Write unit tests

### Phase 4: Low (Week 7-8)
1. ✅ Performance optimizations
2. ✅ Code splitting
3. ✅ Accessibility improvements
4. ✅ Documentation updates

---

## Conclusion

These refactoring recommendations will significantly improve the LocalLeadGenAI codebase in terms of:

- **Security**: API keys secured, inputs validated
- **Reliability**: Error handling, retries, validation
- **Maintainability**: Modular code, clear structure
- **Performance**: Caching, optimization, code splitting
- **Quality**: Tests, documentation, best practices

**Estimated Effort**: 4-8 weeks for full implementation

**ROI**: 10x improvement in code quality, security, and maintainability

---

**Last Updated**: 2024-12-30  
**Document Version**: 1.0
