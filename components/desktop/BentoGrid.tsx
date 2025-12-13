import React, { useCallback, useState, useEffect } from 'react';
import { AppDefinition } from '../../types';
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
    isGridDragging: boolean 
}> = ({ index, style, onDrop, isGridDragging }) => {
    const [isDragOver, setIsDragOver] = React.useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!isDragOver) setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        onDrop(e, index);
    };

    return (
        <div 
            style={style}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                rounded-3xl transition-all duration-200 border
                ${isGridDragging 
                    // High Z-Index when dragging to ensure it sits ON TOP of widgets
                    ? 'z-[50] border-white/20 bg-black/40 backdrop-blur-sm' 
                    : 'z-0 border-white/5 hover:border-white/10'
                }
                ${isDragOver 
                    ? '!border-amber-500 !bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-[0.98]' 
                    : ''
                }
            `}
        >
            {/* Optional: Add a small plus or dot to indicate it's a slot */}
            {isGridDragging && (
                <div className="w-full h-full flex items-center justify-center opacity-30">
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
  // 2. Dragging State to toggle Z-Index
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
    
    // Global listener to catch drag end if dropped outside
    const handleGlobalDragEnd = () => setIsDragging(false);
    window.addEventListener('dragend', handleGlobalDragEnd);

    return () => {
        window.removeEventListener('resize', updateCols);
        window.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, []);


  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setIsDragging(false);
    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId && onMoveApp) {
      onMoveApp(sourceId, targetIndex);
    }
  }, [onMoveApp]);

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
            }

            const style = getGridStyle(index, spanClass);

            if (!app) {
                return (
                    <EmptySlot 
                        key={`empty-${index}`} 
                        index={index} 
                        style={{ ...style, aspectRatio: '1/1' }} 
                        onDrop={handleDrop} 
                        isGridDragging={isDragging}
                    />
                );
            }

            return (
                <div 
                    key={app.id} 
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }} 
                    onDrop={(e) => handleDrop(e, index)} 
                    style={{ 
                        ...style, 
                        // Widgets stay at z-10 normally. 
                        // When dragging, EmptySlots go to z-50, so we don't need to lower this,
                        // but we can make non-dragged items slightly faded to help focus.
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
                </div>
            );
        })}
      </div>
    </div>
  );
};