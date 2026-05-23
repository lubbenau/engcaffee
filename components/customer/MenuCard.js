'use client'

import { Clock, Star, Plus } from 'lucide-react'

export default function MenuCard({ menu, onAddToCart }) {
  // Cooking time & rating fallback defaults
  const cookingTime = menu.cooking_time || '15 min'
  const rating = menu.rating || '4.8'

  return (
    <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-[#e8f5f2]/40 transition-transform duration-300 hover:-translate-y-1 flex flex-col justify-between h-full">
      {/* Menu Image */}
      <div className="relative w-full h-[130px] overflow-hidden">
        <img
          src={menu.image_url || 'https://placehold.co/300?text=' + encodeURIComponent(menu.name)}
          alt={menu.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://placehold.co/300?text=' + encodeURIComponent(menu.name)
          }}
        />
        
        {/* Spicy indicator if menu has options or🌶️ in name */}
        {menu.has_options && (
          <span className="absolute top-2.5 left-2.5 bg-red-50/90 backdrop-blur-sm text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
            🌶️ Bisa Pedas
          </span>
        )}
      </div>

      {/* Info Body */}
      <div className="p-3.5 flex flex-col flex-grow justify-between">
        <div>
          {/* Menu Name */}
          <h3 className="font-extrabold text-[14px] text-gray-900 leading-snug line-clamp-1">
            {menu.name}
          </h3>

          {/* Description */}
          {menu.description && (
            <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
              {menu.description}
            </p>
          )}

          {/* Time & Rating Metadata */}
          <div className="flex items-center gap-2.5 mt-2.5">
            <span className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold">
              <Clock size={11} className="text-gray-400 stroke-[2.2]" />
              {cookingTime}
            </span>
            <span className="flex items-center gap-0.5 text-[10px] text-orange-500 font-extrabold">
              <Star size={11} className="fill-orange-500 stroke-orange-500" />
              {rating}
            </span>
          </div>
        </div>

        {/* Bottom Price & Add Actions */}
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#F8FBFB]">
          <span className="font-extrabold text-[15px] text-[#046A55] tracking-tight">
            Rp {menu.price.toLocaleString('id-ID')}
          </span>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart(menu)
            }}
            className="w-8 h-8 rounded-full bg-[#EBF3F1] hover:bg-[#D7EFEA] text-[#046A55] flex items-center justify-center border-none cursor-pointer shadow-sm transition-colors duration-200 focus:outline-none"
          >
            <Plus size={16} className="stroke-[2.8]" />
          </button>
        </div>
      </div>
    </div>
  )
}
