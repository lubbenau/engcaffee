'use client'

import { useEffect, useState, useTransition } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import { ShoppingBasket, Heart, User, Sparkles, Award } from 'lucide-react'

// Import components
import SkeletonLoading from '@/components/customer/SkeletonLoading'
import SearchBar from '@/components/customer/SearchBar'
import CategoryTabs from '@/components/customer/CategoryTabs'
import BottomNav from '@/components/customer/BottomNav'
import MenuCard from '@/components/customer/MenuCard'
import CartDrawer from '@/components/customer/CartDrawer'
import OrderTracking from '@/components/customer/OrderTracking'
import OrderSuccess from '@/components/OrderSuccess'

export default function MenuPage() {
  const { tableId } = useParams()
  const [categories, setCategories] = useState([])
  const [menus, setMenus] = useState([])
  const [cart, setCart] = useState([])
  const [favorites, setFavorites] = useState([])
  const [activeTab, setActiveTab] = useState('menu') // menu, favorites, orders, profile
  const [showCart, setShowCart] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [, startTransition] = useTransition()

  // Track customer's local order IDs count
  const [activeOrdersCount, setActiveOrdersCount] = useState(0)

  useEffect(() => {
    fetchData()
    // Load favorites from localStorage
    const savedFavs = localStorage.getItem('customer_favorites')
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs))
    }
    
    // Check local active order count
    updateOrderCount()
  }, [])

  function updateOrderCount() {
    const stored = localStorage.getItem('customer_orders')
    if (stored) {
      const ids = JSON.parse(stored)
      setActiveOrdersCount(ids.length)
    }
  }

  async function fetchData() {
    try {
      const { data: cats } = await supabase.from('categories').select('*').order('id')
      const { data: menuData } = await supabase
        .from('menus')
        .select('*, menu_options(*), categories(name)')
        .eq('is_available', true)
        .order('id')
      
      setCategories(cats || [])
      setMenus(menuData || [])
    } catch (e) {
      console.error(e)
      toast.error('Gagal mengambil data menu')
    } finally {
      setLoading(false)
    }
  }

  // Optimistic UI: Add to cart is immediate
  function addToCart(item) {
    // We update cart instantly
    const key = item.id + (item.selectedOption || '')
    
    setCart((prev) => {
      const exists = prev.find((c) => c.cartKey === key)
      if (exists) {
        return prev.map((c) => (c.cartKey === key ? { ...c, quantity: c.quantity + 1 } : c))
      }
      return [...prev, { ...item, quantity: 1, cartKey: key }]
    })

    toast.success(`${item.name} ditambahkan!`, {
      style: {
        borderRadius: '16px',
        background: '#046A55',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 'bold',
        padding: '12px 18px'
      },
      icon: '✨'
    })
  }

  // Optimistic UI updates
  function removeFromCart(cartKey) {
    setCart((prev) => prev.filter((c) => c.cartKey !== cartKey))
  }

  function updateQuantity(cartKey, qty) {
    if (qty < 1) {
      removeFromCart(cartKey)
      return
    }
    setCart((prev) => prev.map((c) => (c.cartKey === cartKey ? { ...c, quantity: qty } : c)))
  }

  async function submitOrder(customerNote) {
    try {
      const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      
      // 1. Insert Order
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          table_number: parseInt(tableId),
          status: 'pending',
          total_price: totalPrice,
          customer_note: customerNote
        })
        .select()
        .single()

      if (error) {
        toast.error('Gagal memproses pesanan')
        return
      }

      // 2. Insert Order Items
      const items = cart.map((item) => ({
        order_id: order.id,
        menu_id: item.id,
        menu_name: item.name,
        quantity: item.quantity,
        price: item.price,
        selected_option: item.selectedOption || null,
        subtotal: item.price * item.quantity
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(items)
      if (itemsError) {
        console.error(itemsError)
        toast.error('Gagal memproses item pesanan')
        return
      }

      // 3. Save order ID to localStorage for real-time tracking
      const stored = localStorage.getItem('customer_orders')
      const currentOrders = stored ? JSON.parse(stored) : []
      localStorage.setItem('customer_orders', JSON.stringify([order.id, ...currentOrders]))
      
      // Update order counts
      updateOrderCount()

      // Reset cart and proceed
      setOrderId(order.id)
      setCart([])
      setShowCart(false)
      setOrderSuccess(true)
    } catch (err) {
      console.error(err)
      toast.error('Terjadi kesalahan')
    }
  }

  // Handle Favorites toggle
  function toggleFavorite(menuId) {
    let updatedFavorites = []
    if (favorites.includes(menuId)) {
      updatedFavorites = favorites.filter((id) => id !== menuId)
      toast.success('Dihapus dari Favorit', { style: { borderRadius: '12px', fontSize: '12px' } })
    } else {
      updatedFavorites = [...favorites, menuId]
      toast.success('Ditambahkan ke Favorit', { style: { borderRadius: '12px', fontSize: '12px' } })
    }
    setFavorites(updatedFavorites)
    localStorage.setItem('customer_favorites', JSON.stringify(updatedFavorites))
  }

  const filteredMenus = menus.filter((m) => {
    const matchCat = activeCategory ? m.category_id === activeCategory : true
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const favoriteMenus = menus.filter((m) => favorites.includes(m.id))

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D7EFEA] flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] bg-[#D7EFEA] rounded-[32px] overflow-hidden py-4">
          <SkeletonLoading />
        </div>
      </div>
    )
  }

  if (orderSuccess) {
    return <OrderSuccess orderId={orderId} tableId={tableId} />
  }

  return (
    <div className="min-h-screen bg-[#D7EFEA] font-sans antialiased text-gray-900 pb-32">
      <Toaster position="top-center" />

      {/* Main mobile wrapper */}
      <div className="max-w-[480px] mx-auto px-4 pt-6">
        
        {/* VIEW 1: MENU CATALOG */}
        {activeTab === 'menu' && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black text-gray-950 tracking-tight">Menu</h1>
                <p className="text-xs text-[#046A55] font-extrabold tracking-wide mt-0.5">ENGCAFFEE • MEJA {tableId}</p>
              </div>
              
              <button
                onClick={() => setShowCart(true)}
                className="w-12 h-12 bg-[#046A55] hover:bg-[#035343] text-white rounded-[18px] border-none cursor-pointer flex items-center justify-center relative shadow-md transition-all duration-300"
              >
                <ShoppingBasket size={22} className="stroke-[2.2]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white animate-bounce">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

            {/* Search capsule bar */}
            <SearchBar value={search} onChange={setSearch} />

            {/* Horizontal Categories Underline Navigation */}
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />

            {/* 2-Column Catalog Grid */}
            {filteredMenus.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-4">🍽️</div>
                <p className="font-extrabold text-[14px]">Menu tidak ditemukan</p>
                <p className="text-xs text-gray-400 mt-1">Coba kata kunci lain atau pilih kategori lain.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredMenus.map((menu) => (
                  <div key={menu.id} className="relative">
                    <MenuCard menu={menu} onAddToCart={addToCart} />
                    
                    {/* Add visual Heart toggle icon above Card */}
                    <button
                      onClick={() => toggleFavorite(menu.id)}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm border-none cursor-pointer flex items-center justify-center shadow-sm z-10"
                    >
                      <Heart
                        size={14}
                        className={`transition-colors stroke-[2.5] ${
                          favorites.includes(menu.id)
                            ? 'fill-red-500 stroke-red-500'
                            : 'text-gray-400'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: FAVORITES */}
        {activeTab === 'favorites' && (
          <div className="space-y-5">
            <div>
              <h1 className="text-3xl font-black text-gray-950 tracking-tight">Favorit</h1>
              <p className="text-xs text-[#046A55] font-extrabold tracking-wide mt-0.5">MENU PILIHAN ANDA</p>
            </div>

            {favoriteMenus.length === 0 ? (
              <div className="bg-white rounded-[24px] p-8 text-center border border-[#e8f5f2]/40 shadow-sm mt-6">
                <div className="w-16 h-16 rounded-full bg-[#FFEDED] text-red-500 flex items-center justify-center mx-auto text-2xl mb-4">
                  ❤️
                </div>
                <h3 className="font-extrabold text-[16px] text-gray-900">Belum Ada Menu Favorit</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Tandai menu makanan atau minuman kesukaan Anda dengan mengetuk ikon hati di pojok kanan atas katalog menu.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {favoriteMenus.map((menu) => (
                  <div key={menu.id} className="relative">
                    <MenuCard menu={menu} onAddToCart={addToCart} />
                    <button
                      onClick={() => toggleFavorite(menu.id)}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm border-none cursor-pointer flex items-center justify-center shadow-sm z-10"
                    >
                      <Heart size={14} className="fill-red-500 stroke-red-500 stroke-[2.5]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: LIVE ORDER TRACKING */}
        {activeTab === 'orders' && (
          <OrderTracking tableId={tableId} />
        )}

        {/* VIEW 4: PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-gray-950 tracking-tight">Profil</h1>
              <p className="text-xs text-[#046A55] font-extrabold tracking-wide mt-0.5">SINOPSIS KUNJUNGAN</p>
            </div>

            {/* Premium Digital ID Card */}
            <div className="bg-gradient-to-br from-[#046A55] to-[#035343] text-white rounded-[28px] p-6 shadow-lg border border-white/10 relative overflow-hidden">
              {/* Background abstract elements */}
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                <Sparkles size={160} />
              </div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border border-white/20 text-3xl">
                  👤
                </div>
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight">Pelanggan Meja {tableId}</h3>
                  <p className="text-[11px] text-white/70 font-semibold tracking-wide uppercase mt-0.5">VIP Guest • EngCaffee</p>
                </div>
              </div>

              {/* Reward Points Details */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-5 border-t border-white/10 relative z-10">
                <div>
                  <p className="text-[9px] text-white/50 uppercase font-bold tracking-wider">Koin Loyalitas</p>
                  <p className="text-xl font-black tracking-tight text-[#DEFF9A] flex items-center gap-1.5 mt-0.5">
                    120 <Award size={18} />
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-white/50 uppercase font-bold tracking-wider">Status Meja</p>
                  <p className="text-sm font-extrabold tracking-wide mt-1">Aktif Scan QR</p>
                </div>
              </div>
            </div>

            {/* Menu List profile utilities */}
            <div className="bg-white rounded-[24px] p-4 border border-[#e8f5f2]/40 shadow-sm space-y-1">
              <div className="flex justify-between items-center py-3 px-2 border-b border-gray-50 cursor-pointer hover:bg-gray-50 rounded-xl">
                <span className="text-xs font-bold text-gray-700">Hubungi Pelayan</span>
                <span className="text-[11px] text-[#046A55] font-extrabold">Panggil 🛎️</span>
              </div>
              <div className="flex justify-between items-center py-3 px-2 border-b border-gray-50 cursor-pointer hover:bg-gray-50 rounded-xl">
                <span className="text-xs font-bold text-gray-700">Minta Bill Tagihan</span>
                <span className="text-[11px] text-[#046A55] font-extrabold">Bill 💵</span>
              </div>
              <div className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-gray-50 rounded-xl">
                <span className="text-xs font-bold text-gray-700">Informasi Wi-Fi</span>
                <span className="text-[11px] text-[#046A55] font-extrabold">EngCafeFree 📶</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Persistent Bottom Floating Cart Bar */}
      {totalItems > 0 && activeTab === 'menu' && (
        <div className="fixed bottom-24 left-0 right-0 px-6 z-30">
          <div className="max-w-[420px] mx-auto">
            <button
              onClick={() => setShowCart(true)}
              className="w-full bg-[#046A55] hover:bg-[#035343] text-white py-4 px-6 rounded-2xl border-none cursor-pointer flex items-center justify-between shadow-xl transition-all duration-300 transform active:scale-98"
            >
              <div className="flex items-center gap-3">
                <span className="bg-white/20 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-black">
                  {totalItems}
                </span>
                <span className="font-extrabold text-[14px]">Lihat Keranjang</span>
              </div>
              <span className="font-black text-[15px]">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation Menu */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => startTransition(() => setActiveTab(tab))}
        badgeCount={activeOrdersCount}
      />

      {/* Slide-Up checkout drawer modal */}
      {showCart && (
        <CartDrawer
          cart={cart}
          tableId={tableId}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onUpdateQty={updateQuantity}
          onSubmit={submitOrder}
        />
      )}
    </div>
  )
}