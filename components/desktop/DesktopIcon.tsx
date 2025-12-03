import React, { useState, useEffect } from 'react';
import { AppDefinition } from '../../types';
import { Globe } from 'lucide-react';

interface DesktopIconProps {
  app: AppDefinition;
  onClick: (appId: string) => void;
  onDragStart?: (id: string) => void;
  onDrop?: (id: string) => void;
  isDragging?: boolean;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({ 
  app, 
  onClick,
  onDragStart,
  onDrop,
  isDragging
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [app.iconUrl]);

  // Handle Drag Start
  const handleDragStart = (e: React.DragEvent) => {
    if (!app.isSystem && onDragStart) {
      onDragStart(app.id);
      e.dataTransfer.effectAllowed = "move";
      // Optional: Set a custom drag image here if needed, 
      // but browser default ghost image is usually fine for icons.
    } else {
      e.preventDefault();
    }
  };

  // Handle Drag Over (Necessary to allow Drop)
  const handleDragOver = (e: React.DragEvent) => {
    if (!app.isSystem) {
      e.preventDefault(); // Allow drop
    }
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!app.isSystem && onDrop) {
      onDrop(app.id);
    }
  };

  const handleClick = () => {
    onClick(app.id);
  };

  return (
    <button
      draggable={!app.isSystem}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        group flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-300 w-28 focus:outline-none relative cursor-pointer
        ${isDragging ? 'opacity-40 scale-95 grayscale' : 'opacity-100'}
        ${app.isSystem ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
      `}
    >
      {/* Icon Container (Smaller: w-14 h-14) */}
      <div className={`
        relative w-14 h-14 rounded-2xl flex items-center justify-center 
        ${app.color} /* Use app color as base background */
        border border-white/10 shadow-xl
        group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300
        group-hover:border-amber-500/40 group-hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]
        overflow-hidden
      `}>
        {/* Gradient Overlay for texture/luxury feel */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/30 pointer-events-none" />

        {/* Inner colored glow */}
        <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-white`} />

        {app.iconUrl && !hasError ? (
          <img 
            src={app.iconUrl} 
            alt={app.name} 
            className="w-7 h-7 object-contain drop-shadow-lg z-10"
            onError={() => setHasError(true)}
            crossOrigin="anonymous"
          />
        ) : (
          /* Render Lucide Icon if available, else Fallback */
          app.icon ? (
            <app.icon className="text-white/90 group-hover:text-amber-50 w-7 h-7 z-10 transition-colors drop-shadow-md" strokeWidth={1.5} />
          ) : (
            <Globe className="text-white/90 group-hover:text-amber-50 w-7 h-7 z-10 transition-colors drop-shadow-md" strokeWidth={1.5} />
          )
        )}
      </div>

      {/* Label */}
      <div className="flex items-center justify-center gap-1.5 w-full px-1">
        <span className="text-slate-300 text-xs font-medium tracking-wide drop-shadow-md text-center group-hover:text-white transition-colors truncate leading-tight">
          {app.name}
        </span>
      </div>
    </button>
  );
};