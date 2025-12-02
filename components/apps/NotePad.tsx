import React, { useState } from 'react';

export const NotePad: React.FC = () => {
  const [text, setText] = useState('Welcome to CloudOS Notes.\n\nType your thoughts here...');

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] rounded-xl overflow-hidden text-slate-300">
      <div className="bg-[#111] px-6 py-4 border-b border-white/5 flex justify-between items-center">
        <span className="font-serif text-lg tracking-wide text-slate-200">Notes</span>
        <div className="text-[10px] text-slate-600 uppercase tracking-widest">Local Storage</div>
      </div>
      <textarea
        className="flex-1 p-8 bg-[#0a0a0a] resize-none focus:outline-none font-mono text-sm leading-relaxed text-slate-300 selection:bg-amber-500/30 placeholder-slate-700"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
      />
    </div>
  );
};