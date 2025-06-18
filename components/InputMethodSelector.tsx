
import React from 'react';
import { InputMethod } from '../types';

interface InputMethodSelectorProps {
  currentMethod: InputMethod | null;
  onSelect: (method: InputMethod) => void;
}

const CameraIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 mr-2"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
  </svg>
);

const PencilIcon: React.FC<{className?: string}> = ({className}) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 mr-2"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);


const InputMethodSelector: React.FC<InputMethodSelectorProps> = ({ currentMethod, onSelect }) => {
  const buttonBaseClass = "flex-1 text-center py-3.5 px-4 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 flex items-center justify-center font-medium text-base";
  const activeClass = "bg-sky-600 text-white shadow-lg";
  const inactiveClass = "bg-white text-sky-700 hover:bg-sky-100 border border-slate-300";

  return (
    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 my-6">
      <button
        onClick={() => onSelect('camera')}
        className={`${buttonBaseClass} ${currentMethod === 'camera' ? activeClass : inactiveClass}`}
        aria-pressed={currentMethod === 'camera'}
      >
        <CameraIcon className="w-5 h-5 mr-2" />
        Scan with Camera
      </button>
      <button
        onClick={() => onSelect('manual')}
        className={`${buttonBaseClass} ${currentMethod === 'manual' ? activeClass : inactiveClass}`}
        aria-pressed={currentMethod === 'manual'}
      >
        <PencilIcon className="w-5 h-5 mr-2" />
        Enter Manually
      </button>
    </div>
  );
};

export default InputMethodSelector;
