import React, { useState, useEffect } from 'react';

interface WebFrameProps {
  id: string;
  src: string;
  title: string;
  themeColor?: string;
  refreshTrigger?: number; // Receive signal from App/Dock to reload
}

export const WebFrame: React.FC<WebFrameProps> = ({ id, src, title, themeColor, refreshTrigger = 0 }) => {
  const [isLoading, setIsLoading] = useState(true);

  // When refreshTrigger changes (user clicked reload in Dock), reset loading state
  // The iframe key change will force React to remount the iframe element
  useEffect(() => {
    setIsLoading(true);
  }, [refreshTrigger]);

  return (
    <div className="w-full h-full relative bg-[#0a0a0a] group overflow-hidden">
      
      {/* Loading Indicator */}
      {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10 transition-opacity duration-300">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
                <span className="text-sm text-zinc-500 font-medium font-serif tracking-wider">Loading...</span>
              </div>
          </div>
      )}
      
      {/* Fullscreen Iframe - Pure, no extra UI */}
      {/* We use refreshTrigger as part of the key to force re-render on reload */}
      <iframe 
          key={`${id}-${refreshTrigger}`}
          src={src} 
          className="w-full h-full border-0 block"
          onLoad={() => setIsLoading(false)}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation allow-downloads allow-modals"
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; camera; microphone"
      />
      
    </div>
  );
};