'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function OrderSuccess({ orderId, tableId }) {
  const [status, setStatus] = useState('pending')

  useEffect(() => {
    // Realtime listener: pantau status order
    const channel = supabase
      .channel('order-status-' + orderId)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      }, payload => {
        setStatus(payload.new.status)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [orderId])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow p-8 max-w-sm w-full text-center">
        {status === 'pending' && (
          <>
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-gray-800">Pesanan Terkirim!</h2>
            <p className="text-gray-500 mt-2">Menunggu konfirmasi dari kasir...</p>
            <p className="text-sm text-orange-500 mt-4">Meja {tableId} • Order #{orderId}</p>
          </>
        )}
        {status === 'confirmed' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-600">Pesanan Dikonfirmasi!</h2>
            <p className="text-gray-500 mt-2">Pesanan kamu sedang diproses di dapur.</p>
            <p className="text-sm text-orange-500 mt-4">Meja {tableId} • Order #{orderId}</p>
          </>
        )}
        {status === 'done' && (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-blue-600">Pesanan Selesai!</h2>
            <p className="text-gray-500 mt-2">Silakan ambil pesanan kamu. Selamat menikmati!</p>
          </>
        )}
      </div>
    </div>
  )
}