
import React from 'react';

interface WelcomeMessageProps {
  onStart: () => void;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ onStart }) => {
  return (
    <div className="text-center p-6 sm:p-8 md:p-10 my-8 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl shadow-xl text-white">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Welcome to Yene Medhanit!</h2>
      <p className="text-base sm:text-lg mb-6">
        Get quick and easy-to-understand information about your medications.
        You can scan your medication or prescription, or enter the name manually.
      </p>
      <button
        onClick={onStart}
        className="px-8 py-3.5 bg-white text-sky-600 font-semibold rounded-lg shadow-md hover:bg-slate-100 transition-colors duration-200 text-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-opacity-50"
        aria-label="Start using the medication guide"
      >
        Get Started
      </button>
    </div>
  );
};

export default WelcomeMessage;
