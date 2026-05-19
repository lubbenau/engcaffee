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
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.replace('/admin/login')
      } else {
        setIsAllowed(true)
      }
    }
    checkUser()
  }, [router, supabase])

  if (!isAllowed) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-emerald-400">
        <p className="text-xl font-bold animate-pulse">MEMERIKSA HAK AKSES ADMIN...</p>
      </div>
    )
  }

  // RETURN DI BAWAH INI ADALAH UI DASHBOARD/KELOLA MENU KAMU YANG SEBENARNYA
  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      {/* Taruh komponen kelola menu, Bento Grid, atau UI modern kamu di sini */}
      <h1 className="text-2xl font-bold">Dashboard Admin EngCaffee</h1>
    </div>
  )
}