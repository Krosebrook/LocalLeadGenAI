/**
 * Business lead analysis utilities
 */

import { OpportunityType } from '../types';
import { LEAD_THRESHOLDS } from '../config/constants';

/**
 * Analyzes a business and returns identified opportunities
 * @param rating - Business rating (0-5)
 * @param reviews - Number of reviews
 * @param hasWebsite - Whether business has a website
 * @returns Array of opportunity types
 */
export const identifyOpportunities = (
  rating: number,
  reviews: number,
  hasWebsite: boolean
): OpportunityType[] => {
  const opportunities: OpportunityType[] = [];

  if (rating < LEAD_THRESHOLDS.LOW_REPUTATION_RATING) {
    opportunities.push(OpportunityType.LOW_REPUTATION);
  }

  if (
    rating > LEAD_THRESHOLDS.UNDERVALUED_RATING &&
    reviews < LEAD_THRESHOLDS.UNDERVALUED_MAX_REVIEWS
  ) {
    opportunities.push(OpportunityType.UNDERVALUED);
  }

  if (!hasWebsite) {
    opportunities.push(OpportunityType.MISSING_INFO);
  }

  return opportunities;
};

/**
 * Generates a unique lead ID
 * @param index - Lead index in the list
 * @returns Unique ID string
 */
export const generateLeadId = (index: number): string => {
  return `lead-${index}-${Date.now()}`;
};
