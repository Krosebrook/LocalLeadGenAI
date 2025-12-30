/**
 * Validation utilities for environment and data validation
 */

import { ERROR_MESSAGES } from '../config/constants';

/**
 * Validates that required environment variables are present
 * @throws Error if required variables are missing
 */
export const validateEnvironment = (): void => {
  if (!process.env.API_KEY && !process.env.GEMINI_API_KEY) {
    throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
  }
};

/**
 * Validates API key is present
 * @param apiKey - The API key to validate
 * @returns boolean indicating if valid
 */
export const isValidApiKey = (apiKey: string | undefined): boolean => {
  return typeof apiKey === 'string' && apiKey.trim().length > 0;
};

/**
 * Safely parses JSON with fallback
 * @param text - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export const safeJsonParse = <T>(text: string, fallback: T): T => {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : JSON.stringify(fallback));
  } catch (error) {
    console.error('JSON parsing failed:', error);
    return fallback;
  }
};
