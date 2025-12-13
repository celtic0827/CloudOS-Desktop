import React, { useState } from 'react';
import { AppDefinition } from '../../types';
import { Globe, ExternalLink, GripHorizontal } from 'lucide-react';

interface BentoTileProps {
  app: AppDefinition;
  onClick: (appId: string) => void;
  style?: React.CSSProperties;
  onDragStart?: (e: React.DragEvent) => void;
  isGridDragging?: boolean;
}

export const BentoTile: React.FC<BentoTileProps> = ({ 
  app, 
  onClick, 
  style,
  onDragStart,
  isGridDragging = false
}) => {
  const [hasError, setHasError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // We maintain aspect ratio classes here, but span classes are now on the parent wrapper in BentoGrid
  const getAspectRatioClass = () => {
    switch (app.gridSize) {
      case '2x2': return 'aspect-square';
      case '2x1': return 'aspect-[2/1]'; 
      case '1x2': return 'aspect-[1/2]';
      case '4x2': return 'aspect-square md:aspect-[2/1]';
      case '1x1':
      default: return 'aspect-square';
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
        setIsDragging(true);
        onDragStart(e);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const showWidget = app.widgetComponent !== undefined;
  const isOneByOne = app.gridSize === '1x1';

  // --- STRICT STATE CONTROL ---
  // When the grid is being dragged (isGridDragging):
  // 1. pointer-events-none: Makes the widget invisible to mouse, passing events to the grid slot below.
  // 2. !transform-none: Instantly kills any active scale animations.
  // 3. !filter-none: Kills glows/blurs.
  // 4. group class is REMOVED to stop child hover effects.
  const containerInteractionClasses = !isGridDragging 
    ? "group hover:bg-[#111]/60 hover:border-amber-500/30 hover:shadow-[0_8px_32px_-8px_rgba(245,158,11,0.15)] active:scale-[0.98] cursor-grab active:cursor-grabbing"
    : "pointer-events-none !transform-none !filter-none !transition-none"; // Hard Reset

  return (
    <div
      draggable={!isGridDragging} // Disable dragging specific tile if we are already in a global drag state (prevents nested issues)
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        relative w-full h-full 
        transition-all duration-300 ease-out
        ${getAspectRatioClass()}
        ${isDragging ? 'z-50 opacity-20' : 'z-auto'}
        ${isGridDragging && !isDragging ? '!opacity-100' : ''} /* Ensure non-dragged items are fully visible but static */
      `}
      style={style}
    >
      <div 
        onClick={(e) => !isGridDragging && onClick(app.id)}
        className={`
          w-full h-full overflow-hidden rounded-3xl
          bg-[#0a0a0a]/40 backdrop-blur-xl border 
          transition-all duration-300 ease-out
          ${isOneByOne || !showWidget ? 'flex flex-col items-center justify-center' : ''}
          
          border-white/5 
          ${containerInteractionClasses}
          
          text-left select-none
        `}
      >
        {/* Drag Handle Hint - Only show when NOT dragging */}
        {!isGridDragging && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-30 transition-opacity z-20 pointer-events-none">
             <GripHorizontal size={12} className="text-white" />
            </div>
        )}

        {showWidget ? (
          <div className="w-full h-full pointer-events-none">
              {app.widgetComponent}
          </div>
        ) : (
          <>
            <div className="relative mb-3 pointer-events-none">
                  <div className={`
                      absolute inset-0 rounded-2xl ${app.color}
                      blur-xl opacity-20 ${!isGridDragging ? 'group-hover:opacity-60 group-hover:scale-125' : ''}
                      transition-all duration-500 scale-110
                      brightness-150 saturate-150
                  `} />

                  <div className={`
                      relative w-12 h-12 rounded-2xl flex items-center justify-center
                      ${app.color} 
                      shadow-lg ${!isGridDragging ? 'group-hover:scale-110' : ''} transition-transform duration-300
                      border border-white/10 overflow-hidden
                  `}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/10" />
                      
                      {app.iconUrl && !hasError ? (
                          <img 
                          src={app.iconUrl} 
                          alt={app.name} 
                          className="w-6 h-6 object-contain z-10 drop-shadow-md"
                          onError={() => setHasError(true)}
                          />
                      ) : (
                          React.createElement(app.icon || Globe, { size: 24, className: 'text-white z-10', strokeWidth: 1.5 })
                      )}
                  </div>
            </div>
            
            <span className={`
                text-xs font-medium text-slate-300 transition-colors truncate w-full text-center px-3 pointer-events-none relative z-10
                ${!isGridDragging ? 'group-hover:text-white' : ''}
            `}>
              {app.name}
            </span>
          </>
        )}

        {app.isExternal && !showWidget && (
          <div className={`absolute top-3 right-3 transition-opacity ${!isGridDragging ? 'opacity-0 group-hover:opacity-50' : 'opacity-0'}`}>
              <ExternalLink size={10} className="text-slate-400" />
          </div>
        )}
      </div>
    </div>
  );
};