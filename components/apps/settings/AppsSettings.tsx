import React, { useState, useEffect, useMemo } from 'react';
import { AppConfig, WidgetStyle, GridSize, HeroEffect } from '../../../types';
import { ICON_LIBRARY, getFavicon } from '../../../constants';
import { DropZoneWidget, StatusWidget } from '../../widgets/HeroWidgets'; // Import real widgets
import { Plus, Globe, Type, Link as LinkIcon, RefreshCcw, Square, RectangleHorizontal, RectangleVertical, Upload as UploadIcon, Trash2, Check, Save, Search, X, Palette, LayoutTemplate, MousePointerClick, Image as ImageIcon, Sparkles, ArrowRight, ArrowDown, LucideIcon, Move, Maximize, Droplets, ToggleLeft, ToggleRight, RotateCw, Moon, Sun, Ban, BoxSelect } from 'lucide-react';

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

// Base unit for Bento Grid to match Desktop
const BASE_SIZE = 160; 
const GAP = 16;

const getPreviewDimensions = (gridSize: GridSize) => {
    switch (gridSize) {
        case '2x2': return { width: BASE_SIZE * 2 + GAP, height: BASE_SIZE * 2 + GAP }; // 336x336
        case '2x1': return { width: BASE_SIZE * 2 + GAP, height: BASE_SIZE };           // 336x160
        case '1x2': return { width: BASE_SIZE, height: BASE_SIZE * 2 + GAP };           // 160x336
        case '1x1':
        default:    return { width: BASE_SIZE, height: BASE_SIZE };                     // 160x160
    }
};

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
    heroEffect: 'none',
    heroEffectIntensity: 20,
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
      heroEffect: 'none',
      heroEffectIntensity: 20,
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
        heroEffect: app.heroEffect ?? 'none',
        heroEffectIntensity: app.heroEffectIntensity ?? 20,
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
      color: COLORS[0],
      description: '',
      iconUrl: '',
      iconName: 'Globe',
      heroIconName: '',
      heroScale: 8,
      heroOpacity: 30,
      heroOffsetX: 40,
      heroOffsetY: 0,
      heroRotation: 0,
      heroEffect: 'none',
      heroEffectIntensity: 20,
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

  const handleColorSelect = (c: string) => {
    setFormData({...formData, color: c});
  };

  const handleStyleSelect = (style: WidgetStyle) => {
      let newGridSize = formData.gridSize;
      if (style === 'standard') newGridSize = '1x1';
      if (style === 'vertical') newGridSize = '1x2';
      if (style === 'horizontal') newGridSize = '2x1';
      // Fallback for types not explicitly matched above
      if (!newGridSize) newGridSize = '1x1';

      setFormData({
          ...formData,
          widgetStyle: style,
          gridSize: newGridSize
      });
  };

  const toggleHeroGraphic = () => {
      if (formData.heroIconName) {
          // Disable
          setFormData({ ...formData, heroIconName: '' });
      } else {
          // Enable - sync with main icon and use defaults
          setFormData({
              ...formData,
              heroIconName: formData.iconName || 'Globe',
              heroScale: formData.heroScale || 8,
              heroOpacity: formData.heroOpacity || 30,
              heroOffsetX: formData.heroOffsetX || 40,
              heroOffsetY: formData.heroOffsetY || 0,
              heroRotation: 0,
              heroEffect: 'none',
              heroEffectIntensity: 20
          });
      }
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

  // --- PREVIEW RENDERER ---
  // Calculates Dimensions and Renders Real Widgets
  const previewDim = getPreviewDimensions(formData.gridSize || '1x1');

  return (
    <>
        {/* LEFT SIDEBAR: LIST */}
        <div className="w-[280px] border-r border-white/5 flex flex-col bg-[#080808] shrink-0">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">My Shortcuts</span>
             <button 
                onClick={handleStartAdd}
                className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                title="Add New App"
             >
                <Plus size={16} />
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-2">
             {userApps.map(app => {
                const isActive = selectedAppId === app.id;
                const AppIcon = app.iconName && ICON_LIBRARY[app.iconName] ? ICON_LIBRARY[app.iconName] : Globe;
                
                return (
                   <button
                      key={app.id}
                      onClick={() => handleSelectApp(app)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group text-left border ${
                         isActive 
                           ? 'bg-white/5 border-amber-500/20 shadow-md' 
                           : 'border-transparent hover:bg-white/5 hover:border-white/5'
                      }`}
                   >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 ${isActive ? 'bg-amber-500 text-white' : 'bg-white/10 text-slate-400 group-hover:text-white'} transition-colors`}>
                         {app.iconUrl ? (
                            <img src={app.iconUrl} className="w-5 h-5 object-contain" alt="" />
                         ) : (
                            <AppIcon size={16} />
                         )}
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                         <div className={`text-sm font-medium truncate ${isActive ? 'text-amber-100' : 'text-slate-300 group-hover:text-slate-100'}`}>{app.name}</div>
                         {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                      </div>
                   </button>
                )
             })}
          </div>
        </div>

        {/* RIGHT PANEL: APP EDITOR */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#050505] relative">
           {/* Background FX */}
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

           {(selectedAppId || isNewApp) ? (
              <div className="flex flex-col h-full relative z-10 p-8">
                 
                 {/* 1. Header Row */}
                 <div className="flex gap-4 mb-8 shrink-0">
                     <div className="w-1/4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80 mb-2 block">Name</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:bg-[#151515] transition-all placeholder:text-slate-700"
                            placeholder="App Name"
                        />
                     </div>
                     <div className="w-2/5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80 mb-2 block">URL</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={formData.url}
                                onChange={e => setFormData({...formData, url: e.target.value})}
                                onBlur={handleAutoFetchIcon}
                                className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm font-mono text-amber-500/90 focus:outline-none focus:border-amber-500/50 focus:bg-[#151515] transition-all placeholder:text-slate-700"
                                placeholder="https://..."
                            />
                            <button 
                                onClick={handleAutoFetchIcon}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-amber-400 p-1.5 rounded-md hover:bg-white/5 transition-colors"
                                title="Auto-fetch Favicon"
                            >
                                <RefreshCcw size={16} />
                            </button>
                        </div>
                     </div>
                     <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80 mb-2 block">Description</label>
                        <input 
                            type="text" 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-amber-500/50 focus:bg-[#151515] transition-all placeholder:text-slate-700"
                            placeholder="Optional"
                        />
                     </div>
                 </div>

                 {/* 2. Main Content Grid */}
                 <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
                    
                    {/* Left Column: Visual Settings - Span 5 */}
                    <div className="col-span-5 flex flex-col gap-6 overflow-y-auto scrollbar-hide pr-2">
                        
                        {/* Layout Style */}
                        <div className="p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl shrink-0">
                            <div className="flex items-center gap-2 text-slate-400 mb-3">
                                <LayoutTemplate size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Layout Style</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'standard', label: 'Standard', icon: Square, desc: '1x1' },
                                    { id: 'vertical', label: 'Portrait', icon: RectangleVertical, desc: '1x2' },
                                    { id: 'horizontal', label: 'Landscape', icon: RectangleHorizontal, desc: '2x1' },
                                ].map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => handleStyleSelect(style.id as WidgetStyle)}
                                        className={`
                                            flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 text-center
                                            ${(formData.widgetStyle === style.id || (style.id === 'horizontal' && formData.widgetStyle === 'dropzone'))
                                                ? 'bg-amber-600/10 border-amber-500/50 text-amber-500 shadow-md shadow-amber-900/10' 
                                                : 'bg-[#111] border-white/5 text-slate-500 hover:bg-white/5 hover:text-slate-300'}
                                        `}
                                    >
                                        <style.icon size={20} />
                                        <div className="text-[10px] font-bold uppercase">{style.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Icons Configuration */}
                        <div className="p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl flex-1 flex flex-col">
                             <div className="flex items-center gap-2 text-slate-400 mb-4">
                                <ImageIcon size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Iconography</span>
                            </div>

                            <div className="space-y-4">
                                {/* Main Icon */}
                                <div className="flex items-center justify-between p-3 bg-[#111] border border-white/5 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg ${formData.color} flex items-center justify-center shadow-lg border border-white/5`}>
                                            {formData.iconUrl ? (
                                                <img src={formData.iconUrl} className="w-5 h-5 object-contain" alt="Icon" />
                                            ) : (
                                                <MainIconToRender size={20} className="text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-200">Main Icon</div>
                                            <div className="text-[10px] text-slate-500">Standard display</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={openIconPicker}
                                        className="px-3 py-1.5 bg-[#151515] hover:bg-amber-600 hover:text-white border border-white/10 rounded-lg text-[10px] font-bold uppercase transition-all text-slate-400"
                                    >
                                        Change
                                    </button>
                                </div>

                                {/* Hero Icon Toggle & Sliders */}
                                {(formData.gridSize === '1x2' || formData.gridSize === '2x1') && (
                                    <div className="flex flex-col gap-3 p-3 bg-[#111] border border-white/5 rounded-xl animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                                                    {formData.heroIconName ? <MainIconToRender size={20} className="text-amber-500" /> : <Sparkles size={16} className="text-slate-600" />}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-200">Background Illustration</div>
                                                    <div className="text-[10px] text-slate-500">Enable decorative graphic</div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={toggleHeroGraphic}
                                                className={`transition-colors duration-300 ${formData.heroIconName ? 'text-amber-500' : 'text-slate-600'}`}
                                            >
                                                {formData.heroIconName ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                            </button>
                                        </div>

                                        {/* SLIDERS & EFFECTS */}
                                        {formData.heroIconName && (
                                            <div className="mt-2 pt-3 border-t border-white/5 space-y-4">
                                                
                                                {/* Scale */}
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                                                        <span className="flex items-center gap-1"><Maximize size={10} /> Scale</span>
                                                        <span>{formData.heroScale}x</span>
                                                    </div>
                                                    <input 
                                                        type="range" min="1" max="20" step="0.5"
                                                        value={formData.heroScale}
                                                        onChange={(e) => setFormData({...formData, heroScale: parseFloat(e.target.value)})}
                                                        className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                                    />
                                                </div>

                                                {/* Rotation */}
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                                                        <span className="flex items-center gap-1"><RotateCw size={10} /> Rotation</span>
                                                        <span>{formData.heroRotation}°</span>
                                                    </div>
                                                    <input 
                                                        type="range" min="0" max="360" step="5"
                                                        value={formData.heroRotation || 0}
                                                        onChange={(e) => setFormData({...formData, heroRotation: parseInt(e.target.value)})}
                                                        className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                                    />
                                                </div>

                                                {/* Opacity */}
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                                                        <span className="flex items-center gap-1"><Droplets size={10} /> Opacity</span>
                                                        <span>{formData.heroOpacity}%</span>
                                                    </div>
                                                    <input 
                                                        type="range" min="0" max="100" step="5"
                                                        value={formData.heroOpacity}
                                                        onChange={(e) => setFormData({...formData, heroOpacity: parseInt(e.target.value)})}
                                                        className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                                    />
                                                </div>

                                                {/* Effect Mode */}
                                                <div className="space-y-2">
                                                    <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1"><Sparkles size={10} /> Visual Effect</div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {[
                                                            { id: 'none', label: 'None', icon: Ban },
                                                            { id: 'shadow', label: 'Shadow', icon: Moon },
                                                            { id: 'glow', label: 'Glow', icon: Sun },
                                                        ].map(mode => (
                                                            <button
                                                                key={mode.id}
                                                                onClick={() => setFormData({...formData, heroEffect: mode.id as HeroEffect})}
                                                                className={`
                                                                    flex flex-col items-center justify-center p-2 rounded-lg border transition-all
                                                                    ${formData.heroEffect === mode.id 
                                                                        ? 'bg-amber-600 text-white border-amber-500 shadow-md' 
                                                                        : 'bg-[#151515] border-white/5 text-slate-500 hover:text-slate-300'}
                                                                `}
                                                            >
                                                                <mode.icon size={14} className="mb-1" />
                                                                <span className="text-[9px] font-bold uppercase">{mode.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Effect Intensity (Conditional) */}
                                                {formData.heroEffect && formData.heroEffect !== 'none' && (
                                                    <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                                                        <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                                                            <span>Intensity</span>
                                                            <span>{formData.heroEffectIntensity}px</span>
                                                        </div>
                                                        <input 
                                                            type="range" min="5" max="100" step="5"
                                                            value={formData.heroEffectIntensity || 20}
                                                            onChange={(e) => setFormData({...formData, heroEffectIntensity: parseInt(e.target.value)})}
                                                            className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                                        />
                                                    </div>
                                                )}

                                                {/* Offsets */}
                                                <div className="grid grid-cols-2 gap-3 pt-1">
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                                                            <span className="flex items-center gap-1"><Move size={10} /> Offset X</span>
                                                            <span>{formData.heroOffsetX}</span>
                                                        </div>
                                                        <input 
                                                            type="range" min="-150" max="150" step="5"
                                                            value={formData.heroOffsetX}
                                                            onChange={(e) => setFormData({...formData, heroOffsetX: parseInt(e.target.value)})}
                                                            className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                                                            <span className="flex items-center gap-1"><Move size={10} className="rotate-90"/> Offset Y</span>
                                                            <span>{formData.heroOffsetY}</span>
                                                        </div>
                                                        <input 
                                                            type="range" min="-100" max="100" step="5"
                                                            value={formData.heroOffsetY}
                                                            onChange={(e) => setFormData({...formData, heroOffsetY: parseInt(e.target.value)})}
                                                            className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Colors & Preview - Span 7 */}
                    <div className="col-span-7 flex flex-col gap-6">
                         
                        {/* Live Preview (Fixed Dimensions / Scrolling) */}
                        <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-2xl flex flex-col relative overflow-hidden min-h-[250px]">
                            <div className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 z-20">Live Preview</div>
                            
                            {/* Scrollable Area for Fixed Content */}
                            <div className="w-full h-full overflow-auto flex items-center justify-center p-8 custom-scrollbar relative z-10">
                                <div 
                                    style={{ 
                                        width: previewDim.width, 
                                        height: previewDim.height 
                                    }}
                                    className="shrink-0 relative rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a0a]/40 backdrop-blur-xl shadow-2xl transition-all duration-300"
                                >
                                    {/* Logic to Render Authentic Widget */}
                                    {formData.gridSize === '1x1' ? (
                                        // Standard 1x1 Icon Tile
                                        <div className="w-full h-full flex flex-col items-center justify-center relative group">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${formData.color} shadow-lg relative z-10`}>
                                                {formData.iconUrl ? (
                                                    <img src={formData.iconUrl} alt="Preview" className="w-6 h-6 object-contain" />
                                                ) : (
                                                    <MainIconToRender size={24} className="text-white" />
                                                )}
                                            </div>
                                            <span className="text-xs font-medium text-slate-300 truncate w-full text-center px-2">{formData.name || 'App Name'}</span>
                                        </div>
                                    ) : (
                                        // Complex Widgets (Using Real Components)
                                        formData.heroIconName ? (
                                            <DropZoneWidget 
                                                name={formData.name || 'App Name'}
                                                icon={MainIconToRender}
                                                color={formData.color}
                                                gridSize={formData.gridSize}
                                                heroIcon={HeroIconToRender || MainIconToRender}
                                                heroSettings={{
                                                    scale: formData.heroScale || 8,
                                                    opacity: formData.heroOpacity || 30,
                                                    x: formData.heroOffsetX || 40,
                                                    y: formData.heroOffsetY || 0,
                                                    rotate: formData.heroRotation || 0,
                                                    effect: formData.heroEffect,
                                                    effectIntensity: formData.heroEffectIntensity
                                                }}
                                            />
                                        ) : (
                                            <StatusWidget 
                                                name={formData.name || 'App Name'}
                                                icon={MainIconToRender}
                                                color={formData.color}
                                                description={formData.description || 'Shortcut'}
                                                gridSize={formData.gridSize}
                                            />
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none z-0" />
                        </div>

                         {/* Color Picker */}
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 shrink-0">
                            <div className="flex items-center gap-2 text-slate-400 mb-3">
                                <Palette size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Theme Color</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => handleColorSelect(c)}
                                    className={`w-8 h-8 rounded-full ${c} ${formData.color === c ? 'ring-2 ring-amber-500 scale-110 shadow-lg' : 'opacity-40 hover:opacity-100'} transition-all`}
                                    title={c.replace('bg-', '')}
                                />
                                ))}
                            </div>
                        </div>
                    </div>
                 </div>
                 
                 {/* Footer Actions */}
                 <div className="pt-6 mt-6 border-t border-white/5 flex justify-between items-center shrink-0">
                     {!isNewApp ? (
                        <button 
                            onClick={handleDeleteCurrent}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-900/10 text-red-500 hover:bg-red-900/30 transition-colors border border-red-900/20 text-[10px] font-bold uppercase tracking-wider"
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                     ) : (
                        <div />
                     )}

                     <div className="flex items-center gap-3">
                         <button 
                            onClick={resetForm} 
                            className="px-6 py-2.5 rounded-xl text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider transition-colors"
                         >
                            Reset
                         </button>
                         <button 
                            onClick={handleSave} 
                            disabled={saveStatus === 'saved'}
                            className={`px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all duration-300 ${
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