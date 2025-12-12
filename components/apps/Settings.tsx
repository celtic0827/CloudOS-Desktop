import React, { useState, useEffect } from 'react';
import { AppConfig, ClockConfig } from '../../types';
import { LayoutGrid, X } from 'lucide-react';
import { AppsSettings } from './settings/AppsSettings';
import { WidgetsSettings } from './settings/WidgetsSettings';
import { DataSettings } from './settings/DataSettings';

interface SettingsProps {
  userApps: AppConfig[];
  activeWidgetIds: string[];
  clockConfig?: ClockConfig;
  onUpdateClockConfig?: (config: Partial<ClockConfig>) => void;
  onAddApp: (app: AppConfig) => void;
  onUpdateApp: (app: AppConfig) => void;
  onDeleteApp: (id: string) => void;
  onResetApps: () => void;
  onImportApps: (apps: AppConfig[]) => void;
  onToggleWidget: (id: string, enabled: boolean) => void;
  onClose: () => void;
  initialTab?: string;
  initialAppId?: string | null;
}

export const Settings: React.FC<SettingsProps> = ({
  userApps,
  activeWidgetIds,
  clockConfig,
  onUpdateClockConfig,
  onAddApp,
  onUpdateApp,
  onDeleteApp,
  onResetApps,
  onImportApps,
  onToggleWidget,
  onClose,
  initialTab,
  initialAppId
}) => {
  
  const [activeTab, setActiveTab] = useState<'apps' | 'widgets' | 'data'>('apps');

  // Handle Initial Routing (Deep Linking into Settings)
  useEffect(() => {
    if (initialTab === 'widgets') {
        setActiveTab('widgets');
    } else if (initialTab === 'data') {
        setActiveTab('data');
    } else {
        setActiveTab('apps');
    }
  }, [initialTab]);

  return (
    <div className="h-full flex flex-col bg-[#050505] text-slate-300 rounded-xl overflow-hidden selection:bg-amber-500/30 font-sans border border-white/10 shadow-2xl">
      
      {/* --- HEADER --- */}
      <div className="bg-[#0a0a0a] border-b border-white/5 px-4 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 text-amber-500">
          <div className="p-1.5 bg-amber-500/10 rounded-lg">
             <LayoutGrid size={16} />
          </div>
          <h2 className="text-sm font-serif tracking-wide text-amber-50">System Settings</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('apps')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'apps' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              Apps
            </button>
            <button 
              onClick={() => setActiveTab('widgets')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'widgets' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              Widgets
            </button>
            <button 
              onClick={() => setActiveTab('data')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'data' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              Backup
            </button>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <button 
            onClick={() => { onClose(); }}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Close Settings"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* === APPS TAB === */}
        {activeTab === 'apps' && (
            <AppsSettings 
                userApps={userApps} 
                onAddApp={onAddApp} 
                onUpdateApp={onUpdateApp} 
                onDeleteApp={onDeleteApp}
                initialAppId={initialAppId}
            />
        )}

        {/* === WIDGETS TAB === */}
        {activeTab === 'widgets' && (
            <WidgetsSettings 
                activeWidgetIds={activeWidgetIds}
                clockConfig={clockConfig}
                onUpdateClockConfig={onUpdateClockConfig}
                onToggleWidget={onToggleWidget}
                initialWidgetId={initialAppId} // If opened from grid, this might be a widget ID
            />
        )}

        {/* === DATA TAB === */}
        {activeTab === 'data' && (
            <DataSettings 
                userApps={userApps}
                onImportApps={onImportApps}
                onResetApps={onResetApps}
            />
        )}
      </div>
    </div>
  );
};