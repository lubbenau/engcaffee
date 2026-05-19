import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#F4FAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', background: '#4DB89E', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px' }}>
            🍽️
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1A1A1A' }}>EngCaffee</h1>
          <p style={{ fontSize: '14px', color: '#888', marginTop: '6px' }}>Sistem Pemesanan Online Berbasis QR Code</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', border: '0.5px solid #F0F0F0' }}>
          <Link href="/admin" style={{
            display: 'block', width: '100%', background: '#4DB89E', color: '#fff',
            padding: '14px', borderRadius: '14px', textAlign: 'center',
            fontWeight: '700', fontSize: '14px', textDecoration: 'none', marginBottom: '12px'
          }}>
            Dashboard Admin
          </Link>
          <Link href="/qr-generator" style={{
            display: 'block', width: '100%', background: '#fff', color: '#4DB89E',
            padding: '14px', borderRadius: '14px', textAlign: 'center',
            fontWeight: '700', fontSize: '14px', textDecoration: 'none',
            border: '1.5px solid #4DB89E'
          }}>
            Generate QR Code
          </Link>
        </div>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#BBB', marginTop: '16px' }}>
          Customer scan QR → pilih menu → pesan
        </p>
      </div>
    </div>
  )
}