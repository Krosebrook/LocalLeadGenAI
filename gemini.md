# Google Gemini Integration Documentation

This document provides detailed information about the Google Gemini AI integration in LocalLeadGenAI.

---

## Table of Contents

1. [Overview](#overview)
2. [API Setup](#api-setup)
3. [Models Used](#models-used)
4. [Grounding Tools](#grounding-tools)
5. [Service Architecture](#service-architecture)
6. [API Configuration](#api-configuration)
7. [Cost Optimization](#cost-optimization)
8. [Rate Limits & Quotas](#rate-limits--quotas)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Overview

LocalLeadGenAI leverages **Google Gemini AI** to power its intelligent lead generation pipeline. Gemini provides:

- **Multimodal AI capabilities** for text generation and analysis
- **Grounding tools** for real-world data access (Google Maps, Google Search)
- **Structured output** for reliable JSON responses
- **High-quality content generation** for personalized pitches

### Why Gemini?

1. **Native Grounding**: Direct access to Google Maps and Search APIs
2. **Speed**: Fast inference times (3-15 seconds per request)
3. **Accuracy**: High-quality, factual responses with source citations
4. **Cost**: Competitive pricing for flash models
5. **Structured Output**: Native JSON schema support

---

## API Setup

### Prerequisites

1. **Google Account** - Required for AI Studio access
2. **API Key** - Generated from [Google AI Studio](https://aistudio.google.com/app/apikey)
3. **Node.js** - For running the application

### Obtaining an API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Choose **"Create API key in new project"** or select existing project
5. Copy the generated API key

### Configuring the Application

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

**Security Note**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### Verifying Setup

Test your API key with a simple call:

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash-lite-latest",
  contents: "Hello, Gemini!"
});

console.log(response.text);
```

---

## Models Used

LocalLeadGenAI uses two Gemini models optimized for different tasks:

### 1. gemini-2.5-flash-lite-latest

**Purpose**: Lead discovery with Google Maps grounding

**Characteristics**:
- **Speed**: Very fast (~3-5 seconds)
- **Cost**: Lowest tier pricing
- **Capabilities**: Text generation, tool use (Google Maps)
- **Context Window**: 1M tokens
- **Output Limit**: 8K tokens

**Use Cases**:
- Finding local businesses
- Parsing location data
- Quick structured outputs

**Why This Model?**:
- Lead discovery requires speed over depth
- Google Maps tool only needs basic reasoning
- Cost-effective for high-volume searches

**Configuration**:
```typescript
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash-lite-latest",
  contents: prompt,
  config: {
    tools: [{ googleMaps: {} }]
  }
});
```

### 2. gemini-3-flash-preview

**Purpose**: Audit analysis and pitch generation

**Characteristics**:
- **Speed**: Fast (~5-15 seconds)
- **Cost**: Mid-tier pricing
- **Capabilities**: Advanced reasoning, Google Search grounding, structured output
- **Context Window**: 1M tokens
- **Output Limit**: 8K tokens

**Use Cases**:
- Digital presence audits
- Gap identification
- Sales pitch generation
- Complex reasoning tasks

**Why This Model?**:
- Better reasoning for nuanced audit analysis
- Superior content generation for pitches
- Google Search grounding for web research

**Configuration (Audit)**:
```typescript
const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: prompt,
  config: {
    tools: [{ googleSearch: {} }]
  }
});
```

**Configuration (Pitch)**:
```typescript
const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: prompt
});
```

### Model Comparison

| Feature | gemini-2.5-flash-lite | gemini-3-flash-preview |
|---------|------------------------|------------------------|
| Speed | ⚡⚡⚡ Fastest | ⚡⚡ Fast |
| Reasoning | ⭐⭐ Good | ⭐⭐⭐ Excellent |
| Cost | 💰 Cheapest | 💰💰 Moderate |
| Grounding | Google Maps | Google Search |
| Best For | Structured queries | Complex analysis |

---

## Grounding Tools

Grounding connects AI to real-world data, ensuring factual accuracy.

### Google Maps Grounding

**Purpose**: Find and retrieve information about local businesses

**Usage**:
```typescript
config: {
  tools: [{ googleMaps: {} }]
}
```

**Capabilities**:
- Search for businesses by type and location
- Retrieve business details (name, address, rating, reviews)
- Get coordinates and distance information
- Find nearby places

**Limitations**:
- Limited to publicly available Google Maps data
- No real-time traffic or hours information
- May not include very new businesses

**Example Query**:
```
Find dentists in Austin, TX with their ratings and review counts
```

**Response Format**:
```json
[
  {
    "name": "Smile Dental",
    "address": "123 Main St, Austin, TX 78701",
    "rating": 4.5,
    "reviews": 87,
    "website": "https://smiledental.com"
  }
]
```

### Google Search Grounding

**Purpose**: Search the web and cite sources for factual information

**Usage**:
```typescript
config: {
  tools: [{ googleSearch: {} }]
}
```

**Capabilities**:
- Search the entire web for information
- Cite sources with URLs
- Verify claims with multiple sources
- Find social media profiles
- Check website features

**Grounding Metadata**:
```typescript
const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
  ?.filter(chunk => chunk.web)
  .map(chunk => ({
    title: chunk.web?.title || 'Source',
    uri: chunk.web?.uri || '#'
  }));
```

**Example Query**:
```
Find information about Smile Dental's website, including whether they have 
online booking and an AI chatbot
```

**Response Includes**:
- Text answer with cited information
- Array of source URLs used
- Grounding confidence scores

---

## Service Architecture

### geminiService.ts Structure

The service layer abstracts all Gemini API interactions:

```typescript
// services/geminiService.ts

import { GoogleGenAI, Type } from "@google/genai";
import { BusinessLead, OpportunityType, BusinessAudit } from "../types";

// Three exported functions:
export const findLeads = async (niche: string, city: string): Promise<BusinessLead[]>
export const auditBusiness = async (lead: BusinessLead): Promise<BusinessAudit>
export const generatePitch = async (...): Promise<string>
```

### Initialization Pattern

Each function initializes a fresh AI client:

```typescript
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
```

**Why not singleton?**
- Simplicity in the MVP
- Allows for future per-request configuration
- No state management needed

**Future Optimization**:
```typescript
// Singleton pattern for production
class GeminiClient {
  private static instance: GoogleGenAI;
  
  static getInstance(): GoogleGenAI {
    if (!this.instance) {
      this.instance = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return this.instance;
  }
}
```

### Response Parsing Strategy

**Challenge**: Gemini may return JSON wrapped in markdown:

```
Here's the data you requested:

```json
[{"name": "Business 1"}, {"name": "Business 2"}]
```
```

**Solution**: Regex extraction:

```typescript
const text = response.text || "[]";
const jsonMatch = text.match(/\[[\s\S]*\]/);  // Extract first array
const data = JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
```

**Fallback**: Empty array/object if parsing fails

---

## API Configuration

### Environment Variable Injection

Vite configuration handles environment variables:

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    }
  };
});
```

**Dual naming**: Supports both `API_KEY` and `GEMINI_API_KEY` for flexibility.

### Request Configuration

**Temperature**: Not explicitly set (uses model defaults)
- Flash models default to ~0.7 (balanced creativity/consistency)

**Top-K**: Not explicitly set (uses model defaults)
- Controls diversity of token selection

**Top-P**: Not explicitly set (uses model defaults)
- Nucleus sampling parameter

**Max Output Tokens**: Not explicitly set (uses model defaults)
- Flash models support up to 8K tokens

**Future Configuration**:
```typescript
config: {
  temperature: 0.9,      // Higher for creative pitches
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
  tools: [{ googleSearch: {} }]
}
```

---

## Cost Optimization

### Current Usage Pattern

| Operation | Model | Tokens (Avg) | Cost per Call* |
|-----------|-------|--------------|----------------|
| Find Leads | gemini-2.5-flash-lite | ~500 | ~$0.0001 |
| Audit Business | gemini-3-flash | ~1500 | ~$0.0004 |
| Generate Pitch | gemini-3-flash | ~800 | ~$0.0002 |

**Total per lead**: ~$0.0007 (70% of a cent)

*Estimates based on Gemini pricing as of Dec 2024. Check [current pricing](https://ai.google.dev/pricing).

### Optimization Strategies

1. **Caching Audit Results**
   ```typescript
   // Store audits in localStorage
   const cachedAudit = localStorage.getItem(`audit_${lead.id}`);
   if (cachedAudit) return JSON.parse(cachedAudit);
   ```

2. **Batch Processing**
   ```typescript
   // Process multiple leads in single request
   const prompt = `Analyze these businesses: ${leads.map(l => l.name).join(', ')}`;
   ```

3. **Shorter Prompts**
   - Remove unnecessary context
   - Use abbreviations where clear
   - Reference previous responses when chaining

4. **Prompt Caching** (Gemini feature)
   ```typescript
   config: {
     cachedContent: previousResponseId  // Reuse context
   }
   ```

5. **Model Selection**
   - Use `flash-lite` for simple tasks
   - Use `flash` only when reasoning needed
   - Avoid `pro` models for simple queries

### Cost Monitoring

**Recommended**: Track token usage per request

```typescript
const response = await ai.models.generateContent({...});
const usage = response.usageMetadata;

console.log({
  promptTokens: usage.promptTokenCount,
  responseTokens: usage.candidatesTokenCount,
  totalTokens: usage.totalTokenCount
});
```

---

## Rate Limits & Quotas

### Free Tier Limits

- **RPM (Requests Per Minute)**: 15 requests/minute
- **TPM (Tokens Per Minute)**: 1M tokens/minute  
- **RPD (Requests Per Day)**: 1,500 requests/day

**Current App Usage**:
- 3 API calls per lead (find, audit, pitch)
- Can process ~5 leads/minute (safe rate)
- Can process ~500 leads/day (within quota)

### Paid Tier Limits

- **RPM**: 1,000+ requests/minute
- **TPM**: 4M+ tokens/minute
- **RPD**: No daily limit

**When to upgrade**:
- Processing >500 leads/day
- Multiple concurrent users
- Real-time batch processing

### Rate Limit Handling

**Current**: No rate limiting (relies on user behavior)

**Recommended Implementation**:

```typescript
import pLimit from 'p-limit';

// Limit concurrent API calls
const limit = pLimit(5);  // Max 5 concurrent requests

const promises = leads.map(lead => 
  limit(() => auditBusiness(lead))
);

const results = await Promise.all(promises);
```

**Exponential Backoff**:
```typescript
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.message.includes('quota')) {
        await sleep(Math.pow(2, i) * 1000);  // 1s, 2s, 4s
        continue;
      }
      throw err;
    }
  }
}
```

---

## Error Handling

### Common Errors

1. **Invalid API Key**
   ```
   Error: API key not valid. Please pass a valid API key.
   ```
   **Solution**: Check `.env.local` configuration

2. **Rate Limit Exceeded**
   ```
   Error: Resource has been exhausted (e.g. check quota).
   ```
   **Solution**: Implement rate limiting or upgrade to paid tier

3. **Invalid Model Name**
   ```
   Error: Model not found
   ```
   **Solution**: Verify model name spelling and availability

4. **Grounding Failure**
   ```
   Error: Grounding search failed
   ```
   **Solution**: Grounding tools may be temporarily unavailable, retry

5. **Malformed Response**
   ```
   SyntaxError: Unexpected token in JSON
   ```
   **Solution**: Use regex extraction before JSON.parse()

### Error Handling Pattern

```typescript
try {
  const result = await geminiAPICall();
  return result;
} catch (err: any) {
  // Log full error for debugging
  console.error('Gemini API Error:', err);
  
  // User-friendly error message
  if (err.message.includes('API key')) {
    throw new Error('Invalid API key. Please check configuration.');
  } else if (err.message.includes('quota')) {
    throw new Error('Rate limit exceeded. Please try again in a few minutes.');
  } else if (err.message.includes('not found')) {
    throw new Error('AI model not available. Please contact support.');
  } else {
    throw new Error('AI service temporarily unavailable. Please try again.');
  }
}
```

---

## Best Practices

### Prompt Engineering

1. **Be Specific**
   ```typescript
   // ❌ Vague
   "Find businesses in Austin"
   
   // ✅ Specific
   "Find 12 dental practices in Austin, TX. Return JSON with name, address, rating, reviews."
   ```

2. **Provide Context**
   ```typescript
   // ✅ Context-rich
   "You are a sales researcher. Analyze [business] for digital gaps that could be service opportunities."
   ```

3. **Constrain Output**
   ```typescript
   // ✅ Well-constrained
   "Return ONLY valid JSON. No markdown, no explanations. Just the JSON array."
   ```

4. **Use Examples** (Few-shot learning)
   ```typescript
   const prompt = `
   Find businesses. Example output:
   [{"name": "Sample Co", "rating": 4.5}]
   
   Now find dentists in ${city}.
   `;
   ```

### Structured Output

For reliable JSON, use Gemini's structured output feature:

```typescript
config: {
  responseMimeType: "application/json",
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      businesses: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            rating: { type: Type.NUMBER }
          }
        }
      }
    }
  }
}
```

### Token Management

1. **Minimize Prompt Size**
   - Remove redundant instructions
   - Use clear, concise language
   - Avoid repetition

2. **Stream Responses** (for long outputs)
   ```typescript
   const stream = await ai.models.generateContentStream({...});
   for await (const chunk of stream) {
     console.log(chunk.text);
   }
   ```

3. **Limit Output Length**
   ```typescript
   config: {
     maxOutputTokens: 500  // Prevent runaway generation
   }
   ```

---

## Troubleshooting

### Issue: No Results from Google Maps

**Symptoms**: `findLeads()` returns empty array

**Causes**:
- Location not recognized by Google Maps
- Niche too specific or misspelled
- No businesses match criteria in that location

**Solutions**:
1. Try broader location (e.g., "Texas" instead of "Small Town, TX")
2. Use common business types (e.g., "Restaurant" not "Farm-to-Table Organic Bistro")
3. Check Google Maps manually to verify businesses exist

### Issue: Audit Sources Empty

**Symptoms**: `audit.sources` array is empty

**Causes**:
- Business has no web presence
- Grounding search couldn't find relevant pages
- Business name too generic

**Solutions**:
1. Include business address in audit prompt
2. Try refreshing audit (may get different sources)
3. Check if website exists manually

### Issue: Pitch Generation Repetitive

**Symptoms**: All pitches sound similar

**Causes**:
- Low temperature setting (defaults to safe values)
- Similar audit findings across leads
- Prompt not differentiated enough

**Solutions**:
1. Increase temperature: `config: { temperature: 0.9 }`
2. Include more specific context per lead
3. Add more tone/style variations
4. Use different prompt templates per opportunity type

### Issue: API Calls Timing Out

**Symptoms**: Requests take >30 seconds or fail

**Causes**:
- Network issues
- Grounding tools slow due to complex queries
- Gemini service degradation

**Solutions**:
1. Implement timeout: `Promise.race([apiCall(), timeout(30000)])`
2. Simplify prompts to reduce processing time
3. Check [Gemini status page](https://status.google.com/)

### Issue: Inconsistent JSON Parsing

**Symptoms**: Sometimes works, sometimes `JSON.parse()` fails

**Causes**:
- Gemini returns markdown-wrapped JSON
- Extra text before/after JSON
- Malformed JSON from AI

**Solutions**:
1. Use regex extraction: `text.match(/\[[\s\S]*\]/)`
2. Add to prompt: "Return ONLY the JSON array. No markdown."
3. Use structured output with `responseSchema`

---

## Advanced Topics

### Custom Safety Settings

Control content filtering:

```typescript
config: {
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    }
  ]
}
```

### Multi-turn Conversations

For follow-up questions:

```typescript
const chat = ai.startChat({
  history: [
    { role: 'user', parts: 'Find dentists in Austin' },
    { role: 'model', parts: '[...results...]' }
  ]
});

const response = await chat.sendMessage('Now find their websites');
```

### Image Analysis (Future)

Gemini supports vision:

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: [
    { text: 'Analyze this website screenshot' },
    { inlineData: { mimeType: 'image/png', data: base64Image } }
  ]
});
```

---

## Resources

### Official Documentation
- [Gemini API Docs](https://ai.google.dev/docs)
- [Get API Key](https://aistudio.google.com/app/apikey)
- [Pricing](https://ai.google.dev/pricing)
- [Grounding Guide](https://ai.google.dev/docs/grounding)
- [Structured Output](https://ai.google.dev/docs/structured_output)

### Tools
- [AI Studio Playground](https://aistudio.google.com/)
- [API Status](https://status.google.com/)
- [Node.js SDK](https://www.npmjs.com/package/@google/genai)

### Community
- [Stack Overflow Tag](https://stackoverflow.com/questions/tagged/google-gemini)
- [GitHub Discussions](https://github.com/google/generative-ai-js/discussions)

---

**Last Updated**: 2024-12-30  
**SDK Version**: @google/genai v1.34.0  
**Document Version**: 0.1.0
