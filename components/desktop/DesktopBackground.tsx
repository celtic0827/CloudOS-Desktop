import React from 'react';

export const DesktopBackground: React.FC = () => {
  return (
    <>
      {/* Refined Background System */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 85% 10%, rgba(217, 119, 6, 0.15) 0%, rgba(0, 0, 0, 0) 50%),
            radial-gradient(circle at 0% 100%, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0) 40%),
            #020202
          `
        }}
      />
      
      {/* Noise Texture for Realism */}
      <div 
        className="absolute inset-0 opacity-[0.04] z-0 pointer-events-none mix-blend-overlay"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </>
  );
};