import React, { useCallback } from 'react';
import { AppDefinition } from '../../types';
import { BentoTile } from './BentoTile';

interface BentoGridProps {
  apps: AppDefinition[];
  onOpenApp: (id: string) => void;
  onMoveApp?: (sourceId: string, targetId: string) => void; // New prop
}

export const BentoGrid: React.FC<BentoGridProps> = ({ apps, onOpenApp, onMoveApp }) => {
  
  // Apps are now pre-sorted by useAppConfig based on user preference.
  // We simply render them in order.

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    // Add a ghost image or styling class if needed
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    
    if (sourceId && sourceId !== targetId && onMoveApp) {
      onMoveApp(sourceId, targetId);
    }
  }, [onMoveApp]);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8">
      {/* 
         Grid Column Updates: 2 (mobile) -> 4 (tab) -> 6 (lap) -> 8 (desk)
      */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4 grid-flow-row-dense">
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