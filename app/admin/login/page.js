'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isAllowed, setIsAllowed] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      // Ambil session login yang aktif di browser
      const { data: { session } } = await supabase.auth.getSession()
      
      // Jika tidak ada session (belum login), langsung tendang balik ke form login
      if (!session) {
        router.replace('/admin/login')
      } else {
        // Jika ada, izinkan halaman dashboard dirender
        setIsAllowed(true)
      }
    }

    checkUser()
  }, [router, supabase])

  // Selama mengecek session, tampilkan loading modern (animasi pulse ala cyberpunk/glassmorphism)
  if (!isAllowed) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-emerald-400">
        <div className="text-center p-8 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-2xl">
          <p className="text-xl font-bold tracking-wider animate-pulse">MEMERIKSA HAK AKSES ADMIN...</p>
        </div>
      </div>
    )
  }

  // JIKA SUDAH LOGIN, TAMPILKAN UI DASHBOARD MODERN KAMU DI SINI
  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      {/* Taruh seluruh kode tampilan menu/dashboard asli kamu di bawah ini */}
      <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
        Dashboard Admin - Engcaffee
      </h1>
      <p className="mt-2 text-slate-400">Selamat datang kembali! Sistem siap digunakan untuk mengelola data.</p>
    </div>
  )
}