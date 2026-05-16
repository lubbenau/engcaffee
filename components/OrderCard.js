'use client'

export default function OrderCard({ order, onUpdateStatus }) {
  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (diff < 60) return `${diff} dtk lalu`
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`
    return `${Math.floor(diff / 3600)} jam lalu`
  }

  const statusConfig = {
    pending: { label: 'Pending', borderColor: '#8B6347' },
    confirmed: { label: 'Diproses', borderColor: '#4A7C59' },
    done: { label: 'Selesai', borderColor: '#C4A882' },
  }
  const cfg = statusConfig[order.status]

  return (
    <div className="rounded-2xl overflow-hidden border"
      style={{ background: 'var(--white)', borderColor: 'var(--cream2)', borderLeft: `3px solid ${cfg.borderColor}` }}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>Meja {order.table_number}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(order.created_at)} · #{order.id}</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full border"
            style={{ background: 'var(--cream)', color: 'var(--brown)', borderColor: 'var(--brown-light)' }}>
            {cfg.label}
          </span>
        </div>

        <div className="space-y-1.5 rounded-xl p-3 mb-3" style={{ background: 'var(--cream)' }}>
          {order.order_items?.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span style={{ color: 'var(--text)' }}>
                <span className="font-bold">{item.quantity}×</span> {item.menu_name}
                {item.selected_option && (
                  <span className="text-xs ml-1" style={{ color: 'var(--brown)' }}>({item.selected_option})</span>
                )}
              </span>
              <span className="font-medium" style={{ color: 'var(--text-muted)' }}>
                Rp {item.subtotal.toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>

        {order.customer_note && (
          <div className="rounded-xl px-3 py-2 mb-3 flex gap-2"
            style={{ background: '#FDF6EC', border: '0.5px solid var(--brown-light)' }}>
            <span>📝</span>
            <p className="text-xs" style={{ color: 'var(--brown-dark)' }}>{order.customer_note}</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-2"
          style={{ borderTop: '0.5px solid var(--cream2)' }}>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Total</span>
          <span className="font-bold" style={{ color: 'var(--brown-dark)' }}>
            Rp {order.total_price.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {order.status === 'pending' && (
        <button onClick={() => onUpdateStatus(order.id, 'confirmed')}
          className="w-full py-3 text-sm font-bold transition-colors"
          style={{ background: 'var(--brown-dark)', color: 'var(--cream)' }}>
          Konfirmasi Pesanan
        </button>
      )}
      {order.status === 'confirmed' && (
        <button onClick={() => onUpdateStatus(order.id, 'done')}
          className="w-full py-3 text-sm font-bold transition-colors"
          style={{ background: '#4A7C59', color: 'var(--white)' }}>
          Tandai Selesai
        </button>
      )}
      {order.status === 'done' && (
        <div className="w-full py-3 text-sm text-center font-medium"
          style={{ background: 'var(--cream)', color: 'var(--text-muted)' }}>
          Pesanan selesai
        </div>
      )}
    </div>
  )
}