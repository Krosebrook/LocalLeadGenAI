
export enum OpportunityType {
  LOW_REPUTATION = 'Low Reputation',
  UNDERVALUED = 'Undervalued',
  MISSING_INFO = 'Missing Info'
}

export interface BusinessLead {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  website?: string;
  opportunities: OpportunityType[];
}

export interface BusinessAudit {
  content: string;
  sources: { title: string; uri: string }[];
  gaps: string[];
}

export interface SearchState {
  niche: string;
  city: string;
}
