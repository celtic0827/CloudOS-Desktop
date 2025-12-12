import React from 'react';
import { AppConfig } from '../../../../types';
import { RefreshCcw } from 'lucide-react';

interface AppFormHeaderProps {
  formData: AppConfig;
  setFormData: React.Dispatch<React.SetStateAction<AppConfig>>;
  onAutoFetchIcon: () => void;
}

export const AppFormHeader: React.FC<AppFormHeaderProps> = ({
  formData,
  setFormData,
  onAutoFetchIcon
}) => {
  return (
    <div className="flex gap-4 mb-1 shrink-0">
         <div className="w-1/4">
            <label className="text-[9px] font-bold uppercase tracking-widest text-amber-500/80 mb-1 block">Name</label>
            <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:bg-[#151515] transition-all placeholder:text-slate-700"
                placeholder="App Name"
            />
         </div>
         <div className="w-2/5">
            <label className="text-[9px] font-bold uppercase tracking-widest text-amber-500/80 mb-1 block">URL</label>
            <div className="relative">
                <input 
                    type="text" 
                    value={formData.url}
                    onChange={e => setFormData({...formData, url: e.target.value})}
                    onBlur={onAutoFetchIcon}
                    className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl pl-3 pr-8 py-1.5 text-sm font-mono text-amber-500/90 focus:outline-none focus:border-amber-500/50 focus:bg-[#151515] transition-all placeholder:text-slate-700"
                    placeholder="https://..."
                />
                <button 
                    onClick={onAutoFetchIcon}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-amber-400 p-1 rounded-md hover:bg-white/5 transition-colors"
                    title="Auto-fetch Favicon"
                >
                    <RefreshCcw size={12} />
                </button>
            </div>
         </div>
         <div className="flex-1">
            <label className="text-[9px] font-bold uppercase tracking-widest text-amber-500/80 mb-1 block">Description</label>
            <input 
                type="text" 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-amber-500/50 focus:bg-[#151515] transition-all placeholder:text-slate-700"
                placeholder="Optional"
            />
         </div>
     </div>
  );
};