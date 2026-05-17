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

  // Ubah bagian "Hero" dan "Menu Grid" di page.js
// ... (logika useEffect dll tetap sama)

  return (
    <div className="min-h-screen pb-24">
      <Toaster position="top-center" />

      {/* Hero Section Modern */}
      <div className="relative overflow-hidden bg-[#3B2314] px-6 pt-12 pb-20 rounded-b-[3rem] shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A373] opacity-10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="text-[#C4A882] text-[10px] tracking-[0.3em] uppercase font-bold">Premium Experience</span>
          <h1 className="text-4xl font-serif font-bold text-[#F5F0E8] mt-1">EngCaffee</h1>
          <div className="flex items-center gap-2 mt-4">
             <div className="px-3 py-1 rounded-full border border-[#C4A882]/30 text-[#C4A882] text-[10px] font-bold">
               Table {tableId}
             </div>
          </div>

          {/* Search Bar Glass */}
          <div className="mt-8 glass-dark rounded-[1.5rem] flex items-center px-4 py-3">
            <span className="text-[#C4A882]">🔍</span>
            <input 
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="What are you craving today?"
              className="bg-transparent border-none outline-none text-white text-sm ml-3 w-full placeholder:text-[#8B7355]"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto -mt-10 px-4">
        {/* Kategori Floating */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-4">
          <button 
            onClick={() => setActiveCategory(null)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm
              ${!activeCategory ? 'bg-[#5C3D2E] text-white' : 'glass text-[#8B6347]'}`}
          >
            All Menu
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm whitespace-nowrap
                ${activeCategory === cat.id ? 'bg-[#5C3D2E] text-white' : 'glass text-[#8B6347]'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Grid - BENTO STYLE */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {filteredMenus.map(menu => (
            <MenuCard key={menu.id} menu={menu} onAddToCart={addToCart} />
          ))}
        </div>
      </div>

      {/* Floating Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-6 z-[100]">
          <button 
            onClick={() => setShowCart(true)}
            className="max-w-md mx-auto w-full glass-dark text-white rounded-[2rem] p-2 flex items-center justify-between shadow-[0_20px_50px_rgba(59,35,20,0.3)] animate-bounce-in"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#C4A882] flex items-center justify-center font-black text-[#3B2314]">
                {totalItems}
              </div>
              <div className="text-left">
                <p className="text-[10px] text-[#C4A882] uppercase font-bold">Total Order</p>
                <p className="text-sm font-bold">Rp {totalPrice.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <div className="pr-4 font-bold text-xs flex items-center gap-2">
              VIEW CART <span>→</span>
            </div>
          </button>
        </div>
      )}
      {/* ... sisanya (CartDrawer) tetap sama */}
    </div>
  )
}