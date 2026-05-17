'use client'
import { useState } from 'react'

export default function MenuCard({ menu, onAddToCart }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOption, setSelectedOption] = useState('')

  function handleAdd() {
    if (menu.has_options && !selectedOption) {
      alert('Pilih tingkat kepedasan dulu!')
      return
    }
    onAddToCart({ id: menu.id, name: menu.name, price: menu.price, quantity, selectedOption: selectedOption || null })
    setQuantity(1)
    setSelectedOption('')
  }

  return (
    <div className="glass rounded-[2.5rem] p-3 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      {/* Container Gambar */}
      <div className="relative h-36 w-full rounded-[2rem] overflow-hidden bg-[#EDE5D8] group">
        {menu.image_url ? (
          <img src={menu.image_url} alt={menu.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {menu.categories?.name === 'Minuman' ? '🥤' : '🍽️'}
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full shadow-sm text-[11px] font-bold text-[#8B6347]">
          Rp {menu.price.toLocaleString('id-ID')}
        </div>
      </div>

      <div className="mt-3 px-1">
        <h3 className="font-extrabold text-sm text-[#2C1A0E] line-clamp-1">{menu.name}</h3>
        <p className="text-[10px] text-[#8B7355] line-clamp-1 mt-0.5 italic">{menu.description}</p>

        {/* Opsi Kepedasan ala Bento */}
        {menu.has_options && (
          <div className="mt-3 space-y-1.5">
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {menu.menu_options.map(opt => (
                <button 
                  key={opt.id} 
                  onClick={() => setSelectedOption(opt.option_name)}
                  className={`px-3 py-1 rounded-full text-[9px] font-bold border transition-all whitespace-nowrap
                    ${selectedOption === opt.option_name 
                      ? 'bg-[#5C3D2E] text-white border-[#5C3D2E]' 
                      : 'bg-white/50 text-[#8B6347] border-[#C4A882]/30'}`}
                >
                  {opt.option_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Counter & Button */}
        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="flex items-center bg-[#EDE5D8]/50 rounded-2xl p-1">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-7 h-7 flex items-center justify-center text-[#5C3D2E] font-bold">-</button>
            <span className="text-xs font-bold w-4 text-center">{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)} className="w-7 h-7 flex items-center justify-center text-[#5C3D2E] font-bold">+</button>
          </div>
          <button 
            onClick={handleAdd}
            className="flex-1 bg-[#3B2314] text-[#F5F0E8] py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all"
          >
            Tambah +
          </button>
        </div>
      </div>
    </div>
  )
}