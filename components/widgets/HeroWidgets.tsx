import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Upload, Calendar, Clock as ClockIcon } from 'lucide-react';
import { useSystemConfig } from '../../hooks/useSystemConfig';
import { GridSize, HeroEffect } from '../../types';

// --- 1. The Hero Clock Widget (Responsive to GridSize) ---
export const ClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const { clockConfig } = useSystemConfig();

  useEffect(() => {
    // Update immediately
    setTime(new Date());
    
    // Sync with seconds
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time based on config
  const timeString = time.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: !clockConfig.use24Hour,
    timeZone: clockConfig.timezone 
  });

  const hour = timeString.split(':')[0];
  const minute = timeString.split(':')[1]?.split(' ')[0];
  const ampm = timeString.split(' ')[1];

  // Format date based on config
  const dateString = time.toLocaleDateString([], { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric',
    timeZone: clockConfig.timezone
  });

  // Render Layouts based on Grid Size
  const size = clockConfig.gridSize || '2x2';

  // Layout: 1x1 (Mini Stack)
  if (size === '1x1') {
      return (
        <div className="w-full h-full flex flex-col justify-center items-center p-2 relative overflow-hidden bg-gradient-to-br from-amber-900/20 to-black/40">
           <div className="flex flex-col items-center leading-none">
              <span className="text-2xl font-bold text-slate-100">{hour}</span>
              <span className="text-2xl font-light text-amber-500 opacity-90">{minute}</span>
           </div>
           {ampm && <span className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">{ampm}</span>}
        </div>
      );
  }

  // Layout: 2x1 (Horizontal Wide)
  if (size === '2x1') {
      return (
        <div className="w-full h-full flex items-center justify-between p-4 relative overflow-hidden">
             <div className="flex flex-col z-10">
                <span className="text-4xl font-thin text-slate-100 tracking-tighter">{timeString}</span>
             </div>
             <div className="flex flex-col items-end z-10 border-l border-white/10 pl-4">
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">{clockConfig.label || 'Local'}</span>
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{dateString}</span>
             </div>
             {/* Decor */}
             <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl" />
        </div>
      );
  }

  // Layout: 1x2 (Vertical Tall)
  if (size === '1x2') {
      return (
        <div className="w-full h-full flex flex-col justify-between p-3 relative overflow-hidden text-center">
             <div className="mt-2">
                 <div className="p-1.5 bg-amber-500/10 rounded-full inline-block mb-2">
                     <ClockIcon size={12} className="text-amber-500" />
                 </div>
                 <div className="text-2xl font-light text-slate-100 tracking-tight leading-none">{hour}:{minute}</div>
                 {ampm && <div className="text-[10px] text-slate-500 uppercase mt-0.5">{ampm}</div>}
             </div>
             <div className="border-t border-white/10 pt-2 mb-2">
                 <div className="text-xs text-slate-300 font-medium leading-tight">{time.toLocaleDateString([], { weekday: 'short', timeZone: clockConfig.timezone })}</div>
                 <div className="text-lg font-bold text-amber-500 leading-none">{time.toLocaleDateString([], { day: 'numeric', timeZone: clockConfig.timezone })}</div>
             </div>
        </div>
      );
  }

  // Layout: 2x2 (Standard Hero)
  return (
    <div className="w-full h-full flex flex-col justify-between p-6 relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-amber-500/20 rounded-full blur-3xl group-hover:bg-amber-500/30 transition-all duration-500" />
      
      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col">
            <span className="text-amber-500 font-bold tracking-widest text-[10px] uppercase truncate max-w-[120px]">
              {clockConfig.label || 'Local Time'}
            </span>
            <span className="text-slate-400 text-xs font-serif italic truncate max-w-[120px]">
              {clockConfig.timezone.split('/')[1]?.replace('_', ' ') || clockConfig.timezone}
            </span>
        </div>
        <ClockIcon size={16} className="text-amber-500/50" />
      </div>

      <div className="z-10">
        <h1 className="text-5xl font-thin text-slate-100 tracking-tighter whitespace-nowrap">
          {timeString}
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-widest truncate">
          {dateString}
        </p>
      </div>
    </div>
  );
};

// --- 2. The AI Input Widget (2x2) ---
export const AIWidget: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col p-5 relative overflow-hidden group">
            {/* Header */}
            <div className="flex items-center gap-2 mb-auto z-10">
                <div className="p-1.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-lg shadow-amber-900/20">
                    <Sparkles size={14} className="text-white" />
                </div>
                <span className="text-sm font-serif text-slate-200">Gemini</span>
            </div>

            {/* Simulated Input Area */}
            <div className="mt-4 relative z-10">
                <div className="text-2xl font-light text-slate-400 leading-tight group-hover:text-slate-200 transition-colors">
                    How can I help you <span className="text-amber-500">create</span> today?
                </div>
                
                <div className="mt-4 flex items-center gap-2 text-slate-600 bg-black/20 p-2 rounded-lg border border-white/5 group-hover:border-amber-500/30 transition-all">
                    <span className="text-xs ml-1">Type to ask...</span>
                    <div className="ml-auto w-6 h-6 bg-white/10 rounded-md flex items-center justify-center">
                        <ArrowRight size={12} />
                    </div>
                </div>
            </div>
            
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>
    );
};

// --- 3. The "Hero Graphic" Widget (Replaces old DropZone) ---
// Renders Main Icon + Background Illustration (Scale/Opacity/Offset/Rotation/Effects)
export const DropZoneWidget: React.FC<{ 
  name: string, 
  icon: any, 
  color: string, 
  gridSize?: GridSize,
  heroIcon?: any,
  heroSettings?: {
      scale: number,
      opacity: number,
      x: number,
      y: number,
      rotate?: number,
      effect?: HeroEffect,
      effectIntensity?: number
  }
}> = ({ 
  name, 
  icon: MainIcon, 
  color,
  gridSize = '2x1',
  heroIcon: HeroIcon,
  heroSettings = { scale: 8, opacity: 30, x: 40, y: 0, rotate: 0, effect: 'none', effectIntensity: 20 }
}) => {
    
    const isVertical = gridSize === '1x2';

    // Calculate Filter for Effects
    // We apply the filter to the container, and opacity to the child SVG to keep shadows strong.
    let filter = 'none';
    const intensity = heroSettings.effectIntensity || 20;
    
    if (heroSettings.effect === 'shadow') {
        // Strong black shadow
        filter = `drop-shadow(0px 10px ${intensity}px rgba(0,0,0,1))`;
    } else if (heroSettings.effect === 'glow') {
        // Bright white/amber glow. Using a mix helps visibility on dark bg.
        filter = `drop-shadow(0px 0px ${intensity}px rgba(255,255,255,0.8)) drop-shadow(0px 0px ${intensity * 0.5}px rgba(245,158,11,0.5))`;
    }

    return (
        <div className={`w-full h-full flex p-4 relative overflow-hidden group ${isVertical ? 'flex-col justify-between items-center text-center' : 'flex-row items-center justify-between'}`}>
            
            {/* BACKGROUND GRAPHIC (Hero Icon) */}
            {HeroIcon && (
                <div 
                    className="absolute z-0 pointer-events-none origin-center transition-all duration-500 ease-out will-change-transform"
                    style={{
                        top: '50%',
                        left: '50%',
                        width: '24px',
                        height: '24px',
                        marginTop: '-12px',
                        marginLeft: '-12px',
                        transform: `
                            translate(${heroSettings.x}px, ${heroSettings.y}px) 
                            rotate(${heroSettings.rotate || 0}deg) 
                            scale(${heroSettings.scale})
                        `,
                        // Apply filter here so it wraps the shape
                        filter: filter,
                        // Color is set here
                        color: '#94a3b8' // Slate-400 equivalent
                    }}
                >
                    {/* Apply opacity here directly to the icon, allowing the shadow/glow (filter) to remain distinct if needed, 
                        though drop-shadow naturally relies on alpha. 
                        However, this structure ensures the filter is calculated on the transformed shape. 
                    */}
                    <div style={{ opacity: heroSettings.opacity / 100 }}>
                        <HeroIcon size={24} strokeWidth={1} />
                    </div>
                </div>
            )}

            {/* CONTENT LAYER (Z-10) */}
            <div className={`flex flex-col z-10 min-w-0 ${isVertical ? 'items-center gap-3 mt-4' : ''}`}>
                <div className={`
                    w-10 h-10 rounded-xl ${color} flex items-center justify-center shadow-lg ring-1 ring-white/10 backdrop-blur-sm
                    group-hover:scale-110 transition-transform duration-300
                `}>
                    <MainIcon size={20} className="text-white" />
                </div>
                
                <div className={`${isVertical ? '' : 'ml-4'}`}>
                     {/* For Horizontal, maybe push text to the left if graphic is right, handled by flex-row justify-between */}
                </div>
            </div>
            
            <div className={`z-10 flex flex-col ${isVertical ? 'mb-2' : 'items-end text-right'}`}>
                 <span className="text-base font-bold text-slate-100 leading-none drop-shadow-md">{name}</span>
                 <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold mt-1.5 opacity-90">Open App</span>
            </div>

            {/* Optional Overlay Gradient to ensure text readability if icon is too bright */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-0" />
        </div>
    );
};

// --- 4. The "Status/Card" Widget ---
// Standard layout without extra graphic
export const StatusWidget: React.FC<{ name: string, icon: any, color: string, description: string, gridSize?: GridSize }> = ({ 
    name, 
    icon: Icon, 
    color, 
    description,
    gridSize = '2x1'
}) => {
    const isVertical = gridSize === '1x2';

    if (isVertical) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 relative overflow-hidden group text-center">
                 <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-3 relative z-10`}>
                    <Icon size={24} className="text-white" />
                 </div>
                 <div className="flex flex-col min-w-0 z-10">
                    <span className="text-sm font-bold text-slate-200 truncate leading-tight">{name}</span>
                    <span className="text-[10px] text-slate-500 truncate mt-1">{description || 'Shortcut'}</span>
                 </div>
                 {/* Bg Glow */}
                 <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        );
    }

    // Default Horizontal (2x1)
    return (
        <div className="w-full h-full flex flex-col justify-center p-4 relative overflow-hidden group">
             <div className="flex items-center gap-3 z-10">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={20} className="text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-200 truncate pr-2">{name}</span>
                    <span className="text-xs text-slate-500 truncate pr-2">{description || 'Shortcut'}</span>
                </div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};