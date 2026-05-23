'use client'

import { useState } from 'react'
import { Check, ClipboardList, Clock, Sparkles } from 'lucide-react'

export default function RealTimeFeed({ orders, onUpdateStatus }) {
  const getStatusBadge = (status) => {
    const config = {
      pending: { label: 'Pending', color: '#F5A623', bg: 'rgba(245, 166, 35, 0.1)' },
      confirmed: { label: 'Diproses', color: '#DEFF9A', bg: 'rgba(222, 255, 154, 0.1)' },
      done: { label: 'Selesai', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.1)' }
    }
    const cfg = config[status] || config.pending

    return (
      <span
        className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
        style={{ color: cfg.color, backgroundColor: cfg.bg }}
      >
        {cfg.label}
      </span>
    )
  }

  // Parse notes to display nicely
  const parseNotes = (noteStr) => {
    if (!noteStr) return { payment: 'Cash', level: '0', text: 'Tidak ada' }
    
    // Example format: 💰 Bayar: QRIS | 🌶️ Level 3 | Catatan: Tanpa bawang
    const parts = noteStr.split('|')
    let payment = 'Cash'
    let level = '0'
    let text = noteStr

    parts.forEach(part => {
      if (part.includes('💰')) {
        payment = part.replace(/💰\s*Bayar:\s*/, '').trim()
      } else if (part.includes('🌶️')) {
        level = part.replace(/🌶️\s*Level\s*/, '').trim()
      } else if (part.includes('Catatan:')) {
        text = part.replace(/Catatan:\s*/, '').trim()
      }
    })

    return { payment, level, text }
  }

  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 space-y-4">
      {/* Header title */}
      <div className="flex justify-between items-center pb-2">
        <h4 className="text-xs font-black text-gray-500 tracking-wider uppercase flex items-center gap-1.5">
          REAL-TIME FEED PESANAN <Sparkles size={13} className="text-[#DEFF9A] animate-pulse" />
        </h4>
        <span className="text-[10px] text-gray-400 font-bold bg-[#1E293B] px-3 py-1 rounded-full border border-gray-800">
          {orders.length} Pesanan Hari Ini
        </span>
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-bold text-gray-400">Belum ada pesanan masuk</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Sistem memantau tabel database Supabase...</p>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-black text-gray-500 uppercase tracking-wider">
                <th className="pb-3 pl-2">MEJA</th>
                <th className="pb-3">DRAFT ITEM</th>
                <th className="pb-3">PEMBAYARAN & LEVEL</th>
                <th className="pb-3">NOMINAL</th>
                <th className="pb-3">STATUS</th>
                <th className="pb-3 text-right pr-2">AKSI CEPAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-xs font-medium text-gray-300">
              {orders.slice(0, 10).map((order) => {
                const parsed = parseNotes(order.customer_note)
                const itemsCount = order.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0

                return (
                  <tr key={order.id} className="hover:bg-[#1E293B]/20 transition-all duration-200">
                    {/* Table Number */}
                    <td className="py-4 pl-2 font-black text-[#DEFF9A] text-sm">
                      Meja {order.table_number}
                    </td>

                    {/* Ordered items details */}
                    <td className="py-4 max-w-[200px]">
                      <div className="space-y-0.5">
                        <p className="font-bold text-white line-clamp-1">
                          {order.order_items?.map(i => `${i.quantity}x ${i.menu_name}`).join(', ') || 'No Items'}
                        </p>
                        <p className="text-[10px] text-gray-500 font-bold">
                          {itemsCount} item draf
                        </p>
                      </div>
                    </td>

                    {/* Custom Notes / Payment method */}
                    <td className="py-4">
                      <div className="space-y-1">
                        <div className="flex gap-2">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            parsed.payment === 'QRIS' ? 'bg-[#DEFF9A]/10 text-[#DEFF9A]' : 'bg-sky-500/10 text-sky-400'
                          }`}>
                            💳 {parsed.payment}
                          </span>
                          {parsed.level !== '0' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                              🌶️ Lvl {parsed.level}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 line-clamp-1 italic font-semibold">
                          Note: "{parsed.text}"
                        </p>
                      </div>
                    </td>

                    {/* Total Price */}
                    <td className="py-4 font-black text-white">
                      Rp {order.total_price.toLocaleString('id-ID')}
                    </td>

                    {/* Status badge */}
                    <td className="py-4">
                      {getStatusBadge(order.status)}
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 text-right pr-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'confirmed')}
                          className="bg-[#DEFF9A] hover:bg-[#c3ec79] text-[#0B0F19] font-black text-[10px] px-3.5 py-2 rounded-xl transition-all duration-300 border-none cursor-pointer"
                        >
                          PROSES 🍳
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'done')}
                          className="bg-[#38BDF8] hover:bg-sky-400 text-[#0B0F19] font-black text-[10px] px-3.5 py-2 rounded-xl transition-all duration-300 border-none cursor-pointer"
                        >
                          SELESAI ✅
                        </button>
                      )}
                      {order.status === 'done' && (
                        <span className="text-[10px] text-gray-600 font-bold block pr-4">
                          Selesai
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
