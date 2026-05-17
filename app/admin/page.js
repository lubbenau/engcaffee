'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import OrderCard from '@/components/OrderCard'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

const C = {
  cream: '#F5F0E8',
  cream2: '#EDE5D8',
  brownLight: '#C4A882',
  brown: '#8B6347',
  brownDark: '#5C3D2E',
  brownDeep: '#3B2314',
  text: '#2C1A0E',
  textMuted: '#8B7355',
  white: '#FDFAF6',
}

export default function AdminPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    fetchOrders()
    const unsub = subscribeOrders()
    return () => { if (unsub) unsub() }
  }, [])

  async function fetchOrders() {
    const { data } = await supabase.from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  function subscribeOrders() {
    const channel = supabase
      .channel('admin-orders-' + Date.now())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        if (payload.eventType === 'INSERT') {
          fetchSingleOrder(payload.new.id)
          toast('🔔 Pesanan baru masuk!', {
            duration: 5000,
            style: { background: C.brownDeep, color: C.cream, fontWeight: 'bold', borderRadius: '12px' }
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
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.value = 880
    g.gain.setValueAtTime(0.3, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.5)
  }

  async function updateStatus(orderId, newStatus) {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    toast.success('Status diupdate!')
  }

  const filtered = orders.filter(o => o.status === activeTab)
  const countByStatus = (s) => orders.filter(o => o.status === s).length

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: C.brown }}>Memuat data...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.cream }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ background: C.brownDeep, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: C.cream, fontFamily: 'Georgia, serif' }}>EngCaffee</h1>
            <p style={{ fontSize: '10px', color: C.brownLight, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>Admin Dashboard</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', color: C.brownLight }}>Total hari ini</p>
              <p style={{ fontWeight: '700', color: C.cream, fontSize: '16px' }}>{orders.length} pesanan</p>
            </div>
            <Link href="/admin/menu" style={{
              fontSize: '12px', fontWeight: '700', padding: '8px 14px', borderRadius: '12px',
              border: `1px solid ${C.brownLight}`, color: C.brownLight, textDecoration: 'none'
            }}>
              Kelola Menu
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px 12px', display: 'flex', gap: '8px' }}>
          {[
            { key: 'pending', label: 'Pending' },
            { key: 'confirmed', label: 'Diproses' },
            { key: 'done', label: 'Selesai' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              background: activeTab === tab.key ? C.brownLight : 'rgba(255,255,255,0.1)',
              color: activeTab === tab.key ? C.brownDeep : C.brownLight,
            }}>
              {tab.label}
              {countByStatus(tab.key) > 0 && (
                <span style={{
                  fontSize: '10px', padding: '1px 6px', borderRadius: '10px',
                  background: activeTab === tab.key ? C.brownDeep : 'rgba(255,255,255,0.2)',
                  color: activeTab === tab.key ? C.cream : C.cream,
                }}>
                  {countByStatus(tab.key)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted }}>
            <p style={{ fontSize: '40px', marginBottom: '12px' }}>☕</p>
            <p>Tidak ada pesanan {activeTab}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
            {filtered.map(order => (
              <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}