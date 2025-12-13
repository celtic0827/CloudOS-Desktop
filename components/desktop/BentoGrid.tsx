import React, { useCallback } from 'react';
import { AppDefinition } from '../../types';
import { BentoTile } from './BentoTile';

interface BentoGridProps {
  apps: AppDefinition[];
  onOpenApp: (id: string) => void;
  onMoveApp?: (sourceId: string, targetId: string) => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ 
  apps, 
  onOpenApp, 
  onMoveApp
}) => {
  
  // LOGIC CHANGE: 
  // Removed 'grid-flow-row-dense'. 
  // Using default 'row' flow ensures strict ordering.
  // If there is a gap caused by a large widget, it will remain a gap visually 
  // rather than reordering subsequent items to fill it. 
  // This is essential for a predictable "Android-like" manual drag experience.

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    
    if (sourceId && sourceId !== targetId && onMoveApp) {
      onMoveApp(sourceId, targetId);
    }
  }, [onMoveApp]);

  return (
    // Changed max-w-[1600px] to max-w-[1920px] for better 2K/Ultrawide support
    <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 transition-all duration-300">
      <div 
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6"
      >
        {apps.map(app => (
          <BentoTile 
            key={app.id} 
            app={app} 
            onClick={onOpenApp}
            onDragStart={(e) => handleDragStart(e, app.id)}
            onDrop={(e) => handleDrop(e, app.id)}
          />
        ))}
      </div>
    </div>
  );
};