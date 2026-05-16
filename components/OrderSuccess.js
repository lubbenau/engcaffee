'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function OrderSuccess({ orderId, tableId }) {
  const [status, setStatus] = useState('pending')

  useEffect(() => {
    const channel = supabase.channel('order-status-' + orderId)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'orders',
        filter: `id=eq.${orderId}`
      }, payload => { setStatus(payload.new.status) })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [orderId])

  const states = {
    pending: { icon: '⏳', title: 'Pesanan Terkirim!', sub: 'Menunggu konfirmasi dari kasir...', badge: 'Menunggu' },
    confirmed: { icon: '👨‍🍳', title: 'Pesanan Dikonfirmasi!', sub: 'Pesanan sedang diproses di dapur.', badge: 'Diproses' },
    done: { icon: '☕', title: 'Pesanan Siap!', sub: 'Silakan ambil pesananmu. Selamat menikmati!', badge: 'Selesai' }
  }
  const s = states[status] || states.pending

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--cream)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{s.icon}</div>
          <h2 className="font-serif text-2xl font-bold" style={{ color: 'var(--brown-deep)' }}>{s.title}</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
        </div>

        <div className="rounded-3xl p-5 border" style={{ background: 'var(--white)', borderColor: 'var(--cream2)' }}>
          <div className="text-center mb-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: 'var(--cream2)', color: 'var(--brown)' }}>
              {s.badge}
            </span>
          </div>
          <div className="space-y-2.5 rounded-2xl p-4" style={{ background: 'var(--cream)' }}>
            {[
              { label: 'Restoran', value: 'EngCaffee' },
              { label: 'Nomor Meja', value: `Meja ${tableId}` },
              { label: 'Order ID', value: `#${orderId}` },
              { label: 'Status', value: s.badge },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {status === 'pending' && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {[0, 150, 300].map(delay => (
                <div key={delay} className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: 'var(--brown)', animationDelay: `${delay}ms` }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}