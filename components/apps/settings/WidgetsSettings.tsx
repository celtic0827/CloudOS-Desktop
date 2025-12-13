import React, { useState, useEffect } from 'react';
import { ClockConfig, GridSize } from '../../../types';
import { WIDGET_REGISTRY } from '../../../constants';
import { AppWindow, MapPin, Globe, ChevronRight, Box, Columns, Rows, LayoutGrid, ToggleRight, ToggleLeft, Save, Check } from 'lucide-react';

interface WidgetsSettingsProps {
  activeWidgetIds: string[];
  clockConfig?: ClockConfig;
  onUpdateClockConfig?: (config: Partial<ClockConfig>) => void;
  onToggleWidget: (id: string, enabled: boolean) => void;
  initialWidgetId?: string | null;
}

// Common Timezones
const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Taipei', label: 'Taipei (CST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

export const WidgetsSettings: React.FC<WidgetsSettingsProps> = ({
  activeWidgetIds,
  clockConfig,
  onUpdateClockConfig,
  onToggleWidget,
  initialWidgetId
}) => {
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(initialWidgetId || null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  // Clock Form State
  const [clockForm, setClockForm] = useState<ClockConfig>(clockConfig || {
      label: 'Local', timezone: 'UTC', use24Hour: true, gridSize: '2x2'
  });

  useEffect(() => {
    if (clockConfig) {
        setClockForm(prev => ({...prev, ...clockConfig}));
    }
  }, [clockConfig]);

  useEffect(() => {
      if (initialWidgetId) setSelectedWidgetId(initialWidgetId);
  }, [initialWidgetId]);

  const handleSaveClock = () => {
    if (onUpdateClockConfig) {
        onUpdateClockConfig(clockForm);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleSelectWidget = (id: string) => {
    setSelectedWidgetId(id);
    if (id === 'clock-widget' && clockConfig) {
        setClockForm(clockConfig);
    }
  };

  return (
    <>
       {/* LEFT SIDEBAR: WIDGET LIST */}
       <div className="w-[240px] border-r border-white/5 flex flex-col bg-[#080808] shrink-0">
          <div className="p-3 border-b border-white/5 bg-[#0a0a0a]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Available Widgets</span>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-2">
              {Object.values(WIDGET_REGISTRY).map(widget => {
                  const isEnabled = activeWidgetIds.includes(widget.id);
                  const isSelected = selectedWidgetId === widget.id;
                  
                  return (
                      <div 
                          key={widget.id}
                          onClick={() => handleSelectWidget(widget.id)}
                          className={`
                              p-3 rounded-xl border transition-all cursor-pointer group
                              ${isSelected ? 'bg-white/5 border-amber-500/30' : 'bg-[#0a0a0a] border-white/5 hover:border-white/10'}
                          `}
                      >
                          <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-amber-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                                      <widget.icon size={14} />
                                  </div>
                                  <span className={`text-xs font-bold ${isSelected ? 'text-amber-100' : 'text-slate-300'}`}>{widget.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                  <button 
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          onToggleWidget(widget.id, !isEnabled);
                                      }}
                                      className={`
                                          relative w-8 h-4 rounded-full transition-colors duration-300
                                          ${isEnabled ? 'bg-amber-600' : 'bg-slate-700'}
                                      `}
                                  >
                                      <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                  </button>
                              </div>
                          </div>
                          <div className="text-[10px] text-slate-500 leading-tight">
                              {widget.description}
                          </div>
                      </div>
                  );
              })}
          </div>
       </div>

       {/* RIGHT PANEL: WIDGET CONFIG */}
       <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#050505] relative">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

           {selectedWidgetId === 'clock-widget' ? (
               <div className="flex flex-col h-full relative z-10">
                  <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                       <div>
                            <h3 className="text-xl font-serif text-amber-50 tracking-wide">Clock Configuration</h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Customize system time display</p>
                       </div>
                  </div>

                  <div className="flex-1 p-6 flex flex-col gap-6 max-w-lg overflow-y-auto scrollbar-hide">
                      {/* Clock: Location Label */}
                      <div className="group relative">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Display Label</label>
                          <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors">
                                  <MapPin size={14} />
                              </div>
                              <input 
                              type="text" 
                              value={clockForm.label}
                              onChange={e => setClockForm({...clockForm, label: e.target.value})}
                              className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:bg-[#151515] transition-all placeholder:text-slate-700"
                              placeholder="e.g. Los Angeles"
                              />
                          </div>
                      </div>

                      {/* Clock: Timezone */}
                      <div className="group relative">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Time Zone</label>
                          <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                  <Globe size={14} />
                              </div>
                              <select 
                                  value={clockForm.timezone}
                                  onChange={e => setClockForm({...clockForm, timezone: e.target.value})}
                                  className="w-full appearance-none bg-[#0f0f0f] border border-white/10 rounded-xl pl-9 pr-8 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:bg-[#151515] transition-all"
                              >
                                  <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>System Default</option>
                                  <hr className="bg-white/10" />
                                  {TIMEZONES.map(tz => (
                                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                                  ))}
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                  <ChevronRight size={14} className="rotate-90" />
                              </div>
                          </div>
                      </div>

                       {/* Clock: Grid Size Selector */}
                       <div className="group relative">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Widget Layout</label>
                          <div className="grid grid-cols-4 gap-2">
                              {[
                                  { id: '1x1', label: '1x1', icon: Box },
                                  { id: '2x1', label: '2x1', icon: Columns },
                                  { id: '1x2', label: '1x2', icon: Rows },
                                  { id: '2x2', label: '2x2', icon: LayoutGrid },
                              ].map(opt => (
                                  <button
                                      key={opt.id}
                                      onClick={() => setClockForm({...clockForm, gridSize: opt.id as GridSize})}
                                      className={`
                                          flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200
                                          ${clockForm.gridSize === opt.id 
                                              ? 'bg-amber-600/20 border-amber-500 text-amber-500' 
                                              : 'bg-[#0f0f0f] border-white/10 text-slate-500 hover:bg-white/5 hover:text-slate-300'}
                                      `}
                                  >
                                      <opt.icon size={18} />
                                      <span className="text-[10px] font-bold">{opt.label}</span>
                                  </button>
                              ))}
                          </div>
                       </div>
                      
                      {/* Clock: 24h Toggle */}
                      <div className="flex items-center justify-between bg-[#0f0f0f] border border-white/10 rounded-xl p-4">
                          <div>
                              <div className="text-sm font-bold text-slate-200">24-Hour Clock</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">Format: 14:30 vs 2:30 PM</div>
                          </div>
                          <button 
                              onClick={() => setClockForm({...clockForm, use24Hour: !clockForm.use24Hour})}
                              className={`transition-colors duration-300 ${clockForm.use24Hour ? 'text-amber-500' : 'text-slate-600'}`}
                          >
                              {clockForm.use24Hour ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                          </button>
                      </div>
                  </div>

                   <div className="p-4 border-t border-white/5 flex justify-end gap-3 bg-[#080808] shrink-0">
                     <button 
                        onClick={handleSaveClock} 
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
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                      <AppWindow size={24} className="opacity-50" />
                  </div>
                  <h3 className="text-base font-serif text-slate-400 tracking-wide">
                      {selectedWidgetId ? 'Configuration not available' : 'Select a widget'}
                  </h3>
                  {selectedWidgetId && (
                       <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest">This widget has no settings.</p>
                  )}
              </div>
           )}
       </div>
    </>
  );
};