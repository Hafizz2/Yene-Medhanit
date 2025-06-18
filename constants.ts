import { Language, LanguageCode, AdOffer } from './types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: LanguageCode.EN, name: 'English', nativeName: 'English' },
  { code: LanguageCode.AM, name: 'Amharic', nativeName: 'አማርኛ' },
  { code: LanguageCode.AR, name: 'Arabic', nativeName: 'العربية' },
  { code: LanguageCode.OM, name: 'Oromo', nativeName: 'Afaan Oromoo' },
  { code: LanguageCode.TI, name: 'Tigrigna', nativeName: 'ትግርኛ' },
];

export const DEFAULT_LANGUAGE_CODE = LanguageCode.EN;

// As per guidelines, use 'gemini-2.5-flash-preview-04-17' for general text tasks, including multimodal analysis.
export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17'; 
// The 'GEMINI_IMAGE_MODEL' was a bit of a misnomer; multimodal models like gemini-2.5-flash handle image inputs for analysis.
// For actual image generation, 'imagen-3.0-generate-002' would be used, but this app analyzes images.

// It's crucial that process.env.API_KEY is set in the environment where this app runs.
// We directly use process.env.API_KEY in geminiService.ts as per instructions.

export const APP_TITLE = "Yene Medhanit";

// Rate Limiting
export const RATE_LIMIT_COUNT = 5; // Max 5 requests
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // Per 1 minute

// Interstitial Ad
export const AD_INTERVAL = 2; // Show ad every 2 successful fetches
export const AD_DURATION_SECONDS = 5; // Ad shown for 10 seconds (changed from 10 to 5 for quicker testing if needed)
export const AD_MESSAGE_TITLE = "A Quick Message from Yene Medhanit";
export const AD_MESSAGE_BODY = "Thank you for using our app! Your continued support helps us improve and provide this service. The medication information will appear shortly.";

// Offline Cache (also serves as history)
export const MAX_CACHED_ITEMS = 10; // Max number of medication info items to cache
export const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // Cache items for 1 day (optional, can also just limit by number)

// URL for fetching ad offers from an external JSON file
// REPLACE THIS WITH THE ACTUAL RAW URL OF YOUR HOSTED ads.json FILE
// Example using a GitHub Gist (make sure it's the 'raw' link):
// export const EXTERNAL_ADS_JSON_URL = 'https://gist.githubusercontent.com/your_username/your_gist_id/raw/your_commit_hash/ads.json';
export const EXTERNAL_ADS_JSON_URL = 'https://gist.githubusercontent.com/Hafizz2/f60ab97aa168c30d4ea8289dab2607c8/raw/8e3f3d7bf069d873ed8ad5ba1aa812d5f98383c8/ads.json'; // Placeholder with example structure
