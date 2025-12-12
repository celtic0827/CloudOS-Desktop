import React, { useState, useEffect, useMemo } from 'react';
import { AppConfig } from '../../../types';
import { ICON_LIBRARY, getFavicon } from '../../../constants';
import { Globe, Trash2, Check, Save, Search, X } from 'lucide-react';

// Sub-components
import { AppListSidebar } from './parts/AppListSidebar';
import { AppFormHeader } from './parts/AppFormHeader';
import { VisualSettings } from './parts/VisualSettings';
import { PreviewPanel } from './parts/PreviewPanel';

interface AppsSettingsProps {
  userApps: AppConfig[];
  onAddApp: (app: AppConfig) => void;
  onUpdateApp: (app: AppConfig) => void;
  onDeleteApp: (id: string) => void;
  initialAppId?: string | null;
}

const ICONS = Object.keys(ICON_LIBRARY);

// Expanded Palette (Needed for Colors if we want to pass them or use them, but Color Picker is in PreviewPanel now)
// We keep COLORS in PreviewPanel to avoid prop drilling too much constant data

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
  
  // Modal State
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconSearch, setIconSearch] = useState('');

  const [formData, setFormData] = useState<AppConfig>({
    id: '',
    name: '',
    url: '',
    color: 'bg-slate-900',
    description: '',
    iconUrl: '',
    iconName: 'Globe',
    heroIconName: '', // Extra graphic
    heroScale: 8,
    heroOpacity: 30,
    heroOffsetX: 40,
    heroOffsetY: 0,
    heroRotation: 0,
    heroColor: '#94a3b8',
    heroEffect: 'none',
    heroEffectIntensity: 5,
    widgetStyle: 'standard',
    gridSize: '1x1'
  });

  // Initial Load Logic
  useEffect(() => {
    if (initialAppId) {
        const app = userApps.find(a => a.id === initialAppId);
        if (app) handleSelectApp(app);
    } else if (!selectedAppId && !isNewApp && userApps.length > 0) {
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
      heroIconName: '',
      heroScale: 8,
      heroOpacity: 30,
      heroOffsetX: 40,
      heroOffsetY: 0,
      heroRotation: 0,
      heroColor: '#94a3b8',
      heroEffect: 'none',
      heroEffectIntensity: 5,
      widgetStyle: 'standard',
      gridSize: '1x1'
    });
  };

  const handleSelectApp = (app: AppConfig) => {
    setFormData({ 
        ...app, 
        iconName: app.iconName || 'Globe',
        heroIconName: app.heroIconName || '',
        heroScale: app.heroScale ?? 8,
        heroOpacity: app.heroOpacity ?? 30,
        heroOffsetX: app.heroOffsetX ?? 40,
        heroOffsetY: app.heroOffsetY ?? 0,
        heroRotation: app.heroRotation ?? 0,
        heroColor: app.heroColor || '#94a3b8',
        heroEffect: app.heroEffect ?? 'none',
        heroEffectIntensity: app.heroEffectIntensity ?? 5,
        widgetStyle: app.widgetStyle || 'standard',
        gridSize: app.gridSize || '1x1'
    });
    setSelectedAppId(app.id);
    setIsNewApp(false);
    setSaveStatus('idle');
    setShowIconPicker(false);
  };

  const handleStartAdd = () => {
    const newId = generateId();
    setFormData({
      id: newId,
      name: 'New Link',
      url: 'https://',
      color: 'bg-slate-900',
      description: '',
      iconUrl: '',
      iconName: 'Globe',
      heroIconName: '',
      heroScale: 8,
      heroOpacity: 30,
      heroOffsetX: 40,
      heroOffsetY: 0,
      heroRotation: 0,
      heroColor: '#94a3b8',
      heroEffect: 'none',
      heroEffectIntensity: 5,
      widgetStyle: 'standard',
      gridSize: '1x1'
    });
    setSelectedAppId(null);
    setIsNewApp(true);
    setSaveStatus('idle');
    setShowIconPicker(false);
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
    
    // Auto-fix layout consistencies
    if (appToSave.widgetStyle === 'standard') {
        appToSave.gridSize = '1x1';
    } else if (appToSave.widgetStyle === 'vertical') {
        appToSave.gridSize = '1x2';
    } else if (appToSave.widgetStyle === 'horizontal' || appToSave.widgetStyle === 'status' || appToSave.widgetStyle === 'dropzone') {
        appToSave.gridSize = '2x1';
        appToSave.widgetStyle = 'horizontal'; 
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

  const openIconPicker = () => {
      setShowIconPicker(true);
      setIconSearch('');
  };

  const handleIconSelect = (iconName: string) => {
    // Set Main Icon
    // Also, if Hero Icon is enabled (not empty), sync it with the new Main Icon
    setFormData(prev => ({ 
        ...prev, 
        iconName, 
        iconUrl: '',
        heroIconName: prev.heroIconName ? iconName : '' 
    }));
    setShowIconPicker(false);
  };

  const handleDeleteCurrent = () => {
    if (selectedAppId && confirm('Delete this shortcut permanently?')) {
      onDeleteApp(selectedAppId);
      setSelectedAppId(null);
      const remaining = userApps.filter(a => a.id !== selectedAppId);
      if (remaining.length > 0) {
         handleSelectApp(remaining[0]);
      } else {
         handleStartAdd();
      }
    }
  };

  // Filter icons for search
  const filteredIcons = useMemo(() => {
    return ICONS.filter(icon => icon.toLowerCase().includes(iconSearch.toLowerCase()));
  }, [iconSearch]);

  const MainIconToRender = (formData.iconName && ICON_LIBRARY[formData.iconName]) 
        ? ICON_LIBRARY[formData.iconName] 
        : Globe;

  const HeroIconToRender = (formData.heroIconName && ICON_LIBRARY[formData.heroIconName])
        ? ICON_LIBRARY[formData.heroIconName]
        : null;

  return (
    <>
        {/* LEFT SIDEBAR: LIST */}
        <AppListSidebar 
            userApps={userApps}
            selectedAppId={selectedAppId || (isNewApp ? 'new' : null)}
            onSelectApp={handleSelectApp}
            onStartAdd={handleStartAdd}
        />

        {/* RIGHT PANEL: APP EDITOR */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#050505] relative">
           {/* Background FX */}
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

           {(selectedAppId || isNewApp) ? (
              <div className="flex flex-col h-full relative z-10 p-6">
                 
                 {/* 1. Header Row (New extracted component with fixed spacing) */}
                 <AppFormHeader 
                    formData={formData}
                    setFormData={setFormData}
                    onAutoFetchIcon={handleAutoFetchIcon}
                 />

                 {/* 2. Main Content Grid */}
                 <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                    
                    {/* Left Column: Visual Appearance (Unified) */}
                    <div className="col-span-7 flex flex-col overflow-y-auto scrollbar-hide pr-2">
                        <VisualSettings 
                            formData={formData}
                            setFormData={setFormData}
                            openIconPicker={openIconPicker}
                            MainIconToRender={MainIconToRender}
                        />
                    </div>

                    {/* Right Column: Colors & Preview - Reduced to Span 5 */}
                    <PreviewPanel 
                        formData={formData}
                        setFormData={setFormData}
                        MainIconToRender={MainIconToRender}
                        HeroIconToRender={HeroIconToRender}
                    />
                 </div>
                 
                 {/* Footer Actions */}
                 <div className="pt-4 mt-4 border-t border-white/5 flex justify-between items-center shrink-0">
                     {!isNewApp ? (
                        <button 
                            onClick={handleDeleteCurrent}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-900/10 text-red-500 hover:bg-red-900/30 transition-colors border border-red-900/20 text-[10px] font-bold uppercase tracking-wider"
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                     ) : (
                        <div />
                     )}

                     <div className="flex items-center gap-3">
                         <button 
                            onClick={resetForm} 
                            className="px-6 py-2 rounded-xl text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider transition-colors"
                         >
                            Reset
                         </button>
                         <button 
                            onClick={handleSave} 
                            disabled={saveStatus === 'saved'}
                            className={`px-8 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all duration-300 ${
                                saveStatus === 'saved' 
                                ? 'bg-emerald-600 text-white hover:bg-emerald-600' 
                                : 'bg-amber-600 text-white hover:bg-amber-500 hover:shadow-amber-500/20'
                            }`}
                         >
                            {saveStatus === 'saved' ? <Check size={14} /> : <Save size={14} />} 
                            {saveStatus === 'saved' ? 'Saved' : 'Save Changes'}
                         </button>
                     </div>
                 </div>

                 {/* --- ICON PICKER MODAL --- */}
                 {showIconPicker && (
                    <div className="absolute inset-0 z-50 bg-[#050505]/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
                        <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-[#0a0a0a] shrink-0">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Search app icon..."
                                    value={iconSearch}
                                    onChange={(e) => setIconSearch(e.target.value)}
                                    className="w-full bg-[#111] border border-white/10 rounded-lg pl-9 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                                />
                            </div>
                            <button 
                                onClick={() => setShowIconPicker(false)}
                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            <div className="grid grid-cols-8 sm:grid-cols-10 gap-3">
                                {filteredIcons.map(iconName => {
                                    const IconComponent = ICON_LIBRARY[iconName];
                                    const isSelected = !formData.iconUrl && formData.iconName === iconName;

                                    return (
                                        <button
                                            key={iconName}
                                            onClick={() => handleIconSelect(iconName)}
                                            className={`
                                                aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all
                                                ${isSelected 
                                                    ? 'bg-amber-600 text-white shadow-lg ring-2 ring-amber-400' 
                                                    : 'bg-[#111] border border-white/5 text-slate-400 hover:bg-[#1a1a1a] hover:text-slate-100 hover:border-white/10'}
                                            `}
                                            title={iconName}
                                        >
                                            <IconComponent size={24} strokeWidth={1.5} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                 )}
              </div>
           ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-2xl">
                    <Search size={32} className="opacity-50" />
                 </div>
                 <h3 className="text-xl font-serif text-slate-400 tracking-wide">Select a shortcut</h3>
                 <p className="text-xs text-slate-600 mt-2 uppercase tracking-widest">Or create a new one to begin</p>
              </div>
           )}
        </div>
    </>
  );
};