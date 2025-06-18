import React, { useState, useEffect } from 'react';
import { CachedMedicationSummaryItem, LanguageCode } from '../types'; 
import { SUPPORTED_LANGUAGES } from '../constants'; 
import { getAllCachedMedicationSummary } from '../services/localStorageService';
// import HistoryIcon from './icons/ClockCounterClockwiseIcon'; // No longer used for separate history section
import ArchiveBoxIcon from './icons/ArchiveBoxIcon';

interface HistoryViewProps {
  // onSelectHistoryItem: (query: string, lang: LanguageCode) => void; // Removed
  onSelectCachedItem: (name: string, lang: LanguageCode) => void;
  currentLanguage: LanguageCode; // Kept for potential future use or context, though items show their own lang
}

const HistoryView: React.FC<HistoryViewProps> = ({ onSelectCachedItem, currentLanguage }) => {
  // history state removed
  const [cachedItems, setCachedItems] = useState<CachedMedicationSummaryItem[]>([]);

  useEffect(() => {
    // setHistory(getSearchHistory()); // Removed
    setCachedItems(getAllCachedMedicationSummary());
  }, []);

  const getLanguageName = (code: LanguageCode) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang ? lang.nativeName : code.toUpperCase();
  };

  const timeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.round((now - timestamp) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4">
      <div className="bg-white shadow-2xl rounded-xl p-4 sm:p-6 md:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
          Recently Viewed
        </h2>

        {cachedItems.length === 0 && (
          <p className="text-center text-slate-500 py-8">
            Your recently viewed medications will appear here once you start searching.
          </p>
        )}

        {/* Explicit Search History section removed */}

        {cachedItems.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center">
              <ArchiveBoxIcon className="w-5 h-5 mr-2" />
              Available Offline
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              These items are stored locally for faster access and offline use. Data is cached per language.
            </p>
            <ul className="space-y-2">
              {cachedItems.map((item) => (
                <li key={`${item.name}-${item.languageCode}-${item.timestamp}`}>
                  <button
                    onClick={() => onSelectCachedItem(item.name, item.languageCode)}
                    className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-slate-800 font-medium">{item.name}</span>
                        <span className="block text-xs text-sky-600">({getLanguageName(item.languageCode)})</span>
                      </div>
                      <span className="text-xs text-slate-400">{timeAgo(item.timestamp)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default HistoryView;