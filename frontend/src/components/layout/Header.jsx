export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <span className="text-xl font-bold text-blue-600">Abuja</span>
          <span className="text-xl font-bold text-gray-800">Estates</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-sm text-gray-600 hover:text-gray-900">
            Post
          </button>
        </div>
      </div>
    </header>
  )
}
