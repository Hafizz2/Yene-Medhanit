import React, { useState, useEffect } from 'react';
import { AD_MESSAGE_TITLE, AD_MESSAGE_BODY } from '../constants';
import XMarkIcon from './icons/XMarkIcon';
import ArrowTopRightOnSquareIcon from './icons/ArrowTopRightOnSquareIcon'; 
import { AdOffer } from '../types'; 

interface InterstitialAdProps {
  adOffer: AdOffer; 
  onClose: () => void;
  durationSeconds: number;
}

interface CircularTimerProps {
  timeLeft: number;
  totalDuration: number;
  size?: number;
  strokeWidth?: number;
  onClose: () => void;
  showCloseState: boolean;
}

const CircularTimer: React.FC<CircularTimerProps> = ({
  timeLeft,
  totalDuration,
  size = 40, 
  strokeWidth = 3,
  onClose,
  showCloseState,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.max(0, Math.min(1, timeLeft / totalDuration));
  const strokeDashoffset = circumference * (1 - progress);


  return (
    <button
      onClick={showCloseState ? onClose : undefined}
      disabled={!showCloseState}
      className={`relative rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-400 transition-opacity duration-300 ${showCloseState ? 'opacity-100 cursor-pointer' : 'opacity-90 cursor-default'}`}
      aria-label={showCloseState ? "Close ad and continue" : `Ad will close in ${timeLeft} seconds`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.25)" 
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor" 
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          fill="transparent"
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s linear' }} 
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-white">
        {!showCloseState ? (
          <span className="text-xs font-bold" style={{ color: 'currentColor' }}>
            {timeLeft}
          </span>
        ) : (
          <XMarkIcon className="w-[45%] h-[45%]" style={{ color: 'currentColor' }} />
        )}
      </div>
    </button>
  );
};


const InterstitialAd: React.FC<InterstitialAdProps> = ({ adOffer, onClose, durationSeconds }) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      return; 
    }

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const showCloseState = timeLeft <= 0;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-95 z-50 flex flex-col items-stretch p-4 text-white text-center">
      {/* Top section for the circular timer */}
      <div className="w-full flex justify-end mb-2 shrink-0">
        <CircularTimer
          timeLeft={timeLeft}
          totalDuration={durationSeconds}
          onClose={onClose}
          showCloseState={showCloseState}
          size={36} 
          strokeWidth={3}
        />
      </div>

      {/* Main content area for ad image and messages */}
      <div className="flex flex-col items-center justify-center flex-grow w-full max-w-md mx-auto overflow-y-auto py-2">
        <div 
          className="relative w-full max-w-[280px] sm:max-w-[300px] aspect-square bg-slate-700/50 rounded-lg flex items-center justify-center text-slate-400 mb-4 border-2 border-dashed border-slate-600 shadow-lg overflow-hidden group" 
          aria-label="Advertisement content area"
        >
          <img 
            src={adOffer.imageUrl} 
            alt={adOffer.altText} 
            className="w-full h-full object-contain"
          />
          {/* Ad link button removed from here */}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-sky-400" style={{ fontFamily: "'Playfair Display', serif" }}>
          {AD_MESSAGE_TITLE}
        </h2>
        <p className="text-sm sm:text-base mb-3 text-slate-200 leading-relaxed max-w-xs sm:max-w-sm">
          {AD_MESSAGE_BODY}
        </p>
      </div>
      
      {/* "Click Here" button positioned at bottom-right of the screen */}
      {adOffer.linkUrl && (
        <a
          href={adOffer.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 flex items-center px-4 py-2.5 bg-sky-500 text-white text-sm font-medium rounded-lg shadow-md hover:bg-sky-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-opacity-75 z-10" // z-10 to ensure it's above other elements if needed
          aria-label="Visit advertiser's site"
        >
          Click Here
          <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
        </a>
      )}

      {/* Footer text */}
      <p className="text-xs text-slate-400 pt-2 shrink-0">Yene Medhanit Ad System</p>
    </div>
  );
};

export default InterstitialAd;