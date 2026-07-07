import { Home, PlusCircle, User } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-50">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo - D + ash close together */}
        <div className="flex items-center gap-0">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="text-xl font-medium text-gray-700 -ml-1">ash</span>
          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full ml-2 hidden sm:inline">
            Real Estate
          </span>
        </div>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <button className="text-sm text-gray-400 hover:text-gray-600 transition flex items-center gap-1">
            <Home size={16} />
            Home
          </button>
          <button className="text-sm text-gray-400 hover:text-gray-600 transition flex items-center gap-1">
            <PlusCircle size={16} />
            List Property
          </button>
          <button className="text-sm font-medium bg-emerald-500 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-600 transition">
            Sign In
          </button>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <PlusCircle size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}