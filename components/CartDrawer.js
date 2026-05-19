'use client'
import { useState } from 'react'

export default function CartDrawer({ cart, tableId, onClose, onRemove, onUpdateQty, onSubmit }) {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  async function handleSubmit() {
    if (cart.length === 0) return
    setLoading(true)
    await onSubmit(note)
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>

        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: '40px', height: '4px', background: '#E0E0E0', borderRadius: '2px' }} />
        </div>

        <div style={{ padding: '8px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid #F0F0F0' }}>
          <div>
            <h2 style={{ fontWeight: '700', fontSize: '18px', color: '#1A1A1A' }}>Keranjang</h2>
            <p style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Meja {tableId}</p>
          </div>
          <button onClick={onClose} style={{ background: '#F5F5F5', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', fontWeight: '700', color: '#888' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#BBB' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>🛒</div>
              <p>Keranjang masih kosong</p>
            </div>
          ) : cart.map(item => (
            <div key={item.cartKey} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '14px', marginBottom: '14px', borderBottom: '0.5px solid #F5F5F5' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#F4FAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                🍽️
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', fontSize: '14px', color: '#1A1A1A' }}>{item.name}</p>
                {item.selectedOption && (
                  <span style={{ fontSize: '11px', color: '#4DB89E', background: '#E8F7F3', padding: '2px 8px', borderRadius: '8px', fontWeight: '600' }}>{item.selectedOption}</span>
                )}
                <p style={{ fontWeight: '700', fontSize: '14px', color: '#1A1A1A', marginTop: '4px' }}>
                  Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F5F5F5', borderRadius: '12px', padding: '6px 10px' }}>
                <button onClick={() => onUpdateQty(item.cartKey, item.quantity - 1)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '18px', color: '#4DB89E', lineHeight: 1 }}>−</button>
                <span style={{ fontWeight: '700', fontSize: '14px', color: '#1A1A1A', minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => onUpdateQty(item.cartKey, item.quantity + 1)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '18px', color: '#4DB89E', lineHeight: 1 }}>+</button>
              </div>
            </div>
          ))}

          {cart.length > 0 && (
            <div style={{ background: '#F5F5F5', borderRadius: '14px', padding: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#888', marginBottom: '6px' }}>Catatan (opsional)</p>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="Contoh: jangan pakai bawang..."
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: '#1A1A1A', resize: 'none' }}
                rows={2} />
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '0.5px solid #F0F0F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: '#888', fontSize: '14px' }}>Total Pembayaran</span>
              <span style={{ fontWeight: '700', fontSize: '20px', color: '#1A1A1A' }}>
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>
            <button onClick={handleSubmit} disabled={loading} style={{
              width: '100%', background: loading ? '#B2DDD4' : '#4DB89E', color: '#fff',
              padding: '16px', borderRadius: '16px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '700', fontSize: '15px'
            }}>
              {loading ? 'Mengirim pesanan...' : 'Pesan Sekarang'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}