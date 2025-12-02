import React, { useState } from 'react';

interface WebFrameProps {
  src: string;
  title: string;
}

export const WebFrame: React.FC<WebFrameProps> = ({ src, title }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="w-full h-full bg-white relative">
      
      {/* Loading Indicator */}
      {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-0">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-sm text-slate-500 font-medium">Loading Application...</span>
              </div>
          </div>
      )}
      
      {/* Fullscreen Iframe */}
      <iframe 
          id={`iframe-${title}`}
          src={src} 
          className="w-full h-full border-0 relative z-10 block"
          onLoad={() => setIsLoading(false)}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; camera; microphone"
      />
      
    </div>
  );
};