import React from 'react';
import { useUsageStore } from '../store/usage-store';

export const Controls: React.FC = () => {
  const { refreshUsage, isLoading } = useUsageStore();

  const handleRefresh = () => {
    refreshUsage();
  };

  const handleQuit = () => {
    window.close();
  };

  return (
    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
      <button
        onClick={handleRefresh}
        disabled={isLoading}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
          isLoading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-1">
            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Refreshing...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </div>
        )}
      </button>
      
      <button
        onClick={handleQuit}
        className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
      >
        <div className="flex items-center space-x-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Close</span>
        </div>
      </button>
    </div>
  );
};