'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import OrderCard from '@/components/OrderCard'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

export default function AdminPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    fetchOrders()
    subscribeOrders()
  }, [])

  async function fetchOrders() {
    const { data } = await supabase.from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  function subscribeOrders() {
    const channel = supabase.channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        if (payload.eventType === 'INSERT') {
          fetchSingleOrder(payload.new.id)
          toast('Pesanan baru masuk!', {
            duration: 5000,
            style: { background: 'var(--brown-deep)', color: 'var(--cream)', fontWeight: 'bold', borderRadius: '12px' }
          })
          playNotifSound()
        }
        if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }

  async function fetchSingleOrder(orderId) {
    const { data } = await supabase.from('orders').select('*, order_items(*)').eq('id', orderId).single()
    if (data) setOrders(prev => [data, ...prev])
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
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    toast.success('Status diupdate!')
  }

  const filtered = orders.filter(o => o.status === activeTab)
  const countByStatus = (s) => orders.filter(o => o.status === s).length

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--cream)' }}>
      <p style={{ color: 'var(--brown)' }}>Memuat data...</p>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ background: 'var(--brown-deep)' }} className="sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="font-serif text-xl font-bold" style={{ color: 'var(--cream)' }}>EngCaffee</h1>
            <p className="text-xs tracking-widest uppercase mt-0.5" style={{ color: 'var(--brown-light)' }}>Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs" style={{ color: 'var(--brown-light)' }}>Total hari ini</p>
              <p className="font-bold" style={{ color: 'var(--cream)' }}>{orders.length} pesanan</p>
            </div>
            <Link href="/admin/menu"
              className="text-xs font-bold px-3 py-1.5 rounded-xl border"
              style={{ borderColor: 'var(--brown-light)', color: 'var(--brown-light)' }}>
              Kelola Menu
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 pb-3 flex gap-2">
          {[
            { key: 'pending', label: 'Pending' },
            { key: 'confirmed', label: 'Diproses' },
            { key: 'done', label: 'Selesai' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all"
              style={activeTab === tab.key
                ? { background: 'var(--brown-light)', color: 'var(--brown-deep)' }
                : { background: 'rgba(255,255,255,0.1)', color: 'var(--brown-light)' }}>
              {tab.label}
              {countByStatus(tab.key) > 0 && (
                <span className="text-xs rounded-full px-1.5 py-0.5"
                  style={activeTab === tab.key
                    ? { background: 'var(--brown-deep)', color: 'var(--cream)' }
                    : { background: 'rgba(255,255,255,0.15)', color: 'var(--cream)' }}>
                  {countByStatus(tab.key)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <p className="text-4xl mb-3">☕</p>
            <p>Tidak ada pesanan {activeTab}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(order => (
              <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}