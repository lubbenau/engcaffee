'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MenuCard from '@/components/MenuCard'
import CartDrawer from '@/components/CartDrawer'
import OrderSuccess from '@/components/OrderSuccess'
import toast, { Toaster } from 'react-hot-toast'

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
      style: { borderRadius: '12px', background: C.brownDeep, color: C.cream, fontSize: '13px' }
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
    <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>☕</div>
      <p style={{ color: C.brown, fontWeight: '600' }}>Menyeduh menu...</p>
    </div>
  )

  if (orderSuccess) return <OrderSuccess orderId={orderId} tableId={tableId} />

  return (
    <div style={{ minHeight: '100vh', background: C.cream }}>
      <Toaster position="top-center" />

      {/* Hero */}
      <div style={{ background: C.brownDeep, padding: '40px 20px 56px' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: C.cream, fontFamily: 'Georgia, serif' }}>EngCaffee</h1>
              <p style={{ fontSize: '10px', color: C.brownLight, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>Selamat datang</p>
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', padding: '6px 14px', borderRadius: '20px', border: `1px solid ${C.brownLight}`, color: C.brownLight }}>
              Meja {tableId}
            </div>
          </div>
          <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.08)', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: '0.5px solid rgba(196,168,130,0.2)' }}>
            <span style={{ color: C.brownLight }}>🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari menu favoritmu..."
              style={{ background: 'transparent', border: 'none', outline: 'none', color: C.cream, fontSize: '14px', flex: 1 }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '520px', margin: '-24px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
        <div style={{ background: C.white, borderRadius: '24px', overflow: 'hidden' }}>

          {/* Kategori */}
          <div style={{ display: 'flex', gap: '8px', padding: '16px', overflowX: 'auto', borderBottom: `0.5px solid ${C.cream2}` }}>
            <button onClick={() => setActiveCategory(null)} style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
              whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
              background: !activeCategory ? C.brownDark : C.cream,
              color: !activeCategory ? C.cream : C.brown,
            }}>Semua</button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
                padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                whiteSpace: 'nowrap', cursor: 'pointer', border: `0.5px solid ${C.brownLight}`,
                background: activeCategory === cat.id ? C.brownDark : C.cream,
                color: activeCategory === cat.id ? C.cream : C.brown,
              }}>{cat.name}</button>
            ))}
          </div>

          {/* Menu Grid */}
          <div style={{ padding: '16px' }}>
            {filteredMenus.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMuted }}>
                <p style={{ fontSize: '32px', marginBottom: '8px' }}>☕</p>
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
        </div>
        <div style={{ height: '96px' }} />
      </div>

      {/* Cart Bar */}
      {totalItems > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px', zIndex: 20 }}>
          <div style={{ maxWidth: '520px', margin: '0 auto' }}>
            <button onClick={() => setShowCart(true)} style={{
              width: '100%', background: C.brownDeep, color: C.cream, borderRadius: '16px',
              padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: C.brownLight, color: C.brownDeep, fontSize: '11px', fontWeight: '700', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {totalItems}
                </span>
                Lihat Keranjang
              </div>
              <span style={{ fontWeight: '700' }}>Rp {totalPrice.toLocaleString('id-ID')}</span>
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