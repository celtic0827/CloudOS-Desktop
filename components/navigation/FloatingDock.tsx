import React, { useState, useEffect, useRef } from 'react';
import { AppDefinition } from '../../types';
import { LayoutGrid, Globe, GripHorizontal, LayoutDashboard } from 'lucide-react';

interface FloatingDockProps {
  activeAppId: string | null;
  apps: AppDefinition[];
  onSwitchApp: (appId: string) => void;
  onCloseApp: () => void;
}

// Internal component to handle individual icon state logic
const DockIcon: React.FC<{ 
  app: AppDefinition; 
  isActive?: boolean;
  onClick?: () => void;
  size?: 'small' | 'large';
}> = ({ app, isActive, onClick, size = 'small' }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [app.iconUrl]);

  const iconSize = size === 'large' ? 20 : 16;
  const imgSize = size === 'large' ? "w-5 h-5" : "w-4 h-4";

  // Determine icon to render
  const IconComponent = app.icon || Globe;

  return (
    <div className={`
      relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
      ${isActive ? 'bg-white/10 border border-white/5' : 'bg-transparent'}
    `}>
      {/* Active Indicator Glow */}
      {isActive && <div className="absolute inset-0 bg-amber-500/10 rounded-lg blur-sm" />}

      {app.iconUrl && !hasError ? (
        <img 
          src={app.iconUrl} 
          alt={app.name} 
          className={`${imgSize} object-contain rounded-sm z-10 drop-shadow-md`}
          onError={() => setHasError(true)}
          crossOrigin="anonymous"
        />
      ) : (
        <IconComponent size={iconSize} className={`z-10 transition-colors ${isActive ? 'text-amber-100' : 'text-slate-400 group-hover:text-slate-200'}`} strokeWidth={1.5} />
      )}
    </div>
  );
};

export const FloatingDock: React.FC<FloatingDockProps> = ({ 
  activeAppId, 
  apps, 
  onSwitchApp, 
  onCloseApp 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeApp = apps.find(a => a.id === activeAppId);
  const dockRef = useRef<HTMLDivElement>(null);
  
  // Dragging Logic
  const [position, setPosition] = useState<{x: number, y: number} | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{x: number, y: number} | null>(null);
  const initialPosRef = useRef<{x: number, y: number} | null>(null);

  // Initialize Position to Bottom Center on Mount
  useEffect(() => {
    // Only set initial position if not already set (e.g. strict mode or re-renders)
    if (!position) {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      // Approximate center bottom: Center X, Bottom - 80px
      setPosition({ 
        x: (windowWidth / 2) - 100, // Roughly centered offset based on dock width
        y: windowHeight - 80 
      });
    }
  }, []);

  // 1. Determine Vertical Popover Direction (Up/Down)
  const isTopHalf = position && position.y < window.innerHeight / 2;

  // 2. Determine Horizontal Alignment (Left/Center/Right)
  // Prevents the menu from being clipped if the dock is near the screen edges
  const getHorizontalAlignmentClass = () => {
    if (!position) return 'left-1/2 -translate-x-1/2'; // Default Center
    
    const windowWidth = window.innerWidth;
    const leftThreshold = windowWidth * 0.2; // 20% from left
    const rightThreshold = windowWidth * 0.8; // 20% from right

    if (position.x < leftThreshold) return 'left-0 origin-left';
    if (position.x > rightThreshold) return 'right-0 origin-right';
    return 'left-1/2 -translate-x-1/2 origin-center';
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only allow dragging from the drag handle or empty space, not buttons
    if ((e.target as HTMLElement).closest('button')) return;

    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = position;
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !dragStartRef.current || !initialPosRef.current) return;
    
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    // Calculate raw new position
    const rawX = initialPosRef.current.x + dx;
    const rawY = initialPosRef.current.y + dy;

    // Boundary Constraints (Clamping)
    const padding = 0; // Allow sticking to screen edges
    const dockWidth = dockRef.current?.offsetWidth || 200;
    const dockHeight = dockRef.current?.offsetHeight || 60;
    
    const maxX = window.innerWidth - dockWidth - padding;
    const maxY = window.innerHeight - dockHeight - padding;

    // Apply Clamp
    const clampedX = Math.max(padding, Math.min(rawX, maxX));
    const clampedY = Math.max(padding, Math.min(rawY, maxY));

    setPosition({
      x: clampedX,
      y: clampedY
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    document.body.style.userSelect = '';
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // If no app is active, we don't show the detailed dock
  if (!activeAppId || !position) return null;

  return (
    <>
      {/* 
        Click Outside Overlay: 
        This transparent layer sits between the App (z-10) and the Dock (z-50).
        It captures clicks anywhere on the screen (including over iframes) to close the menu.
      */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Floating Container */}
      <div 
        ref={dockRef}
        className="fixed z-50 flex flex-col items-center gap-4 transition-none"
        style={{ 
          left: position.x, 
          top: position.y,
          touchAction: 'none' // Prevent scrolling while dragging on touch
        }}
      >
        
        {/* Expanded Menu (Mini App Switcher) */}
        <div 
          className={`
            absolute ${isTopHalf ? 'top-14' : 'bottom-14'}
            ${getHorizontalAlignmentClass()}
            flex items-center gap-2 p-2 bg-[#050505]/90 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]
            transition-all duration-300
            ${isExpanded 
              ? 'opacity-100 scale-100 translate-y-0' 
              : `opacity-0 scale-90 ${isTopHalf ? '-translate-y-4' : 'translate-y-4'} pointer-events-none`
            }
          `}
          style={{ width: 'max-content', maxWidth: '90vw' }}
        >
          {apps.slice(0, 8).map(app => (
            <button
              key={app.id}
              onClick={() => {
                onSwitchApp(app.id);
                setIsExpanded(false);
              }}
              className={`
                relative group p-1 rounded-lg transition-all
                ${activeAppId === app.id ? '' : 'hover:bg-white/5'}
              `}
              title={app.name}
            >
              <DockIcon app={app} isActive={activeAppId === app.id} />
              
              {/* Active Dot */}
              {activeAppId === app.id && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              )}
            </button>
          ))}
          
          <div className="w-px h-6 bg-white/10 mx-1" />
          
          {/* Back to Desktop Button */}
          <button
            onClick={() => {
              onCloseApp();
              setIsExpanded(false);
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-amber-100 transition-colors group relative"
            title="Show Desktop"
          >
            <LayoutDashboard size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Main Bar */}
        <div className={`
            flex items-center gap-3 px-2 py-2 rounded-full 
            bg-[#0a0a0a] backdrop-blur-xl border border-white/10 
            shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.5)]
            group
          `}
        >
          {/* Drag Handle */}
          <div 
            className="cursor-grab active:cursor-grabbing text-slate-700 hover:text-slate-400 p-1 transition-colors"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
             <GripHorizontal size={14} />
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-white/5" />

          {/* Trigger Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 pr-4 text-slate-200 hover:text-white transition-all duration-300"
          >
            {activeApp ? (
              <>
                <div className="relative">
                  <DockIcon app={activeApp} isActive={true} size="large" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-serif tracking-wide text-xs text-amber-50/90 pr-1 max-w-[100px] truncate">
                    {activeApp.name}
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest leading-none">Active</span>
                </div>
              </>
            ) : (
              <LayoutGrid size={18} />
            )}
            
            <div className={`transition-transform duration-300 ml-1 ${isExpanded ? 'rotate-180' : ''}`}>
              <div className="w-0.5 h-0.5 rounded-full bg-slate-500 mb-0.5 group-hover:bg-amber-500 transition-colors" />
              <div className="w-0.5 h-0.5 rounded-full bg-slate-500 group-hover:bg-amber-500 transition-colors" />
            </div>
          </button>
        </div>

      </div>
    </>
  );
};