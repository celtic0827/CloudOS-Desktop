import React from 'react';
import { AppConfig, WidgetStyle } from '../../../../types';
import { ICON_LIBRARY } from '../../../../constants';
import { Square, RectangleVertical, RectangleHorizontal, Globe, Sparkles, ToggleLeft, ToggleRight, Maximize, RotateCw, Droplets, Move } from 'lucide-react';

interface VisualSettingsProps {
  formData: AppConfig;
  setFormData: React.Dispatch<React.SetStateAction<AppConfig>>;
  openIconPicker: () => void;
  MainIconToRender: any;
}

// Gold Palette for Hero Icons
const HERO_COLORS = [
    { value: '#ffffff', label: 'White' },
    { value: '#fde68a', label: 'Champagne' }, // Amber-200
    { value: '#fbbf24', label: 'Bright Gold' }, // Amber-400
    { value: '#f59e0b', label: 'Classic Gold' }, // Amber-500
    { value: '#b45309', label: 'Bronze' }, // Amber-700
];

export const VisualSettings: React.FC<VisualSettingsProps> = ({
  formData,
  setFormData,
  openIconPicker,
  MainIconToRender
}) => {

  const handleStyleSelect = (style: WidgetStyle) => {
      let newGridSize = formData.gridSize;
      if (style === 'standard') newGridSize = '1x1';
      if (style === 'vertical') newGridSize = '1x2';
      if (style === 'horizontal') newGridSize = '2x1';
      // Fallback
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
          // Enable
          setFormData({
              ...formData,
              heroIconName: formData.iconName || 'Globe',
              heroScale: formData.heroScale || 8,
              heroOpacity: formData.heroOpacity || 30,
              heroOffsetX: formData.heroOffsetX || 40,
              heroOffsetY: formData.heroOffsetY || 0,
              heroRotation: 0,
              heroColor: '#fbbf24', // Default Bright Gold
              heroEffect: 'none',
              heroEffectIntensity: 5
          });
      }
  };

  return (
    <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-2xl flex-1 flex flex-col">
        <div className="flex flex-col gap-4 pt-1">
            {/* 1. Layout Style */}
            <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Layout Style</label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'standard', label: 'Standard', icon: Square, desc: '1x1' },
                        { id: 'vertical', label: 'Portrait', icon: RectangleVertical, desc: '1x2' },
                        { id: 'horizontal', label: 'Landscape', icon: RectangleHorizontal, desc: '2x1' },
                    ].map((style) => (
                        <button
                            key={style.id}
                            onClick={() => handleStyleSelect(style.id as WidgetStyle)}
                            className={`
                                flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200 text-center
                                ${(formData.widgetStyle === style.id || (style.id === 'horizontal' && formData.widgetStyle === 'dropzone'))
                                    ? 'bg-amber-600/10 border-amber-500/50 text-amber-500 shadow-md shadow-amber-900/10' 
                                    : 'bg-[#111] border-white/5 text-slate-500 hover:bg-white/5 hover:text-slate-300'}
                            `}
                        >
                            <style.icon size={18} />
                            <div className="text-[10px] font-bold uppercase">{style.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/5 w-full" />

            {/* 2. Iconography Section */}
            <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Iconography</label>
                <div className="space-y-3">
                    {/* Main Icon */}
                    <div className="flex items-center justify-between p-2.5 bg-[#111] border border-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg ${formData.color} flex items-center justify-center shadow-lg border border-white/5`}>
                                {formData.iconUrl ? (
                                    <img src={formData.iconUrl} className="w-5 h-5 object-contain" alt="Icon" />
                                ) : (
                                    <MainIconToRender size={18} className="text-white" />
                                )}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-200 leading-tight">Main Icon</div>
                                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Standard display</div>
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
                        <div className="flex flex-col gap-2 p-3 bg-[#111] border border-white/5 rounded-xl animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                                        {formData.heroIconName ? <MainIconToRender size={18} className="text-amber-500" /> : <Sparkles size={16} className="text-slate-600" />}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-200 leading-tight">Background Illustration</div>
                                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Enable decorative graphic</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={toggleHeroGraphic}
                                    className={`transition-colors duration-300 ${formData.heroIconName ? 'text-amber-500' : 'text-slate-600'}`}
                                >
                                    {formData.heroIconName ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                </button>
                            </div>

                            {/* Hero Config Panel */}
                            {formData.heroIconName && (
                                <div className="mt-2 pt-2 border-t border-white/5 space-y-2.5">
                                    
                                    {/* Color Palette Selection */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Color Tone</label>
                                        <div className="flex gap-2">
                                            {HERO_COLORS.map(color => (
                                                <button
                                                    key={color.value}
                                                    onClick={() => setFormData({...formData, heroColor: color.value})}
                                                    className={`
                                                        w-5 h-5 rounded-full border transition-all duration-300
                                                        ${formData.heroColor === color.value 
                                                            ? 'border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.3)]' 
                                                            : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}
                                                    `}
                                                    style={{ backgroundColor: color.value }}
                                                    title={color.label}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Visual Effect Mode */}
                                    <div className="flex items-center justify-between">
                                        <div className="text-[9px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
                                            <Sparkles size={10} /> Glow Effect
                                        </div>
                                        <button 
                                            onClick={() => setFormData({...formData, heroEffect: formData.heroEffect === 'glow' ? 'none' : 'glow'})}
                                            className={`transition-colors duration-300 ${formData.heroEffect === 'glow' ? 'text-amber-500' : 'text-slate-600'}`}
                                        >
                                            {formData.heroEffect === 'glow' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        {/* Scale */}
                                        <div className="space-y-0.5">
                                            <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold">
                                                <span className="flex items-center gap-1"><Maximize size={9} /> Scale</span>
                                                <span>{formData.heroScale}x</span>
                                            </div>
                                            <input 
                                                type="range" min="1" max="20" step="0.5"
                                                value={formData.heroScale}
                                                onChange={(e) => setFormData({...formData, heroScale: parseFloat(e.target.value)})}
                                                className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                            />
                                        </div>

                                        {/* Rotation */}
                                        <div className="space-y-0.5">
                                            <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold">
                                                <span className="flex items-center gap-1"><RotateCw size={9} /> Rotation</span>
                                                <span>{formData.heroRotation}°</span>
                                            </div>
                                            <input 
                                                type="range" min="-180" max="180" step="5"
                                                value={formData.heroRotation || 0}
                                                onChange={(e) => setFormData({...formData, heroRotation: parseInt(e.target.value)})}
                                                className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                            />
                                        </div>

                                        {/* Opacity */}
                                        <div className="space-y-0.5">
                                            <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold">
                                                <span className="flex items-center gap-1"><Droplets size={9} /> Opacity</span>
                                                <span>{formData.heroOpacity}%</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="100" step="5"
                                                value={formData.heroOpacity}
                                                onChange={(e) => setFormData({...formData, heroOpacity: parseInt(e.target.value)})}
                                                className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                            />
                                        </div>

                                        {/* Effect Intensity */}
                                        {formData.heroEffect === 'glow' ? (
                                            <div className="space-y-0.5 animate-in fade-in">
                                                <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold">
                                                    <span>Intensity</span>
                                                    <span>{formData.heroEffectIntensity}</span>
                                                </div>
                                                <input 
                                                    type="range" min="0" max="10" step="0.5"
                                                    value={formData.heroEffectIntensity || 5}
                                                    onChange={(e) => setFormData({...formData, heroEffectIntensity: parseFloat(e.target.value)})}
                                                    className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                                />
                                            </div>
                                        ) : <div />}

                                        {/* Offset X */}
                                        <div className="space-y-0.5">
                                            <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold">
                                                <span className="flex items-center gap-1"><Move size={9} /> Offset X</span>
                                                <span>{formData.heroOffsetX}</span>
                                            </div>
                                            <input 
                                                type="range" min="-150" max="150" step="5"
                                                value={formData.heroOffsetX}
                                                onChange={(e) => setFormData({...formData, heroOffsetX: parseInt(e.target.value)})}
                                                className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                            />
                                        </div>

                                        {/* Offset Y */}
                                        <div className="space-y-0.5">
                                            <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold">
                                                <span className="flex items-center gap-1"><Move size={9} className="rotate-90"/> Offset Y</span>
                                                <span>{formData.heroOffsetY}</span>
                                            </div>
                                            <input 
                                                type="range" min="-100" max="100" step="5"
                                                value={formData.heroOffsetY}
                                                onChange={(e) => setFormData({...formData, heroOffsetY: parseInt(e.target.value)})}
                                                className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
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
    </div>
  );
};