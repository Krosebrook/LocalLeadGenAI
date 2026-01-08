
import { GoogleGenAI, Type } from "@google/genai";
import { BusinessLead, OpportunityType, BusinessAudit } from "../types";

export const findLeads = async (niche: string, city: string): Promise<BusinessLead[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite-latest",
    contents: `Find 12 local businesses for the niche "${niche}" in "${city}". Return the results as a JSON array of objects with the following keys: name, address, rating, reviews, website (if available). Provide only the JSON data.`,
    config: {
      tools: [{ googleMaps: {} }]
    },
  });

  const text = response.text || "[]";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  const rawData = JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
  
  return rawData.map((item: any, index: number) => {
    const opportunities: OpportunityType[] = [];
    if (item.rating < 4.0) opportunities.push(OpportunityType.LOW_REPUTATION);
    if (item.rating > 4.5 && item.reviews < 20) opportunities.push(OpportunityType.UNDERVALUED);
    if (!item.website) opportunities.push(OpportunityType.MISSING_INFO);

    return {
      id: `lead-${index}-${Date.now()}`,
      name: item.name,
      address: item.address,
      rating: item.rating || 0,
      reviews: item.reviews || 0,
      website: item.website,
      opportunities
    };
  });
};

export const auditBusiness = async (lead: BusinessLead): Promise<BusinessAudit> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const auditPrompt = `Conduct a comprehensive digital presence and performance audit for "${lead.name}" located at "${lead.address}". 
  Use Google Search to investigate their digital footprint across the following areas:

  1. WEBSITE & PERFORMANCE:
     - Check for mobile responsiveness and SSL security.
     - Evaluate perceived page load speed (is it fast, average, or slow?).
     - Look for conversion elements: online booking systems, AI chatbots, or contact forms.
     - Check footer copyright year to gauge update frequency.

  2. SOCIAL MEDIA ENGAGEMENT:
     - Locate official profiles (Facebook, Instagram, LinkedIn, TikTok).
     - Activity Check: Have they posted in the last 30 days?
     - Follower Range: Estimate their reach (e.g., <100, 100-1k, 1k-10k, 10k+).
     - Engagement: Do they seem to respond to customer comments or reviews?

  3. SEO & BRAND SEARCH:
     - How well do they appear in search results?
     - Is their meta description professional?

  Provide a detailed summary of your findings and explicitly highlight missing digital assets or performance bottlenecks.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: auditPrompt,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web)
    .map(chunk => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri || '#'
    })) || [];

  const gapsPrompt = `Based on this audit analysis: "${response.text}", extract and list the specific digital gaps, missing features, or performance issues as a short JSON array of strings. 
  Focus on identifying high-value selling points like "No Recent Social Posts", "Slow Website Loading", "No Mobile Optimization", "Missing AI Chatbot", "Low Social Engagement", or "Outdated Copyright".`;
  
  const gapsResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: gapsPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  const gapsText = gapsResponse.text || "[]";
  const gapsMatch = gapsText.match(/\[[\s\S]*\]/);

  return {
    content: response.text || "No audit data available.",
    sources: sources as { title: string; uri: string }[],
    gaps: JSON.parse(gapsMatch ? gapsMatch[0] : "[]")
  };
};

export const generatePitch = async (
  lead: BusinessLead, 
  audit: BusinessAudit, 
  pitchFocus: string = 'automation',
  tone: string = 'Professional',
  length: string = 'Medium'
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isWebsiteFocus = pitchFocus === 'website';
  
  const prompt = `You are a world-class sales copywriter for an agency specializing in ${isWebsiteFocus ? 'Website Design and Digital Authority' : 'AI-Driven Business Automation'}. 
  Write a high-converting, personalized cold pitch to the business owner of "${lead.name}".
  
  STRICT CONSTRAINTS:
  - TONE: ${tone}
  - LENGTH: ${length}
  
  ${isWebsiteFocus ? `
  PRIMARY FOCUS: Website Launchpad. 
  MESSAGE: I noticed you don't have an official website yet. In today's market, you're losing customers to competitors who are easier to find online. I want to build you a high-performance "digital storefront" that captures leads 24/7.
  VALUE: Social proof, SEO visibility, and a professional brand image.
  ` : `
  PRIMARY FOCUS: AI Automation.
  MESSAGE: I noticed several manual gaps in your digital workflow (e.g., ${audit.gaps.join(", ")}). We implement AI solutions like automated booking and 24/7 chatbots that act as a full-time employee for a fraction of the cost.
  VALUE: Scalability, efficiency, and instant response times.
  `}

  Context from Audit:
  - Rating: ${lead.rating} stars with ${lead.reviews} reviews.
  - Audit Data: ${audit.content}
  - Identified Missing Assets: ${audit.gaps.join(", ")}
  
  GOAL: Get them to reply or book a quick 10-minute audit call.
  Make it clear you've researched them specifically.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  return response.text || "Failed to generate pitch.";
};
