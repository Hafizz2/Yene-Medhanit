import React from 'react';
import LogoIcon from './icons/LogoIcon';

interface AppHeaderProps {
  title: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-md h-20 rounded-b-xl">
      <div className="flex items-center space-x-3">
        <LogoIcon className="w-10 h-10 sm:w-12 sm:h-12 text-sky-600" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-sky-700" style={{ fontFamily: "'Playfair Display', serif" }}>
            {title}
          </h1>
          <p className="text-xs text-slate-500 -mt-1">Your Personal Medication Guide</p>
        </div>
      </div>
      {/* IconButton removed here as its functionality moves to bottom nav */}
    </header>
  );
};

export default AppHeader;