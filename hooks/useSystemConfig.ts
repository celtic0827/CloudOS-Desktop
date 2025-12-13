import { useState, useEffect } from 'react';
import { ClockConfig } from '../types';

const STORAGE_KEY_CLOCK = 'cloudos_clock_config';

const DEFAULT_CLOCK_CONFIG: ClockConfig = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Default to system timezone
  label: 'Local Time',
  use24Hour: true,
  gridSize: '2x2', // Default size
};

export const useSystemConfig = () => {
  // Clock Configuration
  const [clockConfig, setClockConfig] = useState<ClockConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CLOCK);
      const parsed = stored ? JSON.parse(stored) : DEFAULT_CLOCK_CONFIG;
      // Merge with default to ensure new properties (like gridSize) exist if loading old config
      return { ...DEFAULT_CLOCK_CONFIG, ...parsed };
    } catch (e) {
      return DEFAULT_CLOCK_CONFIG;
    }
  });

  // Persist Clock Config
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CLOCK, JSON.stringify(clockConfig));
  }, [clockConfig]);

  const updateClockConfig = (newConfig: Partial<ClockConfig>) => {
    setClockConfig(prev => ({ ...prev, ...newConfig }));
  };

  return {
    clockConfig,
    updateClockConfig
  };
};