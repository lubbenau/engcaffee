'use client'

export default function OrderCard({ order, onUpdateStatus }) {
  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (diff < 60) return `${diff} dtk lalu`
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`
    return `${Math.floor(diff / 3600)} jam lalu`
  }

  const statusConfig = {
    pending: { label: 'Pending', color: '#F5A623', bg: '#FFF8ED', border: '#F5A623' },
    confirmed: { label: 'Diproses', color: '#4DB89E', bg: '#E8F7F3', border: '#4DB89E' },
    done: { label: 'Selesai', color: '#4D8EDB', bg: '#EBF3FD', border: '#4D8EDB' },
  }
  const cfg = statusConfig[order.status]

  return (
    <div style={{ background: '#fff', borderRadius: '20px', border: '0.5px solid #F0F0F0', overflow: 'hidden', borderTop: `3px solid ${cfg.border}` }}>
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A' }}>Meja {order.table_number}</p>
            <p style={{ fontSize: '11px', color: '#BBB', marginTop: '2px' }}>{timeAgo(order.created_at)} · #{order.id}</p>
          </div>
          <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', background: cfg.bg, color: cfg.color }}>
            {cfg.label}
          </span>
        </div>

        <div style={{ background: '#F9F9F9', borderRadius: '14px', padding: '12px', marginBottom: '12px' }}>
          {order.order_items?.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '3px 0' }}>
              <span style={{ color: '#1A1A1A' }}>
                <span style={{ fontWeight: '700' }}>{item.quantity}×</span> {item.menu_name}
                {item.selected_option && (
                  <span style={{ fontSize: '11px', color: '#4DB89E', marginLeft: '4px', background: '#E8F7F3', padding: '1px 6px', borderRadius: '6px' }}>
                    {item.selected_option}
                  </span>
                )}
              </span>
              <span style={{ color: '#888', fontWeight: '500' }}>Rp {item.subtotal.toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>

        {order.customer_note && (
          <div style={{ background: '#FFF8ED', borderRadius: '12px', padding: '10px 12px', marginBottom: '12px', border: '0.5px solid #FFE5A0' }}>
            <p style={{ fontSize: '12px', color: '#B8860B' }}>📝 {order.customer_note}</p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '0.5px solid #F5F5F5' }}>
          <span style={{ fontSize: '13px', color: '#888' }}>Total</span>
          <span style={{ fontWeight: '700', fontSize: '16px', color: '#1A1A1A' }}>
            Rp {order.total_price.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {order.status === 'pending' && (
        <button onClick={() => onUpdateStatus(order.id, 'confirmed')}
          style={{ width: '100%', padding: '14px', background: '#4DB89E', color: '#fff', fontSize: '14px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
          Konfirmasi Pesanan
        </button>
      )}
      {order.status === 'confirmed' && (
        <button onClick={() => onUpdateStatus(order.id, 'done')}
          style={{ width: '100%', padding: '14px', background: '#4D8EDB', color: '#fff', fontSize: '14px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
          Tandai Selesai
        </button>
      )}
      {order.status === 'done' && (
        <div style={{ width: '100%', padding: '14px', background: '#F5F5F5', color: '#BBB', fontSize: '14px', textAlign: 'center' }}>
          Pesanan selesai
        </div>
      )}
    </div>
  )
}