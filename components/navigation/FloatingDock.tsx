import React, { useState, useEffect, useRef } from 'react';
import { AppDefinition, ViewMode, DockState } from '../../types';
import { LayoutGrid, Globe, LayoutDashboard, Download, RotateCw, Plus, X, Columns2, Maximize2 } from 'lucide-react';

interface FloatingDockProps {
  docks: DockState[];
  activeDockId: string;
  onSelectDock: (dockId: string) => void;
  apps: AppDefinition[];
  onSwitchApp: (appId: string, dockId: string) => void;
  onCloseApp: (dockId: string) => void;
  onReloadApp?: (dockId: string) => void;
  canAddDock: boolean;
  onAddDock: () => void;
  onCloseSecondaryDock: () => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  installPrompt?: any;
  onInstallClick?: () => void;
}

const STORAGE_KEY = 'cloudos_dock_position';

// Internal component to handle individual icon state logic
const DockIcon: React.FC<{ 
  app: AppDefinition; 
  isActive?: boolean;
  size?: 'small' | 'large';
  accentColor?: string;
}> = ({ app, isActive, size = 'small', accentColor = 'amber' }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [app.iconUrl]);

  const iconSize = size === 'large' ? 20 : 16;
  const imgSize = size === 'large' ? "w-5 h-5" : "w-4 h-4";
  const IconComponent = app.icon || Globe;

  return (
    <div className={`
      relative flex items-center justify-center transition-all duration-300
      ${isActive && size === 'small' ? 'bg-white/10 border border-white/5 w-8 h-8 rounded-lg' : ''}
      ${size === 'large' ? 'w-full h-full' : ''}
    `}>
      {isActive && size === 'small' && (
        <div className={`absolute inset-0 ${accentColor === 'cyan' ? 'bg-cyan-500/15' : 'bg-amber-500/10'} rounded-lg blur-sm`} />
      )}

      {app.iconUrl && !hasError ? (
        <img 
          src={app.iconUrl} 
          alt={app.name} 
          className={`${imgSize} object-contain rounded-sm z-10 drop-shadow-md`}
          onError={() => setHasError(true)}
          crossOrigin="anonymous"
        />
      ) : (
        <IconComponent 
          size={iconSize} 
          className={`z-10 transition-colors ${
            isActive 
              ? (accentColor === 'cyan' ? 'text-cyan-200' : 'text-amber-100') 
              : 'text-slate-400 group-hover:text-slate-200'
          }`} 
          strokeWidth={1.5} 
        />
      )}
    </div>
  );
};

export const FloatingDock: React.FC<FloatingDockProps> = ({ 
  docks,
  activeDockId,
  onSelectDock,
  apps, 
  onSwitchApp, 
  onCloseApp,
  onReloadApp,
  canAddDock,
  onAddDock,
  onCloseSecondaryDock,
  viewMode,
  onToggleViewMode,
  installPrompt,
  onInstallClick
}) => {
  const [expandedDockId, setExpandedDockId] = useState<string | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const primaryDock = docks.find(d => d.id === 'dock-1') || docks[0];
  const secondaryDock = docks.find(d => d.id === 'dock-2');
  const hasMultipleDocks = !!secondaryDock;

  const dock1App = primaryDock?.activeAppId ? apps.find(a => a.id === primaryDock.activeAppId) : null;
  const dock2App = secondaryDock?.activeAppId ? apps.find(a => a.id === secondaryDock.activeAppId) : null;

  // Active dock definition when menu is expanded
  const activeExpandedDock = docks.find(d => d.id === expandedDockId);
  const currentAppForExpanded = activeExpandedDock?.activeAppId 
    ? apps.find(a => a.id === activeExpandedDock.activeAppId) 
    : null;
  const expandedAccent = expandedDockId === 'dock-2' ? 'cyan' : 'amber';
  
  // Position State for the Unified Base
  const [position, setPosition] = useState<{x: number, y: number} | null>(null);
  
  // Dragging Logic Refs
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{x: number, y: number} | null>(null);
  const initialPosRef = useRef<{x: number, y: number} | null>(null);
  const hasMovedSignificantDistanceRef = useRef(false);
  const latestPositionRef = useRef<{x: number, y: number} | null>(null);

  // Constants
  const BASE_WIDTH = hasMultipleDocks ? 160 : 96;
  const BASE_HEIGHT = 54;
  const EDGE_PADDING = 12;

  // Initialize Position
  useEffect(() => {
    if (!position) {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      let initialX = windowWidth - BASE_WIDTH - 20;
      let initialY = windowHeight - BASE_HEIGHT - 30;

      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            const maxX = windowWidth - BASE_WIDTH - EDGE_PADDING;
            const maxY = windowHeight - BASE_HEIGHT - EDGE_PADDING;
            
            initialX = Math.max(EDGE_PADDING, Math.min(parsed.x, maxX));
            initialY = Math.max(EDGE_PADDING, Math.min(parsed.y, maxY));
        }
      } catch (e) {
        console.error("Failed to load dock position", e);
      }

      const startPos = { x: initialX, y: initialY };
      setPosition(startPos);
      latestPositionRef.current = startPos;
    }
  }, [BASE_WIDTH, BASE_HEIGHT]);

  const getMenuPositionStyle = () => {
    if (!position) return {};
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (position.x > windowWidth - 280) {
      return { right: '100%', marginRight: '16px', top: '50%', transform: 'translateY(-50%)' };
    }
    if (position.x < 280) {
      return { left: '100%', marginLeft: '16px', top: '50%', transform: 'translateY(-50%)' };
    }
    const isTopHalf = position.y < windowHeight / 2;
    if (isTopHalf) {
       return { top: '100%', marginTop: '16px', left: '50%', transform: 'translateX(-50%)' };
    }
    return { bottom: '100%', marginBottom: '16px', left: '50%', transform: 'translateX(-50%)' };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only capture drag if clicking base or icons without stopping
    isDraggingRef.current = true;
    hasMovedSignificantDistanceRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = position;
    
    document.body.style.userSelect = 'none';
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !dragStartRef.current || !initialPosRef.current) return;
    
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasMovedSignificantDistanceRef.current = true;
    }

    if (hasMovedSignificantDistanceRef.current) {
        if (expandedDockId) setExpandedDockId(null);

        const rawX = initialPosRef.current.x + dx;
        const rawY = initialPosRef.current.y + dy;

        const maxX = window.innerWidth - BASE_WIDTH - EDGE_PADDING;
        const maxY = window.innerHeight - BASE_HEIGHT - EDGE_PADDING;

        const clampedX = Math.max(EDGE_PADDING, Math.min(rawX, maxX));
        const clampedY = Math.max(EDGE_PADDING, Math.min(rawY, maxY));

        const newPos = { x: clampedX, y: clampedY };
        setPosition(newPos);
        latestPositionRef.current = newPos;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    document.body.style.userSelect = '';
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    if (hasMovedSignificantDistanceRef.current && latestPositionRef.current) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(latestPositionRef.current));
    }
  };

  const handleDockClick = (dockId: string) => {
    // If not a drag, toggle menu
    if (hasMovedSignificantDistanceRef.current) return;
    onSelectDock(dockId);
    setExpandedDockId(prev => (prev === dockId ? null : dockId));
  };

  if (!position) return null;

  // Filter apps for dock menu, and FORCE 'settings' to always be placed at the very end
  const eligibleApps = apps.filter(app => app.id !== 'clock-widget');
  const nonSettingsApps = eligibleApps.filter(app => app.id !== 'settings');
  const settingsApp = eligibleApps.find(app => app.id === 'settings');

  const dockVisibleApps = settingsApp 
    ? [...nonSettingsApps.slice(0, 15), settingsApp] 
    : nonSettingsApps.slice(0, 16);

  const isTwoRow = dockVisibleApps.length > 8;

  return (
    <>
      {expandedDockId && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setExpandedDockId(null)}
        />
      )}

      <div 
        ref={dockRef}
        className="fixed z-50 flex items-center justify-center transition-none touch-none select-none"
        style={{ 
          left: position.x, 
          top: position.y,
          marginBottom: 'env(safe-area-inset-bottom, 0px)' 
        }}
      >
        
        {/* Expanded Menu for Currently Active Dock */}
        {expandedDockId && activeExpandedDock && (
          <div 
            className="absolute flex items-center gap-2 p-2 bg-[#050505]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] transition-all duration-300 origin-center opacity-100 scale-100"
            style={{ 
                width: 'max-content', 
                maxWidth: '90vw',
                ...getMenuPositionStyle()
            }}
          >
            {/* Apps Grid (Supports up to 8x2 rows = 16 apps) */}
            <div className={isTwoRow ? 'grid grid-cols-8 gap-1.5' : 'flex items-center gap-1.5'}>
              {dockVisibleApps.map(app => (
                <button
                  key={app.id}
                  onClick={() => {
                    onSwitchApp(app.id, expandedDockId);
                    setExpandedDockId(null);
                  }}
                  className={`
                    relative group p-1.5 rounded-xl transition-all flex items-center justify-center
                    ${activeExpandedDock.activeAppId === app.id ? 'bg-white/5' : 'hover:bg-white/5'}
                  `}
                  title={app.name}
                >
                  <DockIcon app={app} isActive={activeExpandedDock.activeAppId === app.id} accentColor={expandedAccent} />
                  
                  {activeExpandedDock.activeAppId === app.id && (
                    <div className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 ${
                      expandedAccent === 'cyan' ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                    } rounded-full`} />
                  )}
                </button>
              ))}
            </div>
            
            <div className="self-stretch w-px bg-white/10 mx-1 my-0.5 transition-all" />
            
            {/* Action Buttons Group (Compact layout aligned with apps rows, prevents stretching height) */}
            <div className={`grid ${isTwoRow ? 'grid-rows-2 grid-flow-col auto-cols-max' : 'grid-flow-col auto-cols-max'} gap-1 items-center justify-center`}>
                {/* Reload Button (Only for Web Apps) */}
                {currentAppForExpanded?.isExternal && onReloadApp && (
                    <button
                      onClick={() => {
                          onReloadApp(expandedDockId);
                          setExpandedDockId(null);
                      }}
                      className="w-8 h-8 rounded-xl hover:bg-white/10 text-slate-500 hover:text-amber-100 transition-colors flex items-center justify-center"
                      title="Reload"
                    >
                      <RotateCw size={15} strokeWidth={1.5} />
                    </button>
                )}

                {/* Show Desktop / Close App */}
                <button
                  onClick={() => {
                    onCloseApp(expandedDockId);
                    setExpandedDockId(null);
                  }}
                  className="w-8 h-8 rounded-xl hover:bg-white/10 text-slate-500 hover:text-amber-100 transition-colors flex items-center justify-center"
                  title={expandedDockId === 'dock-2' ? "關閉此視窗" : "返回桌面 (Show Desktop)"}
                >
                  <LayoutDashboard size={15} strokeWidth={1.5} />
                </button>

                {/* Low-key Close Secondary Dock Button inside menu */}
                {expandedDockId === 'dock-2' && (
                  <button
                    onClick={() => {
                      onCloseSecondaryDock();
                      setExpandedDockId(null);
                    }}
                    className="w-8 h-8 rounded-xl hover:bg-white/10 text-zinc-500 hover:text-zinc-200 transition-colors flex items-center justify-center"
                    title="關閉副快捷列"
                  >
                    <X size={15} strokeWidth={1.8} />
                  </button>
                )}

                {/* Install Button (Only visible if prompt is captured) */}
                {installPrompt && (
                    <button
                        onClick={() => {
                            if (onInstallClick) onInstallClick();
                            setExpandedDockId(null);
                        }}
                        className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-md shadow-amber-900/10 flex items-center justify-center"
                        title="Install App"
                    >
                        <Download size={15} strokeWidth={2} />
                    </button>
                )}
            </div>

          </div>
        )}

        {/* === UNIFIED DOCK BASE (Single Draggable Glass Capsule) === */}
        <div 
          className={`
            flex items-center p-1.5 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10
            rounded-[22px] shadow-[0_10px_35px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)]
            cursor-grab active:cursor-grabbing hover:border-white/20 transition-all duration-300
            gap-1.5
          `}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Slot 1: Primary Dock (Dock 1) */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              handleDockClick('dock-1');
            }}
            className={`
              w-11 h-11 rounded-[16px] relative flex items-center justify-center
              transition-all duration-200 cursor-pointer
              ${activeDockId === 'dock-1' 
                ? 'bg-amber-500/10 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]' 
                : 'hover:bg-white/5 border border-white/5'
              }
              ${expandedDockId === 'dock-1' ? 'ring-2 ring-amber-500/50' : ''}
            `}
            title="快捷列 1"
          >
            {dock1App ? (
              <div className="pointer-events-none p-2">
                <DockIcon app={dock1App} isActive={true} size="large" accentColor="amber" />
              </div>
            ) : (
              <LayoutGrid size={18} className="text-slate-400 group-hover:text-amber-100 transition-colors pointer-events-none" />
            )}
          </div>

          {/* Low-Key Split Divider between Dock 1 and Dock 2 */}
          {secondaryDock && (
            <div className="w-px h-5 bg-white/10 mx-0.5 pointer-events-none" />
          )}

          {/* Slot 2: Secondary Dock (Dock 2) or "+" Button */}
          {secondaryDock ? (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                handleDockClick('dock-2');
              }}
              className={`
                w-11 h-11 rounded-[16px] relative flex items-center justify-center
                transition-all duration-200 cursor-pointer group/sec
                ${activeDockId === 'dock-2' 
                  ? 'bg-cyan-500/10 border border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.25)]' 
                  : 'hover:bg-white/5 border border-white/5'
                }
                ${expandedDockId === 'dock-2' ? 'ring-2 ring-cyan-500/50' : ''}
              `}
              title="快捷列 2"
            >
              {/* Discreet Low-Key Close Button (Frosted minimal glass X, top-right) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseSecondaryDock();
                  if (expandedDockId === 'dock-2') setExpandedDockId(null);
                }}
                className="absolute -top-1 -right-1 z-30 w-4 h-4 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-white/15 backdrop-blur-md flex items-center justify-center transition-all opacity-75 hover:opacity-100 hover:scale-110 shadow-sm cursor-pointer"
                title="關閉副快捷列"
              >
                <X size={9} strokeWidth={2} />
              </button>

              {dock2App ? (
                <div className="pointer-events-none p-2">
                  <DockIcon app={dock2App} isActive={true} size="large" accentColor="cyan" />
                </div>
              ) : (
                <LayoutGrid size={18} className="text-cyan-400/70 transition-colors pointer-events-none" />
              )}
            </div>
          ) : (
            /* "+" Button integrated inside the base */
            canAddDock && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddDock();
                }}
                className="w-8 h-8 rounded-[12px] bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-300 border border-white/5 hover:border-amber-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 ml-0.5 cursor-pointer"
                title="新增副快捷列 (支援雙頁面分屏 / 多工作區處理)"
              >
                <Plus size={15} strokeWidth={2} />
              </button>
            )
          )}

          {/* Single / Dual Page ViewMode Toggle on the right side of the Dock base */}
          {hasMultipleDocks && onToggleViewMode && (
            <>
              <div className="w-px h-5 bg-white/10 mx-0.5 pointer-events-none" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleViewMode();
                }}
                className={`
                  w-9 h-9 rounded-[14px] flex items-center justify-center transition-all duration-200
                  hover:scale-105 active:scale-95 cursor-pointer
                  ${viewMode === 'split' 
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                    : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white'
                  }
                `}
                title={viewMode === 'split' ? "切換為單頁工作區 (Workspace)" : "切換為雙頁分屏 (Split Screen)"}
              >
                {viewMode === 'split' ? <Columns2 size={16} strokeWidth={1.8} /> : <Maximize2 size={16} strokeWidth={1.8} />}
              </button>
            </>
          )}
        </div>

      </div>
    </>
  );
};