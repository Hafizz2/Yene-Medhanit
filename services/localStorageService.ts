import { CachedMedicationData, LanguageCode, MedicationInfo, GroundingMetadata, CachedMedicationSummaryItem } from '../types';
import { MAX_CACHED_ITEMS } from '../constants';

const MEDICATION_CACHE_KEY = 'medicationInfoCache';

// --- Medication Cache (serves as History) ---

interface CacheStructure {
  [key: string]: CachedMedicationData; // key will be `originalQuery.toLowerCase()_languageCode`
}

const getMedicationCacheInternal = (): CacheStructure => {
  try {
    const storedCache = localStorage.getItem(MEDICATION_CACHE_KEY);
    return storedCache ? JSON.parse(storedCache) : {};
  } catch (error) {
    console.error("Error retrieving medication cache:", error);
    return {};
  }
};

const saveMedicationCacheInternal = (cache: CacheStructure): void => {
  try {
    localStorage.setItem(MEDICATION_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Error saving medication cache:", error);
  }
};

export const getCachedMedication = (originalQuery: string, lang: LanguageCode): CachedMedicationData | null => {
  const cacheKey = `${originalQuery.toLowerCase()}_${lang}`;
  const cache = getMedicationCacheInternal();
  const cachedItem = cache[cacheKey];

  if (cachedItem) {
    console.log(`Cache hit for query "${originalQuery}" (${lang})`);
    return cachedItem;
  }
  console.log(`Cache miss for query "${originalQuery}" (${lang})`);
  return null;
};

export const setCachedMedication = (
  originalQuery: string, // Changed from 'name' to 'originalQuery' for clarity
  lang: LanguageCode,
  info: MedicationInfo,
  groundingMetadata: GroundingMetadata | null
): void => {
  const cacheKey = `${originalQuery.toLowerCase()}_${lang}`;
  const cache = getMedicationCacheInternal();

  // Do not cache if info.name (from API) indicates an error or not recognized state
  if (info.name.toLowerCase().includes("not recognized") || 
      info.name.toLowerCase().includes("data error") ||
      info.name.toLowerCase().includes("api error")) {
    console.log(`Skipping cache for error/unrecognized item: query "${originalQuery}", API name "${info.name}" (${lang})`);
    return;
  }

  const newItem: CachedMedicationData = {
    originalQuery, // Store the original query
    info,
    groundingMetadata,
    timestamp: Date.now(),
    languageCode: lang,
  };
  
  cache[cacheKey] = newItem;

  // Cache eviction: if cache exceeds max items, remove oldest
  const keys = Object.keys(cache);
  if (keys.length > MAX_CACHED_ITEMS) {
    keys.sort((a, b) => cache[a].timestamp - cache[b].timestamp); // Sort by oldest first
    const itemsToRemove = keys.length - MAX_CACHED_ITEMS;
    for (let i = 0; i < itemsToRemove; i++) {
      console.log(`Cache full. Removing oldest item: ${keys[i]} (Query: ${cache[keys[i]].originalQuery})`);
      delete cache[keys[i]];
    }
  }
  saveMedicationCacheInternal(cache);
  console.log(`Cached query "${originalQuery}" (${lang})`);
};

export const getAllCachedMedicationSummary = (): CachedMedicationSummaryItem[] => {
  const cache = getMedicationCacheInternal();
  return Object.values(cache)
    .map(item => ({
      name: item.originalQuery, // Use originalQuery for display and lookup
      languageCode: item.languageCode,
      timestamp: item.timestamp,
    }))
    .sort((a, b) => b.timestamp - a.timestamp); // Sort by most recent
};