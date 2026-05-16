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
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg">Keranjang Pesanan</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Keranjang kosong</p>
          ) : (
            cart.map(item => (
              <div key={item.cartKey} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  {item.selectedOption && (
                    <p className="text-xs text-orange-500">{item.selectedOption}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQty(item.cartKey, item.quantity - 1)}
                    className="w-6 h-6 rounded-full border border-gray-300 text-sm flex items-center justify-center"
                  >−</button>
                  <span className="text-sm w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(item.cartKey, item.quantity + 1)}
                    className="w-6 h-6 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center"
                  >+</button>
                </div>
              </div>
            ))
          )}

          {/* Catatan */}
          <div className="mt-2">
            <label className="text-sm text-gray-500">Catatan (opsional):</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Contoh: jangan pakai bawang..."
              className="w-full border border-gray-200 rounded-xl p-2 text-sm mt-1 resize-none"
              rows={2}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex justify-between mb-3">
            <span className="font-medium">Total</span>
            <span className="font-bold text-orange-500">
              Rp {total.toLocaleString('id-ID')}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-3 text-center">Meja {tableId}</p>
          <button
            onClick={handleSubmit}
            disabled={cart.length === 0 || loading}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Mengirim pesanan...' : '🍽️ Pesan Sekarang'}
          </button>
        </div>
      </div>
    </div>
  )
}