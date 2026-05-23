'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function RedirectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const meja = searchParams.get('meja')

  useEffect(() => {
    if (meja) {
      router.replace(`/menu/${meja}`)
    } else {
      router.replace('/')
    }
  }, [meja, router])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#D7EFEA',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '16px',
        animation: 'pulse 1.5s infinite ease-in-out'
      }}>
        🍽️
      </div>
      <p style={{
        color: '#046A55',
        fontWeight: '600',
        fontSize: '16px'
      }}>
        Mengalihkan Anda ke Menu...
      </p>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}

export default function OrderRedirectPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: '#D7EFEA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{ color: '#046A55', fontWeight: '600' }}>Loading...</p>
      </div>
    }>
      <RedirectContent />
    </Suspense>
  )
}
