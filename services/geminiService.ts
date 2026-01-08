
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
  
  const prompt = `Conduct a digital presence audit for "${lead.name}" located at "${lead.address}". 
  Search for their official website, social media (Facebook, Instagram, LinkedIn), and check for:
  1. Does the website have an online booking/scheduling system?
  2. Is there an AI chatbot visible?
  3. What is the copyright year in the footer?
  4. Are they active on social media?
  
  Provide a detailed summary and explicitly list missing digital assets (Gaps).`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
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

  const gapsPrompt = `Based on this audit text: "${response.text}", list the specific digital gaps or missing features as a short JSON array of strings (e.g., ["No AI Chatbot", "Outdated Website", "No Online Booking"]).`;
  
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
