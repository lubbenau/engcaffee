import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow p-8 max-w-sm w-full text-center space-y-4">
        <h1 className="text-3xl font-bold text-orange-500">🍽️ EngCaffee</h1>
        <p className="text-gray-500 text-sm">Sistem Pemesanan Online Berbasis QR Code</p>

        <div className="space-y-3 pt-2">
          <Link
            href="/admin"
            className="block w-full bg-orange-500 text-white py-3 rounded-xl font-semibold"
          >
            🖥️ Dashboard Admin
          </Link>
          <Link
            href="/qr-generator"
            className="block w-full border-2 border-orange-500 text-orange-500 py-3 rounded-xl font-semibold"
          >
            📱 Generate QR Code
          </Link>
        </div>

        <p className="text-xs text-gray-400 pt-2">
          Customer scan QR → pilih menu → pesan
        </p>
      </div>
    </div>
  )
}