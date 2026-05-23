'use client'

import { Lightbulb, DollarSign, Award, Percent } from 'lucide-react'

export default function QuickInsights({ orders }) {
  // 1. Calculate Average Order Value (AOV)
  const completedOrders = orders.filter(o => o.status === 'done')
  const totalRev = completedOrders.reduce((sum, o) => sum + o.total_price, 0)
  const aov = completedOrders.length > 0 ? Math.round(totalRev / completedOrders.length) : 0

  // 2. Active Table counting
  const tableCounts = {}
  orders.forEach(o => {
    tableCounts[o.table_number] = (tableCounts[o.table_number] || 0) + 1
  })
  const topTable = Object.keys(tableCounts).length > 0
    ? Object.keys(tableCounts).reduce((a, b) => tableCounts[a] > tableCounts[b] ? a : b)
    : 'None'

  // 3. Status breakdown
  const pendingCount = orders.filter(o => o.status === 'pending').length
  const confirmedCount = orders.filter(o => o.status === 'confirmed').length
  const completionRate = orders.length > 0 
    ? Math.round((completedOrders.length / orders.length) * 100) 
    : 100

  const insights = [
    {
      title: 'AVERAGE TRANSACTION VALUE',
      value: aov > 0 ? `Rp ${aov.toLocaleString('id-ID')}` : 'Rp 0',
      desc: 'Rata-rata nilai transaksi pelanggan',
      icon: DollarSign,
      color: '#DEFF9A'
    },
    {
      title: 'MEJA TERAKTIF HARI INI',
      value: topTable !== 'None' ? `Meja ${topTable}` : 'Belum Ada',
      desc: `${topTable !== 'None' ? tableCounts[topTable] : 0} kali memesan hari ini`,
      icon: Award,
      color: '#38BDF8'
    },
    {
      title: 'COMPLETION RATE',
      value: `${completionRate}%`,
      desc: `${pendingCount} pending, ${confirmedCount} proses aktif`,
      icon: Percent,
      color: '#FB7185'
    }
  ]

  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 space-y-5">
      {/* Title */}
      <div className="flex justify-between items-center pb-2">
        <h4 className="text-xs font-black text-gray-500 tracking-wider uppercase flex items-center gap-1.5">
          QUICK INSIGHTS <Lightbulb size={14} className="text-[#DEFF9A]" />
        </h4>
        <span className="text-[10px] text-gray-400 font-bold bg-[#1E293B] px-3 py-1 rounded-full border border-gray-800">
          AI Wawasan
        </span>
      </div>

      {/* Grid listing */}
      <div className="space-y-4">
        {insights.map((ins, i) => {
          const Icon = ins.icon
          return (
            <div key={i} className="flex gap-4 items-center">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0"
                style={{
                  color: ins.color,
                  borderColor: `${ins.color}20`,
                  backgroundColor: 'rgba(255, 255, 255, 0.02)'
                }}
              >
                <Icon size={16} />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider block">
                  {ins.title}
                </span>
                <p className="text-sm font-black text-white">{ins.value}</p>
                <p className="text-[10px] text-gray-400 font-medium">{ins.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
