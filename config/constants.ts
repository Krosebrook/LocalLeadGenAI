/**
 * Application Constants
 * Central location for all application-wide constants
 */

// API Configuration
export const API_CONFIG = {
  GEMINI_MODELS: {
    FLASH_LITE: 'gemini-2.5-flash-lite-latest',
    FLASH_PREVIEW: 'gemini-3-flash-preview',
  },
  DEFAULT_LEAD_COUNT: 12,
  TIMEOUT_MS: 30000,
} as const;

// Business Lead Thresholds
export const LEAD_THRESHOLDS = {
  LOW_REPUTATION_RATING: 4.0,
  UNDERVALUED_RATING: 4.5,
  UNDERVALUED_MAX_REVIEWS: 20,
} as const;

// UI Configuration
export const UI_CONFIG = {
  DEFAULT_NICHE: 'Dentist',
  DEFAULT_CITY: 'Austin, TX',
  PITCH_TONES: ['Formal', 'Friendly', 'Urgent'] as const,
  PITCH_LENGTHS: ['Short', 'Medium', 'Long'] as const,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  LEAD_FETCH_FAILED: 'Failed to fetch leads',
  AUDIT_FAILED: 'Audit failed. Please try refreshing or selecting another lead.',
  PITCH_GENERATION_FAILED: 'Pitch generation failed.',
  API_KEY_MISSING: 'GEMINI_API_KEY is not configured. Please check your environment variables.',
} as const;
