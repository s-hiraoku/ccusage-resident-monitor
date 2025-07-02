import { create } from 'zustand';
import { UsageData } from '@shared/types';

interface UsageStore {
  currentUsage: UsageData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdateTime: Date | null;
  
  // Actions
  setUsage: (usage: UsageData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshUsage: () => Promise<void>;
  clearError: () => void;
}

export const useUsageStore = create<UsageStore>((set, get) => ({
  currentUsage: null,
  isLoading: false,
  error: null,
  lastUpdateTime: null,
  
  setUsage: (usage: UsageData) => set({ 
    currentUsage: usage, 
    error: null,
    lastUpdateTime: new Date()
  }),
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  
  setError: (error: string | null) => set({ error, isLoading: false }),
  
  clearError: () => set({ error: null }),
  
  refreshUsage: async () => {
    const { setLoading, setUsage, setError } = get();
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching usage data...');
      const usage = await window.electronAPI.fetchUsage();
      console.log('Usage data received:', usage);
      setUsage(usage);
    } catch (error) {
      console.error('Failed to fetch usage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch usage data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }
}));

// 自動更新の設定
export const setupUsageMonitoring = () => {
  const store = useUsageStore.getState();
  
  // ElectronAPIからの自動更新を監視
  window.electronAPI.onUsageUpdate((usage: UsageData) => {
    console.log('Usage update received:', usage);
    store.setUsage(usage);
  });
  
  // 手動更新イベントの監視
  window.addEventListener('refresh-usage', () => {
    console.log('Manual refresh requested');
    store.refreshUsage();
  });
  
  // 初回データ取得
  store.refreshUsage();
  
  console.log('Usage monitoring setup completed');
};