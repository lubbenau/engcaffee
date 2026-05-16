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
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0" style={{ background: 'rgba(59,35,20,0.6)' }} onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl max-h-[88vh] flex flex-col"
        style={{ background: 'var(--white)' }}>

        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--cream2)' }} />
        </div>

        <div className="px-5 py-3 flex justify-between items-center"
          style={{ borderBottom: '0.5px solid var(--cream2)' }}>
          <div>
            <h2 className="font-bold" style={{ color: 'var(--text)' }}>Keranjang Pesanan</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Meja {tableId}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg"
            style={{ background: 'var(--cream)', color: 'var(--text-muted)' }}>×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">☕</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Keranjang masih kosong</p>
            </div>
          ) : cart.map(item => (
            <div key={item.cartKey} className="flex items-center gap-3 py-2"
              style={{ borderBottom: '0.5px solid var(--cream2)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'var(--cream2)' }}>🍽️</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{item.name}</p>
                {item.selectedOption && (
                  <span className="text-xs font-medium" style={{ color: 'var(--brown)' }}>{item.selectedOption}</span>
                )}
                <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--brown)' }}>
                  Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl px-2 py-1"
                style={{ background: 'var(--cream)' }}>
                <button onClick={() => onUpdateQty(item.cartKey, item.quantity - 1)}
                  className="w-6 h-6 flex items-center justify-center font-bold text-lg"
                  style={{ color: 'var(--brown-dark)' }}>−</button>
                <span className="text-sm font-bold w-4 text-center" style={{ color: 'var(--text)' }}>{item.quantity}</span>
                <button onClick={() => onUpdateQty(item.cartKey, item.quantity + 1)}
                  className="w-6 h-6 flex items-center justify-center font-bold text-lg"
                  style={{ color: 'var(--brown-dark)' }}>+</button>
              </div>
            </div>
          ))}

          {cart.length > 0 && (
            <div className="rounded-2xl p-3 mt-2" style={{ background: 'var(--cream)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Catatan (opsional)</p>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="Contoh: jangan pakai bawang..."
                className="w-full bg-transparent text-sm outline-none resize-none"
                style={{ color: 'var(--text)' }}
                rows={2} />
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="px-5 py-4" style={{ borderTop: '0.5px solid var(--cream2)' }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Pembayaran</span>
              <span className="text-xl font-bold" style={{ color: 'var(--brown-dark)' }}>
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>
            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-sm transition-all disabled:opacity-60"
              style={{ background: 'var(--brown-deep)', color: 'var(--cream)' }}>
              {loading ? 'Mengirim pesanan...' : 'Pesan Sekarang'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}