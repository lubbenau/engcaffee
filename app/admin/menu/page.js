'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

export default function AdminMenuPage() {
  const [menus, setMenus] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', price: '',
    category_id: '', has_options: false, is_available: true
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [editId, setEditId] = useState(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data: cats } = await supabase.from('categories').select('*').order('id')
    const { data: menuData } = await supabase
      .from('menus').select('*, categories(name)').order('id')
    setCategories(cats || [])
    setMenus(menuData || [])
    setLoading(false)
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function uploadImage(file) {
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const { data, error } = await supabase.storage
      .from('menu-images')
      .upload(fileName, file, { upsert: true })
    if (error) { toast.error('Gagal upload foto'); return null }
    const { data: urlData } = supabase.storage
      .from('menu-images')
      .getPublicUrl(fileName)
    return urlData.publicUrl
  }

  async function handleSubmit() {
    if (!form.name || !form.price || !form.category_id) {
      toast.error('Nama, harga, dan kategori wajib diisi!')
      return
    }
    setUploading(true)

    let imageUrl = form.image_url || null
    if (imageFile) {
      imageUrl = await uploadImage(imageFile)
      if (!imageUrl) { setUploading(false); return }
    }

    const payload = {
      name: form.name,
      description: form.description,
      price: parseInt(form.price),
      category_id: parseInt(form.category_id),
      has_options: form.has_options,
      is_available: form.is_available,
      image_url: imageUrl
    }

    if (editId) {
      await supabase.from('menus').update(payload).eq('id', editId)
      toast.success('Menu berhasil diupdate!')
    } else {
      await supabase.from('menus').insert(payload)
      toast.success('Menu berhasil ditambahkan!')
    }

    resetForm()
    fetchData()
    setUploading(false)
  }

  async function handleDelete(id, imageUrl) {
    if (!confirm('Hapus menu ini?')) return
    if (imageUrl) {
      const fileName = imageUrl.split('/').pop()
      await supabase.storage.from('menu-images').remove([fileName])
    }
    await supabase.from('menus').delete().eq('id', id)
    toast.success('Menu dihapus!')
    fetchData()
  }

  async function toggleAvailable(id, current) {
    await supabase.from('menus').update({ is_available: !current }).eq('id', id)
    fetchData()
  }

  function handleEdit(menu) {
    setForm({
      name: menu.name,
      description: menu.description || '',
      price: menu.price,
      category_id: menu.category_id,
      has_options: menu.has_options,
      is_available: menu.is_available,
      image_url: menu.image_url
    })
    setImagePreview(menu.image_url)
    setEditId(menu.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setForm({ name: '', description: '', price: '', category_id: '', has_options: false, is_available: true })
    setImageFile(null)
    setImagePreview(null)
    setEditId(null)
    setShowForm(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-400">Memuat data menu...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-orange-500">🍽️ Kelola Menu</h1>
            <p className="text-xs text-gray-400">{menus.length} menu terdaftar</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin"
              className="text-sm text-gray-500 border border-gray-200 px-3 py-2 rounded-xl">
              ← Dashboard
            </Link>
            <button onClick={() => { resetForm(); setShowForm(!showForm) }}
              className="bg-orange-500 text-white text-sm px-4 py-2 rounded-xl font-semibold">
              {showForm ? '✕ Batal' : '+ Tambah Menu'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">
              {editId ? '✏️ Edit Menu' : '➕ Tambah Menu Baru'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Foto Menu</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-orange-50 flex items-center justify-center flex-shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">🍽️</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-orange-50 file:text-orange-500 file:font-semibold hover:file:bg-orange-100" />
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP. Maks 5MB.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nama Menu *</label>
                <input type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="contoh: Nasi Goreng Spesial"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-200" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Harga *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Rp</span>
                  <input type="number" value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="15000"
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-200" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Kategori *</label>
                <select value={form.category_id}
                  onChange={e => setForm({ ...form, category_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-200">
                  <option value="">Pilih kategori</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Deskripsi</label>
                <input type="text" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="contoh: Nasi goreng dengan telur mata sapi"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-200" />
              </div>

              <div className="md:col-span-2 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => setForm({ ...form, has_options: !form.has_options })}
                    className={`w-11 h-6 rounded-full transition-colors relative ${form.has_options ? 'bg-orange-500' : 'bg-gray-200'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.has_options ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-sm text-gray-600">Ada opsi (pedas/sedang/tidak pedas)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => setForm({ ...form, is_available: !form.is_available })}
                    className={`w-11 h-6 rounded-full transition-colors relative ${form.is_available ? 'bg-orange-500' : 'bg-gray-200'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.is_available ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-sm text-gray-600">Menu tersedia</span>
                </label>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={uploading}
              className="mt-5 w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-3 rounded-xl font-bold text-sm transition-all">
              {uploading ? '⏳ Menyimpan...' : editId ? '💾 Update Menu' : '➕ Tambah Menu'}
            </button>
          </div>
        )}

        {categories.map(cat => {
          const catMenus = menus.filter(m => m.category_id === cat.id)
          if (catMenus.length === 0) return null
          return (
            <div key={cat.id}>
              <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-orange-500 rounded-full inline-block" />
                {cat.name}
                <span className="text-xs font-normal text-gray-400">{catMenus.length} menu</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {catMenus.map(menu => (
                  <div key={menu.id}
                    className={`bg-white rounded-2xl border overflow-hidden flex gap-3 p-3 ${!menu.is_available ? 'opacity-50' : 'border-gray-100'}`}>
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-orange-50 flex items-center justify-center">
                      {menu.image_url ? (
                        <img src={menu.image_url} alt={menu.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">🍽️</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-gray-900 text-sm truncate">{menu.name}</p>
                        {!menu.is_available && (
                          <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full ml-1 flex-shrink-0">Habis</span>
                        )}
                      </div>
                      {menu.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{menu.description}</p>
                      )}
                      <p className="text-sm font-bold text-orange-500 mt-1">
                        Rp {menu.price.toLocaleString('id-ID')}
                      </p>
                      {menu.has_options && (
                        <span className="text-xs text-orange-400">🌶️ Ada opsi kepedasan</span>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleEdit(menu)}
                          className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-lg font-medium">
                          ✏️ Edit
                        </button>
                        <button onClick={() => toggleAvailable(menu.id, menu.is_available)}
                          className="text-xs bg-orange-50 text-orange-500 px-3 py-1 rounded-lg font-medium">
                          {menu.is_available ? '🚫 Nonaktifkan' : '✅ Aktifkan'}
                        </button>
                        <button onClick={() => handleDelete(menu.id, menu.image_url)}
                          className="text-xs bg-red-50 text-red-400 px-3 py-1 rounded-lg font-medium">
                          🗑️ Hapus
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
    </div>
  )
}