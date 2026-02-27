import Navbar from '../components/common/Navbar'
import MentalHealthDashboard from '../components/mentalheath/MentalHealthDashboard'

export default function MentalHealthPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🧠 Mental Health & Wellness</h1>
        <MentalHealthDashboard />
      </main>
    </div>
  )
}