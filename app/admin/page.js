'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'

// Import components
import Sidebar from '@/components/admin/Sidebar'
import Header from '@/components/admin/Header'
import StatCards from '@/components/admin/StatCards'
import RevenueChart from '@/components/admin/RevenueChart'
import RealTimeFeed from '@/components/admin/RealTimeFeed'
import MostOrdered from '@/components/admin/MostOrdered'
import QuickInsights from '@/components/admin/QuickInsights'
import QREngine from '@/components/admin/QREngine'
import AnalyticsPanel from '@/components/admin/AnalyticsPanel'
import KitchenAudio from '@/components/admin/KitchenAudio'
import OrderCard from '@/components/OrderCard'

export default function AdminPage() {
  const router = useRouter()

  // Dynamic layout tab state
  const [activeTab, setActiveTab] = useState('overview') // overview, orders, menu, qr-generator, analytics
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  
  // Real-time audio trigger timestamp
  const [audioTrigger, setAudioTrigger] = useState(0)

  // MENU MANAGEMENT EMBED STATES
  const [menus, setMenus] = useState([])
  const [categories, setCategories] = useState([])
  const [menuLoading, setMenuLoading] = useState(false)
  const [showMenuForm, setShowMenuForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    has_options: false,
    is_available: true,
    image_url: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [editMenuId, setEditMenuId] = useState(null)

  // Orders status tab filtering
  const [activeOrderStatusTab, setActiveOrderStatusTab] = useState('pending')

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
      await fetchMenusAndCategories()
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

  async function fetchMenusAndCategories() {
    setMenuLoading(true)
    const { data: cats } = await supabase.from('categories').select('*').order('id')
    const { data: menuData } = await supabase.from('menus').select('*, categories(name)').order('id')
    setCategories(cats || [])
    setMenus(menuData || [])
    setMenuLoading(false)
  }

  function subscribeOrders() {
    const channel = supabase
      .channel('admin-orders-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchSingleOrder(payload.new.id)

            toast('🔔 Pesanan baru masuk!', {
              duration: 5000,
              style: {
                background: '#DEFF9A',
                color: '#0B0F19',
                fontWeight: '900',
                borderRadius: '16px',
                border: '1px solid #cbe7e1'
              }
            })

            // Trigger Kitchen Audio alert chime
            setAudioTrigger(Date.now())
          }

          if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } : o))
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
      setOrders((prev) => [data, ...prev])
    }
  }

  async function updateStatus(orderId, newStatus) {
    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    toast.success(`Status diupdate ke ${newStatus}!`, {
      style: { borderRadius: '12px', background: '#0F172A', color: '#fff' }
    })
    
    fetchOrders()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  // MENU MANAGEMENT ACTIONS
  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function uploadImage(file) {
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('menu-images')
      .upload(fileName, file, { upsert: true })

    if (error) {
      toast.error('Gagal upload foto menu')
      return null
    }

    const { data } = supabase.storage.from('menu-images').getPublicUrl(fileName)
    return data.publicUrl
  }

  async function handleMenuSubmit() {
    if (!menuForm.name || !menuForm.price || !menuForm.category_id) {
      toast.error('Nama, harga, dan kategori wajib diisi!')
      return
    }

    setUploading(true)
    let imageUrl = menuForm.image_url || null

    if (imageFile) {
      imageUrl = await uploadImage(imageFile)
      if (!imageUrl) {
        setUploading(false)
        return
      }
    }

    const payload = {
      name: menuForm.name,
      description: menuForm.description,
      price: parseInt(menuForm.price),
      category_id: parseInt(menuForm.category_id),
      has_options: menuForm.has_options,
      is_available: menuForm.is_available,
      image_url: imageUrl
    }

    if (editMenuId) {
      const { error } = await supabase.from('menus').update(payload).eq('id', editMenuId)
      if (error) toast.error('Gagal update menu')
      else toast.success('Menu diupdate!')
    } else {
      const { error } = await supabase.from('menus').insert(payload)
      if (error) toast.error('Gagal menambah menu')
      else toast.success('Menu ditambahkan!')
    }

    resetMenuForm()
    fetchMenusAndCategories()
    setUploading(false)
  }

  async function handleMenuDelete(id, imageUrl) {
    if (!confirm('Hapus menu ini?')) return

    if (imageUrl) {
      const fileName = imageUrl.split('/').pop()
      await supabase.storage.from('menu-images').remove([fileName])
    }

    await supabase.from('menus').delete().eq('id', id)
    toast.success('Menu dihapus!')
    fetchMenusAndCategories()
  }

  async function toggleMenuAvailable(id, current) {
    await supabase.from('menus').update({ is_available: !current }).eq('id', id)
    fetchMenusAndCategories()
  }

  function handleMenuEdit(menu) {
    setMenuForm({
      name: menu.name || '',
      description: menu.description || '',
      price: menu.price || '',
      category_id: menu.category_id || '',
      has_options: menu.has_options || false,
      is_available: menu.is_available ?? true,
      image_url: menu.image_url || ''
    })
    setImagePreview(menu.image_url || null)
    setEditMenuId(menu.id)
    setShowMenuForm(true)
  }

  function resetMenuForm() {
    setMenuForm({
      name: '',
      description: '',
      price: '',
      category_id: '',
      has_options: false,
      is_available: true,
      image_url: ''
    })
    setImageFile(null)
    setImagePreview(null)
    setEditMenuId(null)
    setShowMenuForm(false)
  }

  // 1. Calculate Analytics indicators dynamically from local data
  const completedOrders = orders.filter((o) => o.status === 'done')
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total_price, 0)
  
  // Meja Aktif counts today orders with pending/confirmed statuses
  const activeTablesCount = [...new Set(
    orders
      .filter((o) => o.status === 'pending' || o.status === 'confirmed')
      .map((o) => o.table_number)
  )].length

  // Construct chart data for the last 7 days
  const now = new Date()
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const weeklyChartData = []
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(now.getDate() - i)
    const dayName = daysOfWeek[d.getDay()]
    const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const dEnd = dStart + 24 * 60 * 60 * 1000

    const dayOrders = completedOrders.filter((o) => {
      const t = new Date(o.created_at).getTime()
      return t >= dStart && t < dEnd
    })

    const daySales = dayOrders.reduce((sum, o) => sum + o.total_price, 0)
    weeklyChartData.push({ day: dayName, amount: daySales })
  }

  // Render content based on active tab selection
  const getActiveTabLabel = () => {
    const labels = {
      overview: 'Overview',
      orders: 'Real-time Orders',
      menu: 'Menu Management',
      'qr-generator': 'Table QR Generator',
      analytics: 'Sales Analytics'
    }
    return labels[activeTab] || 'Dashboard'
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#DEFF9A]/20 border-t-[#DEFF9A] rounded-full animate-spin"></div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Memuat Data Control Room...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 font-sans flex antialiased">
      <Toaster position="top-right" />

      {/* Modern Fintech Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header HUD panel */}
        <Header
          activeTabLabel={getActiveTabLabel()}
          orderCount={orders.filter((o) => o.status === 'pending').length}
        />

        <main className="flex-1 p-8 overflow-y-auto space-y-8 scrollbar-hide max-w-7xl w-full mx-auto">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Primary Stat widgets */}
              <StatCards
                revenue={totalRevenue}
                ordersCount={orders.length}
                activeTables={activeTablesCount}
              />

              {/* Kitchen Audio Alert primes */}
              <KitchenAudio triggerPlay={audioTrigger} />

              {/* Double Column content dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left Column (Area Chart & Real-Time Feed) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Revenue Area Chart */}
                  <RevenueChart weeklyData={weeklyChartData} />
                  
                  {/* Realtime Order lists Feed */}
                  <RealTimeFeed orders={orders} onUpdateStatus={updateStatus} />
                </div>

                {/* Right Column (Insights & Most Ordered) */}
                <div className="space-y-6">
                  {/* Most ordered item counts */}
                  <MostOrdered orders={orders} />

                  {/* Cerdas business insights */}
                  <QuickInsights orders={orders} />
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: REAL-TIME ORDERS LIST */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Status filter selection tabs */}
              <div className="flex justify-between items-center bg-[#0F172A] border border-[#1E293B] rounded-2xl p-2.5">
                <div className="flex gap-2">
                  {[
                    { id: 'pending', label: 'Pending', color: '#F5A623' },
                    { id: 'confirmed', label: 'Diproses', color: '#DEFF9A' },
                    { id: 'done', label: 'Selesai', color: '#38BDF8' }
                  ].map((tab) => {
                    const count = orders.filter((o) => o.status === tab.id).length
                    const isActive = activeOrderStatusTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveOrderStatusTab(tab.id)}
                        className={`px-6 py-2.5 rounded-xl border-none font-bold text-xs tracking-wider cursor-pointer transition-all duration-300 flex items-center gap-2 ${
                          isActive
                            ? 'bg-[#1E293B] text-white shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                        {count > 0 && (
                          <span
                            className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: isActive ? tab.color : '#1E293B',
                              color: isActive ? '#0B0F19' : tab.color
                            }}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Grid lists of cards */}
              {orders.filter((o) => o.status === activeOrderStatusTab).length === 0 ? (
                <div className="bg-[#0F172A] border border-[#1E293B] rounded-[32px] p-12 text-center text-gray-500">
                  <p className="text-3xl">🍽️</p>
                  <p className="font-extrabold text-[15px] text-gray-400 mt-3">Tidak ada pesanan {activeOrderStatusTab}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {orders
                    .filter((o) => o.status === activeOrderStatusTab)
                    .map((order) => (
                      <div key={order.id} className="relative group text-gray-900">
                        {/* Wrapper around vanilla light theme card so it loads beautifully */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-md transform hover:scale-[1.01] transition-all duration-200">
                          <OrderCard
                            order={order}
                            onUpdateStatus={updateStatus}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MENU MANAGEMENT EMBED */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              {/* Header inside Panel view */}
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-sm text-white uppercase tracking-wider">
                    Daftar Menu Makanan & Minuman
                  </h3>
                  <p className="text-[10px] text-gray-500 font-bold mt-0.5">
                    {menus.length} menu terdaftar di database
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (showMenuForm) resetMenuForm()
                    else setShowMenuForm(true)
                  }}
                  className="bg-[#DEFF9A] hover:bg-[#c3ec79] text-[#0B0F19] px-5 py-2.5 rounded-xl font-black text-xs cursor-pointer border-none transition-all shadow-sm"
                >
                  {showMenuForm ? '✕ TUTUP FORM' : '+ TAMBAH MENU BARU'}
                </button>
              </div>

              {/* Menu creation Form */}
              {showMenuForm && (
                <div className="bg-[#0F172A] border border-[#1E293B] rounded-[32px] p-6 space-y-5">
                  <h4 className="font-black text-white text-sm">
                    {editMenuId ? '✏️ EDIT DATA MENU' : '➕ INPUT MENU BARU'}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Image Preview & Upload */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-xs font-bold text-gray-400">FOTO HIDANGAN</label>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#0B0F19] border border-[#1E293B] flex items-center justify-center flex-shrink-0">
                          {imagePreview ? (
                            <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl">🍽️</span>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="text-xs text-gray-400 font-semibold"
                        />
                      </div>
                    </div>

                    {/* Name field */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400">NAMA HIDANGAN</label>
                      <input
                        type="text"
                        value={menuForm.name}
                        onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                        placeholder="Contoh: Kopi Aren, Nasi Goreng"
                        className="w-full bg-[#0B0F19] text-white border border-[#1E293B] rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none"
                      />
                    </div>

                    {/* Price field */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400">HARGA (RP)</label>
                      <input
                        type="number"
                        value={menuForm.price}
                        onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                        placeholder="18000"
                        className="w-full bg-[#0B0F19] text-white border border-[#1E293B] rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none"
                      />
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400">KATEGORI</label>
                      <select
                        value={menuForm.category_id}
                        onChange={(e) => setMenuForm({ ...menuForm, category_id: e.target.value })}
                        className="w-full bg-[#0B0F19] text-white border border-[#1E293B] rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none"
                      >
                        <option value="">Pilih Kategori</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description field */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400">DESKRIPSI MENU</label>
                      <input
                        type="text"
                        value={menuForm.description}
                        onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                        placeholder="Detail bahan hidangan..."
                        className="w-full bg-[#0B0F19] text-white border border-[#1E293B] rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none"
                      />
                    </div>

                    {/* Checkboxes controls */}
                    <div className="md:col-span-2 flex gap-6 pt-2">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-400">
                        <input
                          type="checkbox"
                          checked={menuForm.has_options}
                          onChange={() => setMenuForm({ ...menuForm, has_options: !menuForm.has_options })}
                          className="w-4 h-4 accent-[#DEFF9A]"
                        />
                        Ada Opsi Kepedasan
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-400">
                        <input
                          type="checkbox"
                          checked={menuForm.is_available}
                          onChange={() => setMenuForm({ ...menuForm, is_available: !menuForm.is_available })}
                          className="w-4 h-4 accent-[#DEFF9A]"
                        />
                        Menu Tersedia Dijual
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleMenuSubmit}
                    disabled={uploading}
                    className="w-full bg-[#DEFF9A] hover:bg-[#c3ec79] text-[#0B0F19] py-3.5 rounded-2xl font-black text-xs cursor-pointer border-none shadow-md mt-4"
                  >
                    {uploading ? 'SEDANG MENYIMPAN FOTO...' : editMenuId ? '💾 UPDATE INFORMASI MENU' : '➕ TAMBAH BARU SEKARANG'}
                  </button>
                </div>
              )}

              {/* Lists divided by Categories */}
              {menuLoading ? (
                <div className="text-center py-10">
                  <div className="w-8 h-8 border-4 border-[#DEFF9A]/20 border-t-[#DEFF9A] rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs text-gray-400">Loading menu list...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {categories.map((cat) => {
                    const catMenus = menus.filter((m) => m.category_id === cat.id)
                    if (catMenus.length === 0) return null

                    return (
                      <div key={cat.id} className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-[#1E293B] pb-2 pl-1">
                          <div className="w-2.5 h-6 bg-[#DEFF9A] rounded-full" />
                          <h4 className="font-black text-white text-sm uppercase tracking-wide">{cat.name}</h4>
                          <span className="text-[10px] text-gray-500 font-bold bg-[#1E293B] px-2 py-0.5 rounded-full">
                            {catMenus.length} item
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {catMenus.map((menu) => (
                            <div
                              key={menu.id}
                              className={`bg-[#0F172A] border border-[#1E293B] rounded-3xl overflow-hidden shadow-sm transition-all duration-300 hover:border-[#334155] ${
                                !menu.is_available ? 'opacity-50' : ''
                              }`}
                            >
                              {/* Image Display */}
                              <div className="h-44 bg-[#0B0F19] relative flex items-center justify-center overflow-hidden border-b border-[#1E293B]">
                                {menu.image_url ? (
                                  <img src={menu.image_url} alt={menu.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-5xl">🍽️</span>
                                )}
                              </div>

                              {/* Details list */}
                              <div className="p-5 space-y-4">
                                <div className="space-y-1">
                                  <h5 className="font-extrabold text-sm text-white line-clamp-1">{menu.name}</h5>
                                  <p className="text-[10px] text-gray-400 font-medium line-clamp-1">{menu.description || 'Tidak ada deskripsi'}</p>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="font-black text-base text-[#DEFF9A]">
                                    Rp {menu.price.toLocaleString('id-ID')}
                                  </span>
                                  {menu.has_options && (
                                    <span className="text-[9px] font-bold text-orange-400 bg-orange-950/20 px-2 py-0.5 rounded border border-orange-500/10">
                                      🌶️ PEDAS Scale
                                    </span>
                                  )}
                                </div>

                                {/* Menu Utilities controls Grid */}
                                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[#1E293B]/60">
                                  <button
                                    onClick={() => handleMenuEdit(menu)}
                                    className="bg-[#1E293B] hover:bg-[#334155] text-white rounded-xl py-2 font-bold text-[10px] cursor-pointer border-none transition-colors"
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    onClick={() => toggleMenuAvailable(menu.id, menu.is_available)}
                                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl py-2 font-bold text-[10px] cursor-pointer border-none transition-colors"
                                  >
                                    {menu.is_available ? 'Nonaktif' : 'Aktifkan'}
                                  </button>
                                  <button
                                    onClick={() => handleMenuDelete(menu.id, menu.image_url)}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl py-2 font-bold text-[10px] cursor-pointer border-none transition-colors"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AUTOMATIC QR ENGINE */}
          {activeTab === 'qr-generator' && <QREngine />}

          {/* TAB 5: SALES ANALYTICS DEEP DIVE */}
          {activeTab === 'analytics' && <AnalyticsPanel orders={orders} />}

        </main>
      </div>
    </div>
  )
}