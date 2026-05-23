'use client'

import { BookOpen, Heart, Clock, User } from 'lucide-react'

export default function BottomNav({ activeTab, onChangeTab, badgeCount }) {
  const tabs = [
    { id: 'menu', label: 'Menu', icon: BookOpen },
    { id: 'favorites', label: 'Favorit', icon: Heart },
    { id: 'orders', label: 'Pesanan', icon: Clock },
    { id: 'profile', label: 'Profil', icon: User }
  ]

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[90%] max-w-[420px] bg-white/90 backdrop-blur-md shadow-lg border border-white/50 rounded-full px-4 py-2 z-40">
      <div className="flex justify-between items-center relative">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="flex flex-col items-center justify-center py-1.5 px-3 rounded-full relative transition-all duration-300 focus:outline-none"
              style={{
                color: isActive ? '#046A55' : '#8E8E8E'
              }}
            >
              {/* Highlight background on active tab */}
              {isActive && (
                <span className="absolute inset-0 bg-[#D7EFEA]/60 rounded-full scale-105 transition-all duration-300 -z-10"></span>
              )}
              
              <Icon size={20} className={`stroke-[2.2] transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-bold mt-1 tracking-wide">{tab.label}</span>

              {/* Badge for Order tab */}
              {tab.id === 'orders' && badgeCount > 0 && (
                <span className="absolute -top-1.5 -right-1 bg-red-500 text-white text-[9px] font-extrabold rounded-full w-4.5 h-4.5 flex items-center justify-center border-2 border-white">
                  {badgeCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
