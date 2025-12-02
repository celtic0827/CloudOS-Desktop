import React, { useState, useEffect, useRef } from 'react';

interface WebFrameProps {
  id: string;
  src: string;
  title: string;
  themeColor?: string;
}

/**
 * CloudOS Bridge Protocol
 * 
 * To make your external app work with CloudOS storage:
 * 
 * 1. Listen for messages:
 *    window.addEventListener('message', (event) => {
 *       if (event.data.type === 'CLOUDOS_RESPONSE_LOAD') { ... }
 *    });
 * 
 * 2. Send commands:
 *    window.parent.postMessage({ type: 'CLOUDOS_SAVE', key: 'myKey', value: 'myValue' }, '*');
 *    window.parent.postMessage({ type: 'CLOUDOS_LOAD', key: 'myKey' }, '*');
 */

export const WebFrame: React.FC<WebFrameProps> = ({ id, src, title, themeColor }) => {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Define the Message Handler
    const handleMessage = (event: MessageEvent) => {
      // Security: In a production OS, you might verify event.origin here.
      // For now, we allow apps we've explicitly added to the desktop.
      
      const { type, key, value, requestId } = event.data;
      const storagePrefix = `cloudos_ext_${id}_`;

      if (!type || !type.startsWith('CLOUDOS_')) return;

      // 1. SAVE DATA
      if (type === 'CLOUDOS_SAVE' && key) {
        try {
          localStorage.setItem(storagePrefix + key, JSON.stringify(value));
          console.log(`[CloudOS] Saved data for app ${title}: ${key}`);
          
          // Optional: Ack back
          iframeRef.current?.contentWindow?.postMessage({
            type: 'CLOUDOS_ACK_SAVE',
            key,
            success: true,
            requestId
          }, '*');
        } catch (e) {
          console.error('[CloudOS] Storage Quota Exceeded or Error', e);
        }
      }

      // 2. LOAD DATA
      if (type === 'CLOUDOS_LOAD' && key) {
        try {
          const raw = localStorage.getItem(storagePrefix + key);
          const data = raw ? JSON.parse(raw) : null;
          
          // Send back to iframe
          iframeRef.current?.contentWindow?.postMessage({
            type: 'CLOUDOS_RESPONSE_LOAD',
            key,
            value: data,
            requestId
          }, '*');
        } catch (e) {
          console.error('[CloudOS] Load Error', e);
        }
      }

      // 3. GET SYSTEM INFO
      if (type === 'CLOUDOS_GET_INFO') {
        iframeRef.current?.contentWindow?.postMessage({
          type: 'CLOUDOS_RESPONSE_INFO',
          themeColor: themeColor || 'bg-slate-900',
          appName: title,
          appId: id,
          requestId
        }, '*');
      }
    };

    // Attach Listener
    window.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [id, title, themeColor]);

  // Handle Handshake on Load
  const handleLoad = () => {
    setIsLoading(false);
    // Send a "Ready" signal to the child app so it knows it's inside CloudOS
    iframeRef.current?.contentWindow?.postMessage({
      type: 'CLOUDOS_READY',
      version: '1.0.0'
    }, '*');
  };

  return (
    <div className="w-full h-full bg-white relative">
      
      {/* Loading Indicator */}
      {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-0">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
                <span className="text-sm text-zinc-500 font-medium font-serif tracking-wider">Loading {title}...</span>
              </div>
          </div>
      )}
      
      {/* Fullscreen Iframe */}
      <iframe 
          ref={iframeRef}
          id={`iframe-${id}`}
          src={src} 
          className="w-full h-full border-0 relative z-10 block"
          onLoad={handleLoad}
          // Added 'allow-storage-access-by-user-activation' for broader support where possible
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation allow-downloads allow-modals"
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; camera; microphone"
      />
      
    </div>
  );
};