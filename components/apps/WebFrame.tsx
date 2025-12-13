import React, { useState } from 'react';
import { RotateCw, ExternalLink } from 'lucide-react';

interface WebFrameProps {
  id: string;
  src: string;
  title: string;
  themeColor?: string;
}

export const WebFrame: React.FC<WebFrameProps> = ({ id, src, title, themeColor }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a] relative overflow-hidden">
      
      {/* Browser Toolbar */}
      <div className="h-10 bg-[#111] border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex gap-1.5 opacity-50">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            </div>
            <div className="h-4 w-px bg-white/10 mx-1" />
            <span className="text-xs font-medium text-slate-400 truncate max-w-[200px] md:max-w-md select-none opacity-80">{title}</span>
        </div>
        
        <div className="flex items-center gap-1">
             <button 
                onClick={handleReload}
                className="p-1.5 text-slate-500 hover:text-amber-500 hover:bg-white/5 rounded-lg transition-all active:scale-95"
                title="Reload Page"
             >
                <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
             </button>
             <a 
                href={src} 
                target="_blank" 
                rel="noreferrer"
                className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all active:scale-95"
                title="Open in new tab"
             >
                <ExternalLink size={14} />
             </a>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 relative bg-white">
        
        {/* Loading Indicator */}
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
                  <span className="text-sm text-zinc-500 font-medium font-serif tracking-wider">Loading...</span>
                </div>
            </div>
        )}
        
        {/* Fullscreen Iframe */}
        <iframe 
            key={iframeKey}
            src={src} 
            className="w-full h-full border-0 block"
            onLoad={() => setIsLoading(false)}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation allow-downloads allow-modals"
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; camera; microphone"
        />
        
      </div>
    </div>
  );
};