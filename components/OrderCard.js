'use client'

const C = {
  cream: '#F5F0E8',
  cream2: '#EDE5D8',
  brownLight: '#C4A882',
  brown: '#8B6347',
  brownDark: '#5C3D2E',
  brownDeep: '#3B2314',
  text: '#2C1A0E',
  textMuted: '#8B7355',
  white: '#FDFAF6',
}

export default function OrderCard({ order, onUpdateStatus }) {
  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (diff < 60) return `${diff} dtk lalu`
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`
    return `${Math.floor(diff / 3600)} jam lalu`
  }

  const borderColor = order.status === 'pending' ? C.brown : order.status === 'confirmed' ? '#4A7C59' : C.brownLight
  const statusLabel = order.status === 'pending' ? 'Pending' : order.status === 'confirmed' ? 'Diproses' : 'Selesai'

  return (
    <div style={{
      background: C.white, borderRadius: '16px',
      border: `0.5px solid ${C.cream2}`, borderLeft: `4px solid ${borderColor}`,
      overflow: 'hidden'
    }}>
      <div style={{ padding: '16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <p style={{ fontSize: '18px', fontWeight: '700', color: C.text }}>Meja {order.table_number}</p>
            <p style={{ fontSize: '11px', color: C.textMuted, marginTop: '2px' }}>{timeAgo(order.created_at)} · #{order.id}</p>
          </div>
          <span style={{
            fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px',
            background: C.cream, color: C.brown, border: `0.5px solid ${C.brownLight}`
          }}>
            {statusLabel}
          </span>
        </div>

        {/* Items */}
        <div style={{ background: C.cream, borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
          {order.order_items?.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '3px 0' }}>
              <span style={{ color: C.text }}>
                <span style={{ fontWeight: '700' }}>{item.quantity}×</span> {item.menu_name}
                {item.selected_option && (
                  <span style={{ color: C.brown, fontSize: '11px', marginLeft: '4px' }}>({item.selected_option})</span>
                )}
              </span>
              <span style={{ color: C.textMuted, fontWeight: '500' }}>Rp {item.subtotal.toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>

        {/* Catatan */}
        {order.customer_note && (
          <div style={{ background: '#FDF6EC', borderRadius: '10px', padding: '8px 12px', marginBottom: '12px', border: `0.5px solid ${C.brownLight}` }}>
            <p style={{ fontSize: '12px', color: C.brownDark }}>📝 {order.customer_note}</p>
          </div>
        )}

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: `0.5px solid ${C.cream2}` }}>
          <span style={{ fontSize: '13px', color: C.textMuted }}>Total</span>
          <span style={{ fontWeight: '700', fontSize: '15px', color: C.brownDark }}>Rp {order.total_price.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Action Button */}
      {order.status === 'pending' && (
        <button onClick={() => onUpdateStatus(order.id, 'confirmed')}
          style={{ width: '100%', padding: '12px', background: C.brownDark, color: C.cream, fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
          ✓ Konfirmasi Pesanan
        </button>
      )}
      {order.status === 'confirmed' && (
        <button onClick={() => onUpdateStatus(order.id, 'done')}
          style={{ width: '100%', padding: '12px', background: '#4A7C59', color: C.white, fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
          ✅ Tandai Selesai
        </button>
      )}
      {order.status === 'done' && (
        <div style={{ width: '100%', padding: '12px', background: C.cream, color: C.textMuted, fontSize: '13px', textAlign: 'center' }}>
          Pesanan selesai
        </div>
      )}
    </div>
  )
}