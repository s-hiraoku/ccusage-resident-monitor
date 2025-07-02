import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { UsageDisplay } from './components/UsageDisplay';
import { Controls } from './components/Controls';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { useUsageStore } from './store/usage-store';
import { setupUsageMonitoring } from './store/usage-store';

const App: React.FC = () => {
  const { currentUsage, isLoading, error } = useUsageStore();

  useEffect(() => {
    // コンポーネントマウント時に監視を開始
    setupUsageMonitoring();
    
    console.log('App component mounted');

    // クリーンアップ
    return () => {
      window.electronAPI.removeUsageListener();
      console.log('App component unmounted');
    };
  }, []);

  const renderContent = () => {
    if (error) {
      return <ErrorDisplay error={error} />;
    }
    
    if (isLoading && !currentUsage) {
      return <LoadingSpinner />;
    }
    
    if (currentUsage) {
      return <UsageDisplay usage={currentUsage} />;
    }
    
    return <LoadingSpinner message="Initializing..." />;
  };

  return (
    <div className="w-full h-full bg-white">
      <div className="p-4 max-w-sm mx-auto">
        <Header />
        
        <div className="min-h-[180px]">
          {renderContent()}
        </div>
        
        <Controls />
      </div>
    </div>
  );
};

export default App;