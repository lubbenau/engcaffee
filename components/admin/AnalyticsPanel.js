'use client'

import { useState } from 'react'
import { TrendingUp, Calendar, DollarSign, ShoppingCart, Percent, Sparkles } from 'lucide-react'

export default function AnalyticsPanel({ orders }) {
  const [filterRange, setFilterRange] = useState('weekly') // daily, weekly, monthly

  const completedOrders = orders.filter(o => o.status === 'done')

  // Helper dates
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const sevenDaysAgo = todayStart - 7 * 24 * 60 * 60 * 1000
  const thirtyDaysAgo = todayStart - 30 * 24 * 60 * 60 * 1000

  // 1. Aggregate Calculations
  // A. Daily (Today)
  const todayOrders = completedOrders.filter(o => new Date(o.created_at).getTime() >= todayStart)
  const dailyRevenue = todayOrders.reduce((sum, o) => sum + o.total_price, 0)

  // B. Weekly (7 Days)
  const weeklyOrders = completedOrders.filter(o => new Date(o.created_at).getTime() >= sevenDaysAgo)
  const weeklyRevenue = weeklyOrders.reduce((sum, o) => sum + o.total_price, 0)

  // C. Monthly (30 Days)
  const monthlyOrders = completedOrders.filter(o => new Date(o.created_at).getTime() >= thirtyDaysAgo)
  const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.total_price, 0)

  // 2. Average Order Value
  const dailyAOV = todayOrders.length > 0 ? Math.round(dailyRevenue / todayOrders.length) : 0
  const weeklyAOV = weeklyOrders.length > 0 ? Math.round(weeklyRevenue / weeklyOrders.length) : 0
  const monthlyAOV = monthlyOrders.length > 0 ? Math.round(monthlyRevenue / monthlyOrders.length) : 0

  // 3. Weekly chart data grouping (last 7 days including today)
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const chartData = []
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(now.getDate() - i)
    const dayName = daysOfWeek[d.getDay()]
    const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const dEnd = dStart + 24 * 60 * 60 * 1000

    const dayOrders = completedOrders.filter(o => {
      const t = new Date(o.created_at).getTime()
      return t >= dStart && t < dEnd
    })

    const daySales = dayOrders.reduce((sum, o) => sum + o.total_price, 0)
    chartData.push({ day: dayName, amount: daySales, count: dayOrders.length })
  }

  // Chart plotting helper coordinates
  const maxSales = Math.max(...chartData.map(c => c.amount), 500000)
  const svgWidth = 500
  const svgHeight = 150
  const padLeft = 40
  const padBottom = 20
  const w = svgWidth - padLeft
  const h = svgHeight - padBottom

  return (
    <div className="space-y-6">
      {/* Quick Summary Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Stats */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-bold text-gray-500">
            <span>PENJUALAN HARI INI</span>
            <Calendar size={14} className="text-[#DEFF9A]" />
          </div>
          <h3 className="text-xl font-black text-[#DEFF9A] tracking-tight">
            Rp {dailyRevenue.toLocaleString('id-ID')}
          </h3>
          <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold">
            <span>{todayOrders.length} Transaksi Sukses</span>
            <span>AOV: Rp {dailyAOV.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-bold text-gray-500">
            <span>PENJUALAN MINGGU INI (7D)</span>
            <TrendingUp size={14} className="text-sky-400" />
          </div>
          <h3 className="text-xl font-black text-sky-400 tracking-tight">
            Rp {weeklyRevenue.toLocaleString('id-ID')}
          </h3>
          <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold">
            <span>{weeklyOrders.length} Transaksi Sukses</span>
            <span>AOV: Rp {weeklyAOV.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-bold text-gray-500">
            <span>PENJUALAN BULAN INI (30D)</span>
            <Sparkles size={14} className="text-rose-400" />
          </div>
          <h3 className="text-xl font-black text-rose-400 tracking-tight">
            Rp {monthlyRevenue.toLocaleString('id-ID')}
          </h3>
          <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold">
            <span>{monthlyOrders.length} Transaksi Sukses</span>
            <span>AOV: Rp {monthlyAOV.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Main Aggregation Graph Panel */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h4 className="text-xs font-black text-gray-500 tracking-wider uppercase flex items-center gap-1.5">
              GRAFIK DISTRIBUSI PENDAPATAN 7 HARI TERAKHIR
            </h4>
            <p className="text-[10px] text-gray-400 font-bold">
              Rata-rata penjualan harian selesai
            </p>
          </div>
        </div>

        {/* Custom SVG Columns Chart */}
        <div className="w-full">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
            {/* Grid dashes */}
            {[0, 0.5, 1].map((r, i) => {
              const y = r * h
              return (
                <line
                  key={i}
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth}
                  y2={y}
                  stroke="#1E293B"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              )
            })}

            {/* Render Bars */}
            {chartData.map((d, i) => {
              const colW = 32
              const spacing = (w - colW * chartData.length) / (chartData.length - 1)
              const x = padLeft + i * (colW + spacing)
              const barH = (d.amount / maxSales) * h
              const y = h - barH

              return (
                <g key={i} className="group cursor-pointer">
                  {/* Backdrop column border highlight on hover */}
                  <rect
                    x={x - 4}
                    y={0}
                    width={colW + 8}
                    height={h}
                    fill="rgba(255,255,255,0.02)"
                    rx="6"
                    className="opacity-0 hover:opacity-100 transition-opacity duration-200"
                  />
                  
                  {/* Visual data bar column */}
                  <rect
                    x={x}
                    y={y}
                    width={colW}
                    height={Math.max(barH, 4)}
                    fill={d.amount > 0 ? 'url(#barGradient)' : '#1E293B'}
                    rx="6"
                    className="transition-all duration-300"
                  />

                  {/* Value count above column */}
                  {d.amount > 0 && (
                    <text
                      x={x + colW / 2}
                      y={y - 6}
                      fill="#DEFF9A"
                      fontSize="8"
                      fontWeight="black"
                      textAnchor="middle"
                    >
                      {d.count}x
                    </text>
                  )}

                  {/* X Axis labels */}
                  <text
                    x={x + colW / 2}
                    y={h + 14}
                    fill="#475569"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {d.day}
                  </text>
                </g>
              )
            })}

            {/* Gradient definition for bars */}
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DEFF9A" />
                <stop offset="100%" stopColor="#80B236" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  )
}
