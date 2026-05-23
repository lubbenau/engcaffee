'use client'

import { Flame } from 'lucide-react'

export default function MostOrdered({ orders }) {
  // Aggregate items from all completed/confirmed orders
  const itemCounts = {}
  let totalItemsCount = 0

  orders.forEach(order => {
    if (order.status !== 'pending') { // confirmed or done orders
      order.order_items?.forEach(item => {
        const name = item.menu_name
        itemCounts[name] = (itemCounts[name] || 0) + item.quantity
        totalItemsCount += item.quantity
      })
    }
  })

  // Format into sorted array
  const sortedItems = Object.keys(itemCounts)
    .map(name => ({
      name,
      count: itemCounts[name],
      percentage: totalItemsCount > 0 ? Math.round((itemCounts[name] / totalItemsCount) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // top 5 items

  const fallbackItems = [
    { name: 'Kopi Susu Gula Aren', count: 12, percentage: 38 },
    { name: 'Nasi Goreng Spesial', count: 8, percentage: 25 },
    { name: 'Roti Bakar Cokelat', count: 5, percentage: 16 },
    { name: 'Kentang Goreng', count: 3, percentage: 9 },
    { name: 'Es Teh Manis', count: 2, percentage: 6 }
  ]

  const itemsToRender = sortedItems.length > 0 ? sortedItems : fallbackItems

  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 space-y-5">
      {/* Title */}
      <div className="flex justify-between items-center pb-2">
        <h4 className="text-xs font-black text-gray-500 tracking-wider uppercase flex items-center gap-1.5">
          MENU TERLARIS <Flame size={14} className="text-[#DEFF9A]" />
        </h4>
        <span className="text-[10px] text-[#DEFF9A] font-bold">
          Terpopuler
        </span>
      </div>

      {/* Item bars list */}
      <div className="space-y-4">
        {itemsToRender.map((item, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-200 truncate pr-4">{item.name}</span>
              <span className="font-black text-[#DEFF9A] flex-shrink-0">
                {item.count} porsi ({item.percentage}%)
              </span>
            </div>
            {/* Progress bar container */}
            <div className="w-full h-2 bg-[#1E293B] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#DEFF9A] to-[#80B236] rounded-full transition-all duration-500"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
