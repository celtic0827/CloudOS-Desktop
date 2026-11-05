import React from 'react';

export const DesktopBackground: React.FC = () => {
  return (
    <>
      {/* High-Performance Lightweight Background (Zero SVG fractal filters, hardware accelerated) */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none transform-gpu"
        style={{
          background: `
            radial-gradient(circle at 85% 10%, rgba(217, 119, 6, 0.12) 0%, rgba(0, 0, 0, 0) 45%),
            radial-gradient(circle at 10% 90%, rgba(255, 255, 255, 0.02) 0%, rgba(0, 0, 0, 0) 35%),
            #020202
          `
        }}
      />
    </>
  );
};