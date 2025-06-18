
import React, { useState, ReactNode } from 'react';
import { MedicationInfo, LanguageCode, GroundingMetadata, GroundingChunk } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants';
import ChevronDownIcon from './icons/ChevronDownIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import ClipboardCheckIcon from './icons/ClipboardCheckIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import ArchiveBoxIcon from './icons/ArchiveBoxIcon';
import MagnifyingGlassMinusIcon from './icons/MagnifyingGlassMinusIcon'; // New icon for not found state

interface MedicationInfoDisplayProps {
  info: MedicationInfo;
  groundingMetadata: GroundingMetadata | null;
  language: LanguageCode;
  scannedImagePreview?: string | null;
  identifiedMedicationName?: string | null;
}

interface InfoSectionProps {
  title: string;
  content: string | string[] | undefined;
  icon: ReactNode;
  initiallyOpen?: boolean;
  langDir?: 'ltr' | 'rtl';
}

const InfoSection: React.FC<InfoSectionProps> = ({ title, content, icon, initiallyOpen = false, langDir = 'ltr' }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  if (content === undefined || content === null || (typeof content === 'string' && content.trim() === "") || (Array.isArray(content) && content.length === 0)) {
    return null;
  }
  
  const displayContent = Array.isArray(content) ? content.join(', ') : content;

  const isEffectivelyEmpty = typeof displayContent === 'string' && 
                            (displayContent.toLowerCase().includes("not available") || 
                             displayContent.toLowerCase().includes("not applicable") ||
                             displayContent.toLowerCase().includes("consult your doctor") ||
                             displayContent.toLowerCase().includes("n/a"));

  return (
    <div className="bg-slate-50 p-4 rounded-lg shadow-md mb-4" dir={langDir}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left focus:outline-none group"
        aria-expanded={isOpen}
        aria-controls={`section-${title.replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center">
          <span className="mr-3 text-sky-600 w-6 h-6">{icon}</span>
          <h3 className="text-lg font-semibold text-slate-800 group-hover:text-sky-700 transition-colors">
            {title}
          </h3>
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 text-slate-500 transform transition-transform duration-200 group-hover:text-slate-600 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div 
            id={`section-${title.replace(/\s+/g, '-')}`} 
            className="mt-3 pt-3 border-t border-slate-200 text-slate-700 space-y-2 text-base leading-relaxed prose prose-base max-w-none"
        >
          {typeof displayContent === 'string' && displayContent.includes('\n') ? 
            displayContent.split('\n').map((paragraph, index) => (
              paragraph.trim() && <p key={index}>{paragraph}</p>
            )) : 
            <p>{isEffectivelyEmpty ? <em className="text-slate-500">{displayContent}</em> : displayContent}</p>
          }
        </div>
      )}
    </div>
  );
};


const MedicationInfoDisplay: React.FC<MedicationInfoDisplayProps> = ({ info, groundingMetadata, language, scannedImagePreview, identifiedMedicationName }) => {
  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === language);
  const langDir = (language === LanguageCode.AR || language === LanguageCode.AM) ? 'rtl' : 'ltr';

  const isDataError = info.name.toLowerCase().includes("data error") || 
                      info.name.toLowerCase().includes("api error") || 
                      info.overview.toLowerCase().includes("could not retrieve structured information"); 
                      
  const isNotRecognized = info.name.toLowerCase().includes("not recognized") && !isDataError;


  if (isDataError || isNotRecognized) {
    const title = isDataError ? "Error Retrieving Information" : "Medication Not Found";
    const message = isDataError ? 
      `We encountered an issue retrieving details for "${identifiedMedicationName || info.name.split(" - ")[0]}". Please try again later or contact support if the problem persists.` :
      `We couldn't find detailed information for "${identifiedMedicationName || info.name.split(" - ")[0]}". Please check the spelling or try a different medication name.`;

    return (
      <div className="mt-6 mb-4 p-6 sm:p-8 bg-slate-50 rounded-lg shadow-md text-center" dir={langDir}>
        <MagnifyingGlassMinusIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 mb-2">{title}</h2>
        <p className="text-slate-600 text-base">{message}</p>
         {info.disclaimer && !isDataError && ( // Show disclaimer if not a data error and it exists
            <div className="mt-6 p-3 bg-amber-100 border-l-4 border-amber-500 rounded-md text-amber-900 text-sm text-left" dir={langDir}>
                 <div className="flex items-start">
                    <InformationCircleIcon className="w-5 h-5 mr-2 mt-0.5 text-amber-600 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Disclaimer</p>
                        <p>{info.disclaimer}</p>
                    </div>
                 </div>
            </div>
        )}
      </div>
    );
  }


  const sections = [
    { title: "Overview", content: info.overview, icon: <InformationCircleIcon />, initiallyOpen: true },
    { title: "Usage Instructions (incl. Dosages)", content: info.usageInstructions, icon: <ClipboardCheckIcon />, initiallyOpen: true },
    { title: "Side Effects", content: info.sideEffects, icon: <ExclamationTriangleIcon /> },
    { title: "Contradictions", content: info.contradictions, icon: <ExclamationTriangleIcon /> },
    { title: "Storage Instructions", content: info.storageInstructions, icon: <ArchiveBoxIcon /> },
  ];

  return (
    <div className="mt-6 mb-4" dir={langDir}>
      <h2 className="text-2xl sm:text-3xl font-bold text-sky-800 mb-2 text-center sm:text-left" style={{ fontFamily: "'Playfair Display', serif" }}>
        {info.name || "Medication Information"}
      </h2>
      <p className="text-sm text-slate-500 mb-6 text-center sm:text-left">
        Displaying information in: {currentLanguage?.nativeName || language.toUpperCase()}
      </p>

      {scannedImagePreview && (
          <div className="mb-6 p-3 border border-slate-300 rounded-lg bg-slate-50">
            <h3 className="text-md font-semibold text-slate-700 mb-2">Scanned Image</h3>
            <img src={`data:image/jpeg;base64,${scannedImagePreview}`} alt="Scanned medication" className="max-w-[200px] w-full mx-auto rounded-md shadow"/>
            {identifiedMedicationName && <p className="text-center mt-2 text-sm text-slate-600">Identified as: <span className="font-medium">{identifiedMedicationName}</span></p>}
          </div>
        )}

      <div className="space-y-4">
        {sections.map(section => (
          <InfoSection 
              key={section.title} 
              title={section.title} 
              content={section.content}
              icon={section.icon}
              initiallyOpen={section.initiallyOpen || false}
              langDir={langDir}
          />
        ))}
      </div>

      {info.disclaimer && (
        <div className="mt-6 p-4 bg-amber-100 border-l-4 border-amber-500 rounded-md text-amber-900 text-sm" dir={langDir}>
          <div className="flex items-start">
            <InformationCircleIcon className="w-5 h-5 mr-2 mt-0.5 text-amber-600 flex-shrink-0" />
            <div>
                <p className="font-semibold">Disclaimer</p>
                <p>{info.disclaimer}</p>
            </div>
          </div>
        </div>
      )}

      {groundingMetadata && groundingMetadata.groundingChunks && groundingMetadata.groundingChunks.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-300" dir={langDir}>
          <h4 className="text-md font-semibold text-slate-700 mb-2">Sources:</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            {groundingMetadata.groundingChunks.map((chunk: GroundingChunk, index: number) => {
              if (chunk.web && chunk.web.uri) { 
                return (
                  <li key={index}>
                    <a 
                      href={chunk.web.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:text-sky-800 hover:underline"
                    >
                      {chunk.web.title || chunk.web.uri}
                    </a>
                  </li>
                );
              }
              return null; 
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MedicationInfoDisplay;