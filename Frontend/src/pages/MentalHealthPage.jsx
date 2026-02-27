import Navbar from '../components/common/Navbar'
import MentalHealthDashboard from '../components/mentalheath/MentalHealthDashboard'

export default function MentalHealthPage() {
  return (
    <div className="mh-page">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <MentalHealthDashboard />
      </main>
    </div>
  )
}