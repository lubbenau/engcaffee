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
    pending: { icon: '⏳', title: 'Pesanan Terkirim!', sub: 'Menunggu konfirmasi dari kasir...', color: '#F5A623', bg: '#FFF8ED' },
    confirmed: { icon: '👨‍🍳', title: 'Pesanan Dikonfirmasi!', sub: 'Pesanan sedang diproses di dapur.', color: '#4DB89E', bg: '#E8F7F3' },
    done: { icon: '🎉', title: 'Pesanan Siap!', sub: 'Silakan ambil pesananmu. Selamat menikmati!', color: '#4D8EDB', bg: '#EBF3FD' }
  }
  const s = states[status] || states.pending

  return (
    <div style={{ minHeight: '100vh', background: '#F4FAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '80px', height: '80px', background: s.bg, borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 16px' }}>
            {s.icon}
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A1A' }}>{s.title}</h2>
          <p style={{ fontSize: '14px', color: '#888', marginTop: '6px' }}>{s.sub}</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', border: '0.5px solid #F0F0F0' }}>
          {[
            { label: 'Restoran', value: 'EngCaffee' },
            { label: 'Nomor Meja', value: `Meja ${tableId}` },
            { label: 'Order ID', value: `#${orderId}` },
            { label: 'Status', value: status === 'pending' ? 'Menunggu' : status === 'confirmed' ? 'Diproses' : 'Selesai' },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '0.5px solid #F5F5F5' : 'none' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>{row.label}</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A1A' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {status === 'pending' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' }}>
            {[0, 150, 300].map(d => (
              <div key={d} style={{ width: '8px', height: '8px', background: '#4DB89E', borderRadius: '50', animation: 'bounce 1s infinite', animationDelay: `${d}ms` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}