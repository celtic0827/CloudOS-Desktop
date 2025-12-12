import React, { useCallback } from 'react';
import { AppDefinition } from '../../types';
import { BentoTile } from './BentoTile';

interface BentoGridProps {
  apps: AppDefinition[];
  onOpenApp: (id: string) => void;
  onMoveApp?: (sourceId: string, targetId: string) => void;
  stackingDirection?: 'down' | 'up';
}

export const BentoGrid: React.FC<BentoGridProps> = ({ 
  apps, 
  onOpenApp, 
  onMoveApp,
  stackingDirection = 'down' 
}) => {
  
  const isStackUp = stackingDirection === 'up';

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
      {/* 
         Grid Column Updates: 
         - Increased spacing (gap-4 -> gap-6) for a cleaner, luxury feel.
         - grid-flow-row-dense ensures items pack tightly.
         - Transform applied if stacking up to flip the grid coordinate system vertically.
      */}
      <div 
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6 grid-flow-row-dense transition-transform duration-500"
        style={isStackUp ? { transform: 'scaleY(-1)' } : undefined}
      >
        {apps.map(app => (
          <BentoTile 
            key={app.id} 
            app={app} 
            onClick={onOpenApp}
            onDragStart={(e) => handleDragStart(e, app.id)}
            onDrop={(e) => handleDrop(e, app.id)}
            isFlipped={isStackUp} // Pass flip state so tile can correct its own orientation
          />
        ))}
      </div>
    </div>
  );
};