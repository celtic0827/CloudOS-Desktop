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
  
  // Drag and Drop State
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

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

  // --- Drag and Drop Handlers ---

  const handleDragStart = (id: string) => {
    setDraggedAppId(id);
  };

  const handleDrop = (targetId: string) => {
    if (!draggedAppId || draggedAppId === targetId) return;

    // Find indices in userApps (System apps return -1 and are ignored)
    const sourceIndex = userApps.findIndex(app => app.id === draggedAppId);
    const targetIndex = userApps.findIndex(app => app.id === targetId);

    // Only allow reordering within user apps
    if (sourceIndex === -1 || targetIndex === -1) return;

    const newUserApps = [...userApps];
    // Remove from old position
    const [movedApp] = newUserApps.splice(sourceIndex, 1);
    // Insert at new position
    newUserApps.splice(targetIndex, 0, movedApp);

    setUserApps(newUserApps);
    setDraggedAppId(null);
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
      return (
        <WebFrame 
          id={activeApp.id}
          src={activeApp.url} 
          title={activeApp.name} 
          themeColor={activeApp.color}
        />
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-white">
        App configuration error
      </div>
    );
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020202] font-sans text-slate-900 selection:bg-amber-500/30">
      
      {/* Refined Background System - Using inline styles to guarantee rendering */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 85% 10%, rgba(217, 119, 6, 0.15) 0%, rgba(0, 0, 0, 0) 50%),
            radial-gradient(circle at 0% 100%, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0) 40%),
            #020202
          `
        }}
      />
      
      {/* Noise Texture for Realism (Low opacity) */}
      <div 
        className="absolute inset-0 opacity-[0.04] z-0 pointer-events-none mix-blend-overlay"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Main Content Area */}
      <main className="relative z-10 w-full h-full">
        
        {/* Desktop View (Icons & Clock) */}
        <div 
          className={`
            w-full h-full flex flex-col items-center justify-center p-6 pb-24
            transition-all duration-300 ease-in-out
            ${activeAppId ? 'opacity-0 pointer-events-none' : 'opacity-100'}
          `}
        >
          <div className="mb-12">
            <Clock />
          </div>
          
          {/* App Grid Panel - Refined Glassmorphism */}
          <div className="
            grid grid-cols-4 md:grid-cols-6 gap-x-8 gap-y-10 p-10 
            rounded-[2.5rem] 
            bg-black/20 backdrop-blur-xl 
            border border-white/10 
            shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] 
            max-w-5xl max-h-[60vh] overflow-y-auto scrollbar-hide
          ">
            {allApps.map((app) => (
              <DesktopIcon 
                key={app.id} 
                app={app} 
                onClick={handleOpenApp}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                isDragging={draggedAppId === app.id}
              />
            ))}
          </div>
        </div>

        {/* Active App Window Container - Optimized Transitions (No Scale/Blur) */}
        <div 
          className={`
            absolute inset-0 transition-all duration-300 ease-out
            ${activeAppId && isAppOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
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