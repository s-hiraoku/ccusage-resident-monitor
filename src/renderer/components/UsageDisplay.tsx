import React from 'react';
import { UsageData } from '@shared/types';

interface UsageDisplayProps {
  usage: UsageData;
}

export const UsageDisplay: React.FC<UsageDisplayProps> = ({ usage }) => {
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-orange-500';
    return 'text-green-500';
  };
  
  const getProgressBarColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    return 'bg-green-500';
  };
  
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };
  
  return (
    <div className="space-y-3 text-sm">
      {/* トークン使用量 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Input Tokens:</span>
          <span className="font-semibold text-gray-800">
            {formatNumber(usage.inputTokens)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Output Tokens:</span>
          <span className="font-semibold text-gray-800">
            {formatNumber(usage.outputTokens)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total:</span>
          <span className="font-semibold text-blue-600">
            {formatNumber(usage.totalTokens)}
          </span>
        </div>
      </div>
      
      <hr className="border-gray-200" />
      
      {/* コスト */}
      <div className="flex justify-between items-center">
        <span className="text-gray-600">Total Cost:</span>
        <span className={`font-bold text-lg ${
          usage.totalCost > 10 ? 'text-red-600' : 'text-gray-800'
        }`}>
          ${usage.totalCost.toFixed(4)}
        </span>
      </div>
      
      {/* 日次進捗 */}
      {usage.dailyLimit !== undefined && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Daily Progress:</span>
            <span className={`font-semibold ${getProgressColor(usage.dailyUsagePercentage)}`}>
              {Math.round(usage.dailyUsagePercentage)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                getProgressBarColor(usage.dailyUsagePercentage)
              }`}
              style={{ width: `${Math.min(usage.dailyUsagePercentage, 100)}%` }}
            />
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Limit: ${usage.dailyLimit?.toFixed(2) || '20.00'} / day
          </div>
        </div>
      )}
      
      <hr className="border-gray-200" />
      
      {/* 最終更新時刻 */}
      <div className="flex items-center justify-center text-xs text-gray-500">
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Updated: {formatTime(usage.lastUpdated)}</span>
      </div>
    </div>
  );
};