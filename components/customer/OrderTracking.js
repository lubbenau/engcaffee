'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ClipboardList, Clock, Sparkles, ChefHat, CheckCircle2, ChevronRight } from 'lucide-react'

export default function OrderTracking({ tableId }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load customer order IDs from localStorage
    const stored = localStorage.getItem('customer_orders')
    const orderIds = stored ? JSON.parse(stored) : []

    if (orderIds.length === 0) {
      setLoading(false)
      return
    }

    // Fetch initial order data
    async function fetchMyOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .in('id', orderIds)
        .order('created_at', { ascending: false })

      if (data) {
        setOrders(data)
      }
      setLoading(false)
    }

    fetchMyOrders()

    // Subscribe to real-time status updates for orders
    const channel = supabase
      .channel('customer-orders-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          if (orderIds.includes(payload.new.id)) {
            // Update the matching order in status state
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } : o))
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getStatusStep = (status) => {
    if (status === 'pending') return 1
    if (status === 'confirmed') return 2
    if (status === 'done') return 3
    return 1
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="w-8 h-8 border-4 border-[#046A55]/30 border-t-[#046A55] rounded-full animate-spin"></div>
        <p className="text-xs text-[#046A55] font-bold">Memuat status pesanan...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-[24px] p-8 text-center border border-[#e8f5f2]/40 shadow-sm max-w-[420px] mx-auto mt-6">
        <div className="w-16 h-16 rounded-full bg-[#D7EFEA] flex items-center justify-center mx-auto text-3xl mb-4">
          📋
        </div>
        <h3 className="font-extrabold text-[16px] text-gray-900">Belum Ada Pesanan</h3>
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          Silakan pesan hidangan lezat kami di menu. Semua pesanan aktif Anda akan muncul di halaman ini untuk dilacak secara langsung!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[420px] mx-auto pb-10">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-extrabold text-lg text-gray-900 flex items-center gap-1.5">
          Pelacakan Pesanan <Sparkles size={16} className="text-[#046A55] fill-[#046A55]/20 animate-pulse" />
        </h2>
        <span className="text-[10px] bg-[#046A55] text-white px-2 py-0.5 rounded-full font-bold">
          Live Real-time
        </span>
      </div>

      {orders.map((order) => {
        const activeStep = getStatusStep(order.status)
        
        return (
          <div
            key={order.id}
            className="bg-white rounded-[24px] p-5 shadow-sm border border-[#e8f5f2]/40 space-y-5"
          >
            {/* Header info */}
            <div className="flex justify-between items-start pb-3 border-b border-gray-50">
              <div>
                <p className="font-extrabold text-sm text-gray-900">Order #{order.id.slice(0, 8)}</p>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  Meja {order.table_number} • {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <span className="font-extrabold text-sm text-[#046A55]">
                Rp {order.total_price.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Stepper tracking tracker */}
            <div className="relative pt-2 pb-1">
              {/* Stepper connector line */}
              <div className="absolute top-6 left-5 right-5 h-0.5 bg-gray-100 -z-1">
                <div
                  className="h-full bg-[#046A55] transition-all duration-500"
                  style={{
                    width: activeStep === 1 ? '0%' : activeStep === 2 ? '50%' : '100%'
                  }}
                />
              </div>

              {/* Steps indicators */}
              <div className="flex justify-between items-center relative">
                {/* Step 1: Pending */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-3 transition-all duration-300 ${
                      activeStep >= 1
                        ? 'bg-[#046A55] border-[#046A55] text-white'
                        : 'bg-white border-gray-200 text-gray-400'
                    }`}
                  >
                    <ClipboardList size={16} />
                  </div>
                  <span
                    className={`text-[9px] font-bold mt-2 ${
                      activeStep >= 1 ? 'text-[#046A55] font-extrabold' : 'text-gray-400'
                    }`}
                  >
                    Diterima
                  </span>
                </div>

                {/* Step 2: Confirmed */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-3 transition-all duration-300 ${
                      activeStep >= 2
                        ? 'bg-[#046A55] border-[#046A55] text-white'
                        : 'bg-white border-gray-200 text-gray-400'
                    } ${activeStep === 2 ? 'animate-bounce' : ''}`}
                  >
                    <ChefHat size={16} />
                  </div>
                  <span
                    className={`text-[9px] font-bold mt-2 ${
                      activeStep >= 2 ? 'text-[#046A55] font-extrabold' : 'text-gray-400'
                    }`}
                  >
                    Sedang Dibuat
                  </span>
                </div>

                {/* Step 3: Done */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-3 transition-all duration-300 ${
                      activeStep >= 3
                        ? 'bg-[#046A55] border-[#046A55] text-white'
                        : 'bg-white border-gray-200 text-gray-400'
                    }`}
                  >
                    <CheckCircle2 size={16} />
                  </div>
                  <span
                    className={`text-[9px] font-bold mt-2 ${
                      activeStep >= 3 ? 'text-[#046A55] font-extrabold' : 'text-gray-400'
                    }`}
                  >
                    Siap Diantar
                  </span>
                </div>
              </div>
            </div>

            {/* Subtitle status info */}
            <div className="bg-[#D7EFEA]/30 rounded-2xl p-3 border border-[#046A55]/5 text-center">
              <p className="text-xs text-[#046A55] font-extrabold leading-snug">
                {order.status === 'pending' && '🧑‍🍳 Koki telah menerima pesanan Anda dan segera memprosesnya.'}
                {order.status === 'confirmed' && '🍳 Pesanan sedang dimasak hangat-hangat di dapur. Mohon ditunggu!'}
                {order.status === 'done' && '🎉 Yey! Pesanan Anda telah matang sempurna dan sedang diantar ke meja.'}
              </p>
            </div>

            {/* Order Items list */}
            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Item Dipesan</p>
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <span className="text-gray-700 font-semibold">
                    <span className="font-extrabold text-[#046A55]">{item.quantity}x</span> {item.menu_name}
                  </span>
                  <span className="text-gray-400 font-semibold">
                    Rp {item.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
