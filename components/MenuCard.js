'use client'
import { useState } from 'react'

export default function MenuCard({ menu, onAddToCart }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOption, setSelectedOption] = useState('')
  const [showDetail, setShowDetail] = useState(false)

  function handleAdd() {
    if (menu.has_options && !selectedOption) {
      alert('Pilih tingkat kepedasan dulu!')
      return
    }
    onAddToCart({ id: menu.id, name: menu.name, price: menu.price, quantity, selectedOption: selectedOption || null })
    setQuantity(1)
    setSelectedOption('')
    setShowDetail(false)
  }

  return (
    <>
      <div onClick={() => setShowDetail(true)} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', border: '0.5px solid #F0F0F0' }}>
        {/* Image */}
        {menu.image_url ? (
          <img src={menu.image_url} alt={menu.name} style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '110px', background: '#F4FAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
            {menu.categories?.name === 'Minuman' ? '🥤' : menu.categories?.name === 'Cemilan' ? '🍟' : '🍽️'}
          </div>
        )}

        <div style={{ padding: '10px' }}>
          <p style={{ fontWeight: '700', fontSize: '12px', color: '#1A1A1A' }}>{menu.name}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '10px', color: '#4DB89E', display: 'flex', alignItems: 'center', gap: '2px' }}>
              🕐 15m
            </span>
            <span style={{ fontSize: '10px', color: '#F5A623', display: 'flex', alignItems: 'center', gap: '2px' }}>
              ⭐ 4.8
            </span>
          </div>
          <p style={{ fontWeight: '700', fontSize: '13px', color: '#1A1A1A', marginTop: '6px' }}>
            Rp {menu.price.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setShowDetail(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '480px', margin: '0 auto', overflow: 'hidden' }}>

            {/* Food Image */}
            {menu.image_url ? (
              <img src={menu.image_url} alt={menu.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '200px', background: '#F4FAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px' }}>
                {menu.categories?.name === 'Minuman' ? '🥤' : menu.categories?.name === 'Cemilan' ? '🍟' : '🍽️'}
              </div>
            )}

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', flex: 1 }}>{menu.name}</h2>
                <button onClick={() => setShowDetail(false)}
                  style={{ background: '#F5F5F5', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <span style={{ fontSize: '12px', color: '#4DB89E' }}>🕐 15 menit</span>
                <span style={{ fontSize: '12px', color: '#F5A623' }}>⭐ 4.8</span>
              </div>

              <p style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', marginTop: '8px' }}>
                Rp {menu.price.toLocaleString('id-ID')}
              </p>

              {menu.description && (
                <p style={{ fontSize: '13px', color: '#888', lineHeight: '1.6', marginTop: '8px' }}>{menu.description}</p>
              )}

              {/* Opsi */}
              {menu.has_options && menu.menu_options?.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A', marginBottom: '8px' }}>Tingkat Kepedasan</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {menu.menu_options.map(opt => (
                      <button key={opt.id} onClick={() => setSelectedOption(opt.option_name)}
                        style={{
                          padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                          border: `1.5px solid ${selectedOption === opt.option_name ? '#4DB89E' : '#E0E0E0'}`,
                          background: selectedOption === opt.option_name ? '#E8F7F3' : '#fff',
                          color: selectedOption === opt.option_name ? '#2D8A74' : '#888',
                        }}>
                        {opt.option_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Qty & Add */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F5F5F5', borderRadius: '14px', padding: '8px 16px' }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '20px', color: '#4DB89E', lineHeight: 1 }}>−</button>
                  <span style={{ fontWeight: '700', fontSize: '16px', color: '#1A1A1A', minWidth: '20px', textAlign: 'center' }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '20px', color: '#4DB89E', lineHeight: 1 }}>+</button>
                </div>
                <button onClick={handleAdd} style={{
                  flex: 1, background: '#4DB89E', color: '#fff', padding: '14px', borderRadius: '14px',
                  border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px'
                }}>
                  Tambah ke Keranjang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}