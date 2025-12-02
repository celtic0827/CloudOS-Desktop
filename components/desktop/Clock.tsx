import React, { useState, useEffect } from 'react';

export const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center select-none relative group cursor-default flex flex-col items-center">
      {/* Subtle Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-600/10 rounded-full blur-[60px] pointer-events-none" />
      
      {/* Time - Editorial Style: Smaller, Dark Gold Gradient, Padding for Clipping */}
      <h1 className="relative text-6xl md:text-[5rem] leading-tight font-serif font-thin text-transparent bg-clip-text bg-gradient-to-b from-amber-400 via-amber-600 to-amber-800 drop-shadow-2xl tracking-tighter pb-4">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </h1>
      
      {/* Date - Darker Theme to match */}
      <div className="flex items-center justify-center gap-6 mt-2 opacity-80">
        <div className="h-px w-8 bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
        <p className="text-xs md:text-sm font-sans font-medium text-amber-500/80 tracking-[0.3em] uppercase">
          {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <div className="h-px w-8 bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
      </div>
    </div>
  );
};