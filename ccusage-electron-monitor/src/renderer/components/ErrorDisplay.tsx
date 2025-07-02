import React from 'react';
import { useUsageStore } from '../store/usage-store';

interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  const { clearError, refreshUsage } = useUsageStore();

  const handleRetry = () => {
    clearError();
    refreshUsage();
  };

  const getErrorMessage = (error: string): string => {
    if (error.includes('COMMAND_NOT_FOUND')) {
      return 'ccusage command not found. Please install ccusage CLI tool.';
    }
    if (error.includes('EXECUTION_FAILED')) {
      return 'Failed to execute ccusage command. Please check your installation.';
    }
    if (error.includes('JSON_PARSING_FAILED')) {
      return 'Failed to parse ccusage output. The command may have returned invalid data.';
    }
    return error;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-6">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-sm font-semibold text-red-700">Error</h3>
        <p className="text-xs text-red-600 max-w-xs text-center leading-relaxed">
          {getErrorMessage(error)}
        </p>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={handleRetry}
          className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Retry</span>
          </div>
        </button>
        
        <button
          onClick={clearError}
          className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};