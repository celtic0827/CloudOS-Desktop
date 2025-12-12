import React from 'react';
import { AppConfig } from '../../../../types';
import { ICON_LIBRARY } from '../../../../constants';
import { Globe, Plus } from 'lucide-react';

interface AppListSidebarProps {
  userApps: AppConfig[];
  selectedAppId: string | null;
  onSelectApp: (app: AppConfig) => void;
  onStartAdd: () => void;
}

export const AppListSidebar: React.FC<AppListSidebarProps> = ({
  userApps,
  selectedAppId,
  onSelectApp,
  onStartAdd
}) => {
  return (
    <div className="w-[260px] border-r border-white/5 flex flex-col bg-[#080808] shrink-0">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]">
         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">My Shortcuts</span>
         <button 
            onClick={onStartAdd}
            className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-white transition-all shadow-sm"
            title="Add New App"
         >
            <Plus size={16} />
         </button>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-1">
         {userApps.map(app => {
            const isActive = selectedAppId === app.id;
            const AppIcon = app.iconName && ICON_LIBRARY[app.iconName] ? ICON_LIBRARY[app.iconName] : Globe;
            
            return (
               <button
                  key={app.id}
                  onClick={() => onSelectApp(app)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group text-left border ${
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
  );
};