import React, { useState, useRef, useEffect } from 'react';
import { AppConfig } from '../../types';
import { Trash2, Plus, Download, Upload, RotateCcw, X, Check, Globe, RefreshCcw, LayoutGrid, ChevronRight, Save, Search, Link as LinkIcon, Type } from 'lucide-react';
import { getFavicon, ICON_LIBRARY } from '../../constants';

interface SettingsProps {
  userApps: AppConfig[];
  onAddApp: (app: AppConfig) => void;
  onUpdateApp: (app: AppConfig) => void;
  onDeleteApp: (id: string) => void;
  onResetApps: () => void;
  onImportApps: (apps: AppConfig[]) => void;
  onClose: () => void;
}

// Expanded Palette: Wide gamut distribution, focused on distinct rich tones
const COLORS = [
  // Monochrome / Neutrals
  'bg-slate-900', 'bg-zinc-700', 'bg-stone-800', 'bg-neutral-600',
  // Reds & Warm
  'bg-red-950', 'bg-red-700', 'bg-rose-800', 'bg-orange-800', 
  // Yellows & Ambers
  'bg-amber-900', 'bg-amber-600', 'bg-yellow-700', 'bg-lime-800',
  // Greens
  'bg-green-800', 'bg-emerald-900', 'bg-emerald-600', 'bg-teal-800',
  // Cyans & Blues
  'bg-cyan-900', 'bg-sky-700', 'bg-blue-900', 'bg-blue-700',
  // Indigos & Violets
  'bg-indigo-900', 'bg-indigo-600', 'bg-violet-900', 'bg-violet-700',
  // Purples & Pinks
  'bg-purple-900', 'bg-fuchsia-800', 'bg-pink-900', 'bg-rose-600'
];

const ICONS = Object.keys(ICON_LIBRARY);

// Robust ID Generator Fallback
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'app-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

export const Settings: React.FC<SettingsProps> = ({
  userApps,
  onAddApp,
  onUpdateApp,
  onDeleteApp,
  onResetApps,
  onImportApps,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'apps' | 'data'>('apps');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isNewApp, setIsNewApp] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<AppConfig>({
    id: '',
    name: '',
    url: '',
    color: 'bg-slate-900',
    description: '',
    iconUrl: '',
    iconName: 'Globe'
  });

  // Effect to select the first app by default if available and nothing selected
  useEffect(() => {
    if (activeTab === 'apps' && !selectedAppId && !isNewApp && userApps.length > 0) {
      handleSelectApp(userApps[0]);
    }
  }, [activeTab, userApps]);

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      url: '',
      color: 'bg-slate-900',
      description: '',
      iconUrl: '',
      iconName: 'Globe'
    });
  };

  const handleSelectApp = (app: AppConfig) => {
    setFormData({ ...app, iconName: app.iconName || 'Globe' });
    setSelectedAppId(app.id);
    setIsNewApp(false);
    setSaveStatus('idle');
  };

  const handleStartAdd = () => {
    // Explicitly set new state to avoid race conditions with resetForm
    const newId = generateId();
    setFormData({
      id: newId,
      name: 'New Link',
      url: 'https://',
      color: COLORS[0],
      description: '',
      iconUrl: '',
      iconName: 'Globe'
    });
    setSelectedAppId(null);
    setIsNewApp(true);
    setSaveStatus('idle');
  };

  const handleSave = () => {
    // Basic validation
    if (!formData.name.trim() || !formData.url.trim()) {
        alert("Please enter both a Name and a URL.");
        return;
    }
    
    let appToSave = { ...formData };
    
    // Auto-fetch logic if no specific choice made
    if (!appToSave.iconUrl && !appToSave.iconName) {
         appToSave.iconUrl = getFavicon(appToSave.url);
    }

    if (isNewApp) {
      onAddApp(appToSave);
      setIsNewApp(false);
      setSelectedAppId(appToSave.id);
    } else {
      onUpdateApp(appToSave);
    }

    // Show visual feedback
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleAutoFetchIcon = () => {
    const favicon = getFavicon(formData.url);
    if (favicon) {
      setFormData(prev => ({ ...prev, iconUrl: favicon }));
    }
  };

  const handleIconSelect = (iconName: string) => {
    // Clear iconUrl to prioritize the system icon
    setFormData(prev => ({ ...prev, iconName, iconUrl: '' }));
  };

  const handleDeleteCurrent = () => {
    if (selectedAppId && confirm('Delete this shortcut permanently?')) {
      onDeleteApp(selectedAppId);
      setSelectedAppId(null);
      if (userApps.length > 1) {
         // Select another app (simple logic: first one that isn't the deleted one)
         const next = userApps.find(a => a.id !== selectedAppId);
         if (next) handleSelectApp(next);
      } else {
         handleStartAdd(); // If no apps left, go to add mode
      }
    }
  };

  // --- Data Handlers ---
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userApps, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "cloudos_backup.json");
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
            onImportApps(parsed);
            alert('Backup restored successfully.');
          } else {
            alert('Invalid backup file format.');
          }
        } catch (err) {
          alert('Failed to parse JSON file.');
        }
      };
    }
  };

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
              onClick={() => setActiveTab('data')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'data' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              Backup
            </button>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Close Settings"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* === APPS TAB LAYOUT === */}
        {activeTab === 'apps' && (
          <>
            {/* LEFT SIDEBAR: LIST */}
            <div className="w-[240px] border-r border-white/5 flex flex-col bg-[#080808] shrink-0">
              <div className="p-3 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">My Shortcuts</span>
                 <button 
                    onClick={handleStartAdd}
                    className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                    title="Add New App"
                 >
                    <Plus size={14} />
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-1">
                 {userApps.map(app => {
                    const isActive = selectedAppId === app.id;
                    const AppIcon = app.iconName && ICON_LIBRARY[app.iconName] ? ICON_LIBRARY[app.iconName] : Globe;
                    
                    return (
                       <button
                          key={app.id}
                          onClick={() => handleSelectApp(app)}
                          className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-200 group text-left border ${
                             isActive 
                               ? 'bg-white/5 border-amber-500/20 shadow-md' 
                               : 'border-transparent hover:bg-white/5 hover:border-white/5'
                          }`}
                       >
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs shrink-0 ${isActive ? 'bg-amber-500 text-white' : 'bg-white/10 text-slate-400 group-hover:text-white'} transition-colors`}>
                             {app.iconUrl ? (
                                <img src={app.iconUrl} className="w-4 h-4 object-contain" alt="" />
                             ) : (
                                <AppIcon size={14} />
                             )}
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className={`text-xs font-medium truncate ${isActive ? 'text-amber-100' : 'text-slate-300 group-hover:text-slate-100'}`}>{app.name}</div>
                          </div>
                          {isActive && <ChevronRight size={12} className="text-amber-500" />}
                       </button>
                    )
                 })}
                 
                 {isNewApp && (
                    <div className="w-full flex items-center gap-2 p-2 rounded-lg bg-amber-900/10 border border-amber-500/30 text-amber-500/70 cursor-default animate-pulse">
                       <div className="w-7 h-7 rounded-md bg-amber-500/20 flex items-center justify-center">
                          <Plus size={14} />
                       </div>
                       <span className="text-xs font-medium italic">New App...</span>
                    </div>
                 )}
              </div>
            </div>

            {/* RIGHT PANEL: EDITOR (Flex Layout, Fixed Height) */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#050505] relative">
               
               {/* Background Glow */}
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

               {(selectedAppId || isNewApp) ? (
                  <div className="flex flex-col h-full relative z-10">
                     
                     {/* 1. EDITOR HEADER */}
                     <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                         <div>
                              <h3 className="text-xl font-serif text-amber-50 tracking-wide">
                                 {isNewApp ? 'New Application' : 'Edit Application'}
                              </h3>
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                                 {isNewApp ? 'Add to your collection' : `ID: ${formData.id.split('-')[0]}...`}
                              </p>
                           </div>
                           {!isNewApp && (
                              <button 
                                 onClick={handleDeleteCurrent}
                                 className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-900/10 text-red-500 hover:bg-red-900/30 transition-colors border border-red-900/20 text-[10px] font-bold uppercase tracking-wider"
                              >
                                 <Trash2 size={12} /> Delete
                              </button>
                           )}
                     </div>

                     {/* 2. SCROLLABLE / FLEX BODY */}
                     <div className="flex-1 min-h-0 flex flex-col px-6 py-2 gap-4">
                        
                        {/* INPUTS ROW */}
                        <div className="grid grid-cols-2 gap-4 shrink-0">
                             {/* Name Input */}
                             <div className="group relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors">
                                    <Type size={14} />
                                </div>
                                <input 
                                   type="text" 
                                   value={formData.name}
                                   onChange={e => setFormData({...formData, name: e.target.value})}
                                   className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 focus:bg-[#151515] transition-all placeholder:text-slate-700"
                                   placeholder="Application Name"
                                />
                             </div>

                             {/* URL Input */}
                             <div className="group relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors">
                                    <LinkIcon size={14} />
                                </div>
                                <input 
                                   type="text" 
                                   value={formData.url}
                                   onChange={e => setFormData({...formData, url: e.target.value})}
                                   onBlur={handleAutoFetchIcon}
                                   className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-xs font-mono text-amber-500/90 focus:outline-none focus:border-amber-500/50 focus:bg-[#151515] transition-all placeholder:text-slate-700"
                                   placeholder="https://example.com"
                                />
                                <button 
                                   onClick={handleAutoFetchIcon}
                                   className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-amber-400 p-1 rounded-md hover:bg-white/5 transition-colors"
                                   title="Fetch Favicon"
                                >
                                   <RefreshCcw size={12} />
                                </button>
                             </div>
                        </div>

                        {/* APPEARANCE SECTION (Fills remaining space) */}
                        <div className="flex-1 min-h-0 grid grid-cols-12 gap-4 border-t border-white/5 pt-4">
                              
                              {/* Left: Preview & Colors */}
                              <div className="col-span-5 flex flex-col gap-4">
                                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Icon Style</label>
                                 
                                 <div className="flex items-center gap-4 bg-[#0f0f0f] border border-white/5 rounded-xl p-4">
                                    <div className={`w-12 h-12 rounded-xl ${formData.color} flex items-center justify-center shadow-lg ring-1 ring-white/10 relative overflow-hidden shrink-0`}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/30 pointer-events-none" />
                                        {formData.iconUrl ? (
                                           <img src={formData.iconUrl} alt="Preview" className="w-7 h-7 object-contain drop-shadow-md z-10" />
                                        ) : (
                                           React.createElement(ICON_LIBRARY[formData.iconName || 'Globe'] || Globe, { size: 24, className: 'text-white/90 z-10' })
                                        )}
                                     </div>
                                     <div className="text-[10px] text-slate-500 leading-tight">
                                        Icon Preview
                                     </div>
                                 </div>

                                 <div className="flex-1 overflow-y-auto scrollbar-hide">
                                    <div className="grid grid-cols-6 gap-2 p-3 bg-[#0f0f0f] border border-white/5 rounded-xl">
                                        {COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setFormData({...formData, color: c})}
                                            className={`w-5 h-5 rounded-full ${c} ${formData.color === c ? 'ring-2 ring-amber-500 scale-110' : 'opacity-70 hover:opacity-100'} transition-all`}
                                            title={c.replace('bg-', '')}
                                        />
                                        ))}
                                    </div>
                                 </div>
                              </div>

                              {/* Right: Icon Grid (Scrollable) */}
                              <div className="col-span-7 flex flex-col bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden">
                                 <div className="px-4 py-3 border-b border-white/5 bg-[#111]">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Library</label>
                                 </div>
                                 <div className="flex-1 overflow-y-auto scrollbar-hide p-3">
                                    <div className="grid grid-cols-6 gap-2">
                                        {ICONS.map(iconName => {
                                           const IconComponent = ICON_LIBRARY[iconName];
                                           const isSelected = !formData.iconUrl && formData.iconName === iconName;
                                           return (
                                              <button
                                                 key={iconName}
                                                 onClick={() => handleIconSelect(iconName)}
                                                 className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                                                    isSelected 
                                                    ? 'bg-amber-600 text-white shadow-lg' 
                                                    : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-200'
                                                 }`}
                                                 title={iconName}
                                              >
                                                 <IconComponent size={14} strokeWidth={1.5} />
                                              </button>
                                           );
                                        })}
                                    </div>
                                 </div>
                              </div>
                        </div>
                     </div>

                     {/* 3. FOOTER (Fixed) */}
                     <div className="p-4 border-t border-white/5 flex justify-end gap-3 bg-[#080808] shrink-0">
                        <button 
                              onClick={resetForm} 
                              className="px-4 py-2 rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider transition-colors"
                           >
                              Reset
                           </button>
                           <button 
                              onClick={handleSave} 
                              disabled={saveStatus === 'saved'}
                              className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all duration-300 ${
                                saveStatus === 'saved' 
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-600' 
                                  : 'bg-amber-600 text-white hover:bg-amber-500 hover:shadow-amber-500/20'
                              }`}
                           >
                              {saveStatus === 'saved' ? <Check size={14} /> : <Save size={14} />} 
                              {saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
                           </button>
                     </div>

                  </div>
               ) : (
                  // Empty State
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                     <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                        <Search size={24} className="opacity-50" />
                     </div>
                     <h3 className="text-base font-serif text-slate-400 tracking-wide">Select a shortcut</h3>
                     <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest">Or create a new one</p>
                  </div>
               )}
            </div>
          </>
        )}

        {/* === DATA TAB LAYOUT === */}
        {activeTab === 'data' && (
          <div className="w-full h-full p-8 overflow-y-auto bg-[#050505]">
            <div className="max-w-3xl mx-auto h-full flex flex-col justify-center">
               <div className="mb-8 text-center">
                  <h3 className="text-2xl font-serif text-amber-50 mb-2">Data Management</h3>
                  <p className="text-sm text-slate-500">Securely backup your configuration or restore from a file.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Export */}
                  <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/5 flex flex-col items-center text-center gap-4 hover:border-amber-500/30 transition-all group relative overflow-hidden">
                     <div className="w-12 h-12 bg-[#111] text-amber-500/50 group-hover:text-amber-400 group-hover:bg-amber-500/10 rounded-xl flex items-center justify-center transition-colors shadow-lg relative z-10">
                        <Download size={20} />
                     </div>
                     <div className="relative z-10">
                        <h4 className="font-medium text-slate-200 text-sm">Export Backup</h4>
                     </div>
                     <button 
                        onClick={handleExport}
                        className="mt-1 px-4 py-2 bg-[#151515] text-slate-300 rounded-lg hover:bg-amber-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider w-full relative z-10 border border-white/5 group-hover:border-amber-500/50"
                     >
                        Download
                     </button>
                  </div>

                  {/* Import */}
                  <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/5 flex flex-col items-center text-center gap-4 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
                     <div className="w-12 h-12 bg-[#111] text-emerald-500/50 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 rounded-xl flex items-center justify-center transition-colors shadow-lg relative z-10">
                        <Upload size={20} />
                     </div>
                     <div className="relative z-10">
                        <h4 className="font-medium text-slate-200 text-sm">Import Config</h4>
                     </div>
                     <button 
                        onClick={handleImportClick}
                        className="mt-1 px-4 py-2 bg-[#151515] text-slate-300 rounded-lg hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider w-full relative z-10 border border-white/5 group-hover:border-emerald-500/50"
                     >
                        Upload File
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
                        <h4 className="font-medium text-slate-200 text-sm">System Reset</h4>
                     </div>
                     <button 
                        onClick={() => {
                           if (confirm('DANGER: This will delete all your custom links. Are you sure?')) {
                              onResetApps();
                           }
                        }}
                        className="mt-1 px-4 py-2 bg-[#151515] text-slate-300 rounded-lg hover:bg-red-900/50 hover:text-red-200 transition-all text-[10px] font-bold uppercase tracking-wider w-full relative z-10 border border-white/5 group-hover:border-red-500/50"
                     >
                        Factory Reset
                     </button>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};