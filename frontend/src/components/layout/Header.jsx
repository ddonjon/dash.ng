import { Home, PlusCircle, User } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gray-100 shadow-sm border-b border-gray-300">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo - Tight spacing like one word */}
        <div className="flex items-center gap-0">
          <div className="flex items-center gap-0.5 bg-gray-200 rounded-xl px-3 py-1.5 border border-gray-300">
            <span className="text-gray-800 font-bold text-lg">D</span>
            <span className="text-gray-600 font-medium text-lg">ash</span>
          </div>
          <span className="text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded-full ml-3 hidden sm:inline border border-gray-200">
            Real Estate
          </span>
        </div>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <button className="text-sm text-gray-600 hover:text-gray-900 transition flex items-center gap-1">
            <Home size={16} />
            Home
          </button>
          <button className="text-sm text-gray-600 hover:text-gray-900 transition flex items-center gap-1">
            <PlusCircle size={16} />
            List Property
          </button>
          <button className="text-sm font-medium bg-gray-700 text-white px-4 py-1.5 rounded-lg hover:bg-gray-800 transition">
            Sign In
          </button>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <button className="p-2 text-gray-600 hover:text-gray-900">
            <PlusCircle size={20} />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}