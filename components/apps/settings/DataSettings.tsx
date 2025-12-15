import React, { useRef } from 'react';
import { Download, Upload, RotateCcw, LayoutTemplate, Box, Sparkles, CheckCircle2 } from 'lucide-react';
import { AppConfig } from '../../../types';
import { SystemBackup } from '../../../hooks/useAppConfig';

interface DataSettingsProps {
  userApps: AppConfig[];
  activeWidgetIds: string[];
  layout: (string | null)[];
  onImportApps: (apps: AppConfig[]) => void;
  onImportSystemConfig: (backup: SystemBackup) => void;
  onResetApps: () => void;
}

export const DataSettings: React.FC<DataSettingsProps> = ({
  userApps,
  activeWidgetIds,
  layout,
  onImportApps,
  onImportSystemConfig,
  onResetApps
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    // New Format: Full System Backup
    const backupData: SystemBackup = {
        apps: userApps,
        widgets: activeWidgetIds,
        layout: layout,
        timestamp: Date.now()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `cloudos_full_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          
          if (Array.isArray(parsed)) {
            // Legacy Format (Just Array of Apps)
            onImportApps(parsed);
            alert('Restored Legacy Backup (Apps Only). Layout positions reset.');
          } else if (parsed.layout && parsed.apps) {
            // New Full Format
            onImportSystemConfig(parsed as SystemBackup);
            alert('Full System Backup Restored Successfully.');
          } else {
            alert('Invalid backup file format.');
          }
        } catch (err) {
          alert('Failed to parse JSON file.');
        }
      };
    }
  };

  // Calculate stats for the dashboard
  const appCount = userApps.length;
  const widgetCount = activeWidgetIds.length;
  // Count non-null slots to verify layout activity
  const layoutItems = layout.filter(id => id !== null).length;

  return (
    <div className="w-full h-full p-8 overflow-y-auto bg-[#050505] scrollbar-hide">
      <div className="max-w-3xl mx-auto h-full flex flex-col justify-center">
         <div className="mb-8 text-center">
            <h3 className="text-2xl font-serif text-amber-50 mb-2">Data Management</h3>
            <p className="text-sm text-slate-500">Securely backup your full configuration (Apps, Layout, Widgets) or restore from file.</p>
         </div>

         {/* Status Dashboard - Visual Confirmation of what's being backed up */}
         <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CheckCircle2 size={12} className="text-emerald-500" />
                Current System State
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#050505] rounded-xl p-3 border border-white/5 flex items-center gap-3">
                    <div className="p-2 bg-amber-900/20 text-amber-500 rounded-lg">
                        <Box size={16} />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-slate-200 leading-none">{appCount}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Apps</div>
                    </div>
                </div>

                <div className="bg-[#050505] rounded-xl p-3 border border-white/5 flex items-center gap-3">
                    <div className="p-2 bg-amber-900/20 text-amber-500 rounded-lg">
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-slate-200 leading-none">{widgetCount}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Widgets</div>
                    </div>
                </div>

                <div className="bg-[#050505] rounded-xl p-3 border border-white/5 flex items-center gap-3">
                    <div className="p-2 bg-amber-900/20 text-amber-500 rounded-lg">
                        <LayoutTemplate size={16} />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-slate-200 leading-none">Saved</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Grid Layout</div>
                    </div>
                </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Export */}
            <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/5 flex flex-col items-center text-center gap-4 hover:border-amber-500/30 transition-all group relative overflow-hidden">
               <div className="w-12 h-12 bg-[#111] text-amber-500/50 group-hover:text-amber-400 group-hover:bg-amber-500/10 rounded-xl flex items-center justify-center transition-colors shadow-lg relative z-10">
                  <Download size={20} />
               </div>
               <div className="relative z-10">
                  <h4 className="font-medium text-slate-200 text-sm">Full System Export</h4>
                  <p className="text-[10px] text-slate-600 mt-1">Saves layout & content</p>
               </div>
               <button 
                  onClick={handleExport}
                  className="mt-1 px-4 py-2 bg-[#151515] text-slate-300 rounded-lg hover:bg-amber-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider w-full relative z-10 border border-white/5 group-hover:border-amber-500/50"
               >
                  Download JSON
               </button>
            </div>

            {/* Import */}
            <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/5 flex flex-col items-center text-center gap-4 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
               <div className="w-12 h-12 bg-[#111] text-emerald-500/50 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 rounded-xl flex items-center justify-center transition-colors shadow-lg relative z-10">
                  <Upload size={20} />
               </div>
               <div className="relative z-10">
                  <h4 className="font-medium text-slate-200 text-sm">Restore Backup</h4>
                  <p className="text-[10px] text-slate-600 mt-1">Accepts legacy & new formats</p>
               </div>
               <button 
                  onClick={handleImportClick}
                  className="mt-1 px-4 py-2 bg-[#151515] text-slate-300 rounded-lg hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider w-full relative z-10 border border-white/5 group-hover:border-emerald-500/50"
               >
                  Upload JSON
               </button>
               <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden" 
               />
            </div>

            {/* Reset */}
            <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/5 flex flex-col items-center text-center gap-4 hover:border-red-500/30 transition-all group relative overflow-hidden">
               <div className="w-12 h-12 bg-[#111] text-red-500/50 group-hover:text-red-400 group-hover:bg-red-500/10 rounded-xl flex items-center justify-center transition-colors shadow-lg relative z-10">
                  <RotateCcw size={20} />
               </div>
               <div className="relative z-10">
                  <h4 className="font-medium text-slate-200 text-sm">Factory Reset</h4>
                  <p className="text-[10px] text-slate-600 mt-1">Clear all local data</p>
               </div>
               <button 
                  onClick={() => {
                     if (confirm('DANGER: This will delete all your custom links and layout. Are you sure?')) {
                        onResetApps();
                     }
                  }}
                  className="mt-1 px-4 py-2 bg-[#151515] text-slate-300 rounded-lg hover:bg-red-900/50 hover:text-red-200 transition-all text-[10px] font-bold uppercase tracking-wider w-full relative z-10 border border-white/5 group-hover:border-red-500/50"
               >
                  Reset All
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};