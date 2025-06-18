
import React, { useState, useEffect } from 'react';
// import { SearchHistoryItem } from '../types'; // No longer needed
// import HistoryIcon from './icons/ClockCounterClockwiseIcon'; // No longer needed
import LoadingSpinner from './LoadingSpinner'; // For inline button spinner

interface ManualInputProps {
  onSubmit: (query: string) => void;
  initialQuery?: string;
  // history: SearchHistoryItem[]; // Removed
  // onHistoryItemClick: (query: string) => void; // Removed
  isLoading: boolean;
}

const ManualInput: React.FC<ManualInputProps> = ({ onSubmit, initialQuery, isLoading }) => {
  const [query, setQuery] = useState(initialQuery || '');

  useEffect(() => {
    if (initialQuery !== undefined) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="my-6 space-y-4">
      <div>
        <label htmlFor="medication-name" className="block text-base font-medium text-slate-700 mb-1">
          Enter Medication Name:
        </label>
        <input
          id="medication-name"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Amoxicillin, Ibuprofen..."
          className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400 text-lg bg-white text-slate-900"
          aria-label="Medication name input"
          disabled={isLoading}
        />
      </div>

      {/* History rendering section removed */}

      <button
        type="submit"
        disabled={!query.trim() || isLoading}
        className="w-full flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition duration-150 ease-in-out relative"
        aria-label="Search for medication information"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" color="text-white" />
            <span className="ml-2">Searching...</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            Search
          </>
        )}
      </button>
    </form>
  );
};

export default ManualInput;