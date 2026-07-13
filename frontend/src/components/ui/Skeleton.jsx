export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
        <div className="h-48 sm:h-full sm:min-h-[200px] bg-gray-200" />
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-4 sm:p-5 space-y-3">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded-full w-16" />
            <div className="h-6 bg-gray-200 rounded-full w-16" />
            <div className="h-6 bg-gray-200 rounded-full w-16" />
          </div>
          <div className="flex justify-between pt-2">
            <div className="h-6 bg-gray-200 rounded w-12" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function MyListingsSkeleton() {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-1/3" />
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-1/3" />
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-gray-200" />
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50/80 border border-gray-200 rounded-2xl p-2.5">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-1" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-4">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-200" />
                <div>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
