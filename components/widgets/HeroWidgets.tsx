import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Upload, Calendar, Clock as ClockIcon } from 'lucide-react';
import { useSystemConfig } from '../../hooks/useSystemConfig';
import { GridSize, HeroEffect } from '../../types';

// --- Helper: Luxury Analog Clock Component ---
const AnalogClock: React.FC<{ time: Date, className?: string, opacity?: number }> = ({ time, className = "", opacity = 1 }) => {
    // Calculate angles
    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    const secondDeg = seconds * 6;
    const minuteDeg = minutes * 6 + seconds * 0.1;
    const hourDeg = (hours % 12) * 30 + minutes * 0.5;

    // Colors
    const goldColor = "#b45309"; // Amber-700 (Dark Gold)
    const tickColor = "#78350f"; // Amber-900 (Deep Bronze)
    
    return (
        <div className={`relative ${className}`} style={{ opacity }}>
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
                <defs>
                    {/* Glow Effects for Gems */}
                    <filter id="rubyGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="sapphireGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* 1. Ticks (No Face/Frame) */}
                {/* Minute Ticks (Small) */}
                {[...Array(60)].map((_, i) => (
                    i % 5 !== 0 && (
                        <line 
                            key={`m-${i}`}
                            x1="100" y1="15" x2="100" y2="18"
                            transform={`rotate(${i * 6} 100 100)`}
                            stroke={tickColor}
                            strokeWidth="1"
                            opacity="0.5"
                        />
                    )
                ))}
                {/* Hour Ticks (Large, Dark Gold) */}
                {[...Array(12)].map((_, i) => (
                    <line 
                        key={`h-${i}`}
                        x1="100" y1="10" x2="100" y2="25"
                        transform={`rotate(${i * 30} 100 100)`}
                        stroke={goldColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                ))}

                {/* 2. Hour Hand (Ruby Tip) */}
                <g transform={`rotate(${hourDeg} 100 100)`}>
                    {/* Shaft */}
                    <line x1="100" y1="100" x2="100" y2="55" stroke={goldColor} strokeWidth="3" strokeLinecap="round" />
                    {/* Gem Mount */}
                    <rect x="97" y="55" width="6" height="4" fill={goldColor} />
                    {/* Ruby Gem */}
                    <rect x="98" y="40" width="4" height="15" fill="#991b1b" stroke={goldColor} strokeWidth="0.5" filter="url(#rubyGlow)" />
                    {/* Gem Reflection */}
                    <rect x="99" y="42" width="1" height="8" fill="#fca5a5" opacity="0.6" />
                </g>

                {/* 3. Minute Hand (Sapphire Tip) */}
                <g transform={`rotate(${minuteDeg} 100 100)`}>
                    {/* Shaft */}
                    <line x1="100" y1="100" x2="100" y2="45" stroke={goldColor} strokeWidth="2" strokeLinecap="round" />
                    {/* Gem Mount */}
                    <rect x="98" y="45" width="4" height="4" fill={goldColor} />
                    {/* Sapphire Gem */}
                    <rect x="98.5" y="25" width="3" height="20" fill="#1e3a8a" stroke={goldColor} strokeWidth="0.5" filter="url(#sapphireGlow)" />
                     {/* Gem Reflection */}
                     <rect x="99.5" y="27" width="1" height="12" fill="#93c5fd" opacity="0.6" />
                </g>

                {/* 4. Second Hand (Simple Gold Needle) */}
                <g transform={`rotate(${secondDeg} 100 100)`}>
                    <line x1="100" y1="110" x2="100" y2="20" stroke="#f59e0b" strokeWidth="1" />
                    <circle cx="100" cy="100" r="2" fill="#f59e0b" />
                </g>

                {/* Center Cap */}
                <circle cx="100" cy="100" r="4" fill="#1c1917" stroke={goldColor} strokeWidth="2" />
            </svg>
        </div>
    );
};


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

  // Common Gradient Class for that "Original Desktop" look
  const goldGradientText = "text-transparent bg-clip-text bg-gradient-to-b from-amber-400 via-amber-600 to-amber-800 drop-shadow-sm";

  // Layout: 1x1 (Mini Stack)
  if (size === '1x1') {
      return (
        <div className="w-full h-full flex flex-col justify-center items-center p-2 relative overflow-hidden bg-gradient-to-br from-amber-900/20 to-black/40 group">
           {/* Background Analog */}
           <div className="absolute inset-0 flex items-center justify-center opacity-30 scale-125 group-hover:scale-110 group-hover:opacity-40 transition-all duration-500">
                <AnalogClock time={time} />
           </div>
           
           <div className="flex flex-col items-center leading-none z-10 relative">
              <span className={`text-2xl font-bold ${goldGradientText}`}>{hour}</span>
              <span className="text-2xl font-light text-amber-500 opacity-90">{minute}</span>
           </div>
           {ampm && <span className="text-[9px] uppercase tracking-widest text-slate-500 mt-1 z-10 relative">{ampm}</span>}
        </div>
      );
  }

  // Layout: 2x1 (Horizontal Wide)
  if (size === '2x1') {
      return (
        <div className="w-full h-full flex items-center justify-between p-4 relative overflow-hidden group">
             {/* Analog Clock Positioned Right */}
             <div className="absolute right-[-20px] top-[-20px] bottom-[-20px] w-[180px] opacity-40 group-hover:opacity-60 transition-opacity duration-500">
                 <AnalogClock time={time} />
             </div>

             <div className="flex flex-col z-10">
                <span className={`text-4xl font-thin tracking-tighter ${goldGradientText}`}>{timeString}</span>
             </div>
             <div className="flex flex-col items-end z-10 border-l border-white/10 pl-4 bg-black/20 backdrop-blur-sm rounded-l-xl p-2">
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">{clockConfig.label || 'Local'}</span>
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{dateString}</span>
             </div>
        </div>
      );
  }

  // Layout: 1x2 (Vertical Tall)
  if (size === '1x2') {
      return (
        <div className="w-full h-full flex flex-col justify-between p-3 relative overflow-hidden text-center group">
             {/* Analog Clock centered in background */}
             <div className="absolute top-[10%] left-[-20%] right-[-20%] h-[200px] opacity-30 group-hover:opacity-50 transition-opacity duration-500">
                 <AnalogClock time={time} />
             </div>

             <div className="mt-2 z-10">
                 <div className="p-1.5 bg-amber-500/10 rounded-full inline-block mb-2 backdrop-blur-md border border-amber-500/20">
                     <ClockIcon size={12} className="text-amber-500" />
                 </div>
                 <div className={`text-2xl font-light tracking-tight leading-none ${goldGradientText}`}>{hour}:{minute}</div>
                 {ampm && <div className="text-[10px] text-slate-500 uppercase mt-0.5">{ampm}</div>}
             </div>
             <div className="border-t border-white/10 pt-2 mb-2 z-10">
                 <div className="text-xs text-slate-300 font-medium leading-tight">{time.toLocaleDateString([], { weekday: 'short', timeZone: clockConfig.timezone })}</div>
                 <div className="text-lg font-bold text-amber-500 leading-none">{time.toLocaleDateString([], { day: 'numeric', timeZone: clockConfig.timezone })}</div>
             </div>
        </div>
      );
  }

  // Layout: 2x2 (Standard Hero)
  return (
    <div className="w-full h-full flex flex-col justify-between p-6 relative overflow-hidden group">
      
      {/* --- Visual Analog Clock (Hero Position) --- */}
      {/* Positioned to the right side, large and luxurious */}
      <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[120%] md:w-[240px] md:h-[240px] md:top-1/2 md:-translate-y-1/2 md:right-[-20px] transition-transform duration-700 ease-out group-hover:scale-105 opacity-90">
         <AnalogClock time={time} />
      </div>
      
      {/* Header Info */}
      <div className="flex justify-between items-start z-10 relative">
        <div className="flex flex-col">
            <span className="text-amber-500 font-bold tracking-widest text-[10px] uppercase truncate max-w-[120px]">
              {clockConfig.label || 'Local Time'}
            </span>
            <span className="text-slate-400 text-xs font-serif italic truncate max-w-[120px]">
              {clockConfig.timezone.split('/')[1]?.replace('_', ' ') || clockConfig.timezone}
            </span>
        </div>
        {/* Removed standard Icon, the Analog clock is the icon now */}
      </div>

      {/* Digital Time Overlay */}
      <div className="z-10 relative mt-auto">
        {/* Added a subtle backdrop to ensure text is readable over the clock hands if they overlap */}
        <div className="inline-block">
            <h1 className={`text-5xl font-thin tracking-tighter whitespace-nowrap ${goldGradientText} drop-shadow-2xl`}>
            {timeString}
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-1 uppercase tracking-widest truncate pl-1">
            {dateString}
            </p>
        </div>
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
      color?: string,
      effect?: HeroEffect,
      effectIntensity?: number
  }
}> = ({ 
  name, 
  icon: MainIcon, 
  color,
  gridSize = '2x1',
  heroIcon: HeroIcon,
  heroSettings = { scale: 8, opacity: 30, x: 40, y: 0, rotate: 0, color: '#94a3b8', effect: 'none', effectIntensity: 5 }
}) => {
    
    const isVertical = gridSize === '1x2';

    // Calculate Filter for Effects
    // We apply the filter to the container, and opacity to the child SVG to keep shadows strong.
    let filter = 'none';
    const rawIntensity = heroSettings.effectIntensity || 0;
    
    // Multiplier to make 0-10 range look good in pixels.
    const intensity = rawIntensity * 2; 
    
    // Determine color (default to slate-400 if not set)
    const iconColor = heroSettings.color || '#94a3b8';

    if (heroSettings.effect === 'glow') {
        // Bright glow using the same icon color, plus a standard white core
        filter = `drop-shadow(0px 0px ${intensity}px ${iconColor}) drop-shadow(0px 0px ${intensity * 0.5}px rgba(255,255,255,0.5))`;
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
                        color: iconColor
                    }}
                >
                    {/* Apply opacity here directly to the icon */}
                    <div style={{ opacity: heroSettings.opacity / 100 }}>
                        <HeroIcon size={24} strokeWidth={1} />
                    </div>
                </div>
            )}

            {/* CONTENT LAYER (Z-10) */}
            <div className={`flex flex-col z-10 min-w-0 ${isVertical ? 'items-center gap-3 mt-4' : ''}`}>
                <div className={`
                    w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg ring-1 ring-white/10 backdrop-blur-sm
                    group-hover:scale-110 transition-transform duration-300
                `}>
                    <MainIcon size={24} className="text-white" />
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
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} className="text-white" />
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