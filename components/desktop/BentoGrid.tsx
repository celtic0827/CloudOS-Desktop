import React, { useCallback, useMemo } from 'react';
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
  
  // LOGIC FIX: When stacking 'up', we want the visual order to be reversed.
  // The 'Clock' (usually first in list) should be at the visual bottom.
  // The 'New Apps' (usually last in list) should be at the visual top.
  // Since we anchor the whole grid to the bottom using justify-end in App.tsx,
  // Reversing the array places the "First" items at the "HTML Bottom", which aligns with the screen bottom.
  const visibleApps = useMemo(() => {
    if (stackingDirection === 'up') {
        return [...apps].reverse();
    }
    return apps;
  }, [apps, stackingDirection]);

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
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6 grid-flow-row-dense"
      >
        {visibleApps.map(app => (
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