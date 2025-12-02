import React, { useState, useEffect } from 'react';

export const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center select-none mb-12 relative group cursor-default">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700" />
      
      <h1 className="relative text-8xl md:text-9xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-50 to-amber-200/50 drop-shadow-2xl tracking-tighter">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </h1>
      <div className="flex items-center justify-center gap-3 mt-4 opacity-80">
        <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-500/50" />
        <p className="text-xl md:text-2xl font-light text-amber-100/80 tracking-widest uppercase font-serif">
          {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-500/50" />
      </div>
    </div>
  );
};