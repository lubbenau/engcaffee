import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--cream)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold" style={{ color: 'var(--brown-deep)' }}>
            EngCaffee
          </h1>
          <p className="text-xs tracking-widest uppercase mt-1" style={{ color: 'var(--brown-light)' }}>
            Est. 2025
          </p>
          <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
            Sistem Pemesanan Online Berbasis QR Code
          </p>
        </div>

        <div className="rounded-3xl overflow-hidden border" style={{ background: 'var(--white)', borderColor: 'var(--cream2)' }}>
          <div className="p-6 space-y-3">
            <Link href="/admin"
              className="block w-full py-3.5 rounded-2xl text-sm font-bold text-center transition-all"
              style={{ background: 'var(--brown-dark)', color: 'var(--cream)' }}>
              Dashboard Admin
            </Link>
            <Link href="/qr-generator"
              className="block w-full py-3.5 rounded-2xl text-sm font-bold text-center border transition-all"
              style={{ borderColor: 'var(--brown-dark)', color: 'var(--brown-dark)', background: 'transparent' }}>
              Generate QR Code
            </Link>
          </div>
          <div className="px-6 pb-5 text-center">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Customer scan QR → pilih menu → pesan
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}