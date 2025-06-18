
import React, { useState, useCallback, useEffect } from 'react';
import { LanguageCode, MedicationInfo, InputMethod, GroundingMetadata, AppView, CachedMedicationSummaryItem, AdOffer } from './types';
import { 
    SUPPORTED_LANGUAGES, 
    DEFAULT_LANGUAGE_CODE, 
    APP_TITLE,
    RATE_LIMIT_COUNT,
    RATE_LIMIT_WINDOW_MS,
    AD_INTERVAL,
    AD_DURATION_SECONDS,
    EXTERNAL_ADS_JSON_URL // Use new constant for external ads
} from './constants';
import { identifyMedicationFromImage, getMedicationInfo } from './services/geminiService';
import { getCachedMedication } from './services/localStorageService'; 
import LanguageSelector from './components/LanguageSelector';
import InputMethodSelector from './components/InputMethodSelector';
import ManualInput from './components/ManualInput';
import CameraCapture from './components/CameraCapture';
import MedicationInfoDisplay from './components/MedicationInfoDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import AppHeader from './components/AppHeader';
import WelcomeMessage from './components/WelcomeMessage';
import InterstitialAd from './components/InterstitialAd';
import BottomNavigationBar from './components/BottomNavigationBar';
import HistoryView from './components/HistoryView';
import InfoView from './components/InfoView';

const App = (): JSX.Element => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE_CODE);
  const [inputMethod, setInputMethod] = useState<InputMethod | null>(null);
  const [medicationQuery, setMedicationQuery] = useState<string>('');
  const [medicationInfo, setMedicationInfo] = useState<MedicationInfo | null>(null);
  const [groundingMetadata, setGroundingMetadata] = useState<GroundingMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [capturedImagePreview, setCapturedImagePreview] = useState<string | null>(null);
  
  const [successfulFetchCount, setSuccessfulFetchCount] = useState<number>(() => {
    const storedCount = localStorage.getItem('successfulFetchCount');
    return storedCount ? parseInt(storedCount, 10) : 0;
  });
  const [showInterstitialAd, setShowInterstitialAd] = useState<boolean>(false);
  const [pendingMedicationInfo, setPendingMedicationInfo] = useState<MedicationInfo | null>(null);
  const [pendingGroundingMetadata, setPendingGroundingMetadata] = useState<GroundingMetadata | null>(null);
  const [pendingCapturedImagePreview, setPendingCapturedImagePreview] = useState<string | null>(null);
  const [pendingIdentifiedMedicationName, setPendingIdentifiedMedicationName] = useState<string | null>(null);
  
  // State for fetched ad offers
  const [adOffers, setAdOffers] = useState<AdOffer[] | null>(null);
  const [adsLoading, setAdsLoading] = useState<boolean>(true);
  const [adsError, setAdsError] = useState<string | null>(null); // Kept for console logging, not UI

  const [currentAdOfferIndex, setCurrentAdOfferIndex] = useState<number>(() => {
    const storedIndex = localStorage.getItem('currentAdOfferIndex');
    return storedIndex ? parseInt(storedIndex, 10) : 0; 
  });
  const [activeAdOffer, setActiveAdOffer] = useState<AdOffer | null>(null);


  useEffect(() => {
    document.documentElement.classList.remove('dark'); 
    localStorage.removeItem('theme'); 
  }, []);

  // Fetch ad offers from external JSON
  useEffect(() => {
    const fetchAds = async () => {
      setAdsLoading(true);
      setAdsError(null);
      try {
        const response = await fetch(EXTERNAL_ADS_JSON_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch ads: ${response.status} ${response.statusText}`);
        }
        const data: AdOffer[] = await response.json();
        if (!Array.isArray(data) || data.some(ad => !ad.id || !ad.imageUrl || !ad.altText)) {
            console.error("Fetched ads data is not a valid array of AdOffer:", data);
            throw new Error("Invalid ad data format received.");
        }
        setAdOffers(data);
      } catch (err) {
        console.error("Error fetching or parsing ad offers:", err);
        setAdsError(err instanceof Error ? err.message : "Could not load ad offers.");
        setAdOffers([]); 
      } finally {
        setAdsLoading(false);
      }
    };

    fetchAds();
  }, []);


  const checkAndRecordRequest = (): boolean => {
    const now = Date.now();
    const timestamps = JSON.parse(localStorage.getItem('apiRequestTimestamps') || '[]') as number[];
    const recentTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

    if (recentTimestamps.length >= RATE_LIMIT_COUNT) {
      const oldestRelevantTimestamp = recentTimestamps.length > 0 ? recentTimestamps[0] : now;
      const timeToWaitMs = RATE_LIMIT_WINDOW_MS - (now - oldestRelevantTimestamp);
      const timeToWaitSeconds = Math.max(1, Math.ceil(timeToWaitMs / 1000));
      setError(`Too many requests. Please try again in about ${timeToWaitSeconds} second${timeToWaitSeconds > 1 ? 's' : ''}.`);
      setIsLoading(false);
      return false;
    }

    recentTimestamps.push(now);
    localStorage.setItem('apiRequestTimestamps', JSON.stringify(recentTimestamps));
    return true;
  };

  const resetHomeState = (preserveInputMethod = false, preserveQuery = false) => {
    setMedicationInfo(null);
    setGroundingMetadata(null);
    setError(null);
    if (!preserveQuery) setMedicationQuery('');
    setCapturedImagePreview(null);
    
    setPendingMedicationInfo(null);
    setPendingGroundingMetadata(null);
    setPendingCapturedImagePreview(null);
    setPendingIdentifiedMedicationName(null);
    setShowInterstitialAd(false);
    setActiveAdOffer(null);

    if (!preserveInputMethod) {
        setInputMethod(null);
        setShowCamera(false);
    }
  };
  
  const handleLanguageChange = (langCode: LanguageCode) => {
    const oldLang = selectedLanguage;
    setSelectedLanguage(langCode);
    const nameToRefetch = medicationInfo?.name.split(' - ')[0] || pendingMedicationInfo?.name.split(' - ')[0] || medicationQuery;
    
    if (nameToRefetch && currentView === 'home') { 
        resetHomeState(true, true); 
        fetchDetails(nameToRefetch, langCode, false, oldLang); 
    }
  };

  const handleInputMethodSelect = (method: InputMethod) => {
    resetHomeState(true); 
    setInputMethod(method);
    setShowCamera(method === 'camera');
  };
  
  const isDataValidForDisplay = (info: MedicationInfo | null): boolean => {
    if (!info) return false;
    const nameLower = info.name.toLowerCase();
    const overviewLower = info.overview.toLowerCase();
    return !(nameLower.includes("not recognized") || 
             overviewLower.includes("not available") || 
             nameLower.includes("data error") ||
             nameLower.includes("api error"));
  };

  const fetchDetails = useCallback(async (name: string, lang: LanguageCode, bypassAdAndRateLimit: boolean = false, previousLangForCacheCheck?: LanguageCode) => {
    if (!name.trim()) {
      setError("Please enter or scan a medication name.");
      return;
    }

    if (!bypassAdAndRateLimit && !checkAndRecordRequest()) return;

    setIsLoading(true);
    setError(null);
    if (currentView !== 'home') setCurrentView('home'); 
    setMedicationInfo(null); 
    setGroundingMetadata(null);
    
    try {
      const result = await getMedicationInfo(name, lang); 
      if (result && result.info) {
        const isValidData = isDataValidForDisplay(result.info);
        if (isValidData) {
            let currentFetchCount = successfulFetchCount;
            if (!bypassAdAndRateLimit) { 
                currentFetchCount += 1;
                setSuccessfulFetchCount(currentFetchCount);
                localStorage.setItem('successfulFetchCount', currentFetchCount.toString());
            }

            if (!bypassAdAndRateLimit && adOffers && adOffers.length > 0 && currentFetchCount % AD_INTERVAL === 0) {
                setPendingMedicationInfo(result.info);
                setPendingGroundingMetadata(result.groundingMetadata || null);
                if(inputMethod === 'camera' && capturedImagePreview && medicationQuery === name){
                    setPendingCapturedImagePreview(capturedImagePreview);
                    setPendingIdentifiedMedicationName(medicationQuery);
                } else {
                    setPendingCapturedImagePreview(null);
                    setPendingIdentifiedMedicationName(null);
                }
                setActiveAdOffer(adOffers[currentAdOfferIndex % adOffers.length]);
                setShowInterstitialAd(true);
            } else {
                setMedicationInfo(result.info);
                setGroundingMetadata(result.groundingMetadata || null);
                setPendingMedicationInfo(null);
                setPendingGroundingMetadata(null);
                setPendingCapturedImagePreview(null);
                setPendingIdentifiedMedicationName(null);
                setActiveAdOffer(null);
            }
        } else {
            setMedicationInfo(result.info); 
            setGroundingMetadata(result.groundingMetadata || null);
        }
      } else {
        setError(`No information found for "${name}".`);
      }
    } catch (err) {
      console.error("Error fetching medication details:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching medication information.");
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successfulFetchCount, inputMethod, capturedImagePreview, medicationQuery, currentView, currentAdOfferIndex, adOffers]); 

  const handleManualSubmit = (query: string) => {
    setMedicationQuery(query);
    setCapturedImagePreview(null); 
    fetchDetails(query, selectedLanguage, false); 
  };
  

  const handleCachedItemClick = async (name: string, lang: LanguageCode) => { 
    setCurrentView('home');
    setSelectedLanguage(lang);
    setMedicationQuery(name); 
    setInputMethod('manual'); 
    setShowCamera(false);
    setError(null);
    setMedicationInfo(null); 
    setGroundingMetadata(null);
    setIsLoading(true);

    const cached = getCachedMedication(name, lang);
    if (cached) {
        console.log("Loading directly from cache via HistoryView click:", name, lang);
        setMedicationInfo(cached.info);
        setGroundingMetadata(cached.groundingMetadata);
        setShowInterstitialAd(false); 
        setActiveAdOffer(null);
        setPendingMedicationInfo(null); 
        setPendingGroundingMetadata(null);
        setPendingCapturedImagePreview(null);
        setPendingIdentifiedMedicationName(null);
        setIsLoading(false); 
    } else {
        console.warn(`Cache miss for item from HistoryView: query "${name}" (${lang}). This should be rare if item was in history. Performing new fetch, bypassing ad/rate limits.`);
        await fetchDetails(name, lang, true); 
    }
};


  const handleImageCapture = useCallback(async (base64Image: string) => {
    setShowCamera(false); 
    setCapturedImagePreview(base64Image); 
    
    if (!checkAndRecordRequest()) {
      setCapturedImagePreview(null); 
      return;
    }

    setIsLoading(true);
    setError(null);
    if (currentView !== 'home') setCurrentView('home');
    setMedicationInfo(null);
    setGroundingMetadata(null);

    try {
      const identifiedName = await identifyMedicationFromImage(base64Image);
      if (identifiedName && identifiedName.toLowerCase() !== 'unknown' && identifiedName.trim() !== '') {
        setMedicationQuery(identifiedName);
        await fetchDetails(identifiedName, selectedLanguage, false); 
      } else {
        setError("Could not identify medication from the image. Please try again or enter manually.");
        setCapturedImagePreview(null); 
      }
    } catch (err) {
      console.error("Error processing image:", err);
      setError(err instanceof Error ? err.message : "An error occurred during image processing.");
      setCapturedImagePreview(null); 
    } finally {
      setIsLoading(false); 
    }
  }, [selectedLanguage, fetchDetails, currentView]);
  
  const handleBackToInputSelection = () => { 
    resetHomeState(); 
    setShowCamera(false);
    setCurrentView('home'); 
  }

  const handleAdClose = () => {
    setShowInterstitialAd(false);
    setActiveAdOffer(null);
    if (pendingMedicationInfo) {
      setMedicationInfo(pendingMedicationInfo);
      setGroundingMetadata(pendingGroundingMetadata);
      setCapturedImagePreview(pendingCapturedImagePreview); 
      setMedicationQuery(pendingIdentifiedMedicationName || medicationQuery || ''); 
    }
    setPendingMedicationInfo(null);
    setPendingGroundingMetadata(null);
    setPendingCapturedImagePreview(null);
    setPendingIdentifiedMedicationName(null);
    setCurrentView('home');
    
    if (adOffers && adOffers.length > 0) {
      const nextAdIndex = (currentAdOfferIndex + 1) % adOffers.length;
      setCurrentAdOfferIndex(nextAdIndex);
      localStorage.setItem('currentAdOfferIndex', nextAdIndex.toString());
    }
  };
  
  const navigateToView = (view: AppView) => {
    setError(null); 
    if (view !== 'home' && showInterstitialAd) {
        setShowInterstitialAd(false);
        setActiveAdOffer(null);
        setPendingMedicationInfo(null);
        setPendingGroundingMetadata(null);
        setPendingCapturedImagePreview(null);
        setPendingIdentifiedMedicationName(null);
    }
    setCurrentView(view);
  };

  const headerHeightClass = "pt-24"; 
  const mainContentBottomPadding = "pb-24"; 

  const renderHomeView = () => (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4">
      <div className="bg-white shadow-2xl rounded-xl p-4 sm:p-6 md:p-8">
        <div className="mb-6 md:mb-8">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            languages={SUPPORTED_LANGUAGES}
          />
        </div>

        {!inputMethod && <WelcomeMessage onStart={() => { setInputMethod('manual'); resetHomeState(true);}} />}

        {inputMethod && (
            <button
                onClick={handleBackToInputSelection}
                className="mb-6 text-sm text-sky-600 hover:text-sky-800 transition-colors flex items-center group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 transform transition-transform group-hover:-translate-x-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Change Input Method
            </button>
        )}
        
        {inputMethod && <InputMethodSelector currentMethod={inputMethod} onSelect={handleInputMethodSelect} />}

        {isLoading && inputMethod !== 'manual' && <LoadingSpinner text="Processing..." /> }
        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {inputMethod === 'manual' && !showCamera && (
          <ManualInput 
            onSubmit={handleManualSubmit} 
            initialQuery={medicationQuery}
            isLoading={isLoading} 
          />
        )}

        {inputMethod === 'camera' && showCamera && !isLoading && (
          <CameraCapture onCapture={handleImageCapture} onClose={() => {setShowCamera(false); if (!medicationInfo && !pendingMedicationInfo) { setInputMethod(null); resetHomeState(true);}}} />
        )}
        
        {capturedImagePreview && !showCamera && !medicationInfo && !pendingMedicationInfo && !error && !isLoading && (
          <div className="my-4 p-4 border border-slate-300 rounded-lg bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Scanned Image:</h3>
            <img src={`data:image/jpeg;base64,${capturedImagePreview}`} alt="Captured medication" className="max-w-xs mx-auto rounded-md shadow-md"/>
            {medicationQuery && <p className="text-center mt-2 text-sm text-slate-600">Identified as: <span className="font-medium">{medicationQuery}</span></p>}
          </div>
        )}

        {!isLoading && medicationInfo && !showInterstitialAd && (
          <MedicationInfoDisplay 
            info={medicationInfo} 
            groundingMetadata={groundingMetadata}
            language={selectedLanguage} 
            scannedImagePreview={inputMethod === 'camera' ? capturedImagePreview : null}
            identifiedMedicationName={inputMethod === 'camera' ? medicationQuery : null}
          />
        )}
      </div>
    </div>
  );


  return (
    <div className="h-full flex flex-col bg-slate-100 text-slate-900 text-base">
      <AppHeader title={APP_TITLE} />

      {showInterstitialAd && activeAdOffer && (
        <InterstitialAd 
          adOffer={activeAdOffer}
          onClose={handleAdClose}
          durationSeconds={AD_DURATION_SECONDS}
        />
      )}

      <main className={`flex-grow overflow-y-auto ${headerHeightClass} ${mainContentBottomPadding} ${showInterstitialAd ? 'blur-sm pointer-events-none' : ''}`}>
        {adsLoading && currentView === 'home' && !inputMethod && <LoadingSpinner text="Loading ad configurations..." />}
        {/* Removed adsError display from UI as per user request */}
        
        {currentView === 'home' && renderHomeView()}
        {currentView === 'history' && (
            <HistoryView 
                onSelectCachedItem={handleCachedItemClick}
                currentLanguage={selectedLanguage} 
            />
        )}
        {currentView === 'info' && <InfoView />}
      </main>
      
      {!showInterstitialAd && (
          <BottomNavigationBar currentView={currentView} onNavigate={navigateToView} />
      )}

       <footer className={`p-4 bg-white border-t border-slate-200 shadow-md ${showInterstitialAd ? 'blur-sm pointer-events-none' : ''} ${currentView !== 'home' ? 'hidden sm:block' : ''} sr-only`}>
          <div className="text-center text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} {APP_TITLE}. All rights reserved.</p>
            <p className="mt-1">This tool is for informational purposes only. Always consult a healthcare professional.</p>
          </div>
      </footer>
    </div>
  );
};

export default App;
