import React, { useState, useEffect, useCallback } from 'react';
import { FloatingDock } from './components/navigation/FloatingDock';
import { GlassCard } from './components/ui/GlassCard';
import { ContextMenu } from './components/ui/ContextMenu';
import { WebFrame } from './components/apps/WebFrame';
import { Settings } from './components/apps/Settings';
import { DesktopBackground } from './components/desktop/DesktopBackground';
import { BentoGrid } from './components/desktop/BentoGrid';
import { useAppConfig } from './hooks/useAppConfig';
import { useSystemConfig } from './hooks/useSystemConfig';
import { useWindowManager } from './hooks/useWindowManager';
import { AppDefinition } from './types';

function App() {
  // 1. Initialize System Config
  const { clockConfig, updateClockConfig } = useSystemConfig();

  // 2. App Config
  const { 
    userApps, 
    allApps, 
    activeWidgetIds,
    layout, 
    addApp, 
    updateApp, 
    deleteApp, 
    resetApps, 
    importApps,
    importSystemConfig,
    moveApp,
    toggleWidget
  } = useAppConfig(clockConfig);

  // 3. Multi-Dock & Multi-Page Window Manager
  const { 
    docks,
    activeDockId,
    setActiveDockId,
    viewMode,
    toggleViewMode,
    addSecondaryDock,
    removeSecondaryDock,
    openApp, 
    closeApp,
    reloadApp,
    anyAppOpen,
    primaryDock,
    secondaryDock
  } = useWindowManager();

  const [settingsContext, setSettingsContext] = useState<{tab?: string, appId?: string | null, dockId?: string}>({});
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);

  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      console.log("PWA Install Prompt captured");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // --- PC Optimization: Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC closes the currently focused window, or any open window
      if (e.key === 'Escape' && anyAppOpen) {
        if (activeDockId && docks.find(d => d.id === activeDockId)?.activeAppId) {
          closeApp(activeDockId);
        } else {
          closeApp('dock-1');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [anyAppOpen, activeDockId, docks, closeApp]);

  // --- Prevent Rogue Browser Window/Body Scroll Shifts ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollX !== 0 || window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.scrollTo(0, 0);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [anyAppOpen]);

  // --- PC Optimization: Right Click Handler ---
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleCloseContextMenu = () => setContextMenu(null);

  const handleOpenApp = (id: string, dockId?: string) => {
      const targetDock = dockId || activeDockId || 'dock-1';
      const app = allApps.find(a => a?.id === id); 
      
      if (app?.isWidget && app.id !== 'gemini-assistant') {
          setSettingsContext({ tab: 'widgets', appId: app.id, dockId: targetDock });
          openApp('settings', targetDock);
          return;
      }
      
      if (app?.id === 'settings') {
          setSettingsContext({ tab: 'apps', dockId: targetDock });
      }
      openApp(id, targetDock);
  };

  // --- Window Content Renderer ---
  const renderAppContent = (app: AppDefinition, refreshTrigger: number, dockId: string) => {
    if (app.id === 'settings') {
      return (
        <div className="flex items-center justify-center w-full h-full pointer-events-none p-4 pb-[env(safe-area-inset-bottom)]">
          <div className="w-[1280px] h-[850px] max-w-full max-h-full pointer-events-auto transition-all duration-300">
            <GlassCard className="w-full h-full flex flex-col overflow-hidden shadow-2xl !bg-[#0a0a0a] !border-amber-500/20 !shadow-black/50">
              <Settings 
                userApps={userApps}
                activeWidgetIds={activeWidgetIds}
                layout={layout}
                clockConfig={clockConfig} 
                onUpdateClockConfig={updateClockConfig} 
                onAddApp={addApp}
                onUpdateApp={updateApp}
                onDeleteApp={deleteApp}
                onResetApps={resetApps}
                onImportApps={importApps}
                onImportSystemConfig={importSystemConfig}
                onToggleWidget={toggleWidget}
                onClose={() => closeApp(dockId)}
                initialTab={settingsContext.tab}
                initialAppId={settingsContext.appId}
              />
            </GlassCard>
          </div>
        </div>
      );
    }

    if (app.component) {
      return (
        <div className="p-4 md:p-8 w-full h-full pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <GlassCard className="w-full h-full flex flex-col overflow-hidden shadow-2xl">
            {app.component}
          </GlassCard>
        </div>
      );
    }

    if (app.isExternal && app.url) {
      return (
        <WebFrame 
          key={`${dockId}-${app.id}-${refreshTrigger}`}
          id={`${dockId}-${app.id}`}
          src={app.url} 
          title={app.name} 
          themeColor={app.color}
          refreshTrigger={refreshTrigger}
        />
      );
    }

    return <div className="flex items-center justify-center h-full text-white">App configuration error</div>;
  };

  // Filter out nulls for the Dock
  const dockApps = allApps.filter((a): a is any => a !== null);

  // App definitions for active docks
  const dock1App = primaryDock?.activeAppId ? allApps.find(a => a?.id === primaryDock.activeAppId) : null;
  const dock2App = secondaryDock?.activeAppId ? allApps.find(a => a?.id === secondaryDock.activeAppId) : null;
  const isSplitActive = viewMode === 'split' && !!dock1App && !!dock2App;

  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden overscroll-none bg-[#020202] font-sans text-slate-900 selection:bg-amber-500/30"
      onContextMenu={handleContextMenu}
      onClick={handleCloseContextMenu}
    >
      
      <DesktopBackground />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          onClose={handleCloseContextMenu}
          onOpenSettings={() => {
              setSettingsContext({ tab: 'apps' });
              openApp('settings', activeDockId);
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
            ${anyAppOpen ? 'opacity-0 scale-95 pointer-events-none blur-sm' : 'opacity-100 scale-100 blur-0'}
          `}
        >
          <div 
            className="w-full h-full overflow-y-auto scrollbar-hide"
            style={{ 
              maskImage: 'linear-gradient(to bottom, transparent, black 2%, black 90%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 2%, black 90%, transparent)'
            }}
          >
            <div className="min-h-full flex flex-col transition-all duration-500 justify-start pt-24 pb-48">
               <div className="w-full">
                 <BentoGrid 
                    apps={allApps}
                    onOpenApp={(id) => handleOpenApp(id, activeDockId)} 
                    onMoveApp={moveApp} 
                 />
                 
                 {dockApps.length > 12 && (
                   <div className="text-slate-700 text-[10px] uppercase tracking-widest opacity-50 font-medium text-center mt-8">
                     End of Workspace
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>

        {/* Active App Windows (Multi-Page / Split View / Workspace Tab) */}
        <div 
          className={`
            absolute inset-0 transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) z-20 overflow-hidden overscroll-none
            ${anyAppOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98] pointer-events-none'}
          `}
          onContextMenu={(e) => e.stopPropagation()}
        >
          {/* === PLAN A: DUAL-PAGE SPLIT VIEW (50% / 50%) === */}
          {isSplitActive ? (
            <div className="w-full h-full flex flex-row overflow-hidden bg-black">
              {/* Left Screen: Page 1 (Dock 1) */}
              <div 
                className="flex-1 h-full relative overflow-hidden flex flex-col"
                onClick={() => setActiveDockId('dock-1')}
              >
                {/* Active Indicator Bar */}
                <div className={`h-1 w-full transition-all duration-300 ${activeDockId === 'dock-1' ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.9)]' : 'bg-white/10'}`} />
                <div className="flex-1 w-full h-full relative overflow-hidden">
                  {renderAppContent(dock1App, primaryDock.refreshTrigger, 'dock-1')}
                </div>
              </div>

              {/* === PROMINENT HIGH-TECH CENTRAL DIVIDER === */}
              <div className="w-2 h-full relative bg-[#09090b] border-x border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.9)] flex items-center justify-center shrink-0 z-30 select-none">
                {/* Central glowing vertical gradient line */}
                <div className="w-[2px] h-full bg-gradient-to-b from-amber-500/80 via-white to-cyan-400/80 shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
                
                {/* Tactile grab handle in the center */}
                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-16 rounded-full bg-[#18181b] border border-white/30 shadow-[0_4px_16px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105 hover:border-amber-400/60 pointer-events-none">
                  <div className="w-1 h-1.5 rounded-full bg-amber-400/90 shadow-[0_0_6px_rgba(245,158,11,0.9)]" />
                  <div className="w-1 h-3 rounded-full bg-white/90" />
                  <div className="w-1 h-1.5 rounded-full bg-cyan-400/90 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
                </div>
              </div>

              {/* Right Screen: Page 2 (Dock 2) */}
              <div 
                className="flex-1 h-full relative overflow-hidden flex flex-col"
                onClick={() => setActiveDockId('dock-2')}
              >
                {/* Active Indicator Bar */}
                <div className={`h-1 w-full transition-all duration-300 ${activeDockId === 'dock-2' ? 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]' : 'bg-white/10'}`} />
                <div className="flex-1 w-full h-full relative overflow-hidden">
                  {renderAppContent(dock2App, secondaryDock!.refreshTrigger, 'dock-2')}
                </div>
              </div>
            </div>
          ) : (
            /* === PLAN C: FULLSCREEN / WORKSPACE TAB VIEW === */
            <div className="w-full h-full relative overflow-hidden">
              {/* Page 1 (Dock 1) */}
              {dock1App && (
                <div 
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    activeDockId === 'dock-1' || !dock2App 
                      ? 'opacity-100 z-10 pointer-events-auto' 
                      : 'opacity-0 z-0 pointer-events-none'
                  }`}
                  onClick={() => setActiveDockId('dock-1')}
                >
                  {renderAppContent(dock1App, primaryDock.refreshTrigger, 'dock-1')}
                </div>
              )}

              {/* Page 2 (Dock 2) */}
              {dock2App && (
                <div 
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    activeDockId === 'dock-2' 
                      ? 'opacity-100 z-10 pointer-events-auto' 
                      : 'opacity-0 z-0 pointer-events-none'
                  }`}
                  onClick={() => setActiveDockId('dock-2')}
                >
                  {renderAppContent(dock2App, secondaryDock!.refreshTrigger, 'dock-2')}
                </div>
              )}
            </div>
          )}
        </div>

      </main>

      {/* Floating Navigation Dock (Unified Base) */}
      {anyAppOpen && (
        <FloatingDock 
          docks={docks}
          activeDockId={activeDockId}
          onSelectDock={setActiveDockId}
          apps={dockApps}
          onSwitchApp={(appId, dockId) => handleOpenApp(appId, dockId)}
          onCloseApp={(dockId) => closeApp(dockId)}
          onReloadApp={(dockId) => reloadApp(dockId)}
          canAddDock={!secondaryDock}
          onAddDock={addSecondaryDock}
          onCloseSecondaryDock={removeSecondaryDock}
          viewMode={viewMode}
          onToggleViewMode={toggleViewMode}
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
      )}

    </div>
  );
}

export default App;