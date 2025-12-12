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
  const latestPositionRef = useRef<{x: number, y: number} | null>(null);

  // Constants for Size and Padding
  const DOCK_SIZE = 48; 
  const EDGE_PADDING = 12; // Increased padding for aesthetics

  // Initialize Position
  useEffect(() => {
    if (!position) {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Default to bottom right, slightly offset
      let initialX = windowWidth - 80;
      let initialY = windowHeight - 100;

      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
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

  const getMenuPositionStyle = () => {
    if (!position) return {};
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Intelligent positioning based on screen quadrant
    if (position.x > windowWidth - 250) {
      return { right: '100%', marginRight: '16px', top: '50%', transform: 'translateY(-50%)' };
    }
    if (position.x < 250) {
      return { left: '100%', marginLeft: '16px', top: '50%', transform: 'translateY(-50%)' };
    }
    const isTopHalf = position.y < windowHeight / 2;
    if (isTopHalf) {
       return { top: '100%', marginTop: '16px', left: '50%', transform: 'translateX(-50%)' };
    }
    return { bottom: '100%', marginBottom: '16px', left: '50%', transform: 'translateX(-50%)' };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
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
        if (isExpanded) setIsExpanded(false);

        const rawX = initialPosRef.current.x + dx;
        const rawY = initialPosRef.current.y + dy;

        // Constraint logic with Safe Area awareness
        // Note: JS doesn't easily read env(), so we use a conservative padding
        const maxX = window.innerWidth - DOCK_SIZE - EDGE_PADDING;
        const maxY = window.innerHeight - DOCK_SIZE - EDGE_PADDING;

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
    } else {
        setIsExpanded(prev => !prev);
    }
  };

  if (!activeAppId || !position) return null;

  return (
    <>
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div 
        ref={dockRef}
        className="fixed z-50 flex flex-col items-center justify-center transition-none touch-none"
        style={{ 
          left: position.x, 
          top: position.y,
          // CSS variable fallback to ensure it sits above iOS home bar if docked at bottom
          marginBottom: 'env(safe-area-inset-bottom, 0px)' 
        }}
      >
        
        {/* Expanded Menu */}
        <div 
          className={`
            absolute flex items-center gap-2 p-2 bg-[#050505]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]
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
                relative group p-1.5 rounded-xl transition-all
                ${activeAppId === app.id ? 'bg-white/5' : 'hover:bg-white/5'}
              `}
              title={app.name}
            >
              <DockIcon app={app} isActive={activeAppId === app.id} />
              
              {activeAppId === app.id && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              )}
            </button>
          ))}
          
          <div className="w-px h-6 bg-white/10 mx-1" />
          
          <button
            onClick={() => {
              onCloseApp();
              setIsExpanded(false);
            }}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-500 hover:text-amber-100 transition-colors group relative"
            title="Show Desktop"
          >
            <LayoutDashboard size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* FAB */}
        <div 
          className={`
            w-12 h-12 rounded-[18px] 
            bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 
            shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.5)]
            flex items-center justify-center
            cursor-grab active:cursor-grabbing
            hover:scale-105 hover:border-amber-500/30 transition-all duration-300
            group z-50
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
            
            <div className={`absolute inset-0 rounded-[18px] border border-amber-500/50 transition-all duration-500 ${isExpanded ? 'opacity-100 scale-110' : 'opacity-0 scale-100'}`} />
        </div>

      </div>
    </>
  );
};