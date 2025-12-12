import React, { useState } from 'react';
import { AppDefinition } from '../../types';
import { Globe, ExternalLink, GripHorizontal } from 'lucide-react';

interface BentoTileProps {
  app: AppDefinition;
  onClick: (appId: string) => void;
  style?: React.CSSProperties;
  onDragStart?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  isFlipped?: boolean; // New prop to handle bottom-up correction
}

export const BentoTile: React.FC<BentoTileProps> = ({ 
  app, 
  onClick, 
  style,
  onDragStart,
  onDrop,
  isFlipped
}) => {
  const [hasError, setHasError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Determine Layout Classes based on Grid Size
  const getLayoutClasses = () => {
    switch (app.gridSize) {
      case '2x2': return 'col-span-2 row-span-2 aspect-square';
      case '2x1': return 'col-span-2 row-span-1 aspect-[2/1]'; 
      case '1x2': return 'col-span-1 row-span-2 aspect-[1/2]';
      case '4x2': return 'col-span-2 row-span-2 aspect-square md:col-span-4 md:row-span-2 md:aspect-[2/1]';
      case '1x1':
      default: return 'col-span-1 row-span-1 aspect-square';
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
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDropLocal = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setIsDragging(false);
    if (onDrop) onDrop(e);
  };

  const showWidget = app.widgetComponent !== undefined;
  const isOneByOne = app.gridSize === '1x1';

  return (
    // OUTER WRAPPER: Handles Grid Positioning & Structural Transforms (Flipping)
    // We separate this from the inner visual card to avoid CSS transform conflicts (e.g. scaleY(-1) vs hover:scale-105)
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropLocal}
      className={`
        relative w-full h-full 
        transition-all duration-300 ease-out
        ${getLayoutClasses()}
        ${isDragging ? 'z-50' : 'z-auto'}
      `}
      style={{
          ...style,
          // Counter-flip if the grid is reversed (bottom-up mode)
          transform: isFlipped ? 'scaleY(-1)' : style?.transform 
      }}
    >
      {/* INNER VISUAL CARD: Handles Appearance, Hover Effects, and Content */}
      <div 
        onClick={() => onClick(app.id)}
        className={`
          w-full h-full group overflow-hidden rounded-3xl cursor-grab active:cursor-grabbing
          bg-[#0a0a0a]/40 backdrop-blur-xl border 
          transition-all duration-300 ease-out
          ${isOneByOne || !showWidget ? 'flex flex-col items-center justify-center' : ''}
          
          /* Visual States */
          ${isDragging ? 'opacity-20 scale-95 border-amber-500/50 grayscale' : 'opacity-100'}
          ${isDragOver ? 'border-amber-500 shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)] bg-white/5 scale-[1.02]' : 'border-white/5 hover:bg-[#111]/60 hover:border-amber-500/30 hover:shadow-[0_8px_32px_-8px_rgba(245,158,11,0.15)]'}
          
          active:scale-[0.98] 
          text-left select-none
        `}
      >
        {/* Drag Handle Hint */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-30 transition-opacity z-20 pointer-events-none">
          <GripHorizontal size={12} className="text-white" />
        </div>

        {/* 1. Custom Widget View */}
        {showWidget ? (
          <div className="w-full h-full pointer-events-none">
              {app.widgetComponent}
          </div>
        ) : (
          /* 2. Standard Icon View */
          <>
            {/* Wrapper for Icon & Glow */}
            <div className="relative mb-3 pointer-events-none">
                  {/* Glow Layer */}
                  <div className={`
                      absolute inset-0 rounded-2xl ${app.color}
                      blur-xl opacity-20 group-hover:opacity-60
                      transition-all duration-500 scale-110 group-hover:scale-125
                      brightness-150 saturate-150
                  `} />

                  {/* Main Icon Box */}
                  <div className={`
                      relative w-12 h-12 rounded-2xl flex items-center justify-center
                      ${app.color} 
                      shadow-lg group-hover:scale-110 transition-transform duration-300
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
            
            <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors truncate w-full text-center px-3 pointer-events-none relative z-10">
              {app.name}
            </span>
          </>
        )}

        {/* External Link Indicator */}
        {app.isExternal && !showWidget && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-50 transition-opacity">
              <ExternalLink size={10} className="text-slate-400" />
          </div>
        )}
      </div>
    </div>
  );
};