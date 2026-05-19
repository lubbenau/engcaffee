import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
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

  // GANTI KE SINI: Menggunakan getSession agar ringan dan terhindar dari infinite loop loading
  const { data: { session } } = await supabase.auth.getSession()
  const hasUser = !!session?.user

  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname === '/admin/login'

  // KONDISI 1: Mau masuk halaman admin, tapi BELUM login -> Lempar ke login
  if (isAdminPage && !isLoginPage && !hasUser) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // KONDISI 2: SUDAH login, tapi mau buka halaman login lagi -> Kembalikan ke dashboard
  if (isLoginPage && hasUser) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return response
}

export const config = {
  // Ditambahkan pengecualian agar satpam tidak memeriksa file internal Next.js (_next) dan static images
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}