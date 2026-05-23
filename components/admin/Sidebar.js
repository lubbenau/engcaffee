'use client'

import { LayoutDashboard, ShoppingCart, ChefHat, QrCode, TrendingUp, LogOut } from 'lucide-react'

export default function Sidebar({ activeTab, onSelectTab, onLogout }) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Real-time Orders', icon: ShoppingCart },
    { id: 'menu', label: 'Menu Management', icon: ChefHat },
    { id: 'qr-generator', label: 'Table QR Generator', icon: QrCode },
    { id: 'analytics', label: 'Sales Analytics', icon: TrendingUp }
  ]

  return (
    <aside className="w-68 bg-[#0B0F19] text-white flex flex-col justify-between border-r border-[#172237] h-screen sticky top-0 print:hidden flex-shrink-0 z-20">
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Brand Logo header */}
        <div className="px-6 py-7 border-b border-[#172237] flex items-center gap-3">
          <div className="w-10 h-10 bg-[#DEFF9A] rounded-xl flex items-center justify-center text-xl shadow-[0_0_15px_rgba(222,255,154,0.3)]">
            🍳
          </div>
          <div>
            <h2 className="font-extrabold text-base tracking-tight text-white">EngCaffee</h2>
            <p className="text-[10px] text-[#DEFF9A] font-black uppercase tracking-wider">Fintech Admin</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1.5 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left border-none cursor-pointer font-bold text-xs tracking-wide transition-all duration-300 ${
                  isActive
                    ? 'bg-[#1E293B] text-[#DEFF9A] shadow-md border-l-4 border-l-[#DEFF9A]'
                    : 'text-gray-400 hover:text-white hover:bg-[#111827]/40'
                }`}
              >
                <Icon size={16} className={`stroke-[2.2] ${isActive ? 'text-[#DEFF9A]' : 'text-gray-400'}`} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom section (Logout button) */}
      <div className="p-4 border-t border-[#172237]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left border-none cursor-pointer font-bold text-xs tracking-wide text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all duration-300"
        >
          <LogOut size={16} className="stroke-[2.2]" />
          Logout
        </button>
      </div>
    </aside>
  )
}
