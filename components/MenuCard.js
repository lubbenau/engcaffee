'use client'
import { useState } from 'react'

const C = {
  cream: '#F5F0E8',
  cream2: '#EDE5D8',
  brownLight: '#C4A882',
  brown: '#8B6347',
  brownDark: '#5C3D2E',
  brownDeep: '#3B2314',
  text: '#2C1A0E',
  textMuted: '#8B7355',
  white: '#FDFAF6',
}

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
    <div style={{ background: C.white, borderRadius: '16px', border: `0.5px solid ${C.cream2}`, overflow: 'hidden' }}>
      {/* Image */}
      {menu.image_url ? (
        <img src={menu.image_url} alt={menu.name} style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '110px', background: C.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
          {menu.categories?.name === 'Minuman' ? '🥤' : menu.categories?.name === 'Cemilan' ? '🍟' : '🍽️'}
        </div>
      )}

      {/* Info */}
      <div style={{ padding: '10px' }}>
        <p style={{ fontWeight: '700', fontSize: '13px', color: C.text }}>{menu.name}</p>
        {menu.description && (
          <p style={{ fontSize: '11px', color: C.textMuted, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{menu.description}</p>
        )}
        <p style={{ fontWeight: '700', fontSize: '13px', color: C.brown, marginTop: '4px' }}>
          Rp {menu.price.toLocaleString('id-ID')}
        </p>

        {/* Opsi */}
        {menu.has_options && menu.menu_options?.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <p style={{ fontSize: '10px', color: C.textMuted, marginBottom: '4px' }}>Kepedasan:</p>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {menu.menu_options.map(opt => (
                <button key={opt.id} onClick={() => setSelectedOption(opt.option_name)}
                  style={{
                    padding: '3px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '600', cursor: 'pointer',
                    border: `0.5px solid ${selectedOption === opt.option_name ? C.brownDark : C.brownLight}`,
                    background: selectedOption === opt.option_name ? C.brownDark : 'transparent',
                    color: selectedOption === opt.option_name ? C.cream : C.brown,
                  }}>
                  {opt.option_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Qty & Tambah */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: C.cream, borderRadius: '10px', padding: '4px 10px' }}>
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '16px', color: C.brownDark, lineHeight: 1 }}>−</button>
            <span style={{ fontWeight: '700', fontSize: '13px', color: C.text, minWidth: '14px', textAlign: 'center' }}>{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '16px', color: C.brownDark, lineHeight: 1 }}>+</button>
          </div>
          <button onClick={handleAdd}
            style={{ background: C.brownDark, color: C.cream, padding: '7px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
            + Tambah
          </button>
        </div>
      </div>
    </div>
  )
}