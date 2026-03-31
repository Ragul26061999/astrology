import React from 'react'

export interface DashaPeriod {
  lord: string;
  start: string;
  end: string;
  duration: number;
}

interface DashaTimelineProps {
  dashas: DashaPeriod[];
}

const DashaTimeline: React.FC<DashaTimelineProps> = ({ dashas }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isCurrentDasha = (start: string, end: string) => {
    const now = new Date();
    return now >= new Date(start) && now <= new Date(end);
  };

  return (
    <div className="w-full space-y-3">
      <h3 className="text-amber-400 font-semibold mb-4 flex items-center gap-2">
         Vimshottari Dasha
      </h3>
      <div className="relative pl-6 border-l-2 border-amber-500/20 space-y-6">
        {dashas.map((dasha, idx) => {
          const active = isCurrentDasha(dasha.start, dasha.end);
          return (
            <div key={idx} className="relative">
              {/* Dot on the timeline */}
              <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-slate-950 ${
                active ? 'border-amber-400 scale-125 shadow-[0_0_10px_#fbbf24]' : 'border-amber-500/40'
              }`} />
              
              <div className={`p-4 rounded-xl transition-all ${
                active 
                  ? 'bg-amber-500/10 border border-amber-400/30' 
                  : 'bg-slate-900/40 border border-slate-700/30 opacity-70'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold text-lg ${active ? 'text-amber-400' : 'text-slate-200'}`}>
                    {dasha.lord} Mahadasha
                  </span>
                  {active && (
                    <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded uppercase tracking-tighter">
                      Current
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-end text-sm">
                  <div className="text-slate-400">
                    {formatDate(dasha.start)} — {formatDate(dasha.end)}
                  </div>
                  <div className="text-amber-400/60 font-mono text-xs">
                    {Math.round(dasha.duration)} Years
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DashaTimeline
