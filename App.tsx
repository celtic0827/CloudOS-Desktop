import React, { useState } from 'react';
import { DesktopIcon } from './components/desktop/DesktopIcon';
import { FloatingDock } from './components/navigation/FloatingDock';
import { Clock } from './components/desktop/Clock';
import { GlassCard } from './components/ui/GlassCard';
import { WebFrame } from './components/apps/WebFrame';
import { Settings } from './components/apps/Settings';
import { DesktopBackground } from './components/desktop/DesktopBackground';
import { useAppConfig } from './hooks/useAppConfig';
import { useWindowManager } from './hooks/useWindowManager';

function App() {
  // Logic extracted to Custom Hooks
  const { 
    userApps, 
    allApps, 
    addApp, 
    updateApp, 
    deleteApp, 
    resetApps, 
    importApps, 
    reorderApps 
  } = useAppConfig();

  const { 
    activeAppId, 
    isAppOpen, 
    openApp, 
    closeApp 
  } = useWindowManager();

  // Drag State (Purely UI state, specific to Desktop view)
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

  const activeApp = allApps.find(app => app.id === activeAppId);

  // --- Drag and Drop Handlers ---
  const handleDragStart = (id: string) => {
    setDraggedAppId(id);
  };

  const handleDrop = (targetId: string) => {
    if (!draggedAppId || draggedAppId === targetId) return;
    reorderApps(draggedAppId, targetId);
    setDraggedAppId(null);
  };

  // --- Window Content Renderer ---
  const renderAppContent = () => {
    if (!activeApp) return null;

    // Special case: Settings App
    if (activeApp.id === 'settings') {
      return (
        <div className="flex items-center justify-center w-full h-full pointer-events-none p-4">
          <div className="w-[900px] h-[600px] max-w-full max-h-full pointer-events-auto">
            <GlassCard className="w-full h-full flex flex-col overflow-hidden shadow-2xl !bg-[#0a0a0a] !border-amber-500/20 !shadow-black/50">
              <Settings 
                userApps={userApps}
                onAddApp={addApp}
                onUpdateApp={updateApp}
                onDeleteApp={deleteApp}
                onResetApps={resetApps}
                onImportApps={importApps}
                onClose={closeApp}
              />
            </GlassCard>
          </div>
        </div>
      );
    }

    // Priority 1: Internal Components
    if (activeApp.component) {
      return (
        <div className="p-4 md:p-8 w-full h-full">
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
    <div className="relative w-screen h-screen overflow-hidden bg-[#020202] font-sans text-slate-900 selection:bg-amber-500/30">
      
      <DesktopBackground />

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
          
          {/* App Grid Panel */}
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
                onClick={openApp}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                isDragging={draggedAppId === app.id}
              />
            ))}
          </div>
        </div>

        {/* Active App Window Container */}
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
        onSwitchApp={openApp}
        onCloseApp={closeApp}
      />

    </div>
  );
}

export default App;