import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { AppDefinition, GridSize } from '../../types';
import { BentoTile } from './BentoTile';

interface BentoGridProps {
  apps: (AppDefinition | null)[];
  onOpenApp: (id: string) => void;
  onMoveApp?: (sourceId: string, targetIndex: number) => void;
}

// Empty Slot Component
const EmptySlot: React.FC<{ 
    index: number, 
    style: React.CSSProperties,
    onDrop: (e: React.DragEvent, index: number) => void,
    onDragEnter: (index: number) => void,
    isGridDragging: boolean,
    isHighlighted: boolean
}> = ({ index, style, onDrop, onDragEnter, isGridDragging, isHighlighted }) => {

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        onDragEnter(index); 
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        onDrop(e, index);
    };

    // Visual State Logic
    let borderClass = 'border-transparent'; // Default hidden
    let bgClass = 'bg-transparent';
    let scaleClass = 'scale-100';
    let shadowClass = '';

    if (isGridDragging) {
        // When dragging, show faint outline for all empty slots
        borderClass = 'border-white/5';
        bgClass = 'bg-white/[0.02]';
    }

    if (isHighlighted) {
        // Strong highlight for the drop target footprint
        borderClass = '!border-amber-500';
        bgClass = '!bg-amber-500/20';
        scaleClass = 'scale-[0.98]';
        shadowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.3)]';
    }

    return (
        <div 
            style={style}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`
                rounded-3xl transition-all duration-200 border
                ${isGridDragging ? 'z-[50] backdrop-blur-sm' : 'z-0'}
                ${borderClass} ${bgClass} ${scaleClass} ${shadowClass}
            `}
        >
            {isGridDragging && !isHighlighted && (
                <div className="w-full h-full flex items-center justify-center opacity-20">
                    <div className="w-1 h-1 rounded-full bg-white" />
                </div>
            )}
        </div>
    );
};

export const BentoGrid: React.FC<BentoGridProps> = ({ 
  apps, 
  onOpenApp, 
  onMoveApp
}) => {
  // 1. Responsive Column Logic
  const [cols, setCols] = useState(8); 
  
  // 2. Dragging State
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const updateCols = () => {
        const width = window.innerWidth;
        if (width >= 1280) setCols(8);      
        else if (width >= 1024) setCols(6); 
        else if (width >= 768) setCols(4);  
        else setCols(2);                    
    };

    updateCols();
    window.addEventListener('resize', updateCols);
    
    const handleGlobalDragEnd = () => {
        setIsDragging(false);
        setDraggedAppId(null);
        setHoveredIndex(null);
    };
    window.addEventListener('dragend', handleGlobalDragEnd);

    return () => {
        window.removeEventListener('resize', updateCols);
        window.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, []);

  // Helper: Get W/H from GridSize string
  const getDimensions = (gridSize: GridSize): [number, number] => {
      if (gridSize === '2x2') return [2, 2];
      if (gridSize === '2x1') return [2, 1];
      if (gridSize === '1x2') return [1, 2];
      if (gridSize === '4x2') return [4, 2];
      return [1, 1];
  };

  // Helper: Check if a placement is valid (Doesn't wrap rows, doesn't overflow bottom)
  const checkPlacementValidity = useCallback((index: number, w: number, h: number) => {
      const colIndex = index % cols;
      
      // 1. Right Edge Check: If current column + width > total columns, it wraps.
      if (colIndex + w > cols) return false;

      // 2. Bottom Edge Check: If it goes beyond the total number of slots
      // Calculate the index of the bottom-right cell
      const lastIndex = index + ((h - 1) * cols) + (w - 1);
      if (lastIndex >= apps.length) return false;

      return true;
  }, [cols, apps.length]);

  // --- Footprint Calculation Logic ---
  const highlightedIndices = useMemo(() => {
      if (hoveredIndex === null || !draggedAppId) return new Set<number>();

      const app = apps.find(a => a?.id === draggedAppId);
      // If we can't find the dragged app (weird), default to 1x1 logic or just anchor
      const gridSize = app?.gridSize || '1x1';
      const [w, h] = getDimensions(gridSize);

      // Validate Placement BEFORE calculating indices
      const isValid = checkPlacementValidity(hoveredIndex, w, h);
      
      // If invalid, return empty set (User sees NO highlight -> implies "No Drop")
      if (!isValid) return new Set<number>();

      const indices = new Set<number>();

      for (let row = 0; row < h; row++) {
          for (let col = 0; col < w; col++) {
              const targetIndex = hoveredIndex + col + (row * cols);
              indices.add(targetIndex);
          }
      }
      return indices;

  }, [hoveredIndex, draggedAppId, apps, cols, checkPlacementValidity]);


  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setIsDragging(true);
    setDraggedAppId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    // We need to re-validate here because the drop event doesn't know about the UI state
    // We need to get the dragged app ID from state (closure) or re-fetch
    const sourceId = e.dataTransfer.getData('text/plain');
    
    // Find the app to check its size
    const app = apps.find(a => a?.id === sourceId);
    
    if (app && onMoveApp) {
        const [w, h] = getDimensions(app.gridSize);
        // Only allow move if valid
        if (checkPlacementValidity(targetIndex, w, h)) {
            onMoveApp(sourceId, targetIndex);
        }
    }

    // Reset state
    setIsDragging(false);
    setDraggedAppId(null);
    setHoveredIndex(null);
  }, [onMoveApp, apps, checkPlacementValidity]);

  // Explicit Grid Position Helper
  const getGridStyle = (index: number, span?: string) => {
      const colStart = (index % cols) + 1;
      const rowStart = Math.floor(index / cols) + 1;

      let colSpan = 1;
      let rowSpan = 1;

      if (span === 'col-span-2') colSpan = 2;
      if (span === 'row-span-2') rowSpan = 2;
      if (span === 'col-span-2 row-span-2') { colSpan = 2; rowSpan = 2; }

      return {
          gridColumnStart: colStart,
          gridColumnEnd: `span ${colSpan}`,
          gridRowStart: rowStart,
          gridRowEnd: `span ${rowSpan}`,
      };
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 transition-all duration-300">
      <div 
        className="grid gap-4 md:gap-6"
        style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridAutoRows: 'minmax(100px, auto)' 
        }}
      >
        {apps.map((app, index) => {
            // Determine Span
            let spanClass = '';
            if (app) {
                if (app.gridSize === '2x2') spanClass = 'col-span-2 row-span-2';
                else if (app.gridSize === '2x1' || app.gridSize === '4x2') spanClass = 'col-span-2';
                else if (app.gridSize === '1x2') spanClass = 'row-span-2';
                else if (app.gridSize === '4x2') spanClass = 'col-span-2'; 
            }

            const style = getGridStyle(index, spanClass);

            if (!app) {
                return (
                    <EmptySlot 
                        key={`empty-${index}`} 
                        index={index} 
                        style={{ ...style, aspectRatio: '1/1' }} 
                        onDrop={handleDrop} 
                        onDragEnter={setHoveredIndex}
                        isGridDragging={isDragging}
                        isHighlighted={highlightedIndices.has(index)}
                    />
                );
            }

            return (
                <div 
                    key={app.id} 
                    onDragOver={(e) => { 
                        e.preventDefault(); 
                        e.dataTransfer.dropEffect = 'move';
                        setHoveredIndex(index);
                    }} 
                    onDrop={(e) => handleDrop(e, index)} 
                    style={{ 
                        ...style, 
                        zIndex: 10,
                        opacity: isDragging ? 0.6 : 1
                    }}
                    className="relative transition-opacity duration-200"
                >
                  <BentoTile 
                    app={app} 
                    onClick={onOpenApp}
                    onDragStart={(e) => handleDragStart(e, app.id)}
                  />
                  
                  {/* Overlay for drop target feedback on top of existing widgets */}
                  {highlightedIndices.has(index) && isDragging && (
                       <div className="absolute inset-0 bg-amber-500/20 border-2 border-amber-500 rounded-3xl z-50 pointer-events-none animate-pulse" />
                  )}
                </div>
            );
        })}
      </div>
    </div>
  );
};