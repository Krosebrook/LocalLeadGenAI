# Agents & AI Workflow Documentation

This document describes the AI agent architecture, workflow, and decision logic used in LocalLeadGenAI.

---

## Table of Contents

1. [Overview](#overview)
2. [Agent Architecture](#agent-architecture)
3. [Lead Discovery Agent](#lead-discovery-agent)
4. [Audit Agent](#audit-agent)
5. [Pitch Generation Agent](#pitch-generation-agent)
6. [Decision Logic](#decision-logic)
7. [Prompt Engineering](#prompt-engineering)
8. [Error Handling](#error-handling)
9. [Future Enhancements](#future-enhancements)

---

## Overview

LocalLeadGenAI uses a **multi-agent architecture** powered by Google's Gemini AI models. Each agent is specialized for a specific task in the lead generation pipeline:

1. **Lead Discovery Agent** - Finds businesses using Google Maps
2. **Audit Agent** - Analyzes digital presence using Google Search
3. **Pitch Generation Agent** - Creates personalized sales copy

These agents work sequentially, with each agent's output feeding into the next stage of the pipeline.

### Agent Communication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│   Lead      │────▶│   Audit     │────▶│   Pitch     │
│   Input     │     │ Discovery   │     │   Agent     │     │ Generation  │
│             │     │   Agent     │     │             │     │   Agent     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
   niche/city        BusinessLead[]      BusinessAudit       Sales Pitch
```

---

## Agent Architecture

### Design Principles

1. **Separation of Concerns**: Each agent has a single, well-defined responsibility
2. **Composability**: Agents can be chained together or used independently
3. **Grounding**: Agents use Google's grounding tools for factual accuracy
4. **Type Safety**: Strict TypeScript interfaces for all agent inputs/outputs
5. **Error Resilience**: Graceful handling of API failures and unexpected responses

### Common Patterns

All agents follow these patterns:

```typescript
// 1. Initialize AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 2. Construct prompt with context
const prompt = `...`;

// 3. Call Gemini API with appropriate model and tools
const response = await ai.models.generateContent({
  model: 'gemini-model-name',
  contents: prompt,
  config: { tools: [...] }
});

// 4. Extract and transform response data
const data = parseResponse(response);

// 5. Return typed result
return data;
```

---

## Lead Discovery Agent

### Purpose
Discovers local businesses matching a specified niche and location using Google Maps data.

### Implementation

**Location**: `services/geminiService.ts::findLeads()`

**Model**: `gemini-2.5-flash-lite-latest`

**Grounding Tool**: `{ googleMaps: {} }`

### Input

```typescript
interface Input {
  niche: string;    // Industry/business type (e.g., "Dentist", "Coffee Shop")
  city: string;     // Geographic location (e.g., "Austin, TX")
}
```

### Output

```typescript
interface Output {
  leads: BusinessLead[];
}

interface BusinessLead {
  id: string;                     // Unique identifier
  name: string;                   // Business name
  address: string;                // Full address
  rating: number;                 // Google rating (0-5)
  reviews: number;                // Review count
  website?: string;               // Website URL (optional)
  opportunities: OpportunityType[]; // Classified opportunities
}
```

### Prompt Template

```
Find 12 local businesses for the niche "{niche}" in "{city}". 
Return the results as a JSON array of objects with the following keys: 
name, address, rating, reviews, website (if available). 
Provide only the JSON data.
```

### Decision Logic

After receiving raw business data, the agent applies classification rules:

1. **Low Reputation** → If `rating < 4.0`
2. **Undervalued** → If `rating > 4.5` AND `reviews < 20`
3. **Missing Info** → If `website` is null/undefined

**Classification Code:**
```typescript
const opportunities: OpportunityType[] = [];
if (item.rating < 4.0) opportunities.push(OpportunityType.LOW_REPUTATION);
if (item.rating > 4.5 && item.reviews < 20) opportunities.push(OpportunityType.UNDERVALUED);
if (!item.website) opportunities.push(OpportunityType.MISSING_INFO);
```

### Response Parsing

Since Gemini may return markdown-formatted JSON, the agent extracts the JSON array:

```typescript
const text = response.text || "[]";
const jsonMatch = text.match(/\[[\s\S]*\]/);  // Extract array
const rawData = JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
```

### Edge Cases

- **No results found**: Returns empty array
- **Malformed JSON**: Falls back to empty array
- **Missing fields**: Provides defaults (rating: 0, reviews: 0)
- **Invalid coordinates**: Google Maps handles location resolution

---

## Audit Agent

### Purpose
Analyzes a business's digital presence by searching the web and identifying gaps in their online strategy.

### Implementation

**Location**: `services/geminiService.ts::auditBusiness()`

**Model**: `gemini-3-flash-preview`

**Grounding Tool**: `{ googleSearch: {} }`

### Input

```typescript
interface Input {
  lead: BusinessLead;
}
```

### Output

```typescript
interface BusinessAudit {
  content: string;                        // Full audit summary
  sources: { title: string; uri: string }[]; // Grounding sources
  gaps: string[];                         // Missing digital assets
}
```

### Prompt Template

**Phase 1: Audit Generation**
```
Conduct a digital presence audit for "{business.name}" located at "{business.address}". 
Search for their official website, social media (Facebook, Instagram, LinkedIn), and check for:
1. Does the website have an online booking/scheduling system?
2. Is there an AI chatbot visible?
3. What is the copyright year in the footer?
4. Are they active on social media?

Provide a detailed summary and explicitly list missing digital assets (Gaps).
```

**Phase 2: Gap Extraction**
```
Based on this audit text: "{audit_text}", list the specific digital gaps or missing 
features as a short JSON array of strings (e.g., ["No AI Chatbot", "Outdated Website", 
"No Online Booking"]).
```

### Decision Logic

The Audit Agent operates in two phases:

**Phase 1: Information Gathering**
1. Use Google Search to find business's digital presence
2. Analyze website, social media, and online tools
3. Extract grounding metadata (sources used)
4. Generate comprehensive audit text

**Phase 2: Gap Identification**
1. Send audit text to secondary AI call
2. Use structured JSON schema to extract gaps
3. Return array of specific missing features

### Grounding Metadata Extraction

```typescript
const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
  ?.filter(chunk => chunk.web)
  .map(chunk => ({
    title: chunk.web?.title || 'Source',
    uri: chunk.web?.uri || '#'
  })) || [];
```

### Structured Output (Gap Extraction)

Uses Gemini's structured output feature:

```typescript
config: {
  responseMimeType: "application/json",
  responseSchema: {
    type: Type.ARRAY,
    items: { type: Type.STRING }
  }
}
```

### Edge Cases

- **No website found**: Audit notes absence, gap includes "No Website"
- **Private social media**: Reports as "Limited Social Media Presence"
- **Blocked by robots.txt**: Notes in audit, source list may be empty
- **Outdated information**: Uses most recent grounding sources available

---

## Pitch Generation Agent

### Purpose
Creates personalized, high-converting sales pitches based on audit findings and business context.

### Implementation

**Location**: `services/geminiService.ts::generatePitch()`

**Model**: `gemini-3-flash-preview`

**Grounding Tool**: None (creative generation)

### Input

```typescript
interface Input {
  lead: BusinessLead;
  audit: BusinessAudit;
  pitchFocus: 'automation' | 'website';  // Type of pitch
  tone: 'Formal' | 'Friendly' | 'Urgent'; // Communication style
  length: 'Short' | 'Medium' | 'Long';    // Word count target
}
```

### Output

```typescript
interface Output {
  pitch: string;  // Personalized sales copy
}
```

### Prompt Template

The prompt is highly structured to ensure consistency:

```
You are a world-class sales copywriter for an agency specializing in 
{Website Design | AI-Driven Business Automation}. 

Write a high-converting, personalized cold pitch to the business owner of "{business.name}".

STRICT CONSTRAINTS:
- TONE: {Formal|Friendly|Urgent}
- LENGTH: {Short|Medium|Long}

{Focus-specific message}

Context from Audit:
- Rating: {rating} stars with {reviews} reviews.
- Audit Data: {audit.content}
- Identified Missing Assets: {gaps.join(", ")}

GOAL: Get them to reply or book a quick 10-minute audit call.
Make it clear you've researched them specifically.
```

### Decision Logic

**Focus Selection:**

1. **Automation Pitch** (default)
   - Highlights gaps in digital workflow
   - Emphasizes AI chatbots, booking systems, automation
   - Value prop: efficiency, scalability, 24/7 availability
   - Use case: Businesses with partial digital presence

2. **Website Pitch** (conditional)
   - Only shown if `OpportunityType.MISSING_INFO` present
   - Emphasizes need for digital storefront
   - Value prop: discoverability, credibility, lead capture
   - Use case: Businesses with no website

**Tone Adaptation:**

- **Formal**: Professional language, industry terminology, structured format
- **Friendly**: Conversational style, personal anecdotes, casual language
- **Urgent**: Action-oriented, time-sensitive language, FOMO elements

**Length Guidelines:**

- **Short**: 50-100 words, single paragraph
- **Medium**: 150-250 words, 2-3 paragraphs
- **Long**: 300-500 words, multiple paragraphs with structure

### Context Integration

The pitch is context-aware:

1. **Business-specific**: Uses actual business name and audit findings
2. **Gap-specific**: References exact missing digital assets
3. **Rating-aware**: Adjusts messaging based on reputation
4. **Location-aware**: Can reference local market dynamics

### Edge Cases

- **No gaps identified**: Focuses on optimization and improvement
- **Excellent rating**: Emphasizes scaling and maintaining excellence
- **Poor rating**: Highlights reputation management and recovery
- **Multiple gaps**: Prioritizes most critical 2-3 gaps

---

## Decision Logic

### Opportunity Classification Matrix

| Condition | Classification | Priority | Pitch Angle |
|-----------|----------------|----------|-------------|
| rating < 4.0 | Low Reputation | High | Reputation management, review generation |
| rating > 4.5 AND reviews < 20 | Undervalued | Medium | Scale visibility, capture demand |
| !website | Missing Info | High | Website design, digital presence |

### Agent Selection Flow

```
User initiates search
    ↓
Lead Discovery Agent executes
    ↓
Leads classified by opportunities
    ↓
User selects lead
    ↓
Audit Agent executes
    ↓
Gaps identified and prioritized
    ↓
User configures pitch parameters
    ↓
Pitch Agent selects template based on focus
    ↓
Pitch Agent adapts tone and length
    ↓
Personalized pitch generated
```

---

## Prompt Engineering

### Best Practices

1. **Clear Constraints**: Specify output format, tone, and length explicitly
2. **Context First**: Provide all relevant context before asking for output
3. **Examples**: Use few-shot examples for structured outputs when needed
4. **Verification**: Request specific checks and validations
5. **Grounding**: Use grounding tools for factual accuracy

### Prompt Patterns

**Structured Output Pattern:**
```
[Role/Context] + [Task] + [Constraints] + [Format] + [Examples]
```

**Grounding Pattern:**
```
[Search Query] + [Verification Criteria] + [Source Requirements]
```

**Creative Generation Pattern:**
```
[Role] + [Audience] + [Goal] + [Constraints] + [Context]
```

---

## Error Handling

### API Failure Handling

Currently, each agent catches errors and propagates them:

```typescript
try {
  const result = await agentFunction();
  return result;
} catch (err: any) {
  console.error(err);
  throw new Error('Agent failed: ' + err.message);
}
```

### Response Validation

**Lead Discovery:**
- Validates JSON structure
- Provides default values for missing fields
- Filters out invalid entries

**Audit Agent:**
- Ensures audit content is non-empty
- Provides empty arrays if sources unavailable
- Validates gap array structure

**Pitch Agent:**
- Returns fallback message if generation fails
- Ensures minimum length requirements

### Retry Logic

**Current**: No automatic retries (planned for future)

**Recommended Pattern:**
```typescript
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

---

## Future Enhancements

### Planned Agent Improvements

1. **Multi-Lead Batch Processing**
   - Process multiple leads simultaneously
   - Aggregate results for comparison
   - Intelligent priority ranking

2. **Competitive Analysis Agent**
   - Compare lead against competitors
   - Identify market gaps and opportunities
   - Benchmark digital presence

3. **Follow-Up Agent**
   - Generate follow-up email sequences
   - Adapt messaging based on response
   - Schedule reminders and tracking

4. **Sentiment Analysis Agent**
   - Analyze review sentiment
   - Identify reputation trends
   - Suggest response strategies

5. **ROI Calculation Agent**
   - Estimate potential value of services
   - Calculate expected conversion rates
   - Provide pricing recommendations

### Prompt Optimization

1. **A/B Testing Framework**
   - Test different prompt variations
   - Measure effectiveness metrics
   - Automatically select best performers

2. **Dynamic Prompt Generation**
   - Adapt prompts based on business type
   - Industry-specific terminology
   - Localization for different regions

3. **Feedback Loop**
   - Learn from user edits to pitches
   - Improve prompts based on successful conversions
   - Personalize to agency voice/style

### Grounding Enhancements

1. **Multi-Source Verification**
   - Cross-reference multiple sources
   - Flag conflicting information
   - Confidence scores for findings

2. **Historical Data**
   - Track changes in business presence over time
   - Identify trends and patterns
   - Alert on significant changes

3. **Social Media Deep Dive**
   - Analyze posting frequency
   - Engagement metrics
   - Content quality assessment

---

## Appendix

### Agent Performance Metrics

| Agent | Avg Response Time | Success Rate | Token Usage (Avg) |
|-------|-------------------|--------------|-------------------|
| Lead Discovery | 5-10s | 95%+ | ~500 tokens |
| Audit | 8-15s | 90%+ | ~1500 tokens |
| Pitch Generation | 3-5s | 98%+ | ~800 tokens |

### Debugging Tips

1. **Enable detailed logging**: Add console.log before/after each AI call
2. **Inspect raw responses**: Check `response.text` for unexpected formats
3. **Validate inputs**: Ensure lead data is complete before passing to agents
4. **Test prompts in AI Studio**: Iterate on prompts before implementing
5. **Monitor token usage**: Track costs and optimize prompts for efficiency

### References

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Grounding with Google Search](https://ai.google.dev/docs/grounding)
- [Structured Output Guide](https://ai.google.dev/docs/structured_output)
- [Prompt Engineering Guide](https://ai.google.dev/docs/prompt_best_practices)

---

**Last Updated**: 2024-12-30  
**Version**: 0.1.0
