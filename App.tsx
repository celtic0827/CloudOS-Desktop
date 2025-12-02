import React, { useState, useEffect, useMemo } from 'react';
import { SYSTEM_APPS, DEFAULT_USER_APPS, configToDefinition } from './constants';
import { AppConfig, AppDefinition } from './types';
import { DesktopIcon } from './components/desktop/DesktopIcon';
import { FloatingDock } from './components/navigation/FloatingDock';
import { Clock } from './components/desktop/Clock';
import { GlassCard } from './components/ui/GlassCard';
import { WebFrame } from './components/apps/WebFrame';
import { Settings } from './components/apps/Settings';

const STORAGE_KEY = 'cloudos_user_apps';

function App() {
  // State for user-defined/external apps
  const [userApps, setUserApps] = useState<AppConfig[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_USER_APPS;
    } catch (e) {
      console.error("Failed to load apps", e);
      return DEFAULT_USER_APPS;
    }
  });

  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [isAppOpen, setIsAppOpen] = useState(false);

  // Persist to local storage whenever userApps changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userApps));
  }, [userApps]);

  // Merge System apps (hardcoded) + User apps (dynamic)
  const allApps: AppDefinition[] = useMemo(() => {
    const userDefinitions = userApps.map(configToDefinition);
    return [...userDefinitions, ...SYSTEM_APPS];
  }, [userApps]);

  const activeApp = allApps.find(app => app.id === activeAppId);

  // --- App Management Handlers ---

  const handleAddApp = (newApp: AppConfig) => {
    setUserApps(prev => [...prev, newApp]);
  };

  const handleUpdateApp = (updatedApp: AppConfig) => {
    setUserApps(prev => prev.map(app => app.id === updatedApp.id ? updatedApp : app));
  };

  const handleDeleteApp = (id: string) => {
    setUserApps(prev => prev.filter(app => app.id !== id));
  };

  const handleResetApps = () => {
    setUserApps(DEFAULT_USER_APPS);
  };

  const handleImportApps = (importedApps: AppConfig[]) => {
    // Basic validation could go here
    setUserApps(importedApps);
  };

  // --- Window Management ---

  const handleOpenApp = (appId: string) => {
    setActiveAppId(appId);
    // Small delay to allow state to set before animating in
    setTimeout(() => setIsAppOpen(true), 10);
  };

  const handleCloseApp = () => {
    setIsAppOpen(false);
    // Wait for animation to finish before removing from DOM
    setTimeout(() => setActiveAppId(null), 300);
  };

  const renderAppContent = () => {
    if (!activeApp) return null;

    // Special case for Settings App: Fixed Window Size, Centered
    if (activeApp.id === 'settings') {
      return (
        <div className="flex items-center justify-center w-full h-full pointer-events-none p-4">
          <div className="w-[900px] h-[600px] max-w-full max-h-full pointer-events-auto">
            <GlassCard className="w-full h-full flex flex-col overflow-hidden shadow-2xl !bg-[#0a0a0a] !border-amber-500/20 !shadow-black/50">
              <Settings 
                userApps={userApps}
                onAddApp={handleAddApp}
                onUpdateApp={handleUpdateApp}
                onDeleteApp={handleDeleteApp}
                onResetApps={handleResetApps}
                onImportApps={handleImportApps}
                onClose={handleCloseApp}
              />
            </GlassCard>
          </div>
        </div>
      );
    }

    // Priority 1: If the app has a specific React Component (Internal Apps)
    if (activeApp.component) {
      return (
        <div className="p-4 md:p-8 w-full h-full">
          <GlassCard className="w-full h-full flex flex-col overflow-hidden shadow-2xl">
            {activeApp.component}
          </GlassCard>
        </div>
      );
    }

    // Priority 2: External Apps (Full Screen WebFrame)
    if (activeApp.isExternal && activeApp.url) {
      return <WebFrame src={activeApp.url} title={activeApp.name} />;
    }

    return (
      <div className="flex items-center justify-center h-full text-white">
        App configuration error
      </div>
    );
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans text-slate-900 selection:bg-amber-500/30">
      
      {/* Wallpaper Background - Dims significantly when app is open to save focus */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 ease-out"
        style={{ 
          backgroundImage: 'url("https://picsum.photos/3840/2160?grayscale&blur=2")',
          transform: activeAppId ? 'scale(1.1)' : 'scale(1.0)',
          filter: activeAppId ? 'brightness(0.2) blur(20px)' : 'brightness(0.8) blur(0px)'
        }}
      />
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-0" />

      {/* Main Content Area */}
      <main className="relative z-10 w-full h-full">
        
        {/* Desktop View (Icons & Clock) */}
        <div 
          className={`
            w-full h-full flex flex-col items-center justify-center p-6
            transition-all duration-500 ease-in-out
            ${activeAppId ? 'opacity-0 scale-150 pointer-events-none blur-sm' : 'opacity-100 scale-100'}
          `}
        >
          <Clock />
          
          <div className="grid grid-cols-4 md:grid-cols-6 gap-6 p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/5 shadow-2xl max-w-4xl max-h-[60vh] overflow-y-auto scrollbar-hide">
            {allApps.map((app) => (
              <DesktopIcon 
                key={app.id} 
                app={app} 
                onClick={handleOpenApp} 
              />
            ))}
          </div>
        </div>

        {/* Active App Window Container */}
        <div 
          className={`
            absolute inset-0 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
            ${activeAppId && isAppOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8 pointer-events-none'}
          `}
        >
          {activeApp && renderAppContent()}
        </div>

      </main>

      {/* Floating Navigation Dock */}
      <FloatingDock 
        activeAppId={activeAppId}
        apps={allApps}
        onSwitchApp={handleOpenApp}
        onCloseApp={handleCloseApp}
      />

    </div>
  );
}

export default App;