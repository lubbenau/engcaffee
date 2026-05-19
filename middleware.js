import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // JALUR AMAN 1: Jika request menuju halaman login atau aset static, langsung loloskan tanpa cek session
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  // Gunakan getSession agar proses pengecekan super cepat di sisi Edge Server
  const { data: { session } } = await supabase.auth.getSession()
  const hasUser = !!session?.user

  // KONDISI: Ingin masuk rute /admin (dashboard dll) tapi belum login -> Tendang ke login
  if (pathname.startsWith('/admin') && !hasUser) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return response
}

export const config = {
  // Satpam hanya memantau area admin saja agar tidak memberatkan rute pembeli/customer
  matcher: ['/admin', '/admin/:path*']
}