import React, { useState, useEffect } from 'react';
import { AppDefinition } from '../../types';
import { ExternalLink, Globe } from 'lucide-react';

interface DesktopIconProps {
  app: AppDefinition;
  onClick: (appId: string) => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({ app, onClick }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [app.iconUrl]);

  return (
    <button
      onClick={() => onClick(app.id)}
      className="group flex flex-col items-center gap-4 p-4 rounded-xl transition-all duration-300 w-32 focus:outline-none relative"
    >
      {/* Icon Container */}
      <div className={`
        relative w-16 h-16 rounded-2xl flex items-center justify-center 
        ${app.color} /* Use app color as base background */
        border border-white/10 shadow-xl
        group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300
        group-hover:border-amber-500/40 group-hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]
        overflow-hidden
      `}>
        {/* Gradient Overlay for texture/luxury feel, but keeps color visible */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/30 pointer-events-none" />

        {/* Inner colored glow based on app color preference, subtly visible */}
        <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-white`} />

        {app.iconUrl && !hasError ? (
          <img 
            src={app.iconUrl} 
            alt={app.name} 
            className="w-10 h-10 object-contain drop-shadow-lg z-10"
            onError={() => setHasError(true)}
            crossOrigin="anonymous"
          />
        ) : (
          /* Render Lucide Icon if available, else Fallback */
          app.icon ? (
            <app.icon className="text-white/90 group-hover:text-amber-50 w-8 h-8 z-10 transition-colors drop-shadow-md" strokeWidth={1.5} />
          ) : (
            <Globe className="text-white/90 group-hover:text-amber-50 w-8 h-8 z-10 transition-colors drop-shadow-md" strokeWidth={1.5} />
          )
        )}

        {app.isExternal && (
          <div className="absolute -top-1.5 -right-1.5 bg-[#0a0a0a] rounded-full p-1 border border-white/20 shadow-sm z-20">
            <ExternalLink size={8} className="text-slate-400" />
          </div>
        )}
      </div>

      {/* Label */}
      <span className="text-slate-300 text-sm font-medium tracking-wide drop-shadow-md text-center group-hover:text-white transition-colors truncate w-full px-1">
        {app.name}
      </span>
    </button>
  );
};