import React, { useCallback } from 'react';
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
    onDrop: (e: React.DragEvent, index: number) => void 
}> = ({ index, onDrop }) => {
    const [isDragOver, setIsDragOver] = React.useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        // Critical: preventDefault allows drop
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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                col-span-1 row-span-1 aspect-square rounded-3xl transition-all duration-200
                ${isDragOver ? 'bg-white/10 border-2 border-dashed border-amber-500/50 scale-95 shadow-[inset_0_0_20px_rgba(245,158,11,0.2)]' : 'border border-transparent hover:bg-white/5'}
            `}
        />
    );
};

export const BentoGrid: React.FC<BentoGridProps> = ({ 
  apps, 
  onOpenApp, 
  onMoveApp
}) => {

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }, []);

  // Handle drop on any tile (Empty or Occupied)
  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    
    if (sourceId && onMoveApp) {
      onMoveApp(sourceId, targetIndex);
    }
  }, [onMoveApp]);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 transition-all duration-300">
      <div 
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6"
      >
        {apps.map((app, index) => {
            if (!app) {
                return <EmptySlot key={`empty-${index}`} index={index} onDrop={handleDrop} />;
            }

            return (
                <div 
                    key={app.id} 
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }} 
                    onDrop={(e) => handleDrop(e, index)} 
                    // Handle responsive spans for widgets
                    className={
                        app.gridSize === '2x2' ? 'col-span-2 row-span-2' : 
                        (app.gridSize === '2x1' || app.gridSize === '4x2') ? 'col-span-2' : 
                        app.gridSize === '1x2' ? 'row-span-2' : ''
                    }
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