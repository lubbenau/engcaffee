'use client'

export default function OrderCard({ order, onUpdateStatus }) {
  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (diff < 60) return `${diff} detik lalu`
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
    return `${Math.floor(diff / 3600)} jam lalu`
  }

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    confirmed: 'bg-green-100 text-green-700 border-green-200',
    done: 'bg-blue-100 text-blue-700 border-blue-200',
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-l-4 p-4 ${
      order.status === 'pending' ? 'border-l-yellow-400' :
      order.status === 'confirmed' ? 'border-l-green-400' : 'border-l-blue-400'
    }`}>
      {/* Header Order */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-gray-800 text-lg">Meja {order.table_number}</p>
          <p className="text-xs text-gray-400">{timeAgo(order.created_at)} • #{order.id}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${statusColor[order.status]}`}>
          {order.status === 'pending' ? '⏳ Pending' :
           order.status === 'confirmed' ? '✅ Dikonfirmasi' : '🎉 Selesai'}
        </span>
      </div>

      {/* Item List */}
      <div className="space-y-1.5 mb-3">
        {order.order_items?.map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-700">
              {item.quantity}x {item.menu_name}
              {item.selected_option && (
                <span className="text-orange-400 text-xs ml-1">({item.selected_option})</span>
              )}
            </span>
            <span className="text-gray-500">
              Rp {item.subtotal.toLocaleString('id-ID')}
            </span>
          </div>
        ))}
      </div>

      {/* Catatan */}
      {order.customer_note && (
        <div className="bg-yellow-50 rounded-lg p-2 mb-3">
          <p className="text-xs text-yellow-700">📝 {order.customer_note}</p>
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between items-center pt-2 border-t">
        <span className="font-bold text-gray-700">Total</span>
        <span className="font-bold text-orange-500">
          Rp {order.total_price.toLocaleString('id-ID')}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex gap-2">
        {order.status === 'pending' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'confirmed')}
            className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-semibold"
          >
            ✅ Konfirmasi Pesanan
          </button>
        )}
        {order.status === 'confirmed' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'done')}
            className="flex-1 bg-blue-500 text-white py-2 rounded-xl text-sm font-semibold"
          >
            🎉 Tandai Selesai
          </button>
        )}
        {order.status === 'done' && (
          <div className="flex-1 text-center text-sm text-gray-400 py-2">
            Pesanan selesai
          </div>
        )}
      </div>
    </div>
  )
}