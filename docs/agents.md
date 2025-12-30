# AI Agent Workflows Documentation

## Overview

LocalLeadGenAI utilizes multiple AI agent workflows powered by Google Gemini to deliver intelligent lead generation, auditing, and pitch creation. This document explains each agent's purpose, decision logic, and data flow.

---

## Agent Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Agent Orchestration                    │
│                                                          │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐   │
│  │   Lead     │ → │   Audit    │ → │   Pitch    │   │
│  │  Discovery │    │   Agent    │    │  Generator │   │
│  │   Agent    │    │            │    │   Agent    │   │
│  └────────────┘    └────────────┘    └────────────┘   │
└─────────────────────────────────────────────────────────┘
```

Each agent operates independently with specific responsibilities and can be invoked in sequence or independently based on user interaction.

---

## Agent 1: Lead Discovery Agent

### Purpose
Discover and analyze local businesses that match specific niche and location criteria, identifying potential sales opportunities.

### Input
```typescript
{
  niche: string,    // Business type (e.g., "Dentist", "Roofer")
  city: string      // Location (e.g., "Austin, TX")
}
```

### Output
```typescript
BusinessLead[] = [
  {
    id: string,
    name: string,
    address: string,
    rating: number,
    reviews: number,
    website?: string,
    opportunities: OpportunityType[]
  }
]
```

### Decision Logic

#### Step 1: Query Construction
```
Prompt Template:
"Find {DEFAULT_LEAD_COUNT} local businesses for the niche '{niche}' 
in '{city}'. Return results as JSON array with: name, address, 
rating, reviews, website (if available)."
```

#### Step 2: Grounding Strategy
- **Tool**: Google Maps API integration
- **Reason**: Provides accurate, real-time business data
- **Coverage**: Local businesses with verified locations
- **Accuracy**: High (official Google data)

#### Step 3: Data Processing
1. Extract JSON from AI response
2. Parse and validate business data
3. Apply opportunity analysis algorithm
4. Generate unique IDs

#### Step 4: Opportunity Classification

**Algorithm**:
```python
def classify_opportunities(lead):
    opportunities = []
    
    # Low Reputation Check
    if lead.rating < 4.0:
        opportunities.add(LOW_REPUTATION)
    
    # Undervalued Check
    if lead.rating > 4.5 AND lead.reviews < 20:
        opportunities.add(UNDERVALUED)
    
    # Missing Website Check
    if not lead.website:
        opportunities.add(MISSING_INFO)
    
    return opportunities
```

**Opportunity Types Explained**:

1. **LOW_REPUTATION** (rating < 4.0)
   - Business has poor reviews
   - Opportunity: Reputation management services
   - Pitch angle: Help improve online presence

2. **UNDERVALUED** (rating > 4.5, reviews < 20)
   - High quality but low visibility
   - Opportunity: Marketing and review generation
   - Pitch angle: Scale success with automation

3. **MISSING_INFO** (no website)
   - No online presence
   - Opportunity: Website development
   - Pitch angle: Digital transformation

### Performance Characteristics
- **Model**: gemini-2.5-flash-lite-latest
- **Speed**: Fast (optimized for quick responses)
- **Tokens**: ~500-1000 per request
- **Accuracy**: High (Google Maps verified)

### Error Handling
- **No results found**: Return empty array
- **Parse error**: Fallback to empty array
- **API error**: Propagate to UI with user-friendly message

---

## Agent 2: Digital Audit Agent

### Purpose
Conduct comprehensive digital presence analysis for a business, identifying gaps and opportunities in their online footprint.

### Input
```typescript
{
  lead: BusinessLead  // Business to audit
}
```

### Output
```typescript
{
  content: string,              // Detailed audit narrative
  sources: Array<{              // Verifiable sources
    title: string,
    uri: string
  }>,
  gaps: string[]                // Specific missing features
}
```

### Decision Logic

#### Step 1: Audit Prompt Construction

**Criteria Analyzed**:
1. **Website Analysis**
   - Online booking/scheduling system
   - AI chatbot presence
   - Copyright year (indicates update frequency)
   - Mobile responsiveness
   - Page load speed

2. **Social Media Presence**
   - Facebook active/inactive
   - Instagram presence
   - LinkedIn profile
   - Post frequency
   - Engagement metrics

3. **Digital Features**
   - Live chat support
   - Email automation
   - CRM integration
   - Analytics setup

#### Step 2: Grounding Strategy
- **Tool**: Google Search
- **Reason**: Access to real-time web data
- **Coverage**: Official websites, social media, reviews
- **Accuracy**: High with source citations

#### Step 3: Source Extraction

The agent extracts grounding metadata:
```typescript
groundingChunks.forEach(chunk => {
  if (chunk.web) {
    sources.push({
      title: chunk.web.title,
      uri: chunk.web.uri
    });
  }
});
```

**Source Types**:
- Official business websites
- Social media pages
- Review platforms (Yelp, Google Reviews)
- Directory listings

#### Step 4: Gap Analysis

Secondary agent call with structured output:
```typescript
Prompt: "Based on audit: '{auditText}', list specific 
digital gaps as JSON array"

Response Schema: {
  type: "array",
  items: { type: "string" }
}
```

**Common Gaps Identified**:
- No AI Chatbot
- Outdated Website (old copyright)
- No Online Booking
- Inactive Social Media
- No Mobile App
- Poor SEO
- Slow Loading Speed
- No Email Marketing

### Performance Characteristics
- **Model**: gemini-3-flash-preview
- **Speed**: Moderate (thorough analysis)
- **Tokens**: ~2000-4000 per request
- **Accuracy**: Very high with grounded sources

### Error Handling
- **No sources found**: Continue with audit, note limitation
- **Parse error in gaps**: Return empty gaps array
- **API error**: Propagate with retry suggestion

---

## Agent 3: Pitch Generation Agent

### Purpose
Generate highly personalized, context-aware sales pitches that address specific business needs identified during the audit.

### Input
```typescript
{
  lead: BusinessLead,
  audit: BusinessAudit,
  pitchFocus: 'automation' | 'website',
  tone: 'Formal' | 'Friendly' | 'Urgent',
  length: 'Short' | 'Medium' | 'Long'
}
```

### Output
```typescript
string  // Personalized pitch text
```

### Decision Logic

#### Step 1: Pitch Type Selection

**Automation Focus**:
- Target: Businesses with websites but missing features
- Angle: AI chatbots, booking automation, CRM
- Value Prop: Efficiency, 24/7 availability, cost savings

**Website Launchpad Focus**:
- Target: Businesses without websites
- Angle: Digital storefront, SEO, brand presence
- Value Prop: Visibility, credibility, lead capture

#### Step 2: Context Integration

The agent synthesizes multiple data points:
```typescript
Context = {
  business_name: lead.name,
  rating: lead.rating,
  reviews: lead.reviews,
  identified_gaps: audit.gaps,
  audit_findings: audit.content,
  competitive_position: derived_from_rating
}
```

#### Step 3: Tone Calibration

**Formal Tone**:
- Professional language
- Data-driven arguments
- Executive-level communication
- Formal greetings and closings

**Friendly Tone**:
- Conversational style
- Personal anecdotes
- Warm, approachable language
- Casual greetings

**Urgent Tone**:
- Time-sensitive language
- Competitive pressure
- Immediate action prompts
- Scarcity/opportunity framing

#### Step 4: Length Adjustment

**Short** (100-150 words):
- Hook + Problem + Solution + CTA
- Quick, punchy sentences
- Single core message

**Medium** (200-300 words):
- Introduction + Problem detail + Solution + Benefits + CTA
- Balanced detail
- 2-3 key points

**Long** (400-500 words):
- Full narrative structure
- Multiple pain points
- Detailed solution explanation
- Case study references
- Multi-layered CTA

#### Step 5: Personalization Techniques

1. **Business-Specific Research**
   ```
   "I noticed your 4.8-star rating with 15 reviews..."
   "Your business on Main Street in Austin..."
   ```

2. **Gap-Based Messaging**
   ```
   "I see you're missing an AI chatbot, which means..."
   "Your website hasn't been updated since 2020..."
   ```

3. **Competitive Context**
   ```
   "Competitors in your area are already using..."
   "You're losing leads to businesses with..."
   ```

4. **Value Quantification**
   ```
   "This could save you 20 hours per week..."
   "Businesses like yours see 40% more inquiries..."
   ```

### Prompt Engineering Strategy

```
System Role: "World-class sales copywriter specializing in 
{automation/website development}"

Constraints:
- TONE: {tone}
- LENGTH: {length}
- FOCUS: {automation/website}

Context:
- Business: {lead.name}
- Rating: {lead.rating} stars, {lead.reviews} reviews
- Gaps: {audit.gaps.join(", ")}
- Audit: {audit.content}

Goal: Get reply or book 10-minute audit call
Strategy: Show you've done research, provide clear value
```

### Performance Characteristics
- **Model**: gemini-3-flash-preview
- **Speed**: Fast (creative generation)
- **Tokens**: ~1000-2000 per request
- **Quality**: High personalization

### Error Handling
- **Generic output**: Retry with enhanced prompt
- **Off-topic**: Validate output format
- **API error**: Provide fallback template

---

## Agent Orchestration

### Sequential Flow
```
User Action → Lead Discovery
    ↓
Lead Selection → Audit Agent
    ↓
Pitch Configuration → Pitch Generator
    ↓
Final Output
```

### Parallel Capabilities
While currently sequential, the architecture supports:
- Batch lead auditing
- Multiple pitch variations simultaneously
- A/B test different tones

---

## Agent Interaction Patterns

### Pattern 1: Full Pipeline
```typescript
// User searches for leads
leads = await leadDiscoveryAgent(niche, city);

// User selects lead
audit = await auditAgent(selectedLead);

// User generates pitch
pitch = await pitchAgent(lead, audit, config);
```

### Pattern 2: Standalone Audit
```typescript
// Direct audit without lead search
audit = await auditAgent(manuallyEnteredLead);
```

### Pattern 3: Refresh & Regenerate
```typescript
// Refresh audit for updated data
newAudit = await auditAgent(lead);

// Regenerate pitch with new tone
newPitch = await pitchAgent(lead, newAudit, newConfig);
```

---

## Quality Assurance

### Lead Discovery Validation
- Verify all required fields present
- Check rating bounds (0-5)
- Validate address format
- Ensure unique IDs

### Audit Quality Checks
- Minimum 100 words in content
- At least 1 source (when available)
- Gaps array is valid JSON
- No duplicate gaps

### Pitch Quality Metrics
- Length matches specification
- Tone is appropriate
- Business name is mentioned
- Includes clear CTA
- References specific gaps

---

## Future Enhancements

### Agent Improvements

1. **Multi-Model Strategy**
   - Use different models for different tasks
   - Ensemble approaches for validation

2. **Learning Loop**
   - Track pitch success rates
   - Adjust prompts based on performance
   - A/B test messaging variants

3. **Advanced Grounding**
   - Social media API integration
   - Review sentiment analysis
   - Competitor benchmarking

4. **Batch Processing**
   - Process multiple leads simultaneously
   - Queue management
   - Progress tracking

---

## Monitoring & Debugging

### Agent Telemetry
```typescript
{
  agent: 'leadDiscovery',
  timestamp: Date.now(),
  duration_ms: 1250,
  tokens_used: 800,
  success: true,
  error: null
}
```

### Debug Mode
Enable verbose logging:
```typescript
DEBUG=true npm run dev
```

Logs include:
- Prompt sent to API
- Raw API response
- Parsing steps
- Error stack traces

---

## Conclusion

The three-agent architecture provides a modular, scalable approach to lead generation. Each agent has a specific responsibility and can be improved independently. The grounding capabilities ensure accuracy and verifiability, while the flexible prompt engineering enables personalization at scale.

For implementation details, see [gemini.md](gemini.md).  
For API specifics, see [API.md](API.md).

---

**Last Updated**: December 30, 2024
