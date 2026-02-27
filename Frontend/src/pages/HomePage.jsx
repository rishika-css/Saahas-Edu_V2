import Navbar from '../components/common/Navbar'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const features = [
  { path: '/braille', icon: '⠿', label: 'Braille System', desc: 'Learn and convert text to Braille', color: 'purple' },
  { path: '/sign-language', icon: '🤟', label: 'Sign Language', desc: 'Interactive sign language learning', color: 'blue' },
  { path: '/dashboard', icon: '📊', label: 'My Dashboard', desc: 'Track your learning progress', color: 'green' },
  { path: '/mental-health', icon: '🧠', label: 'Mental Health', desc: 'Mood tracking and wellness resources', color: 'pink' },
]

const colorMap = {
  purple: 'from-purple-500 to-purple-700',
  blue: 'from-blue-500 to-blue-700',
  green: 'from-green-500 to-green-700',
  pink: 'from-pink-500 to-pink-700',
}

export default function HomePage() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name} 👋</h1>
          <p className="text-gray-500 mt-2">Your personalized learning journey continues here.</p>
          {user?.disability && user.disability !== 'none' && (
            <span className="inline-block mt-3 bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium capitalize">
              {user.disability.replace('-', ' ')} support enabled
            </span>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {features.map(f => (
            <Link key={f.path} to={f.path}>
              <div className={`bg-gradient-to-br ${colorMap[f.color]} text-white rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer shadow-md`}>
                <span className="text-4xl">{f.icon}</span>
                <h3 className="text-xl font-bold mt-3">{f.label}</h3>
                <p className="text-white/80 text-sm mt-1">{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}