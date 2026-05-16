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

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .order('id')

    const { data: menuData } = await supabase
      .from('menus')
      .select('*, menu_options(*), categories(name)')
      .eq('is_available', true)
      .order('id')

    setCategories(cats || [])
    setMenus(menuData || [])
    setActiveCategory(cats?.[0]?.id || null)
    setLoading(false)
  }

  function addToCart(item) {
    setCart(prev => {
      const key = item.id + (item.selectedOption || '')
      const exists = prev.find(c => c.cartKey === key)
      if (exists) {
        return prev.map(c =>
          c.cartKey === key
            ? { ...c, quantity: c.quantity + item.quantity }
            : c
        )
      }
      return [...prev, { ...item, cartKey: key }]
    })
    toast.success(`${item.name} ditambahkan!`)
  }

  function removeFromCart(cartKey) {
    setCart(prev => prev.filter(c => c.cartKey !== cartKey))
  }

  function updateQuantity(cartKey, qty) {
    if (qty < 1) return removeFromCart(cartKey)
    setCart(prev =>
      prev.map(c => c.cartKey === cartKey ? { ...c, quantity: qty } : c)
    )
  }

  async function submitOrder(customerNote) {
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

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

    if (error) { toast.error('Gagal membuat pesanan'); return }

    const items = cart.map(item => ({
      order_id: order.id,
      menu_id: item.id,
      menu_name: item.name,
      quantity: item.quantity,
      price: item.price,
      selected_option: item.selectedOption || null,
      subtotal: item.price * item.quantity
    }))

    await supabase.from('order_items').insert(items)

    setOrderId(order.id)
    setCart([])
    setShowCart(false)
    setOrderSuccess(true)
  }

  const filteredMenus = menus.filter(m => m.category_id === activeCategory)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Memuat menu...</p>
    </div>
  )

  if (orderSuccess) return <OrderSuccess orderId={orderId} tableId={tableId} />

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-orange-500">🍽️ QR Order</h1>
            <p className="text-xs text-gray-500">Meja {tableId}</p>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium"
          >
            🛒 Keranjang
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Tab Kategori */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {filteredMenus.map(menu => (
          <MenuCard key={menu.id} menu={menu} onAddToCart={addToCart} />
        ))}
      </div>

      {/* Cart Drawer */}
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