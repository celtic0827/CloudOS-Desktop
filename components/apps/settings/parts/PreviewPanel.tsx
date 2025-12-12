import React from 'react';
import { AppConfig, GridSize } from '../../../../types';
import { DropZoneWidget, StatusWidget } from '../../../widgets/HeroWidgets';
import { Palette } from 'lucide-react';

interface PreviewPanelProps {
  formData: AppConfig;
  setFormData: React.Dispatch<React.SetStateAction<AppConfig>>;
  MainIconToRender: any;
  HeroIconToRender: any;
}

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

const COLORS = [
  'bg-slate-900', 'bg-slate-700', 'bg-zinc-900', 'bg-zinc-700', 'bg-stone-800', 'bg-neutral-800',
  'bg-red-950', 'bg-red-700', 'bg-rose-900', 'bg-rose-800', 'bg-rose-600', 'bg-orange-800',
  'bg-amber-900', 'bg-amber-800', 'bg-amber-600', 'bg-yellow-700', 'bg-lime-800',
  'bg-green-800', 'bg-emerald-900', 'bg-emerald-700', 'bg-emerald-600', 'bg-teal-800', 'bg-teal-600',
  'bg-cyan-900', 'bg-cyan-700', 'bg-sky-900', 'bg-sky-700', 'bg-blue-900', 'bg-blue-800',
  'bg-indigo-900', 'bg-indigo-700', 'bg-indigo-600', 'bg-violet-900', 'bg-violet-700', 'bg-violet-600',
  'bg-purple-900', 'bg-purple-700', 'bg-fuchsia-900', 'bg-fuchsia-700', 'bg-pink-900', 'bg-pink-700', 'bg-rose-700'
];

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  formData,
  setFormData,
  MainIconToRender,
  HeroIconToRender
}) => {
  const previewDim = getPreviewDimensions(formData.gridSize || '1x1');

  return (
    <div className="col-span-5 flex flex-col gap-4 min-h-0">
         
        {/* Live Preview (Fixed Dimensions / Scrolling) */}
        <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-2xl flex flex-col relative overflow-hidden min-h-[250px]">
            <div className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 z-20">Live Preview</div>
            
            {/* Scrollable Area for Fixed Content */}
            <div className="w-full h-full overflow-auto flex items-center justify-center p-6 custom-scrollbar relative z-10">
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
                            
                            {/* Wrapper for Icon & Glow */}
                            <div className="relative mb-3">
                                {/* Glow Layer (Updated to match Desktop) */}
                                <div className={`
                                    absolute inset-0 rounded-2xl ${formData.color}
                                    blur-xl opacity-0 group-hover:opacity-60 
                                    transition-all duration-500 scale-110 group-hover:scale-125
                                    brightness-150 saturate-150
                                `} />

                                {/* Icon Box */}
                                <div className={`
                                    relative w-12 h-12 rounded-2xl flex items-center justify-center 
                                    ${formData.color} shadow-lg relative z-10
                                    group-hover:scale-110 transition-transform duration-300
                                    border border-white/10 overflow-hidden
                                `}>
                                    {formData.iconUrl ? (
                                        <img src={formData.iconUrl} alt="Preview" className="w-6 h-6 object-contain" />
                                    ) : (
                                        <MainIconToRender size={24} className="text-white" />
                                    )}
                                </div>
                            </div>

                            <span className="text-xs font-medium text-slate-300 truncate w-full text-center px-2 relative z-10">{formData.name || 'App Name'}</span>
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
                                    color: formData.heroColor,
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
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 shrink-0">
            <div className="flex items-center gap-2 text-slate-400 mb-3">
                <Palette size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Theme Color</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
                {COLORS.map(c => (
                <button
                    key={c}
                    onClick={() => setFormData({...formData, color: c})}
                    className={`w-7 h-7 rounded-full ${c} ${formData.color === c ? 'ring-2 ring-amber-500 scale-110 shadow-lg' : 'opacity-40 hover:opacity-100'} transition-all`}
                    title={c.replace('bg-', '')}
                />
                ))}
            </div>
        </div>
    </div>
  );
};