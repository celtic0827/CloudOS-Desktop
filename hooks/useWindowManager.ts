import { useState } from 'react';

export const useWindowManager = () => {
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [isAppOpen, setIsAppOpen] = useState(false);

  const openApp = (appId: string) => {
    if (activeAppId === appId) return;
    setActiveAppId(appId);
    // Small delay to allow state to set before animating in
    setTimeout(() => setIsAppOpen(true), 10);
  };

  const closeApp = () => {
    setIsAppOpen(false);
    // Wait for animation to finish before removing from DOM
    setTimeout(() => setActiveAppId(null), 300);
  };

  return {
    activeAppId,
    isAppOpen,
    openApp,
    closeApp
  };
};