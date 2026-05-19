'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import OrderCard from '@/components/OrderCard'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

export default function AdminPage() {
  const router = useRouter()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [session, setSession] = useState(null)

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/admin/login')
        return
      }

      setSession(session)

      await fetchOrders()
    }

    checkSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/admin/login')
      } else {
        setSession(session)
      }
    })

    const unsub = subscribeOrders()

    return () => {
      subscription.unsubscribe()

      if (unsub) unsub()
    }
  }, [router])

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
      .channel('admin-orders-' + Date.now())
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        payload => {
          if (payload.eventType === 'INSERT') {
            fetchSingleOrder(payload.new.id)

            toast('🔔 Pesanan baru masuk!', {
              duration: 5000,
              style: {
                background: '#1A1A1A',
                color: '#fff',
                fontWeight: '700',
                borderRadius: '12px'
              }
            })

            playNotifSound()
          }

          if (payload.eventType === 'UPDATE') {
            setOrders(prev =>
              prev.map(o =>
                o.id === payload.new.id
                  ? { ...o, ...payload.new }
                  : o
              )
            )
          }
        }
      )
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

    const o = ctx.createOscillator()
    const g = ctx.createGain()

    o.connect(g)
    g.connect(ctx.destination)

    o.frequency.value = 880

    g.gain.setValueAtTime(0.3, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + 0.5
    )

    o.start(ctx.currentTime)
    o.stop(ctx.currentTime + 0.5)
  }

  async function updateStatus(orderId, newStatus) {
    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    toast.success('Status diupdate!')
  }

  const filtered = orders.filter(
    o => o.status === activeTab
  )

  const countByStatus = s =>
    orders.filter(o => o.status === s).length

  if (loading || !session)
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#F4FAF8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <p
          style={{
            color: '#4DB89E',
            fontWeight: '600'
          }}
        >
          Memuat data...
        </p>
      </div>
    )

  return (
    <div style={{ minHeight: '100vh', background: '#F4FAF8' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div
        style={{
          background: '#fff',
          borderBottom: '0.5px solid #F0F0F0',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '16px 20px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: '#4DB89E',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}
              >
                🍽️
              </div>

              <div>
                <h1
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1A1A1A'
                  }}
                >
                  EngCaffee
                </h1>

                <p
                  style={{
                    fontSize: '11px',
                    color: '#888'
                  }}
                >
                  Dashboard Admin
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div style={{ textAlign: 'right' }}>
                <p
                  style={{
                    fontSize: '11px',
                    color: '#888'
                  }}
                >
                  Total hari ini
                </p>

                <p
                  style={{
                    fontWeight: '700',
                    color: '#1A1A1A'
                  }}
                >
                  {orders.length} pesanan
                </p>
              </div>

              <Link
                href="/admin/menu"
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  background: '#E8F7F3',
                  color: '#2D8A74',
                  textDecoration: 'none'
                }}
              >
                Kelola Menu
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '14px'
            }}
          >
            {[
              {
                label: 'Pending',
                count: countByStatus('pending'),
                color: '#F5A623',
                bg: '#FFF8ED'
              },
              {
                label: 'Diproses',
                count: countByStatus('confirmed'),
                color: '#4DB89E',
                bg: '#E8F7F3'
              },
              {
                label: 'Selesai',
                count: countByStatus('done'),
                color: '#4D8EDB',
                bg: '#EBF3FD'
              }
            ].map(s => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  background: s.bg,
                  borderRadius: '12px',
                  padding: '10px',
                  textAlign: 'center'
                }}
              >
                <p
                  style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: s.color
                  }}
                >
                  {s.count}
                </p>

                <p
                  style={{
                    fontSize: '10px',
                    color: s.color,
                    fontWeight: '600'
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '6px'
            }}
          >
            {[
              { key: 'pending', label: 'Pending' },
              { key: 'confirmed', label: 'Diproses' },
              { key: 'done', label: 'Selesai' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  background:
                    activeTab === tab.key
                      ? '#4DB89E'
                      : '#F5F5F5',
                  color:
                    activeTab === tab.key
                      ? '#fff'
                      : '#888'
                }}
              >
                {tab.label}

                {countByStatus(tab.key) > 0 && (
                  <span
                    style={{
                      marginLeft: '6px',
                      background:
                        activeTab === tab.key
                          ? 'rgba(255,255,255,0.3)'
                          : '#E0E0E0',
                      color:
                        activeTab === tab.key
                          ? '#fff'
                          : '#666',
                      fontSize: '11px',
                      padding: '1px 6px',
                      borderRadius: '10px'
                    }}
                  >
                    {countByStatus(tab.key)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders */}
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '20px'
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 0',
              color: '#BBB'
            }}
          >
            <div
              style={{
                fontSize: '40px',
                marginBottom: '12px'
              }}
            >
              🍽️
            </div>

            <p>
              Tidak ada pesanan {activeTab}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '16px'
            }}
          >
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