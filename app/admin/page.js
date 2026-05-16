'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import OrderCard from '@/components/OrderCard'
import toast, { Toaster } from 'react-hot-toast'

export default function AdminPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    fetchOrders()
    subscribeOrders()
  }, [])

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    setOrders(data || [])
    setLoading(false)
  }

  function subscribeOrders() {
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders'
      }, payload => {
        if (payload.eventType === 'INSERT') {
          // Ambil order baru beserta items-nya
          fetchSingleOrder(payload.new.id)
          toast('🔔 Pesanan baru masuk!', {
            duration: 5000,
            style: { background: '#f97316', color: '#fff', fontWeight: 'bold' }
          })
          // Mainkan suara notifikasi
          playNotifSound()
        }
        if (payload.eventType === 'UPDATE') {
          setOrders(prev =>
            prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o)
          )
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  async function fetchSingleOrder(orderId) {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()

    if (data) {
      setOrders(prev => [data, ...prev])
    }
  }

  function playNotifSound() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.frequency.value = 880
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.5)
  }

  async function updateStatus(orderId, newStatus) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (!error) {
      toast.success(`Status diupdate: ${newStatus}`)
    }
  }

  const filtered = orders.filter(o => o.status === activeTab)

  const countByStatus = (status) => orders.filter(o => o.status === status).length

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Memuat data...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-orange-500">🍽️ Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Kelola pesanan masuk</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Total hari ini</p>
            <p className="font-bold text-gray-700">{orders.length} pesanan</p>
          </div>
        </div>

        {/* Tab Status */}
        <div className="max-w-4xl mx-auto px-4 pb-3 flex gap-2">
          {[
            { key: 'pending', label: '⏳ Pending' },
            { key: 'confirmed', label: '✅ Dikonfirmasi' },
            { key: 'done', label: '🎉 Selesai' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === tab.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab.label}
              {countByStatus(tab.key) > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                  activeTab === tab.key ? 'bg-white text-orange-500' : 'bg-gray-300 text-gray-600'
                }`}>
                  {countByStatus(tab.key)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Order List */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>Tidak ada pesanan {activeTab}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}