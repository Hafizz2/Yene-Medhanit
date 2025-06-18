
import React from 'react';
import { Language, LanguageCode } from '../types';

interface LanguageSelectorProps {
  selectedLanguage: LanguageCode;
  onLanguageChange: (languageCode: LanguageCode) => void;
  languages: Language[];
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onLanguageChange, languages }) => {
  return (
    <div className="relative mb-6">
      <label className="block text-base font-medium text-slate-700 mb-2">
        Display Language:
      </label>
      <div className="flex overflow-x-auto space-x-2 pb-2 -mb-2 no-scrollbar" 
           style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} /* For Firefox and IE/Edge */
      >
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`px-4 py-2.5 text-base font-medium rounded-md whitespace-nowrap transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500
              ${selectedLanguage === lang.code 
                ? 'bg-sky-600 text-white shadow-md scale-105' 
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
              }`}
            aria-pressed={selectedLanguage === lang.code}
          >
            {lang.nativeName} <span className="hidden sm:inline">({lang.name})</span>
          </button>
        ))}
      </div>
      {/* Subtle gradient fades for scroll indication - optional */}
      <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white pointer-events-none md:hidden"></div>
      <div className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-white pointer-events-none md:hidden"></div>
    </div>
  );
};

export default LanguageSelector;
