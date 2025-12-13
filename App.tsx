import React, { useState, useEffect, useCallback } from 'react';
import { FloatingDock } from './components/navigation/FloatingDock';
import { GlassCard } from './components/ui/GlassCard';
import { ContextMenu } from './components/ui/ContextMenu'; // Import ContextMenu
import { WebFrame } from './components/apps/WebFrame';
import { Settings } from './components/apps/Settings';
import { DesktopBackground } from './components/desktop/DesktopBackground';
import { BentoGrid } from './components/desktop/BentoGrid';
import { useAppConfig } from './hooks/useAppConfig';
import { useSystemConfig } from './hooks/useSystemConfig';
import { useWindowManager } from './hooks/useWindowManager';

function App() {
  // 1. Initialize System Config
  const { clockConfig, updateClockConfig } = useSystemConfig();

  // 2. App Config
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

  const [settingsContext, setSettingsContext] = useState<{tab?: string, appId?: string | null}>({});
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);

  // Web App Reload State
  const [webRefreshTrigger, setWebRefreshTrigger] = useState(0);

  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
      console.log("PWA Install Prompt captured");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // --- PC Optimization: Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to close active window
      if (e.key === 'Escape' && activeAppId) {
        closeApp();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeAppId, closeApp]);

  // --- PC Optimization: Right Click Handler ---
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    // Only trigger on the background/grid, not inside apps
    // We rely on stopPropagation in app windows, but checking target helps
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleCloseContextMenu = () => setContextMenu(null);

  const handleOpenApp = (id: string) => {
      // Find app in the sparse array
      const app = allApps.find(a => a?.id === id); 
      
      if (app?.isWidget && app.id !== 'gemini-assistant') {
          setSettingsContext({ tab: 'widgets', appId: app.id });
          openApp('settings');
          return;
      }
      
      if (app?.id === 'settings') {
          setSettingsContext({ tab: 'apps' });
      }
      openApp(id);
  };

  const handleReloadActiveApp = () => {
    setWebRefreshTrigger(prev => prev + 1);
  };

  const activeApp = allApps.find(app => app?.id === activeAppId);

  // --- Window Content Renderer ---
  const renderAppContent = () => {
    if (!activeApp) return null;

    if (activeApp.id === 'settings') {
      return (
        <div className="flex items-center justify-center w-full h-full pointer-events-none p-4 pb-[env(safe-area-inset-bottom)]">
          <div className="w-[1280px] h-[850px] max-w-full max-h-full pointer-events-auto transition-all duration-300">
            <GlassCard className="w-full h-full flex flex-col overflow-hidden shadow-2xl !bg-[#0a0a0a] !border-amber-500/20 !shadow-black/50">
              <Settings 
                userApps={userApps}
                activeWidgetIds={activeWidgetIds}
                clockConfig={clockConfig} 
                onUpdateClockConfig={updateClockConfig} 
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

    if (activeApp.component) {
      return (
        <div className="p-4 md:p-8 w-full h-full pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <GlassCard className="w-full h-full flex flex-col overflow-hidden shadow-2xl">
            {activeApp.component}
          </GlassCard>
        </div>
      );
    }

    if (activeApp.isExternal && activeApp.url) {
      return (
        <WebFrame 
          id={activeApp.id}
          src={activeApp.url} 
          title={activeApp.name} 
          themeColor={activeApp.color}
          refreshTrigger={webRefreshTrigger}
        />
      );
    }

    return <div className="flex items-center justify-center h-full text-white">App configuration error</div>;
  };

  // Filter out nulls for the Dock, as the Dock should only show actual apps
  const dockApps = allApps.filter((a): a is any => a !== null);

  return (
    <div 
      className="relative w-screen h-[100dvh] overflow-hidden bg-[#020202] font-sans text-slate-900 selection:bg-amber-500/30"
      onContextMenu={handleContextMenu} // Capture right click globally
      onClick={handleCloseContextMenu} // Left click closes menu
    >
      
      <DesktopBackground />

      {/* Context Menu (Conditional Render) */}
      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          onClose={handleCloseContextMenu}
          onOpenSettings={() => {
              setSettingsContext({ tab: 'apps' });
              openApp('settings');
          }}
          onResetLayout={resetApps}
        />
      )}

      {/* Main Content Area */}
      <main className="relative z-10 w-full h-full flex flex-col">
        
        {/* Desktop View */}
        <div 
          className={`
            flex-1 w-full relative
            transition-all duration-500 ease-in-out
            ${activeAppId ? 'opacity-0 scale-95 pointer-events-none blur-sm' : 'opacity-100 scale-100 blur-0'}
          `}
        >
          <div 
            className="w-full h-full overflow-y-auto scrollbar-hide"
            style={{ 
              maskImage: 'linear-gradient(to bottom, transparent, black 2%, black 90%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 2%, black 90%, transparent)'
            }}
          >
            {/* 
                LAYOUT UPDATE:
                - Removed generic 'p-6' to allow BentoGrid to handle horizontal spacing more accurately on mobile.
                - Increased 'pb-48' (12rem) to ensure apps are never covered by the Dock.
                - Standardized 'pt-24' (6rem) for top spacing.
            */}
            <div className={`
                min-h-full flex flex-col transition-all duration-500
                justify-start pt-24 pb-48
            `}>
               
               <div className="w-full">
                 <BentoGrid 
                    apps={allApps} // Now passes sparse array (App | null)[]
                    onOpenApp={handleOpenApp} 
                    onMoveApp={moveApp} 
                 />
                 
                 {/* Only show "End of Workspace" if we have enough apps to scroll */}
                 {dockApps.length > 12 && (
                   <div className="text-slate-700 text-[10px] uppercase tracking-widest opacity-50 font-medium text-center mt-8">
                     End of Workspace
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>

        {/* Active App Window */}
        <div 
          className={`
            absolute inset-0 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) z-20
            ${activeAppId && isAppOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'}
          `}
          onContextMenu={(e) => e.stopPropagation()} // Allow default browser menu inside apps if needed, or customize
        >
          {activeApp && renderAppContent()}
        </div>

      </main>

      {/* Floating Navigation Dock */}
      <FloatingDock 
        activeAppId={activeAppId}
        apps={dockApps} // Pass only non-null apps
        onSwitchApp={handleOpenApp}
        onCloseApp={closeApp}
        onReloadApp={handleReloadActiveApp}
        showReload={activeApp?.isExternal} // Only show reload if active app is a Web App
        installPrompt={installPrompt}
        onInstallClick={() => {
            if (installPrompt) {
                installPrompt.prompt();
                installPrompt.userChoice.then((choiceResult: any) => {
                    if (choiceResult.outcome === 'accepted') {
                        setInstallPrompt(null);
                    }
                });
            }
        }}
      />

    </div>
  );
}

export default App;