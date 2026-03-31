import React from 'react'

export interface PlanetData {
  id: string;
  name: string;
  rashi: string;
  degree: string;
  nakshatra: string;
  pada: number;
  status?: string; // Retrograde, Combust, etc.
}

interface PlanetaryTableProps {
  planets: PlanetData[];
}

const PlanetaryTable: React.FC<PlanetaryTableProps> = ({ planets }) => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-amber-500/20 bg-slate-900/40 backdrop-blur-xl">
      <table className="w-full text-left border-collapse">
        <thead className="bg-amber-500/10">
          <tr>
            <th className="px-4 py-3 text-xs font-semibold text-amber-200 uppercase tracking-wider border-b border-amber-500/20">Planet</th>
            <th className="px-4 py-3 text-xs font-semibold text-amber-200 uppercase tracking-wider border-b border-amber-500/20">Sign</th>
            <th className="px-4 py-3 text-xs font-semibold text-amber-200 uppercase tracking-wider border-b border-amber-500/20">Degree</th>
            <th className="px-4 py-3 text-xs font-semibold text-amber-200 uppercase tracking-wider border-b border-amber-500/20">Nakshatra</th>
            <th className="px-4 py-3 text-xs font-semibold text-amber-200 uppercase tracking-wider border-b border-amber-500/20">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-amber-500/10">
          {planets.map((planet) => (
            <tr key={planet.id} className="hover:bg-amber-500/5 transition-colors group">
              <td className="px-4 py-3 text-sm font-medium text-white group-hover:text-amber-400">
                {planet.name}
              </td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {planet.rashi}
              </td>
              <td className="px-4 py-3 text-sm text-slate-300 font-mono">
                {planet.degree}
              </td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {planet.nakshatra} (P{planet.pada})
              </td>
              <td className="px-4 py-3 text-xs">
                {planet.status ? (
                  <span className={`px-2 py-0.5 rounded-full ${
                    planet.status.toLowerCase().includes('retro') 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {planet.status}
                  </span>
                ) : (
                  <span className="text-slate-500 italic">Direct</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PlanetaryTable
