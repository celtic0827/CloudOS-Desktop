import React, { useState, useEffect } from 'react';
import { AppConfig, WidgetStyle } from '../../../types';
import { ICON_LIBRARY, getFavicon } from '../../../constants';
import { Plus, Globe, ExternalLink, Type, Link as LinkIcon, RefreshCcw, Square, RectangleHorizontal, Upload as UploadIcon, Trash2, Check, Save, Search } from 'lucide-react';

interface AppsSettingsProps {
  userApps: AppConfig[];
  onAddApp: (app: AppConfig) => void;
  onUpdateApp: (app: AppConfig) => void;
  onDeleteApp: (id: string) => void;
  initialAppId?: string | null;
}

// Expanded Palette
const COLORS = [
  'bg-slate-900', 'bg-slate-700', 'bg-zinc-900', 'bg-zinc-700', 'bg-stone-800', 'bg-neutral-800',
  'bg-red-950', 'bg-red-700', 'bg-rose-900', 'bg-rose-800', 'bg-rose-600', 'bg-orange-800',
  'bg-amber-900', 'bg-amber-800', 'bg-amber-600', 'bg-yellow-700', 'bg-lime-800',
  'bg-green-800', 'bg-emerald-900', 'bg-emerald-700', 'bg-emerald-600', 'bg-teal-800', 'bg-teal-600',
  'bg-cyan-900', 'bg-cyan-700', 'bg-sky-900', 'bg-sky-700', 'bg-blue-900', 'bg-blue-800',
  'bg-indigo-900', 'bg-indigo-700', 'bg-indigo-600', 'bg-violet-900', 'bg-violet-700', 'bg-violet-600',
  'bg-purple-900', 'bg-purple-700', 'bg-fuchsia-900', 'bg-fuchsia-700', 'bg-pink-900', 'bg-pink-700', 'bg-rose-700'
];

const ICONS = Object.keys(ICON_LIBRARY);

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'app-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

export const AppsSettings: React.FC<AppsSettingsProps> = ({
  userApps,
  onAddApp,
  onUpdateApp,
  onDeleteApp,
  initialAppId
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isNewApp, setIsNewApp] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const [formData, setFormData] = useState<AppConfig>({
    id: '',
    name: '',
    url: '',
    color: 'bg-slate-900',
    description: '',
    iconUrl: '',
    iconName: 'Globe',
    widgetStyle: 'standard'
  });

  // Initial Load Logic
  useEffect(() => {
    if (initialAppId) {
        // If passed a specific ID via props/routing
        const app = userApps.find(a => a.id === initialAppId);
        if (app) handleSelectApp(app);
    } else if (!selectedAppId && !isNewApp && userApps.length > 0) {
        // Default to first app
        handleSelectApp(userApps[0]);
    }
  }, [initialAppId]);

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      url: '',
      color: 'bg-slate-900',
      description: '',
      iconUrl: '',
      iconName: 'Globe',
      widgetStyle: 'standard'
    });
  };

  const handleSelectApp = (app: AppConfig) => {
    setFormData({ 
        ...app, 
        iconName: app.iconName || 'Globe',
        widgetStyle: app.widgetStyle || 'standard' 
    });
    setSelectedAppId(app.id);
    setIsNewApp(false);
    setSaveStatus('idle');
  };

  const handleStartAdd = () => {
    const newId = generateId();
    setFormData({
      id: newId,
      name: 'New Link',
      url: 'https://',
      color: COLORS[0],
      description: '',
      iconUrl: '',
      iconName: 'Globe',
      widgetStyle: 'standard'
    });
    setSelectedAppId(null);
    setIsNewApp(true);
    setSaveStatus('idle');
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.url.trim()) {
        alert("Please enter both a Name and a URL.");
        return;
    }
    
    let appToSave = { ...formData };
    
    if (!appToSave.iconUrl && !appToSave.iconName) {
         appToSave.iconUrl = getFavicon(appToSave.url);
    }
    
    // Enforce grid size
    if (appToSave.widgetStyle === 'dropzone' || appToSave.widgetStyle === 'status') {
        appToSave.gridSize = '2x1';
    } else {
        appToSave.gridSize = '1x1';
    }

    if (isNewApp) {
      onAddApp(appToSave);
      setIsNewApp(false);
      setSelectedAppId(appToSave.id);
    } else {
      onUpdateApp(appToSave);
    }

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
    setFormData(prev => ({ ...prev, iconName, iconUrl: '' }));
  };

  const handleColorSelect = (c: string) => {
    setFormData({...formData, color: c});
  };

  const handleDeleteCurrent = () => {
    if (selectedAppId && confirm('Delete this shortcut permanently?')) {
      onDeleteApp(selectedAppId);
      setSelectedAppId(null);
      // Auto select next or create new
      // We need to wait for parent to update props ideally, but for now we can guess
      const remaining = userApps.filter(a => a.id !== selectedAppId);
      if (remaining.length > 0) {
         handleSelectApp(remaining[0]);
      } else {
         handleStartAdd();
      }
    }
  };

  return (
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
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                         <div className={`text-xs font-medium truncate ${isActive ? 'text-amber-100' : 'text-slate-300 group-hover:text-slate-100'}`}>{app.name}</div>
                         <ExternalLink size={10} className={`shrink-0 ${isActive ? 'text-amber-500' : 'text-slate-600'} transition-all`} />
                      </div>
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

        {/* RIGHT PANEL: APP EDITOR */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#050505] relative">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

           {(selectedAppId || isNewApp) ? (
              <div className="flex flex-col h-full relative z-10">
                 
                 {/* No Header Block - Direct to Inputs */}
                 <div className="flex-1 min-h-0 flex flex-col px-6 pt-6 py-2 gap-4">
                    <div className="grid grid-cols-2 gap-4 shrink-0">
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

                    <div className="shrink-0">
                        <input 
                            type="text" 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50 focus:bg-[#151515] transition-all placeholder:text-slate-700"
                            placeholder="Short description (e.g. 'Sync your content')"
                        />
                    </div>

                    <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-3 shrink-0">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Desktop Appearance</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'standard', label: 'Icon', icon: Square, desc: '1x1' },
                                { id: 'status', label: 'Card', icon: RectangleHorizontal, desc: '2x1' },
                                { id: 'dropzone', label: 'Drop', icon: UploadIcon, desc: '2x1' }
                            ].map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => setFormData({ ...formData, widgetStyle: style.id as WidgetStyle })}
                                    className={`
                                        flex flex-row items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 text-left
                                        ${formData.widgetStyle === style.id 
                                            ? 'bg-amber-600/10 border-amber-500/50 text-amber-500' 
                                            : 'bg-[#0a0a0a] border-white/5 text-slate-500 hover:bg-white/5 hover:text-slate-300'}
                                    `}
                                >
                                    <div className="p-1.5 bg-white/5 rounded-md shrink-0">
                                        <style.icon size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="text-[10px] font-bold uppercase">{style.label}</div>
                                        <div className="text-[9px] opacity-60">{style.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 grid grid-cols-12 gap-4 border-t border-white/5 pt-4">
                        <div className="col-span-5 flex flex-col gap-4 h-full overflow-hidden">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Theme Color</label>
                            <div className="flex items-center gap-4 bg-[#0f0f0f] border border-white/5 rounded-xl p-4 shrink-0">
                                <div className={`w-12 h-12 rounded-xl ${formData.color} flex items-center justify-center shadow-lg ring-1 ring-white/10 relative overflow-hidden shrink-0`}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/30 pointer-events-none" />
                                    {formData.iconUrl ? (
                                    <img src={formData.iconUrl} alt="Preview" className="w-7 h-7 object-contain drop-shadow-md z-10" />
                                    ) : (
                                    React.createElement(ICON_LIBRARY[formData.iconName || 'Globe'] || Globe, { size: 24, className: 'text-white/90 z-10' })
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <div className="text-xs font-bold text-slate-200">Color Preview</div>
                                    <div className="text-[10px] text-slate-500">Applies to icon & border</div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
                                <div className="grid grid-cols-6 gap-2 p-3 bg-[#0f0f0f] border border-white/5 rounded-xl">
                                    {COLORS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => handleColorSelect(c)}
                                        className={`w-5 h-5 rounded-full ${c} ${formData.color === c ? 'ring-2 ring-amber-500 scale-110' : 'opacity-70 hover:opacity-100'} transition-all`}
                                        title={c.replace('bg-', '')}
                                    />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="col-span-7 flex flex-col bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden h-full">
                            <div className="px-4 py-3 border-b border-white/5 bg-[#111] shrink-0">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Icon Library</label>
                            </div>
                            <div className="flex-1 overflow-y-auto scrollbar-hide p-3 min-h-0">
                                <div className="grid grid-cols-8 gap-1">
                                    {ICONS.map(iconName => {
                                    const IconComponent = ICON_LIBRARY[iconName];
                                    const isSelected = !formData.iconUrl && formData.iconName === iconName;
                                    return (
                                        <button
                                            key={iconName}
                                            onClick={() => handleIconSelect(iconName)}
                                            className={`aspect-square rounded-md flex items-center justify-center transition-all ${
                                                isSelected 
                                                ? 'bg-amber-600 text-white shadow-lg' 
                                                : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-200'
                                            }`}
                                            title={iconName}
                                        >
                                            <IconComponent size={18} strokeWidth={1.5} />
                                        </button>
                                    );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
                 
                 <div className="p-4 border-t border-white/5 flex justify-between items-center bg-[#080808] shrink-0">
                     {/* LEFT: DELETE */}
                     {!isNewApp ? (
                        <button 
                            onClick={handleDeleteCurrent}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/10 text-red-500 hover:bg-red-900/30 transition-colors border border-red-900/20 text-[10px] font-bold uppercase tracking-wider"
                        >
                            <Trash2 size={12} /> Delete
                        </button>
                     ) : (
                        <div /> /* Spacer if new app */
                     )}

                     {/* RIGHT: ACTIONS */}
                     <div className="flex items-center gap-3">
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
              </div>
           ) : (
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
  );
};