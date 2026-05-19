import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()

  // Ambil data env secara dinamis
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Buat client Supabase standar yang aman untuk Edge Runtime
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // Penting di middleware agar tidak menyimpan cache state antar request user lain
    },
  })

  // Next.js menyimpan session token Supabase di cookies dengan pola nama ini
  // Cari cookie yang mengandung nama proyek Supabase kamu
  const cookieName = Object.keys(req.cookies.all()).find(name => name.includes('-auth-token'))
  const tokenJson = req.cookies.get(cookieName)?.value

  let session = null
  if (tokenJson) {
    try {
      const parsed = JSON.parse(tokenJson)
      session = parsed?.access_token || null
    } catch (e) {
      session = null
    }
  }

  const isAdminPage = req.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = req.nextUrl.pathname === '/admin/login'

  // Jika mencoba masuk area admin, tidak login, dan bukan di halaman login -> Tendang ke Login
  if (isAdminPage && !isLoginPage && !session) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  // Jika sudah login tapi iseng buka halaman login -> Balikin ke Dashboard
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return res
}

export const config = {
  matcher: ['/admin', '/admin/:path*']
}