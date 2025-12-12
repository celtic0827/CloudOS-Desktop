import React, { useEffect, useRef } from 'react';
import { Settings, RotateCcw, Monitor, RefreshCw } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onOpenSettings: () => void;
  onResetLayout: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onOpenSettings, onResetLayout }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position to prevent overflow off screen
  const style = {
    top: y,
    left: x,
  };

  // Basic boundary detection logic could be added here, 
  // currently simplified to render at cursor.

  return (
    <div 
      ref={menuRef}
      className="fixed z-[100] min-w-[180px] bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-100"
      style={style}
      onContextMenu={(e) => e.preventDefault()} // Prevent browser menu on top of custom menu
    >
      <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1">
        Desktop Actions
      </div>
      
      <button 
        onClick={() => { onOpenSettings(); onClose(); }}
        className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-amber-500 hover:text-white transition-colors flex items-center gap-2 group"
      >
        <Settings size={14} className="text-slate-400 group-hover:text-white" />
        <span>System Settings</span>
      </button>

      <button 
        onClick={() => { window.location.reload(); onClose(); }}
        className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-white/10 transition-colors flex items-center gap-2"
      >
        <RefreshCw size={14} className="text-slate-400" />
        <span>Refresh Desktop</span>
      </button>

      <div className="h-px bg-white/10 my-1 mx-2" />

      <button 
        onClick={() => { 
            if(confirm('Reset all layout preferences?')) {
                onResetLayout(); 
                onClose();
            }
        }}
        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2"
      >
        <RotateCcw size={14} />
        <span>Reset Layout</span>
      </button>
    </div>
  );
};