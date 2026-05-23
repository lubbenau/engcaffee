'use client'

import { useEffect, useState } from 'react'
import { Bell, Wifi, Clock, UserCheck } from 'lucide-react'

export default function Header({ activeTabLabel, orderCount }) {
  const [time, setTime] = useState('')

  useEffect(() => {
    setTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))
    }, 15000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="h-20 bg-[#0B0F19] border-b border-[#172237] px-8 flex justify-between items-center sticky top-0 z-10 print:hidden flex-shrink-0">
      {/* Title */}
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">{activeTabLabel}</h1>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">EngCaffee Control Room</p>
      </div>

      {/* Admin Utilities */}
      <div className="flex items-center gap-6">
        {/* Connection status */}
        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/20 px-3 py-1.5 rounded-full border border-emerald-500/20 text-[10px] font-bold tracking-wide">
          <Wifi size={12} className="animate-pulse" />
          SUPABASE LIVE
        </div>

        {/* Local time */}
        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold">
          <Clock size={14} />
          {time}
        </div>

        {/* Notifications Alert icon */}
        <div className="relative cursor-pointer text-gray-400 hover:text-white transition-colors duration-200">
          <Bell size={18} className="stroke-[2.2]" />
          {orderCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#DEFF9A] text-[#0B0F19] text-[8px] font-black rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-[0_0_10px_rgba(222,255,154,0.5)]">
              {orderCount}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-6 bg-[#172237]" />

        {/* Admin profile detail */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-black text-white">Adam Bajaber</p>
            <p className="text-[9px] text-[#DEFF9A] font-bold">System Architect</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#DEFF9A] to-[#80B236] text-[#0B0F19] font-black flex items-center justify-center text-sm shadow-[0_0_10px_rgba(222,255,154,0.2)]">
            AB
          </div>
        </div>
      </div>
    </header>
  )
}
