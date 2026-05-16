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
      style: { borderRadius: '12px', background: '#3B2314', color: '#F5F0E8', fontSize: '13px' }
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
    <div className="flex flex-col items-center justify-center min-h-screen"
      style={{ background: 'var(--cream)' }}>
      <div className="text-4xl mb-3">☕</div>
      <p className="text-sm font-semibold" style={{ color: 'var(--brown)' }}>Menyeduh menu...</p>
    </div>
  )

  if (orderSuccess) return <OrderSuccess orderId={orderId} tableId={tableId} />

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>
      <Toaster position="top-center" />

      {/* Hero */}
      <div style={{ background: 'var(--brown-deep)' }} className="px-4 pt-10 pb-14">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-serif text-2xl font-bold" style={{ color: 'var(--cream)' }}>
                EngCaffee
              </h1>
              <p className="text-xs tracking-widest uppercase mt-0.5" style={{ color: 'var(--brown-light)' }}>
                Selamat datang
              </p>
            </div>
            <div className="text-xs font-semibold px-3 py-1.5 rounded-full border"
              style={{ borderColor: 'var(--brown-light)', color: 'var(--brown-light)', background: 'rgba(196,168,130,0.1)' }}>
              Meja {tableId}
            </div>
          </div>
          <div className="mt-4 rounded-2xl flex items-center gap-2 px-4 py-2.5 border"
            style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(196,168,130,0.2)' }}>
            <span style={{ color: 'var(--brown-light)' }}>🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari menu favoritmu..."
              className="bg-transparent text-sm flex-1 outline-none"
              style={{ color: 'var(--cream)', caretColor: 'var(--brown-light)' }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 -mt-6 relative z-10">
        <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--white)' }}>

          {/* Kategori */}
          <div className="flex gap-2 px-4 pt-4 pb-3 overflow-x-auto"
            style={{ borderBottom: '0.5px solid var(--cream2)' }}>
            <button onClick={() => setActiveCategory(null)}
              className="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all"
              style={!activeCategory
                ? { background: 'var(--brown-dark)', color: 'var(--cream)' }
                : { background: 'var(--cream)', color: 'var(--brown)', border: '0.5px solid var(--brown-light)' }}>
              Semua
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all"
                style={activeCategory === cat.id
                  ? { background: 'var(--brown-dark)', color: 'var(--cream)' }
                  : { background: 'var(--cream)', color: 'var(--brown)', border: '0.5px solid var(--brown-light)' }}>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="px-4 py-4">
            {filteredMenus.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">☕</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Menu tidak ditemukan</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredMenus.map(menu => (
                  <MenuCard key={menu.id} menu={menu} onAddToCart={addToCart} />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="h-24" />
      </div>

      {/* Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 p-4">
          <div className="max-w-lg mx-auto">
            <button onClick={() => setShowCart(true)}
              className="w-full rounded-2xl py-4 px-5 flex items-center justify-between transition-all"
              style={{ background: 'var(--brown-deep)', color: 'var(--cream)' }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                  style={{ background: 'var(--brown-light)', color: 'var(--brown-deep)' }}>
                  {totalItems}
                </span>
                <span className="font-semibold text-sm">Lihat Keranjang</span>
              </div>
              <span className="font-bold">Rp {totalPrice.toLocaleString('id-ID')}</span>
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