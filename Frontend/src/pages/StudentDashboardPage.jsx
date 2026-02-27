import Navbar from '../components/common/Navbar'
import StudentDashboard from '../components/dashboard/StudentDashboard'
import { useAuth } from '../context/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartBar } from '@fortawesome/free-solid-svg-icons'

export default function StudentDashboardPage() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6"><FontAwesomeIcon icon={faChartBar} className="mr-2" /> Student Dashboard</h1>
        <StudentDashboard user={user} />
      </main>
    </div>
  )
}