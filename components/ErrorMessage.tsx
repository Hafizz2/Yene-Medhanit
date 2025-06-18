
import React from 'react';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div 
      className="my-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md shadow-md flex justify-between items-start" 
      role="alert"
    >
      <div>
        <p className="font-bold">Error</p>
        <p>{message}</p>
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className="ml-4 text-red-500 hover:text-red-700 focus:outline-none"
          aria-label="Close error message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
