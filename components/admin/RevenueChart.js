'use client'

import { useState } from 'react'
import { Sparkles, TrendingUp } from 'lucide-react'

export default function RevenueChart({ weeklyData }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  // Default fallback if no data provided
  const data = weeklyData || [
    { day: 'Sen', amount: 1200000 },
    { day: 'Sel', amount: 1900000 },
    { day: 'Rab', amount: 1500000 },
    { day: 'Kam', amount: 2800000 },
    { day: 'Jum', amount: 2200000 },
    { day: 'Sab', amount: 3800000 },
    { day: 'Min', amount: 4500000 }
  ]

  const maxVal = Math.max(...data.map(d => d.amount), 1000000)
  
  // SVG Config
  const width = 600
  const height = 180
  const paddingLeft = 45
  const paddingRight = 20
  const paddingTop = 25
  const paddingBottom = 25

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  // Generate coordinates
  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * chartWidth
    const y = height - paddingBottom - (d.amount / maxVal) * chartHeight
    return { x, y, day: d.day, amount: d.amount }
  })

  // Create smooth SVG path string (Catmull-rom or nice Bezier approximation)
  let linePath = ''
  let areaPath = ''

  if (points.length > 0) {
    // Start curve
    linePath = `M ${points[0].x} ${points[0].y}`
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      // Control points for smooth bezier curve
      const cpX1 = p0.x + (p1.x - p0.x) / 2
      const cpY1 = p0.y
      const cpX2 = p0.x + (p1.x - p0.x) / 2
      const cpY2 = p1.y

      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`
    }

    // Area path closes at the bottom
    areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
  }

  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 space-y-4">
      {/* Header Info */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h4 className="text-xs font-black text-gray-500 tracking-wider uppercase flex items-center gap-1.5">
            TREND PENDAPATAN MINGGUAN <Sparkles size={13} className="text-[#DEFF9A]" />
          </h4>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-white">
              Rp {data.reduce((sum, d) => sum + d.amount, 0).toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/10 flex items-center gap-0.5">
              <TrendingUp size={10} /> +12.4%
            </span>
          </div>
        </div>

        {/* Legend stats indicator */}
        <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DEFF9A] inline-block shadow-[0_0_8px_rgba(222,255,154,0.5)]"></span>
            Omset Harian
          </div>
        </div>
      </div>

      {/* SVG Canvas Area Chart */}
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Definitions for Gradients & Filters */}
          <defs>
            {/* Stroke glow line gradient */}
            <linearGradient id="neonGlowGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#DEFF9A" />
              <stop offset="100%" stopColor="#80B236" />
            </linearGradient>

            {/* Area shadow filled gradient */}
            <linearGradient id="neonAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DEFF9A" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#DEFF9A" stopOpacity="0.0" />
            </linearGradient>

            {/* Neon glowing filter */}
            <filter id="neonFilter" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#DEFF9A" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Grid lines horizontal */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
            const y = paddingTop + r * chartHeight
            const gridVal = maxVal * (1 - r)
            return (
              <g key={idx}>
                {/* Horizontal dashed line */}
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#1E293B"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                {/* Left axis value label */}
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  fill="#475569"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  {gridVal >= 1000000 ? `${(gridVal / 1000000).toFixed(1)}M` : `${(gridVal / 1000).toFixed(0)}k`}
                </text>
              </g>
            )
          })}

          {/* Filled Area Chart */}
          <path d={areaPath} fill="url(#neonAreaGradient)" />

          {/* Glowing Stroke Curve Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#neonGlowGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#neonFilter)"
          />

          {/* Vertical trigger indicator lines on hover */}
          {hoveredIdx !== null && (
            <line
              x1={points[hoveredIdx].x}
              y1={paddingTop}
              x2={points[hoveredIdx].x}
              y2={height - paddingBottom}
              stroke="#DEFF9A"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.5"
            />
          )}

          {/* Chart Nodes Circles */}
          {points.map((p, idx) => {
            const isHovered = hoveredIdx === idx
            return (
              <g key={idx}>
                {/* Transparent wider target hit box for hover */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="14"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
                
                {/* Visual node circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#DEFF9A' : '#0F172A'}
                  stroke={isHovered ? '#0F172A' : '#DEFF9A'}
                  strokeWidth={isHovered ? 2 : 2.5}
                  className="transition-all duration-200 pointer-events-none"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 0 5px #DEFF9A)' : 'none'
                  }}
                />
              </g>
            )
          })}

          {/* X Axis Labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={height - paddingBottom + 16}
              fill={hoveredIdx === idx ? '#DEFF9A' : '#475569'}
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              className="transition-colors duration-200"
            >
              {p.day}
            </text>
          ))}
        </svg>

        {/* Hover Floating Tooltip HUD Card */}
        {hoveredIdx !== null && (
          <div
            className="absolute bg-[#0B0F19]/90 border border-[#DEFF9A]/30 text-white rounded-xl px-3 py-2 text-[11px] font-bold shadow-[0_0_15px_rgba(222,255,154,0.15)] pointer-events-none transition-all duration-150 z-10"
            style={{
              left: `${(points[hoveredIdx].x / width) * 100}%`,
              top: `${(points[hoveredIdx].y / height) * 100 - 32}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <p className="text-gray-400 text-[9px] uppercase tracking-wide">{data[hoveredIdx].day}day Sales</p>
            <p className="text-[#DEFF9A] text-xs font-black mt-0.5">
              Rp {data[hoveredIdx].amount.toLocaleString('id-ID')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
