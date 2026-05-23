'use client'

import QREngine from '@/components/admin/QREngine'
import Link from 'next/link'

export default function QRGeneratorPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation back home - Hidden on print */}
        <div className="flex justify-between items-center print:hidden">
          <Link
            href="/"
            className="text-xs font-black text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1 bg-[#1E293B] px-4 py-2.5 rounded-xl border border-gray-800"
          >
            ← KEMBALI KE HOME
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">🍳</span>
            <span className="text-xs font-black tracking-wider uppercase text-[#DEFF9A]">ENGCAFFEE SYSTEM</span>
          </div>
        </div>

        {/* Central QREngine Module */}
        <QREngine />

      </div>
    </div>
  )
}