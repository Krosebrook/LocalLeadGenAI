# Google Gemini Integration Documentation

## Overview

LocalLeadGenAI leverages Google's Gemini AI platform with advanced grounding capabilities to provide accurate, verifiable lead generation and business intelligence. This document details the integration specifics, best practices, and optimization strategies.

---

## Table of Contents

- [Gemini API Setup](#gemini-api-setup)
- [Models Used](#models-used)
- [Grounding Capabilities](#grounding-capabilities)
- [Integration Architecture](#integration-architecture)
- [Prompt Engineering](#prompt-engineering)
- [Response Handling](#response-handling)
- [Rate Limits & Quotas](#rate-limits--quotas)
- [Cost Optimization](#cost-optimization)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Gemini API Setup

### Getting Your API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Add to `.env.local`:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

### API Key Security

**DO**:
- ✅ Store in environment variables
- ✅ Add `.env.local` to `.gitignore`
- ✅ Rotate keys regularly
- ✅ Use separate keys for dev/prod

**DON'T**:
- ❌ Commit API keys to git
- ❌ Expose in client-side code (production)
- ❌ Share keys publicly
- ❌ Use same key across projects

---

## Models Used

LocalLeadGenAI uses two Gemini models strategically:

### 1. gemini-2.5-flash-lite-latest

**Use Case**: Lead Discovery

**Characteristics**:
- ⚡ **Speed**: Fastest model available
- 💰 **Cost**: Most economical
- 🎯 **Accuracy**: Good for structured data
- 📊 **Context**: 32K token window

**Why This Model**:
- Lead search requires fast response times
- Structured JSON output is straightforward
- Google Maps grounding is well-supported
- High volume of requests expected

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

**Use Case**: Business Audit & Pitch Generation

**Characteristics**:
- 🧠 **Intelligence**: Advanced reasoning
- 🔍 **Analysis**: Deep content understanding
- 📝 **Quality**: Superior text generation
- 📊 **Context**: 128K token window

**Why This Model**:
- Complex analysis requires advanced reasoning
- Quality of audit and pitch is critical
- Google Search grounding provides rich context
- Worth the extra tokens for accuracy

**Configuration**:
```typescript
const response = await ai.models.generateContent({
  model: "gemini-3-flash-preview",
  contents: prompt,
  config: {
    tools: [{ googleSearch: {} }]
  }
});
```

---

## Grounding Capabilities

Grounding enables Gemini to access real-time, verifiable data from Google's services.

### Google Maps Grounding

**What It Does**:
- Searches Google Maps for businesses
- Returns verified business information
- Provides location accuracy
- Includes ratings and reviews

**Data Provided**:
```typescript
{
  name: "Business Name",
  address: "123 Main St, City, State ZIP",
  rating: 4.5,
  reviews: 127,
  website: "https://example.com",
  phone: "(555) 123-4567",
  hours: "9AM-5PM",
  category: "Dentist"
}
```

**Advantages**:
- ✅ Official Google data
- ✅ Real-time accuracy
- ✅ Verified locations
- ✅ Rich metadata

**Limitations**:
- ⚠️ May miss very new businesses
- ⚠️ Limited to public Google Maps data
- ⚠️ No historical data

### Google Search Grounding

**What It Does**:
- Performs real-time web searches
- Crawls and analyzes websites
- Extracts relevant information
- Provides source citations

**Use Cases**:
1. Website analysis
2. Social media discovery
3. Review aggregation
4. Competitive research
5. Industry trends

**Grounding Metadata**:
```typescript
{
  groundingChunks: [
    {
      web: {
        uri: "https://business-website.com",
        title: "Business Name - Official Site"
      }
    }
  ],
  groundingSupport: [
    {
      segment: { startIndex: 0, endIndex: 50 },
      groundingChunkIndices: [0, 1],
      confidenceScores: [0.95, 0.87]
    }
  ]
}
```

**Advantages**:
- ✅ Current web data
- ✅ Verifiable sources
- ✅ Citation generation
- ✅ Comprehensive coverage

**Limitations**:
- ⚠️ May miss new/updated content
- ⚠️ Depends on web accessibility
- ⚠️ Higher token usage

---

## Integration Architecture

### Client Initialization

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.API_KEY 
});
```

**Note**: Current architecture uses client-side API calls. For production, consider backend proxy.

### Request Flow

```
Application Code
    ↓
Gemini Service Layer
    ↓
Google GenAI SDK
    ↓
HTTPS Request
    ↓
Gemini API Servers
    ↓
Google Maps/Search (if grounding enabled)
    ↓
Response Processing
    ↓
Return to Application
```

### Error Handling Pattern

```typescript
try {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] }
  });
  
  // Process response
  const text = response.text || fallbackValue;
  
} catch (error) {
  if (error.status === 429) {
    // Rate limit - implement backoff
  } else if (error.status === 401) {
    // Auth error - check API key
  } else if (error.status === 400) {
    // Bad request - check prompt
  } else {
    // Generic error
  }
}
```

---

## Prompt Engineering

### Best Practices

#### 1. Be Specific
```typescript
// ❌ Bad
"Find businesses"

// ✅ Good
"Find 12 local businesses for the niche 'Dentist' in 'Austin, TX'. 
Return as JSON array with: name, address, rating, reviews, website."
```

#### 2. Request Structured Output
```typescript
config: {
  responseMimeType: "application/json",
  responseSchema: {
    type: Type.ARRAY,
    items: { type: Type.STRING }
  }
}
```

#### 3. Provide Context
```typescript
const prompt = `You are a world-class sales copywriter specializing in 
AI-Driven Business Automation.

Target Business: ${lead.name}
Context: Rating ${lead.rating} stars with ${lead.reviews} reviews
Gaps Identified: ${audit.gaps.join(", ")}

Write a personalized cold pitch...`;
```

#### 4. Set Constraints
```typescript
STRICT CONSTRAINTS:
- TONE: Friendly
- LENGTH: Medium (200-300 words)
- FOCUS: AI Automation
- GOAL: Book 10-minute call
```

### Prompt Templates

#### Lead Discovery Template
```typescript
`Find ${count} local businesses for the niche "${niche}" in "${city}".

Requirements:
- Return valid JSON array only
- Include: name, address, rating, reviews, website
- Focus on businesses matching the niche exactly
- Prioritize businesses with public contact info

Format: [{"name": "...", "address": "...", ...}]`
```

#### Audit Template
```typescript
`Conduct a digital presence audit for "${businessName}" 
located at "${address}".

Search for:
1. Official website - analyze for:
   - Online booking/scheduling system
   - AI chatbot presence
   - Copyright year (website age)
   - Mobile responsiveness
   
2. Social media presence:
   - Facebook, Instagram, LinkedIn
   - Activity level and engagement
   
3. Digital features:
   - Email marketing
   - Review management
   - CRM/automation tools

Provide:
- Detailed summary (200+ words)
- List of specific digital gaps
- Current state assessment`
```

#### Pitch Template
```typescript
`You are ${role} for an agency specializing in ${focus}.

Write a high-converting pitch to the owner of "${businessName}".

CONSTRAINTS:
- TONE: ${tone}
- LENGTH: ${length}
- FOCUS: ${pitchType}

CONTEXT:
- Business: ${businessName}
- Rating: ${rating} stars with ${reviews} reviews
- Identified Gaps: ${gaps}
- Audit Summary: ${auditSummary}

VALUE PROPOSITION:
${valueProposition}

GOAL: Get them to reply or book a 10-minute audit call.

Requirements:
- Make it clear you've researched them specifically
- Reference their exact situation
- Quantify benefits where possible
- Include clear call-to-action
- Professional yet conversational`
```

---

## Response Handling

### Text Extraction

```typescript
// Basic extraction
const text = response.text || "";

// With fallback
const text = response.text || "No content generated";
```

### JSON Parsing

```typescript
// Safe parsing with regex extraction
const jsonMatch = text.match(/\[[\s\S]*\]/) || 
                  text.match(/\{[\s\S]*\}/);
const data = JSON.parse(jsonMatch?.[0] || "[]");
```

### Grounding Metadata

```typescript
// Extract sources
const sources = response.candidates?.[0]
  ?.groundingMetadata?.groundingChunks
  ?.filter(chunk => chunk.web)
  .map(chunk => ({
    title: chunk.web?.title || 'Source',
    uri: chunk.web?.uri || '#'
  })) || [];
```

### Confidence Scores

```typescript
// Check grounding confidence
const support = response.candidates?.[0]
  ?.groundingMetadata?.groundingSupport || [];

support.forEach(item => {
  console.log('Confidence:', item.confidenceScores);
});
```

---

## Rate Limits & Quotas

### Free Tier Limits

| Metric | Limit |
|--------|-------|
| RPM (Requests Per Minute) | 15 |
| RPD (Requests Per Day) | 1,500 |
| TPM (Tokens Per Minute) | 1,000,000 |
| Context Window | 32K-128K |

### Paid Tier Limits

| Metric | Limit |
|--------|-------|
| RPM | 360+ |
| RPD | 10,000+ |
| TPM | 4,000,000+ |
| Context Window | 128K-1M |

### Handling Rate Limits

```typescript
async function callWithRetry(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429 && i < maxRetries - 1) {
        // Exponential backoff
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
```

---

## Cost Optimization

### Token Usage

**Flash-Lite Pricing** (as of Dec 2024):
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens

**Flash-Preview Pricing**:
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens

### Optimization Strategies

1. **Use Appropriate Models**
   - Flash-Lite for simple tasks
   - Flash-Preview for complex analysis

2. **Minimize Prompt Length**
   ```typescript
   // ❌ Wasteful
   const prompt = `${longContext}\n\n${moreContext}\n\n${evenMoreContext}`;
   
   // ✅ Efficient
   const prompt = `${essentialContext}`;
   ```

3. **Cache Results**
   ```typescript
   const cache = new Map<string, any>();
   
   async function getCached(key: string, fn: () => Promise<any>) {
     if (cache.has(key)) return cache.get(key);
     const result = await fn();
     cache.set(key, result);
     return result;
   }
   ```

4. **Batch Processing**
   ```typescript
   // Process multiple leads in one call
   const prompt = `Analyze these businesses: ${JSON.stringify(leads)}`;
   ```

5. **Structured Output**
   - Use `responseMimeType: "application/json"`
   - Reduces parsing overhead
   - More reliable extraction

---

## Best Practices

### Security

1. **Never expose API keys client-side in production**
2. **Use environment variables**
3. **Implement rate limiting**
4. **Monitor usage and costs**
5. **Rotate keys regularly**

### Performance

1. **Use appropriate models for tasks**
2. **Implement caching where appropriate**
3. **Minimize prompt length**
4. **Parallel requests when possible**
5. **Implement timeouts**

### Quality

1. **Validate responses**
2. **Use grounding for facts**
3. **Test prompts thoroughly**
4. **Monitor output quality**
5. **Iterate on prompts based on results**

---

## Troubleshooting

### Common Issues

#### Issue: "API Key Invalid"
**Solution**: Check `.env.local` configuration
```bash
# Verify file exists
cat .env.local

# Should contain
GEMINI_API_KEY=your_key_here
```

#### Issue: "Rate Limit Exceeded"
**Solution**: Implement exponential backoff or upgrade tier

#### Issue: "No grounding sources found"
**Solution**: 
- Check business has online presence
- Verify search terms are specific
- Try alternative search queries

#### Issue: "Response parsing failed"
**Solution**: Use `safeJsonParse` utility
```typescript
const data = safeJsonParse(response.text, []);
```

#### Issue: "Slow response times"
**Solution**:
- Use Flash-Lite for simple tasks
- Reduce prompt length
- Remove unnecessary grounding

---

## Future Enhancements

### Planned Features

1. **Multi-Modal Support**
   - Image analysis for website screenshots
   - Logo extraction
   - Visual branding audit

2. **Advanced Grounding**
   - Custom search filters
   - Specific domain targeting
   - Time-range filtering

3. **Function Calling**
   - Direct API integrations
   - Database queries
   - Third-party tools

4. **Streaming Responses**
   - Real-time output generation
   - Better UX for long content
   - Progressive rendering

---

## Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://aistudio.google.com)
- [Pricing Calculator](https://ai.google.dev/pricing)
- [Best Practices Guide](https://ai.google.dev/docs/best_practices)

---

## Support

For Gemini-specific issues:
- [Google AI Forum](https://discuss.ai.google.dev)
- [Issue Tracker](https://github.com/google/generative-ai-js/issues)

For LocalLeadGenAI issues:
- [GitHub Issues](https://github.com/Krosebrook/LocalLeadGenAI/issues)

---

**Last Updated**: December 30, 2024
