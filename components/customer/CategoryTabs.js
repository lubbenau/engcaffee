'use client'

export default function CategoryTabs({ categories, activeCategory, onSelect }) {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-2">
      <div className="flex gap-6 px-1 flex-row min-w-max border-b border-[#046A55]/10">
        {/* All Tab */}
        <button
          onClick={() => onSelect(null)}
          className="relative pb-3 text-sm font-bold transition-all cursor-pointer focus:outline-none"
          style={{
            color: activeCategory === null ? '#046A55' : '#8AAB9E'
          }}
        >
          Semua
          {activeCategory === null && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#046A55] rounded-full transition-all duration-300"></div>
          )}
        </button>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className="relative pb-3 text-sm font-bold transition-all cursor-pointer focus:outline-none"
              style={{
                color: isActive ? '#046A55' : '#8AAB9E'
              }}
            >
              {cat.name}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#046A55] rounded-full transition-all duration-300"></div>
              )}
            </button>
          )
        })}
      </div>
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  )
}
