import MoodTracker from './MoodTracker'
import ResourceCard from './ResourceCard'
import Card from '../common/Card'

const resources = [
  { icon: '🧘', title: 'Breathing Exercises', description: 'Calm your mind in 5 minutes' },
  { icon: '📖', title: 'Journaling Prompts', description: 'Express your thoughts freely' },
  { icon: '🎵', title: 'Relaxing Sounds', description: 'Focus music and nature sounds' },
  { icon: '💬', title: 'Talk to a Counselor', description: 'Connect with a professional' },
]

const weekData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const moodData = [4, 3, 5, 2, 4, 5, 3]

export default function MentalHealthDashboard() {
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold text-gray-700 mb-4">Daily Mood Check-in</h3>
        <MoodTracker />
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-700 mb-4">This Week's Mood</h3>
        <div className="flex items-end gap-2 h-24">
          {weekData.map((day, i) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-purple-400 rounded-t-md transition-all"
                style={{ height: `${(moodData[i] / 5) * 80}px` }}
              />
              <span className="text-xs text-gray-400">{day}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-700 mb-4">Resources</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {resources.map(r => (
            <ResourceCard key={r.title} {...r} />
          ))}
        </div>
      </Card>
    </div>
  )
}