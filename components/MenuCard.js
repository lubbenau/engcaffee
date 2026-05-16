'use client'
import { useState } from 'react'

export default function MenuCard({ menu, onAddToCart }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOption, setSelectedOption] = useState('')

  function handleAdd() {
    if (menu.has_options && !selectedOption) {
      alert('Pilih opsi terlebih dahulu!')
      return
    }
    onAddToCart({
      id: menu.id,
      name: menu.name,
      price: menu.price,
      quantity,
      selectedOption: selectedOption || null
    })
    setQuantity(1)
    setSelectedOption('')
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{menu.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{menu.description}</p>
          <p className="text-orange-500 font-bold mt-1">
            Rp {menu.price.toLocaleString('id-ID')}
          </p>
        </div>
        {menu.image_url && (
          <img
            src={menu.image_url}
            alt={menu.name}
            className="w-20 h-20 object-cover rounded-xl ml-3"
          />
        )}
      </div>

      {/* Opsi (pedas/sedang/tidak pedas) */}
      {menu.has_options && menu.menu_options?.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-1.5">Pilih opsi:</p>
          <div className="flex gap-2 flex-wrap">
            {menu.menu_options.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelectedOption(opt.option_name)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  selectedOption === opt.option_name
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                {opt.option_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity & Add Button */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center"
          >−</button>
          <span className="font-medium w-4 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center"
          >+</button>
        </div>
        <button
          onClick={handleAdd}
          className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-medium"
        >
          + Tambah
        </button>
      </div>
    </div>
  )
}