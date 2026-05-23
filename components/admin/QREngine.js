'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { QrCode, Download, Printer, Plus, Minus, Sparkles } from 'lucide-react'

export default function QREngine() {
  const [tableCount, setTableCount] = useState(6)
  const [baseUrl, setBaseUrl] = useState('')
  const [qrCodes, setQrCodes] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Detect window host to pre-fill baseUrl for easy local testing
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin)
    }
  }, [])

  async function generateQRCodes() {
    if (!baseUrl) {
      alert('Masukkan URL aplikasi kamu terlebih dahulu!')
      return
    }
    setLoading(true)
    const codes = []

    try {
      for (let i = 1; i <= tableCount; i++) {
        // Construct standard dinamis URL format: order?meja=xx
        const url = `${baseUrl}/order?meja=${i}`
        
        // Generate QR code data URL using qrcode library
        const dataUrl = await QRCode.toDataURL(url, {
          width: 320,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        })
        codes.push({ table: i, url, dataUrl })
      }
      setQrCodes(codes)
    } catch (e) {
      console.error(e)
      alert('Gagal membuat QR Codes')
    } finally {
      setLoading(false)
    }
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
      }, index * 200)
    })
  }

  function printAll() {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Settings Form - Hidden on print */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 space-y-5 print:hidden">
        <div className="flex justify-between items-center pb-2">
          <h4 className="text-xs font-black text-gray-500 tracking-wider uppercase flex items-center gap-1.5">
            ENGINE GENERATOR QR OTOMATIS MASSAL <Sparkles size={14} className="text-[#DEFF9A]" />
          </h4>
          <span className="text-[10px] text-gray-400 font-bold bg-[#1E293B] px-3 py-1 rounded-full border border-gray-800">
            QR Generator
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Base URL Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              URL APLIKASI WEB RESTO
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value.replace(/\/$/, ''))}
              placeholder="Contoh: https://namadomain.com"
              className="w-full bg-[#0B0F19] text-white border border-[#1E293B] rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#DEFF9A]/40 focus:ring-1 focus:ring-[#DEFF9A]/40 transition-all duration-300"
            />
            <p className="text-[10px] text-gray-500 font-medium">
              Link QR dinamis akan mengarah ke: <code className="text-[#DEFF9A] bg-slate-900 px-1 py-0.5 rounded font-mono">{baseUrl || 'domain'}/order?meja=xx</code>
            </p>
          </div>

          {/* Table Count controls */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              JUMLAH MEJA TERSEDIA
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setTableCount((t) => Math.max(1, t - 1))}
                className="w-10 h-10 rounded-xl bg-[#1E293B] border border-gray-800 flex items-center justify-center text-white hover:bg-[#334155] cursor-pointer"
              >
                <Minus size={16} />
              </button>
              <span className="font-black text-2xl text-white w-10 text-center">{tableCount}</span>
              <button
                onClick={() => setTableCount((t) => t + 1)}
                className="w-10 h-10 rounded-xl bg-[#DEFF9A] text-[#0B0F19] flex items-center justify-center font-bold hover:scale-103 cursor-pointer"
              >
                <Plus size={16} />
              </button>
              <span className="text-xs text-gray-400 font-bold">Meja</span>
            </div>
          </div>
        </div>

        {/* Generate triggers */}
        <button
          onClick={generateQRCodes}
          disabled={loading}
          className="w-full bg-[#DEFF9A] hover:bg-[#c3ec79] text-[#0B0F19] font-black py-4 rounded-2xl border-none cursor-pointer transition-all duration-300 flex items-center justify-center gap-2"
        >
          {loading ? 'Sedang Memproses...' : '🔄 GENERATE BATCH QR CODE MEJA'}
        </button>

        {/* Action Controls for Batch outputs */}
        {qrCodes.length > 0 && (
          <div className="flex gap-4 pt-2 border-t border-[#1E293B]/60">
            <button
              onClick={downloadAll}
              className="flex-1 border border-[#DEFF9A]/20 hover:border-[#DEFF9A]/40 text-[#DEFF9A] bg-[#DEFF9A]/5 font-black py-3 rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 text-xs"
            >
              <Download size={14} /> DOWNLOAD SEMUA (.PNG)
            </button>
            <button
              onClick={printAll}
              className="flex-1 bg-white hover:bg-gray-100 text-gray-900 font-black py-3 rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 text-xs shadow-md"
            >
              <Printer size={14} /> PRINT CETAK SEMUA MEJA
            </button>
          </div>
        )}
      </div>

      {/* QR Codes Print Grid */}
      {qrCodes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-500 tracking-wider uppercase pl-1 print:hidden">
            DAFTAR PREVIEW QR CODE
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4 print:p-0">
            {qrCodes.map((qr) => (
              <div
                key={qr.table}
                className="bg-white rounded-[24px] p-5 text-center border border-gray-100 shadow-sm print:shadow-none print:border-2 print:border-gray-200 print:rounded-3xl flex flex-col justify-between"
              >
                <div>
                  {/* Restaurant Branding Header */}
                  <div className="flex items-center justify-center gap-1.5 mb-2.5">
                    <span className="text-xl">🍳</span>
                    <h5 className="font-extrabold text-[12px] text-[#046A55] uppercase tracking-wider">
                      ENGCAFFEE QR ORDER
                    </h5>
                  </div>
                  
                  {/* QR Image output */}
                  <div className="border border-gray-100 rounded-2xl p-2.5 bg-white inline-block shadow-xs max-w-[190px] mx-auto w-full">
                    <img
                      src={qr.dataUrl}
                      alt={`QR Meja ${qr.table}`}
                      className="w-full h-auto object-contain block"
                    />
                  </div>

                  {/* Scan Instructions */}
                  <div className="mt-3.5 space-y-1">
                    <p className="font-black text-gray-900 text-lg">MEJA {qr.table}</p>
                    <p className="text-[10px] text-gray-400 font-medium px-2 leading-relaxed">
                      Scan QR Code ini untuk memesan makanan dan minuman favorit Anda langsung dari HP Anda.
                    </p>
                  </div>
                </div>

                {/* Individual Action triggers - Hidden on print */}
                <button
                  onClick={() => downloadQR(qr.dataUrl, qr.table)}
                  className="print:hidden mt-4 w-full border border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download size={12} /> Unduh QR
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global CSS Inject to support clean print styles */}
      <style jsx global>{`
        @media print {
          /* Hide non-print structures */
          header, aside, .print\\:hidden, button, nav {
            display: none !important;
          }
          
          /* Full page print layout reset */
          body, main, html, #__next {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }

          /* Grid spacing on print */
          .print\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
          .print\\:gap-4 {
            gap: 16px !important;
          }
          .print\\:border-2 {
            border-width: 2px !important;
            border-style: solid !important;
            border-color: #E2E8F0 !important;
          }
        }
      `}</style>
    </div>
  )
}
