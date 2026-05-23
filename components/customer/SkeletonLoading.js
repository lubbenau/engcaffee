'use client'

export default function SkeletonLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center px-4 pt-6">
        <div className="h-8 w-28 bg-[#cbe7e1] rounded-2xl"></div>
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-[#cbe7e1] rounded-2xl"></div>
          <div className="h-10 w-10 bg-[#cbe7e1] rounded-2xl"></div>
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="px-4">
        <div className="h-12 w-full bg-[#cbe7e1] rounded-full"></div>
      </div>

      {/* Category Tabs Skeleton */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 bg-[#cbe7e1] rounded-full flex-shrink-0"></div>
        ))}
      </div>

      {/* Catalog Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4 px-4">
        {[1, 2, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-[24px] overflow-hidden p-3 space-y-3 shadow-sm border border-[#e8f5f2]/40">
            {/* Image Placeholder */}
            <div className="h-32 w-full bg-gray-200 rounded-[18px]"></div>
            
            {/* Info Placeholders */}
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              <div className="flex gap-2">
                <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
                <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-5 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
