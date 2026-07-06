import { Home, PlusCircle, User } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo - Changed to Dash */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Dash</span>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full hidden sm:inline">
            Real Estate
          </span>
        </div>

        {/* Navigation - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <button className="text-sm text-gray-600 hover:text-gray-900 transition flex items-center gap-1">
            <Home size={16} />
            Home
          </button>
          <button className="text-sm text-gray-600 hover:text-gray-900 transition flex items-center gap-1">
            <PlusCircle size={16} />
            List Property
          </button>
          <button className="text-sm font-medium bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition">
            Sign In
          </button>
        </div>

        {/* Navigation - Mobile */}
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