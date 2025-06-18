export enum LanguageCode {
  EN = 'en',
  AM = 'am',
  AR = 'ar',
  OM = 'om',
  TI = 'ti',
}

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string; // e.g., "English", "አማርኛ"
}

export interface MedicationInfo {
  name: string;
  overview: string;
  usageInstructions: string; // Will include dosages
  sideEffects: string; // Consolidated field for all side effects
  contradictions: string; // User-specified term for contraindications
  storageInstructions: string;
  disclaimer: string;
}

export type InputMethod = 'camera' | 'manual';

// For Gemini Search Grounding
export interface GroundingChunkWeb {
  uri?: string; // Made optional to align with @google/genai SDK
  title?: string; // Made optional to align with @google/genai SDK and good practice
}
export interface GroundingChunk {
  web?: GroundingChunkWeb; // Made optional as a chunk might not be web-based or web property might be absent
}
export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

// For Offline Cache (also serves as history)
export interface CachedMedicationData {
  originalQuery: string; // The user's original search term
  info: MedicationInfo;
  groundingMetadata: GroundingMetadata | null;
  timestamp: number;
  languageCode: LanguageCode; // Store language code to ensure correct cache retrieval
}

export interface CachedMedicationSummaryItem {
  name: string; // This will now be the originalQuery
  languageCode: LanguageCode;
  timestamp: number;
}

export type AppView = 'home' | 'history' | 'info';

export interface AdOffer {
  id: string;
  imageUrl: string; // URL for the ad image
  linkUrl?: string; // Optional URL to navigate to when ad is clicked
  altText: string;  // Alt text for the ad image
  videoUrl?: string; // Optional URL for a video ad
}