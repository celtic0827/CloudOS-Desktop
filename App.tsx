import React, { useState } from 'react';
import { FloatingDock } from './components/navigation/FloatingDock';
import { GlassCard } from './components/ui/GlassCard';
import { WebFrame } from './components/apps/WebFrame';
import { Settings } from './components/apps/Settings';
import { DesktopBackground } from './components/desktop/DesktopBackground';
import { BentoGrid } from './components/desktop/BentoGrid';
import { useAppConfig } from './hooks/useAppConfig';
import { useSystemConfig } from './hooks/useSystemConfig'; // Import here
import { useWindowManager } from './hooks/useWindowManager';

function App() {
  // 1. Initialize System Config (Clock, etc.) at Top Level
  const { clockConfig, updateClockConfig } = useSystemConfig();

  // 2. Pass clockConfig to useAppConfig so the Grid knows the correct sizes
  const { 
    userApps, 
    allApps, 
    activeWidgetIds,
    addApp, 
    updateApp, 
    deleteApp, 
    resetApps, 
    importApps,
    moveApp,
    toggleWidget
  } = useAppConfig(clockConfig);

  const { 
    activeAppId, 
    isAppOpen, 
    openApp, 
    closeApp 
  } = useWindowManager();

  // New State for Settings Context
  const [settingsContext, setSettingsContext] = useState<{tab?: string, appId?: string | null}>({});

  const handleOpenApp = (id: string) => {
      const app = allApps.find(a => a.id === id);
      
      // Special Handling for Widgets (No Window)
      // If it's a widget and NOT the AI (which has a chat window), open Settings
      if (app?.isWidget && app.id !== 'gemini-assistant') {
          setSettingsContext({ tab: 'widgets', appId: app.id });
          openApp('settings');
          return;
      }
      
      // Default behavior
      if (app?.id === 'settings') {
          setSettingsContext({ tab: 'apps' });
      }
      openApp(id);
  };

  const activeApp = allApps.find(app => app.id === activeAppId);

  // --- Window Content Renderer ---
  const renderAppContent = () => {
    if (!activeApp) return null;

    // Special case: Settings App
    if (activeApp.id === 'settings') {
      return (
        <div className="flex items-center justify-center w-full h-full pointer-events-none p-4 pb-[env(safe-area-inset-bottom)]">
          {/* Increased Size for better layout (1280x850) */}
          <div className="w-[1280px] h-[850px] max-w-full max-h-full pointer-events-auto transition-all duration-300">
            <GlassCard className="w-full h-full flex flex-col overflow-hidden shadow-2xl !bg-[#0a0a0a] !border-amber-500/20 !shadow-black/50">
              <Settings 
                userApps={userApps}
                activeWidgetIds={activeWidgetIds}
                clockConfig={clockConfig} // Pass current config
                onUpdateClockConfig={updateClockConfig} // Pass updater
                onAddApp={addApp}
                onUpdateApp={updateApp}
                onDeleteApp={deleteApp}
                onResetApps={resetApps}
                onImportApps={importApps}
                onToggleWidget={toggleWidget}
                onClose={closeApp}
                initialTab={settingsContext.tab}
                initialAppId={settingsContext.appId}
              />
            </GlassCard>
          </div>
        </div>
      );
    }

    // Priority 1: Internal Components (e.g. Gemini Chat)
    if (activeApp.component) {
      return (
        <div className="p-4 md:p-8 w-full h-full pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <GlassCard className="w-full h-full flex flex-col overflow-hidden shadow-2xl">
            {activeApp.component}
          </GlassCard>
        </div>
      );
    }

    // Priority 2: External Web Frames
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

    return <div className="flex items-center justify-center h-full text-white">App configuration error</div>;
  };

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-[#020202] font-sans text-slate-900 selection:bg-amber-500/30">
      
      <DesktopBackground />

      {/* Main Content Area */}
      <main className="relative z-10 w-full h-full flex flex-col">
        
        {/* Desktop View (Scrollable Bento Grid) */}
        <div 
          className={`
            flex-1 w-full relative
            transition-all duration-500 ease-in-out
            ${activeAppId ? 'opacity-0 scale-95 pointer-events-none blur-sm' : 'opacity-100 scale-100 blur-0'}
          `}
        >
          {/* Scrollable Container */}
          <div 
            className="w-full h-full overflow-y-auto scrollbar-hide"
            style={{ 
              // Mask image creates the fading effect at top and bottom
              maskImage: 'linear-gradient(to bottom, transparent, black 5%, black 90%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 5%, black 90%, transparent)'
            }}
          >
            {/* Inner Wrapper for Centering & Padding */}
            <div className="min-h-full flex flex-col items-center justify-center p-6 pb-32 pt-16">
               <BentoGrid apps={allApps} onOpenApp={handleOpenApp} onMoveApp={moveApp} />
               
               {/* Optional: Visual hint that end of list is reached if many apps */}
               {allApps.length > 12 && (
                 <div className="mt-8 text-slate-700 text-[10px] uppercase tracking-widest opacity-50 font-medium">
                   End of Workspace
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Active App Window Container */}
        <div 
          className={`
            absolute inset-0 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) z-20
            ${activeAppId && isAppOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'}
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
        onCloseApp={closeApp}
      />

    </div>
  );
}

export default App;