import React from 'react';
import { AppView } from '../types';
import HomeIcon from './icons/HomeIcon';
import ListBulletIcon from './icons/ListBulletIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';

interface BottomNavigationBarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { view: 'home' as AppView, label: 'Home', icon: HomeIcon },
    { view: 'history' as AppView, label: 'History', icon: ListBulletIcon },
    { view: 'info' as AppView, label: 'Info', icon: InformationCircleIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg rounded-t-xl z-30">
      <div className="max-w-2xl mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          const IconComponent = item.icon;
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`flex flex-col items-center justify-center w-full h-full p-2 focus:outline-none transition-colors duration-200 ease-in-out
                ${isActive ? 'text-sky-600' : 'text-slate-500 hover:text-sky-500'}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <IconComponent className={`w-6 h-6 mb-0.5 ${isActive ? 'stroke-[2px]' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigationBar;