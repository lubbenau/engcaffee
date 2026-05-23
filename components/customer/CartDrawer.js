'use client'

import { useState } from 'react'
import { X, Sparkles, Coins, QrCode } from 'lucide-react'

export default function CartDrawer({ cart, tableId, onClose, onRemove, onUpdateQty, onSubmit }) {
  const [note, setNote] = useState('')
  const [spiceLevel, setSpiceLevel] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('QRIS') // QRIS or Cash
  const [loading, setLoading] = useState(false)

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  async function handleSubmit() {
    if (cart.length === 0) return
    setLoading(true)
    
    // Serialize notes, spice level, and payment method into customer_note
    const spiceText = `🌶️ Level ${spiceLevel}`
    const paymentText = `💰 Bayar: ${paymentMethod === 'QRIS' ? 'QRIS' : 'Tunai/Kasir'}`
    const serializedNote = `${paymentText} | ${spiceText} | Catatan: ${note.trim() || 'Tidak ada'}`
    
    await onSubmit(serializedNote)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Dark overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Cart Container Drawer */}
      <div className="relative w-full max-w-[480px] bg-white rounded-t-[32px] max-h-[90vh] flex flex-col shadow-2xl border-t border-white/20 transition-transform duration-300 z-10">
        
        {/* Decorative notch line */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 flex justify-between items-center border-b border-gray-100">
          <div>
            <h2 className="font-extrabold text-xl text-gray-900 flex items-center gap-1.5">
              Keranjang <Sparkles size={16} className="text-[#046A55] fill-[#046A55]/20" />
            </h2>
            <p className="text-xs text-[#046A55] font-bold mt-0.5">Meja {tableId}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center border-none cursor-pointer transition-colors duration-200 focus:outline-none"
          >
            <X size={16} className="text-gray-500 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-300">
              <div className="text-5xl mb-4">🛒</div>
              <p className="font-bold text-gray-400">Keranjang masih kosong</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-[#046A55] text-white rounded-full font-bold text-xs cursor-pointer border-none"
              >
                Pilih Menu
              </button>
            </div>
          ) : (
            <>
              {/* Cart List */}
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.cartKey}
                    className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-b-0"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#D7EFEA]/40 flex items-center justify-center text-2xl flex-shrink-0">
                      🍽️
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[14px] text-gray-900">{item.name}</p>
                      {item.selectedOption && (
                        <span className="inline-block text-[10px] text-[#046A55] bg-[#D7EFEA]/80 px-2 py-0.5 rounded-md font-bold mt-1">
                          {item.selectedOption}
                        </span>
                      )}
                      <p className="font-extrabold text-[14px] text-gray-900 mt-1">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                    
                    {/* Add & Subtract Controls */}
                    <div className="flex items-center gap-3.5 bg-gray-100 rounded-full px-3.5 py-1.5">
                      <button
                        onClick={() => onUpdateQty(item.cartKey, item.quantity - 1)}
                        className="bg-none border-none cursor-pointer font-bold text-lg text-[#046A55] hover:scale-110 active:scale-95 transition-transform leading-none"
                      >
                        −
                      </button>
                      <span className="font-extrabold text-sm text-gray-900 min-w-[14px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.cartKey, item.quantity + 1)}
                        className="bg-none border-none cursor-pointer font-bold text-lg text-[#046A55] hover:scale-110 active:scale-95 transition-transform leading-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Advanced Customization Notes */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                {/* Spicy Level Selector (1-5) */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    🌶️ Tingkat Kepedasan ({spiceLevel})
                  </label>
                  <div className="flex gap-2.5">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setSpiceLevel(lvl)}
                        className={`flex-1 py-2.5 rounded-2xl border font-extrabold text-sm cursor-pointer transition-all duration-300 focus:outline-none ${
                          spiceLevel === lvl
                            ? 'bg-[#FFEDED] border-red-300 text-red-600 scale-102 shadow-xs'
                            : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <span className="block text-center">
                          {lvl} {lvl >= 3 ? '🔥' : '🌶️'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Instructions Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    📝 Catatan Khusus
                  </label>
                  <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Contoh: jangan pakai bawang, kuah dipisah, dll..."
                      className="w-full bg-transparent border-none outline-none text-xs text-gray-800 resize-none h-18 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Payment Options Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    💳 Pilihan Metode Pembayaran
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* QRIS Card */}
                    <button
                      onClick={() => setPaymentMethod('QRIS')}
                      className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer text-left transition-all duration-300 focus:outline-none ${
                        paymentMethod === 'QRIS'
                          ? 'border-[#046A55] bg-[#D7EFEA]/40 text-[#046A55]'
                          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${paymentMethod === 'QRIS' ? 'bg-[#046A55] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <QrCode size={18} />
                      </div>
                      <div>
                        <p className="font-extrabold text-xs">Bayar via QRIS</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Praktis & Instan</p>
                      </div>
                    </button>

                    {/* Cash Card */}
                    <button
                      onClick={() => setPaymentMethod('Cash')}
                      className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer text-left transition-all duration-300 focus:outline-none ${
                        paymentMethod === 'Cash'
                          ? 'border-[#046A55] bg-[#D7EFEA]/40 text-[#046A55]'
                          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${paymentMethod === 'Cash' ? 'bg-[#046A55] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Coins size={18} />
                      </div>
                      <div>
                        <p className="font-extrabold text-xs">Bayar Cash</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Bayar di Kasir</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Checkout Actions */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <span className="color-gray-500 text-xs font-bold uppercase tracking-wider">Total Pembayaran</span>
              <span className="font-extrabold text-xl text-gray-900">
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-4 rounded-2xl border-none font-extrabold text-[15px] text-white text-center cursor-pointer shadow-md transition-all duration-300 flex items-center justify-center gap-2 ${
                loading ? 'bg-[#046A55]/60 cursor-not-allowed' : 'bg-[#046A55] hover:bg-[#035343] active:scale-99'
              }`}
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Mengirim Pesanan...
                </>
              ) : (
                `Pesan Sekarang (${cart.reduce((sum, item) => sum + item.quantity, 0)} item)`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
