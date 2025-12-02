import React, { useState, useEffect } from 'react';
import { AppDefinition } from '../../types';
import { LayoutGrid, X, Globe } from 'lucide-react';

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

  const iconSize = size === 'large' ? 24 : 18;
  const imgSize = size === 'large' ? "w-6 h-6" : "w-5 h-5";

  // Determine icon to render
  const IconComponent = app.icon || Globe;

  return (
    <div className={`
      relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
      ${isActive ? 'bg-white/10 border border-white/5' : 'bg-transparent'}
    `}>
      {/* Active Indicator Glow */}
      {isActive && <div className="absolute inset-0 bg-amber-500/10 rounded-xl blur-sm" />}

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

  // If no app is active, we don't show the detailed dock
  if (!activeAppId) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
      
      {/* Expanded Menu (Mini App Switcher) */}
      <div 
        className={`
          flex items-center gap-2 p-3 bg-[#050505]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]
          transition-all duration-300 origin-bottom
          ${isExpanded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8 pointer-events-none absolute bottom-16'}
        `}
      >
        {apps.slice(0, 8).map(app => (
          <button
            key={app.id}
            onClick={() => {
              onSwitchApp(app.id);
              setIsExpanded(false);
            }}
            className={`
              relative group p-1 rounded-xl transition-all
              ${activeAppId === app.id ? '' : 'hover:bg-white/5'}
            `}
            title={app.name}
          >
            <DockIcon app={app} isActive={activeAppId === app.id} />
            
            {/* Active Dot */}
            {activeAppId === app.id && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            )}
            
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-amber-50 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
              {app.name}
            </div>
          </button>
        ))}
        
        <div className="w-px h-8 bg-white/10 mx-2" />
        
        <button
          onClick={() => {
            onCloseApp();
            setIsExpanded(false);
          }}
          className="p-2 rounded-xl hover:bg-red-900/20 text-slate-500 hover:text-red-400 transition-colors group relative"
          title="Close App"
        >
          <X size={20} strokeWidth={1.5} />
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-red-200 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
            Close
          </div>
        </button>
      </div>

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          flex items-center gap-4 pl-3 pr-5 py-3 rounded-full 
          bg-[#0a0a0a] backdrop-blur-xl border border-white/10 
          shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.5)]
          text-slate-200 hover:text-white hover:border-amber-500/30 transition-all duration-300
          group
        `}
      >
        {activeApp ? (
          <>
            <div className="relative">
               <DockIcon app={activeApp} isActive={true} size="large" />
               <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-amber-500/20" />
            </div>
            <div className="flex flex-col items-start">
               <span className="font-serif tracking-wide text-sm text-amber-50/90 pr-1 max-w-[120px] truncate">
                 {activeApp.name}
               </span>
               <span className="text-[10px] text-slate-500 uppercase tracking-widest">Active</span>
            </div>
          </>
        ) : (
          <LayoutGrid size={20} />
        )}
        
        <div className={`transition-transform duration-300 ml-2 ${isExpanded ? 'rotate-180' : ''}`}>
           <div className="w-1 h-1 rounded-full bg-slate-500 mb-1 group-hover:bg-amber-500 transition-colors" />
           <div className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-amber-500 transition-colors" />
        </div>
      </button>

    </div>
  );
};