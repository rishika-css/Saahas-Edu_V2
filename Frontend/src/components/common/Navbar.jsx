import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { path: '/braille', label: 'Braille', icon: '⠿' },
  { path: '/sign-language', label: 'Sign Language', icon: '🤟' },
  { path: '/dashboard', label: 'Student Dashboard', icon: '📊' },
  { path: '/mental-health', label: 'Mental Health', icon: '🧠' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/home" className="flex items-center gap-2">
          <span className="text-2xl">🌟</span>
          <span className="font-bold text-purple-700 text-lg">InclusiveLearn</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${pathname === link.path
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden md:block">Hi, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex overflow-x-auto gap-2 px-4 pb-3">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition
              ${pathname === link.path ? 'bg-purple-100 text-purple-700' : 'text-gray-600 bg-gray-100'}`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}