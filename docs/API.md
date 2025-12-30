# API Documentation

## Overview

This document provides comprehensive documentation for all API functions, utilities, and services in LocalLeadGenAI.

---

## Table of Contents

- [Services](#services)
  - [Gemini Service](#gemini-service)
- [Utilities](#utilities)
  - [Validation](#validation)
  - [Lead Analyzer](#lead-analyzer)
- [Types](#types)
- [Configuration](#configuration)

---

## Services

### Gemini Service

Located in: `services/geminiService.ts`

#### `findLeads(niche: string, city: string): Promise<BusinessLead[]>`

Searches for local businesses using Google Maps grounding.

**Parameters**:
- `niche` (string): Business type or industry (e.g., "Dentist", "Roofer")
- `city` (string): Location to search (e.g., "Austin, TX")

**Returns**: `Promise<BusinessLead[]>` - Array of business leads

**Example**:
```typescript
const leads = await findLeads("Dentist", "Austin, TX");
// Returns: Array of 12 BusinessLead objects
```

**Business Lead Structure**:
```typescript
{
  id: string,                    // Unique identifier
  name: string,                  // Business name
  address: string,               // Full address
  rating: number,                // Rating 0-5
  reviews: number,               // Number of reviews
  website?: string,              // Optional website URL
  opportunities: OpportunityType[] // Array of identified opportunities
}
```

**AI Model Used**: `gemini-2.5-flash-lite-latest`

**Grounding**: Google Maps

**Error Handling**:
- Throws error if API key is missing
- Returns empty array on parse failure
- Network errors propagated to caller

---

#### `auditBusiness(lead: BusinessLead): Promise<BusinessAudit>`

Performs comprehensive digital presence audit for a business.

**Parameters**:
- `lead` (BusinessLead): The business to audit

**Returns**: `Promise<BusinessAudit>` - Audit results with sources and gaps

**Example**:
```typescript
const audit = await auditBusiness(selectedLead);
// Returns: BusinessAudit object with content, sources, and gaps
```

**Business Audit Structure**:
```typescript
{
  content: string,              // Detailed audit text
  sources: Array<{              // Grounding sources
    title: string,
    uri: string
  }>,
  gaps: string[]                // Identified missing features
}
```

**AI Model Used**: `gemini-3-flash-preview`

**Grounding**: Google Search

**Process**:
1. Searches for business website and social media
2. Analyzes digital presence (booking, chatbot, design)
3. Extracts verifiable sources
4. Identifies specific gaps using structured JSON

**Audit Criteria**:
- Online booking/scheduling system
- AI chatbot presence
- Website age (copyright year)
- Social media activity
- Mobile responsiveness
- SEO optimization

---

#### `generatePitch(lead: BusinessLead, audit: BusinessAudit, pitchFocus: string, tone: string, length: string): Promise<string>`

Generates personalized sales pitch based on audit findings.

**Parameters**:
- `lead` (BusinessLead): Target business
- `audit` (BusinessAudit): Audit results
- `pitchFocus` (string): 'automation' or 'website'
- `tone` (string): 'Formal', 'Friendly', or 'Urgent'
- `length` (string): 'Short', 'Medium', or 'Long'

**Returns**: `Promise<string>` - Personalized pitch text

**Example**:
```typescript
const pitch = await generatePitch(
  lead,
  audit,
  'automation',
  'Friendly',
  'Medium'
);
// Returns: Personalized sales pitch text
```

**Pitch Types**:

1. **Automation Focus**
   - Emphasizes AI chatbots, booking systems
   - Highlights efficiency gains
   - Addresses specific gaps from audit

2. **Website Launchpad**
   - For businesses without websites
   - Focuses on online visibility
   - Emphasizes SEO and digital authority

**AI Model Used**: `gemini-3-flash-preview`

**Grounding**: None (creative generation)

---

## Utilities

### Validation

Located in: `utils/validation.ts`

#### `validateEnvironment(): void`

Validates that required environment variables are present.

**Throws**: Error if `GEMINI_API_KEY` is not configured

**Example**:
```typescript
try {
  validateEnvironment();
} catch (error) {
  console.error('Environment not configured:', error);
}
```

---

#### `isValidApiKey(apiKey: string | undefined): boolean`

Checks if an API key is valid (non-empty string).

**Parameters**:
- `apiKey` (string | undefined): API key to validate

**Returns**: `boolean` - True if valid

**Example**:
```typescript
if (isValidApiKey(process.env.API_KEY)) {
  // Proceed with API call
}
```

---

#### `safeJsonParse<T>(text: string, fallback: T): T`

Safely parses JSON with regex extraction and fallback.

**Parameters**:
- `text` (string): Text containing JSON
- `fallback` (T): Default value if parsing fails

**Returns**: `T` - Parsed object or fallback

**Example**:
```typescript
const data = safeJsonParse<Lead[]>(response.text, []);
// Returns: Parsed array or empty array on failure
```

**Features**:
- Extracts JSON from markdown code blocks
- Handles malformed responses
- Logs errors for debugging
- Type-safe with generics

---

### Lead Analyzer

Located in: `utils/leadAnalyzer.ts`

#### `identifyOpportunities(rating: number, reviews: number, hasWebsite: boolean): OpportunityType[]`

Analyzes business metrics to identify sales opportunities.

**Parameters**:
- `rating` (number): Business rating (0-5)
- `reviews` (number): Number of reviews
- `hasWebsite` (boolean): Whether business has website

**Returns**: `OpportunityType[]` - Array of opportunities

**Example**:
```typescript
const opportunities = identifyOpportunities(3.8, 50, false);
// Returns: [OpportunityType.LOW_REPUTATION, OpportunityType.MISSING_INFO]
```

**Logic**:
- **LOW_REPUTATION**: rating < 4.0
- **UNDERVALUED**: rating > 4.5 AND reviews < 20
- **MISSING_INFO**: hasWebsite === false

**Thresholds** (configurable in `config/constants.ts`):
```typescript
LEAD_THRESHOLDS = {
  LOW_REPUTATION_RATING: 4.0,
  UNDERVALUED_RATING: 4.5,
  UNDERVALUED_MAX_REVIEWS: 20,
}
```

---

#### `generateLeadId(index: number): string`

Generates unique identifier for a business lead.

**Parameters**:
- `index` (number): Lead index in array

**Returns**: `string` - Unique ID

**Example**:
```typescript
const id = generateLeadId(0);
// Returns: "lead-0-1735527492813"
```

**Format**: `lead-{index}-{timestamp}`

---

## Types

Located in: `types.ts`

### `OpportunityType` (Enum)

```typescript
enum OpportunityType {
  LOW_REPUTATION = 'Low Reputation',
  UNDERVALUED = 'Undervalued',
  MISSING_INFO = 'Missing Info'
}
```

### `BusinessLead` (Interface)

```typescript
interface BusinessLead {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  website?: string;
  opportunities: OpportunityType[];
}
```

### `BusinessAudit` (Interface)

```typescript
interface BusinessAudit {
  content: string;
  sources: { title: string; uri: string }[];
  gaps: string[];
}
```

### `SearchState` (Interface)

```typescript
interface SearchState {
  niche: string;
  city: string;
}
```

---

## Configuration

Located in: `config/constants.ts`

### `API_CONFIG`

```typescript
{
  GEMINI_MODELS: {
    FLASH_LITE: 'gemini-2.5-flash-lite-latest',
    FLASH_PREVIEW: 'gemini-3-flash-preview',
  },
  DEFAULT_LEAD_COUNT: 12,
  TIMEOUT_MS: 30000,
}
```

### `LEAD_THRESHOLDS`

```typescript
{
  LOW_REPUTATION_RATING: 4.0,
  UNDERVALUED_RATING: 4.5,
  UNDERVALUED_MAX_REVIEWS: 20,
}
```

### `UI_CONFIG`

```typescript
{
  DEFAULT_NICHE: 'Dentist',
  DEFAULT_CITY: 'Austin, TX',
  PITCH_TONES: ['Formal', 'Friendly', 'Urgent'],
  PITCH_LENGTHS: ['Short', 'Medium', 'Long'],
}
```

### `ERROR_MESSAGES`

```typescript
{
  LEAD_FETCH_FAILED: 'Failed to fetch leads',
  AUDIT_FAILED: 'Audit failed. Please try refreshing or selecting another lead.',
  PITCH_GENERATION_FAILED: 'Pitch generation failed.',
  API_KEY_MISSING: 'GEMINI_API_KEY is not configured. Please check your environment variables.',
}
```

---

## Rate Limits

### Gemini API

Limits vary by API tier. Free tier typically includes:
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per minute

**Recommendations**:
- Implement client-side throttling
- Add retry logic with exponential backoff
- Cache results where appropriate
- Consider upgrading for production use

---

## Error Handling

### Standard Error Response

All service functions use try-catch blocks and throw descriptive errors:

```typescript
try {
  const result = await findLeads(niche, city);
} catch (error) {
  if (error.message.includes('API key')) {
    // Handle auth error
  } else if (error.message.includes('rate limit')) {
    // Handle rate limit
  } else {
    // Handle general error
  }
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `API_KEY_MISSING` | No env variable | Set `GEMINI_API_KEY` |
| `429 Too Many Requests` | Rate limit hit | Implement throttling |
| `Parse error` | Malformed response | Using `safeJsonParse` |
| `Network error` | Connection issue | Add retry logic |

---

## Best Practices

### When Using the API

1. **Always validate environment** before calls
2. **Implement loading states** for better UX
3. **Handle errors gracefully** with user feedback
4. **Cache results** when appropriate
5. **Debounce user inputs** to prevent excessive calls
6. **Use TypeScript** for type safety
7. **Log errors** for debugging

### Example Pattern

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSearch = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const results = await findLeads(niche, city);
    setLeads(results);
  } catch (err: any) {
    setError(err.message || 'An error occurred');
    console.error('Search failed:', err);
  } finally {
    setLoading(false);
  }
};
```

---

## Testing Examples

### Unit Test Example (Vitest/Jest)

```typescript
import { identifyOpportunities } from './utils/leadAnalyzer';
import { OpportunityType } from './types';

describe('identifyOpportunities', () => {
  it('identifies low reputation', () => {
    const result = identifyOpportunities(3.5, 100, true);
    expect(result).toContain(OpportunityType.LOW_REPUTATION);
  });

  it('identifies missing website', () => {
    const result = identifyOpportunities(4.5, 50, false);
    expect(result).toContain(OpportunityType.MISSING_INFO);
  });

  it('identifies undervalued business', () => {
    const result = identifyOpportunities(4.8, 15, true);
    expect(result).toContain(OpportunityType.UNDERVALUED);
  });
});
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12-30 | Initial API documentation |

---

## Support

For API questions or issues:
- Open an issue on [GitHub](https://github.com/Krosebrook/LocalLeadGenAI/issues)
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- See [gemini.md](gemini.md) for Gemini-specific details

---

**Last Updated**: December 30, 2024
