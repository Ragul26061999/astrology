'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface KundaliProps {
  houses: Record<number, { rashi: number; planets: string[] }>;
  title?: string;
}

/**
 * North Indian Style Chart (Diamond Chart)
 * Houses are fixed, Rashi numbers change.
 * House 1 is the top-center diamond.
 */
const KundaliChart: React.FC<KundaliProps> = ({ houses, title = "D1 Birth Chart" }) => {
  // SVG Coordinates for a 400x400 chart
  const size = 400;
  
  // Define house paths/centers for labeling
  const housePoints = [
    { id: 1, center: [200, 130] }, // Top Diamond
    { id: 2, center: [130, 60] },  // Left Top Triangle
    { id: 3, center: [60, 130] },  // Left Triangle
    { id: 4, center: [130, 200] }, // Left Diamond
    { id: 5, center: [60, 270] },  // Left Bottom Triangle
    { id: 6, center: [130, 340] }, // Bottom Top Triangle
    { id: 7, center: [200, 270] }, // Bottom Diamond
    { id: 8, center: [270, 340] }, // Bottom Right Triangle
    { id: 9, center: [340, 270] }, // Right Triangle
    { id: 10, center: [270, 200] }, // Right Diamond
    { id: 11, center: [340, 130] }, // Right Top Triangle
    { id: 12, center: [270, 60] },  // Right Top Diamond-ish
  ];

  // Map planets to short codes
  const PLANET_CODES: Record<string, string> = {
    sun: "Su", moon: "Mo", mars: "Ma", mercury: "Me", 
    jupiter: "Ju", venus: "Ve", saturn: "Sa", rahu: "Ra", ketu: "Ke"
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-amber-400 font-semibold mb-4 text-lg">{title}</h3>
      <div className="relative w-full max-w-[400px] aspect-square">
        <svg 
          viewBox={`0 0 ${size} ${size}`} 
          className="w-full h-full drop-shadow-[0_0_15px_rgba(251,191,36,0.1)]"
        >
          {/* Main Outer Square */}
          <rect 
            x="10" y="10" width="380" height="380" 
            fill="none" stroke="#fbbf24" strokeWidth="2" 
          />
          
          {/* Diagonals */}
          <line x1="10" y1="10" x2="390" y2="390" stroke="#fbbf24" strokeWidth="1.5" />
          <line x1="390" y1="10" x2="10" y2="390" stroke="#fbbf24" strokeWidth="1.5" />
          
          {/* Inner Diamond */}
          <path 
            d="M200 10 L390 200 L200 390 L10 200 Z" 
            fill="none" stroke="#fbbf24" strokeWidth="1.5" 
          />

          {/* Render Houses */}
          {Object.entries(houses).map(([hId, data]) => {
            const hNum = parseInt(hId);
            const pos = housePoints[hNum - 1];
            if (!pos) return null;

            return (
              <g key={hId}>
                {/* Rashi Number (Small, corner) */}
                <text 
                  x={pos.center[0]} 
                  y={pos.center[1] - 15} 
                  fill="#f59e0b" 
                  fontSize="12" 
                  textAnchor="middle" 
                  fontWeight="bold"
                >
                  {data.rashi}
                </text>

                {/* Planets (Centered) */}
                <text 
                  x={pos.center[0]} 
                  y={pos.center[1] + 10} 
                  fill="white" 
                  fontSize="14" 
                  textAnchor="middle" 
                  className="font-medium"
                >
                  {data.planets.map(p => PLANET_CODES[p.toLowerCase()] || p).join(' ')}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export default KundaliChart
