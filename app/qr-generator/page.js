'use client'
import { useState, useRef } from 'react'
import QRCode from 'qrcode'

export default function QRGeneratorPage() {
  const [tableCount, setTableCount] = useState(5)
  const [baseUrl, setBaseUrl] = useState('')
  const [qrCodes, setQrCodes] = useState([])
  const [loading, setLoading] = useState(false)

  async function generateQRCodes() {
    if (!baseUrl) {
      alert('Masukkan URL aplikasi kamu dulu!')
      return
    }
    setLoading(true)
    const codes = []

    for (let i = 1; i <= tableCount; i++) {
      const url = `${baseUrl}/menu/${i}`
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      })
      codes.push({ table: i, url, dataUrl })
    }

    setQrCodes(codes)
    setLoading(false)
  }

  function downloadQR(dataUrl, tableNumber) {
    const link = document.createElement('a')
    link.download = `QR-Meja-${tableNumber}.png`
    link.href = dataUrl
    link.click()
  }

  function downloadAll() {
    qrCodes.forEach((qr, index) => {
      setTimeout(() => {
        downloadQR(qr.dataUrl, qr.table)
      }, index * 300)
    })
  }

  function printAll() {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - hidden saat print */}
      <div className="print:hidden bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-orange-500">📱 QR Code Generator</h1>
          <p className="text-sm text-gray-500">Generate QR Code untuk setiap meja</p>
        </div>
      </div>

      {/* Form - hidden saat print */}
      <div className="print:hidden max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">

          {/* Input Base URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Aplikasi Kamu
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value.replace(/\/$/, ''))}
              placeholder="contoh: http://localhost:3000 atau https://namadomain.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <p className="text-xs text-gray-400 mt-1">
              Saat deploy nanti, ganti dengan domain asli kamu
            </p>
          </div>

          {/* Input Jumlah Meja */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah Meja
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTableCount(t => Math.max(1, t - 1))}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-600"
              >−</button>
              <span className="font-bold text-2xl w-8 text-center">{tableCount}</span>
              <button
                onClick={() => setTableCount(t => t + 1)}
                className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center"
              >+</button>
              <span className="text-sm text-gray-500">meja</span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateQRCodes}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Generating...' : '🔄 Generate QR Code'}
          </button>
        </div>

        {/* Action Buttons */}
        {qrCodes.length > 0 && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={downloadAll}
              className="flex-1 border-2 border-orange-500 text-orange-500 py-2.5 rounded-xl font-semibold text-sm"
            >
              ⬇️ Download Semua
            </button>
            <button
              onClick={printAll}
              className="flex-1 bg-gray-800 text-white py-2.5 rounded-xl font-semibold text-sm"
            >
              🖨️ Print Semua
            </button>
          </div>
        )}
      </div>

      {/* QR Code Grid */}
      {qrCodes.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3">
            {qrCodes.map(qr => (
              <div
                key={qr.table}
                className="bg-white rounded-2xl shadow-sm p-4 text-center print:shadow-none print:border print:border-gray-200"
              >
                {/* Logo / Nama Resto */}
                <p className="font-bold text-orange-500 text-sm mb-1">🍽️ QR Order</p>

                {/* QR Image */}
                <img
                  src={qr.dataUrl}
                  alt={`QR Meja ${qr.table}`}
                  className="w-full max-w-[180px] mx-auto"
                />

                {/* Nomor Meja */}
                <div className="mt-2">
                  <p className="font-bold text-gray-800 text-lg">Meja {qr.table}</p>
                  <p className="text-xs text-gray-400 break-all">{qr.url}</p>
                </div>

                {/* Download Button - hidden saat print */}
                <button
                  onClick={() => downloadQR(qr.dataUrl, qr.table)}
                  className="print:hidden mt-3 w-full border border-orange-300 text-orange-500 py-1.5 rounded-xl text-xs font-medium"
                >
                  ⬇️ Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}