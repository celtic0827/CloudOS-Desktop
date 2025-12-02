import React, { useState, useEffect, useRef } from 'react';
import { AppDefinition } from '../../types';
import { LayoutGrid, Globe, LayoutDashboard } from 'lucide-react';

interface FloatingDockProps {
  activeAppId: string | null;
  apps: AppDefinition[];
  onSwitchApp: (appId: string) => void;
  onCloseApp: () => void;
}

const STORAGE_KEY = 'cloudos_dock_position';

// Internal component to handle individual icon state logic
const DockIcon: React.FC<{ 
  app: AppDefinition; 
  isActive?: boolean;
  size?: 'small' | 'large';
}> = ({ app, isActive, size = 'small' }) => {
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
      relative flex items-center justify-center transition-all duration-300
      ${isActive && size === 'small' ? 'bg-white/10 border border-white/5 w-8 h-8 rounded-lg' : ''}
      ${size === 'large' ? 'w-full h-full' : ''}
    `}>
      {/* Active Indicator Glow (Only for list items) */}
      {isActive && size === 'small' && <div className="absolute inset-0 bg-amber-500/10 rounded-lg blur-sm" />}

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
  
  // Position State
  const [position, setPosition] = useState<{x: number, y: number} | null>(null);
  
  // Dragging Logic Refs
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{x: number, y: number} | null>(null);
  const initialPosRef = useRef<{x: number, y: number} | null>(null);
  const hasMovedSignificantDistanceRef = useRef(false);
  // Keep track of latest position for saving to storage on mouse up (avoids stale closures)
  const latestPositionRef = useRef<{x: number, y: number} | null>(null);

  // Constants for Size and Padding
  const DOCK_SIZE = 48; // w-12 = 3rem = 48px
  const EDGE_PADDING = 2; // 2px margin

  // Initialize Position (From LocalStorage or Default Bottom Right)
  useEffect(() => {
    if (!position) {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      let initialX = windowWidth - 100;
      let initialY = windowHeight - 100;

      // Try loading from local storage
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Verify and clamp in case window size changed
            const maxX = windowWidth - DOCK_SIZE - EDGE_PADDING;
            const maxY = windowHeight - DOCK_SIZE - EDGE_PADDING;
            
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
  }, []);

  // 1. Determine Popover Direction
  const isTopHalf = position && position.y < window.innerHeight / 2;
  
  // 2. Determine Horizontal Alignment for the Menu
  const getMenuPositionStyle = () => {
    if (!position) return {};
    
    const windowWidth = window.innerWidth;
    // If close to right edge, show menu on left
    if (position.x > windowWidth - 250) {
      return { right: '100%', marginRight: '12px', top: '50%', transform: 'translateY(-50%)' };
    }
    // If close to left edge, show menu on right
    if (position.x < 250) {
      return { left: '100%', marginLeft: '12px', top: '50%', transform: 'translateY(-50%)' };
    }
    // Otherwise show above or below
    if (isTopHalf) {
       return { top: '100%', marginTop: '12px', left: '50%', transform: 'translateX(-50%)' };
    }
    return { bottom: '100%', marginBottom: '12px', left: '50%', transform: 'translateX(-50%)' };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Stop propagation to prevent 'click outside' overlay from catching this immediately
    e.stopPropagation();

    isDraggingRef.current = true;
    hasMovedSignificantDistanceRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = position;
    
    // Prevent text selection
    document.body.style.userSelect = 'none';
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !dragStartRef.current || !initialPosRef.current) return;
    
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    // Check if moved enough to consider it a drag
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasMovedSignificantDistanceRef.current = true;
    }

    // Only update position if we are dragging to prevent jitter on simple clicks
    if (hasMovedSignificantDistanceRef.current) {
        // Close menu if dragging starts
        if (isExpanded) setIsExpanded(false);

        const rawX = initialPosRef.current.x + dx;
        const rawY = initialPosRef.current.y + dy;

        const maxX = window.innerWidth - DOCK_SIZE - EDGE_PADDING;
        const maxY = window.innerHeight - DOCK_SIZE - EDGE_PADDING;

        const clampedX = Math.max(EDGE_PADDING, Math.min(rawX, maxX));
        const clampedY = Math.max(EDGE_PADDING, Math.min(rawY, maxY));

        const newPos = { x: clampedX, y: clampedY };
        setPosition(newPos);
        latestPositionRef.current = newPos; // Update ref for save logic
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    document.body.style.userSelect = '';
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    // If we dragged, save the position
    if (hasMovedSignificantDistanceRef.current && latestPositionRef.current) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(latestPositionRef.current));
    } else {
        // Otherwise, treat it as a click -> Toggle Menu
        setIsExpanded(prev => !prev);
    }
  };

  if (!activeAppId || !position) return null;

  return (
    <>
      {/* Click Outside Overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Main Floating Button Container */}
      <div 
        ref={dockRef}
        className="fixed z-50 flex flex-col items-center justify-center transition-none"
        style={{ 
          left: position.x, 
          top: position.y,
          touchAction: 'none' 
        }}
      >
        
        {/* Expanded Menu */}
        <div 
          className={`
            absolute flex items-center gap-2 p-2 bg-[#050505]/90 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]
            transition-all duration-300 origin-center
            ${isExpanded 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-90 pointer-events-none'
            }
          `}
          style={{ 
              width: 'max-content', 
              maxWidth: '90vw',
              ...getMenuPositionStyle()
          }}
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

        {/* The Single Floating Icon (FAB) */}
        {/* Changed: w-12 h-12 (48px), rounded-2xl (Squircle) */}
        <div 
          className={`
            w-12 h-12 rounded-2xl 
            bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 
            shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.5)]
            flex items-center justify-center
            cursor-grab active:cursor-grabbing
            hover:scale-105 hover:border-amber-500/30 transition-all duration-300
            group
          `}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
            {activeApp ? (
               <div className="pointer-events-none p-2.5">
                  <DockIcon app={activeApp} isActive={true} size="large" />
               </div>
            ) : (
               <LayoutGrid size={20} className="text-slate-400 group-hover:text-amber-100 transition-colors pointer-events-none" />
            )}
            
            {/* Subtle Ring Glow on Expand (Squircle shape match) */}
            <div className={`absolute inset-0 rounded-2xl border border-amber-500/50 transition-all duration-500 ${isExpanded ? 'opacity-100 scale-110' : 'opacity-0 scale-100'}`} />
        </div>

      </div>
    </>
  );
};