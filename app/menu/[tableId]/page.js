'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MenuCard from '@/components/MenuCard'
import CartDrawer from '@/components/CartDrawer'
import OrderSuccess from '@/components/OrderSuccess'
import toast, { Toaster } from 'react-hot-toast'

export default function MenuPage() {
  const { tableId } = useParams()
  const [categories, setCategories] = useState([])
  const [menus, setMenus] = useState([])
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data: cats } = await supabase.from('categories').select('*').order('id')
    const { data: menuData } = await supabase
      .from('menus').select('*, menu_options(*), categories(name)')
      .eq('is_available', true).order('id')
    setCategories(cats || [])
    setMenus(menuData || [])
    setLoading(false)
  }

  function addToCart(item) {
    setCart(prev => {
      const key = item.id + (item.selectedOption || '')
      const exists = prev.find(c => c.cartKey === key)
      if (exists) return prev.map(c => c.cartKey === key ? { ...c, quantity: c.quantity + item.quantity } : c)
      return [...prev, { ...item, cartKey: key }]
    })
    toast.success(`${item.name} ditambahkan!`, {
      style: { borderRadius: '12px', background: '#1A1A1A', color: '#fff', fontSize: '13px' }
    })
  }

  function removeFromCart(cartKey) { setCart(prev => prev.filter(c => c.cartKey !== cartKey)) }
  function updateQuantity(cartKey, qty) {
    if (qty < 1) return removeFromCart(cartKey)
    setCart(prev => prev.map(c => c.cartKey === cartKey ? { ...c, quantity: qty } : c))
  }

  async function submitOrder(customerNote) {
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const { data: order, error } = await supabase.from('orders')
      .insert({ table_number: parseInt(tableId), status: 'pending', total_price: totalPrice, customer_note: customerNote })
      .select().single()
    if (error) { toast.error('Gagal membuat pesanan'); return }
    const items = cart.map(item => ({
      order_id: order.id, menu_id: item.id, menu_name: item.name,
      quantity: item.quantity, price: item.price,
      selected_option: item.selectedOption || null,
      subtotal: item.price * item.quantity
    }))
    await supabase.from('order_items').insert(items)
    setOrderId(order.id)
    setCart([])
    setShowCart(false)
    setOrderSuccess(true)
  }

  const filteredMenus = menus.filter(m => {
    const matchCat = activeCategory ? m.category_id === activeCategory : true
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F4FAF8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>🍽️</div>
      <p style={{ color: '#4DB89E', fontWeight: '600' }}>Memuat menu...</p>
    </div>
  )

  if (orderSuccess) return <OrderSuccess orderId={orderId} tableId={tableId} />

  return (
    <div style={{ minHeight: '100vh', background: '#F4FAF8', paddingBottom: '80px' }}>
      <Toaster position="top-center" />

      {/* Header */}
      <div style={{ background: '#fff', padding: '16px 16px 0', position: 'sticky', top: 0, zIndex: 10, borderBottom: '0.5px solid #F0F0F0' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1A1A' }}>Menu</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: '#4DB89E', background: '#E8F7F3', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>
                Meja {tableId}
              </span>
              <button onClick={() => setShowCart(true)} style={{
                width: '40px', height: '40px', background: '#4DB89E', borderRadius: '12px',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
              }}>
                <span style={{ fontSize: '18px' }}>🛒</span>
                {totalItems > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#FF6B6B', color: '#fff', fontSize: '10px', fontWeight: '700', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search */}
          <div style={{ background: '#F5F5F5', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px', color: '#BBB' }}>🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari menu..."
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: '#1A1A1A', flex: 1 }} />
          </div>

          {/* Kategori */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px' }}>
            <button onClick={() => setActiveCategory(null)} style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
              whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
              background: !activeCategory ? '#4DB89E' : '#F5F5F5',
              color: !activeCategory ? '#fff' : '#888',
            }}>Semua</button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
                padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
                background: activeCategory === cat.id ? '#4DB89E' : '#F5F5F5',
                color: activeCategory === cat.id ? '#fff' : '#888',
              }}>{cat.name}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px' }}>
        {filteredMenus.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#BBB' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🍽️</div>
            <p>Menu tidak ditemukan</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {filteredMenus.map(menu => (
              <MenuCard key={menu.id} menu={menu} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Cart Bar */}
      {totalItems > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: '#fff', borderTop: '0.5px solid #F0F0F0', zIndex: 20 }}>
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <button onClick={() => setShowCart(true)} style={{
              width: '100%', background: '#4DB89E', color: '#fff',
              padding: '14px 20px', borderRadius: '16px', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                  {totalItems}
                </span>
                Lihat Keranjang
              </div>
              <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
            </button>
          </div>
        </div>
      )}

      {showCart && (
        <CartDrawer cart={cart} tableId={tableId}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onUpdateQty={updateQuantity}
          onSubmit={submitOrder} />
      )}
    </div>
  )
}