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
    <div className="rounded-2xl overflow-hidden border" style={{ background: 'var(--white)', borderColor: 'var(--cream2)' }}>
      <div className="relative">
        {menu.image_url ? (
          <img src={menu.image_url} alt={menu.name} className="w-full h-32 object-cover" />
        ) : (
          <div className="w-full h-32 flex items-center justify-center text-5xl"
            style={{ background: 'var(--cream2)' }}>
            {menu.categories?.name === 'Minuman' ? '🥤' :
             menu.categories?.name === 'Cemilan' ? '🍟' : '🍽️'}
          </div>
        )}
        <div className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'var(--white)', color: 'var(--brown)' }}>
          Rp {menu.price.toLocaleString('id-ID')}
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-bold text-sm" style={{ color: 'var(--text)' }}>{menu.name}</h3>
        {menu.description && (
          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{menu.description}</p>
        )}

        {menu.has_options && menu.menu_options?.length > 0 && (
          <div className="mt-2">
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Kepedasan:</p>
            <div className="flex gap-1 flex-wrap">
              {menu.menu_options.map(opt => (
                <button key={opt.id} onClick={() => setSelectedOption(opt.option_name)}
                  className="px-2 py-0.5 rounded-lg text-xs font-semibold transition-all border"
                  style={selectedOption === opt.option_name
                    ? { background: 'var(--brown-dark)', color: 'var(--cream)', borderColor: 'var(--brown-dark)' }
                    : { background: 'transparent', color: 'var(--brown)', borderColor: 'var(--brown-light)' }}>
                  {opt.option_name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 rounded-xl px-2 py-1"
            style={{ background: 'var(--cream)' }}>
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-5 h-5 flex items-center justify-center font-bold"
              style={{ color: 'var(--brown-dark)' }}>−</button>
            <span className="text-sm font-bold w-4 text-center" style={{ color: 'var(--text)' }}>{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)}
              className="w-5 h-5 flex items-center justify-center font-bold"
              style={{ color: 'var(--brown-dark)' }}>+</button>
          </div>
          <button onClick={handleAdd}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'var(--brown-dark)', color: 'var(--cream)' }}>
            + Tambah
          </button>
        </div>
      </div>
    </div>
  )
}