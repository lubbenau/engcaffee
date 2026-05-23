'use client'

import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full shadow-sm">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cari menu favoritmu..."
        className="w-full bg-white text-gray-800 placeholder-gray-400 pl-12 pr-6 py-3.5 rounded-full border border-transparent focus:outline-none focus:border-[#046A55]/30 focus:ring-1 focus:ring-[#046A55]/30 transition-all duration-300 text-sm font-medium"
      />
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        <Search size={18} className="stroke-[2.5]" />
      </div>
    </div>
  )
}
