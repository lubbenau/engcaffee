'use client'

import { DollarSign, ShoppingBag, UtensilsCrossed } from 'lucide-react'

export default function StatCards({ revenue, ordersCount, activeTables }) {
  const cards = [
    {
      title: 'TOTAL REVENUE',
      value: `Rp ${revenue.toLocaleString('id-ID')}`,
      desc: 'Penjualan selesai hari ini',
      icon: DollarSign,
      color: '#DEFF9A',
      bgColor: 'rgba(222, 255, 154, 0.05)'
    },
    {
      title: 'TOTAL ORDERS',
      value: `${ordersCount} Pesanan`,
      desc: 'Volume transaksi masuk hari ini',
      icon: ShoppingBag,
      color: '#38BDF8',
      bgColor: 'rgba(56, 189, 248, 0.05)'
    },
    {
      title: 'MEJA AKTIF',
      value: `${activeTables} Meja`,
      desc: 'Meja dengan pesanan diproses',
      icon: UtensilsCrossed,
      color: '#FB7185',
      bgColor: 'rgba(251, 113, 133, 0.05)'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <div
            key={i}
            className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 flex items-center justify-between shadow-sm relative overflow-hidden transition-all duration-300 hover:border-[#334155]"
          >
            {/* Soft background glow */}
            <div
              className="absolute w-28 h-28 rounded-full -top-10 -right-10 opacity-10 filter blur-xl"
              style={{ backgroundColor: card.color }}
            />

            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-500 tracking-wider block uppercase">
                {card.title}
              </span>
              <h3
                className="text-2xl font-black tracking-tight"
                style={{ color: card.color }}
              >
                {card.value}
              </h3>
              <p className="text-xs text-gray-400 font-medium">{card.desc}</p>
            </div>

            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-105"
              style={{
                color: card.color,
                borderColor: `${card.color}20`,
                backgroundColor: card.bgColor
              }}
            >
              <Icon size={20} className="stroke-[2.2]" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
