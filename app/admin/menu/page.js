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

  const [editId, setEditId] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .order('id')

    const { data: menuData } = await supabase
      .from('menus')
      .select('*, categories(name)')
      .order('id')

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

    const { error } = await supabase.storage
      .from('menu-images')
      .upload(fileName, file, {
        upsert: true
      })

    if (error) {
      toast.error('Gagal upload foto')
      return null
    }

    const { data } = supabase.storage
      .from('menu-images')
      .getPublicUrl(fileName)

    return data.publicUrl
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

      if (!imageUrl) {
        setUploading(false)
        return
      }
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
      const { error } = await supabase
        .from('menus')
        .update(payload)
        .eq('id', editId)

      if (error) {
        toast.error('Gagal update menu')
      } else {
        toast.success('Menu berhasil diupdate!')
      }
    } else {
      const { error } = await supabase
        .from('menus')
        .insert(payload)

      if (error) {
        toast.error('Gagal tambah menu')
      } else {
        toast.success('Menu berhasil ditambahkan!')
      }
    }

    resetForm()
    fetchData()

    setUploading(false)
  }

  async function handleDelete(id, imageUrl) {
    if (!confirm('Hapus menu ini?')) return

    if (imageUrl) {
      const fileName = imageUrl.split('/').pop()

      await supabase.storage
        .from('menu-images')
        .remove([fileName])
    }

    await supabase
      .from('menus')
      .delete()
      .eq('id', id)

    toast.success('Menu dihapus!')

    fetchData()
  }

  async function toggleAvailable(id, current) {
    await supabase
      .from('menus')
      .update({
        is_available: !current
      })
      .eq('id', id)

    fetchData()
  }

  function handleEdit(menu) {
    setForm({
      name: menu.name || '',
      description: menu.description || '',
      price: menu.price || '',
      category_id: menu.category_id || '',
      has_options: menu.has_options || false,
      is_available: menu.is_available ?? true,
      image_url: menu.image_url || ''
    })

    setImagePreview(menu.image_url || null)

    setEditId(menu.id)

    setShowForm(true)

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }, 100)
  }

  function resetForm() {
    setForm({
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
    setEditId(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Memuat menu...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4FAF8]">
      <Toaster position="top-center" />

      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#4DB89E] flex items-center justify-center text-2xl">
              🍽️
            </div>

            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A]">
                Kelola Menu
              </h1>

              <p className="text-gray-400">
                {menus.length} menu tersedia
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin"
              className="px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition font-medium"
            >
              ← Dashboard
            </Link>

            <button
              onClick={() => {
                if (showForm) {
                  resetForm()
                } else {
                  setShowForm(true)
                  setEditId(null)
                }
              }}
              className="px-5 py-3 rounded-2xl bg-[#4DB89E] hover:bg-[#42a78e] transition text-white font-semibold shadow"
            >
              {showForm ? '✕ Tutup' : '+ Tambah Menu'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">

        {/* FORM */}
        {showForm && (
          <div className="bg-white rounded-3xl p-6 shadow-sm mb-8">
            <h2 className="text-2xl font-bold mb-6 text-[#1A1A1A]">
              {editId ? '✏️ Edit Menu' : '➕ Tambah Menu'}
            </h2>

            <div className="grid md:grid-cols-2 gap-5">

              {/* FOTO */}
              <div className="md:col-span-2">
                <label className="block mb-2 font-medium text-sm text-gray-600">
                  Foto Menu
                </label>

                <div className="flex items-center gap-5">
                  <div className="w-28 h-28 rounded-3xl overflow-hidden bg-gray-100 flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl">🍽️</span>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* NAMA */}
              <div>
                <label className="block mb-2 font-medium text-sm text-gray-600">
                  Nama Menu
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value
                    })
                  }
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#4DB89E]"
                  placeholder="Contoh: Nasi Goreng"
                />
              </div>

              {/* HARGA */}
              <div>
                <label className="block mb-2 font-medium text-sm text-gray-600">
                  Harga
                </label>

                <input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: e.target.value
                    })
                  }
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#4DB89E]"
                  placeholder="15000"
                />
              </div>

              {/* KATEGORI */}
              <div>
                <label className="block mb-2 font-medium text-sm text-gray-600">
                  Kategori
                </label>

                <select
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category_id: e.target.value
                    })
                  }
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#4DB89E]"
                >
                  <option value="">Pilih kategori</option>

                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* DESKRIPSI */}
              <div>
                <label className="block mb-2 font-medium text-sm text-gray-600">
                  Deskripsi
                </label>

                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value
                    })
                  }
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#4DB89E]"
                  placeholder="Deskripsi menu"
                />
              </div>

              {/* SWITCH */}
              <div className="md:col-span-2 flex gap-6 mt-2">

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.has_options}
                    onChange={() =>
                      setForm({
                        ...form,
                        has_options: !form.has_options
                      })
                    }
                  />

                  <span className="text-sm text-gray-600">
                    Ada opsi kepedasan
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.is_available}
                    onChange={() =>
                      setForm({
                        ...form,
                        is_available: !form.is_available
                      })
                    }
                  />

                  <span className="text-sm text-gray-600">
                    Menu tersedia
                  </span>
                </label>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="mt-6 w-full bg-[#4DB89E] hover:bg-[#42a78e] transition text-white font-bold py-4 rounded-2xl"
            >
              {uploading
                ? '⏳ Menyimpan...'
                : editId
                ? '💾 Update Menu'
                : '➕ Tambah Menu'}
            </button>
          </div>
        )}

        {/* LIST MENU */}
        <div className="space-y-10">
          {categories.map((cat) => {
            const catMenus = menus.filter(
              (m) => m.category_id === cat.id
            )

            if (catMenus.length === 0) return null

            return (
              <div key={cat.id}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-2 h-8 bg-[#4DB89E] rounded-full" />

                  <h2 className="text-2xl font-bold text-[#1A1A1A]">
                    {cat.name}
                  </h2>

                  <span className="text-gray-400">
                    {catMenus.length} menu
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catMenus.map((menu) => (
                    <div
                      key={menu.id}
                      className={`bg-white rounded-3xl overflow-hidden shadow-sm border transition hover:shadow-lg ${
                        !menu.is_available
                          ? 'opacity-60'
                          : ''
                      }`}
                    >
                      {/* IMAGE */}
                      <div className="h-52 bg-gray-100 flex items-center justify-center overflow-hidden">
                        {menu.image_url ? (
                          <img
                            src={menu.image_url}
                            alt={menu.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-7xl">
                            🍽️
                          </span>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-[#1A1A1A]">
                          {menu.name}
                        </h3>

                        {menu.description && (
                          <p className="text-gray-400 mt-2">
                            {menu.description}
                          </p>
                        )}

                        <p className="text-4xl font-bold text-[#4DB89E] mt-5">
                          Rp {menu.price.toLocaleString('id-ID')}
                        </p>

                        {menu.has_options && (
                          <p className="text-orange-500 mt-3 font-medium">
                            🌶️ Opsi kepedasan tersedia
                          </p>
                        )}

                        <div className="grid grid-cols-3 gap-3 mt-6">

                          <button
                            onClick={() => handleEdit(menu)}
                            className="bg-gray-100 hover:bg-gray-200 transition rounded-2xl py-3 font-semibold"
                          >
                            ✏️ Edit
                          </button>

                          <button
                            onClick={() =>
                              toggleAvailable(
                                menu.id,
                                menu.is_available
                              )
                            }
                            className="bg-orange-50 hover:bg-orange-100 transition text-orange-500 rounded-2xl py-3 font-semibold"
                          >
                            {menu.is_available
                              ? 'Nonaktif'
                              : 'Aktifkan'}
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                menu.id,
                                menu.image_url
                              )
                            }
                            className="bg-red-50 hover:bg-red-100 transition text-red-500 rounded-2xl py-3 font-semibold"
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
      </div>
    </div>
  )
}