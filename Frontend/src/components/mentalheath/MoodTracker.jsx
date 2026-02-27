import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFaceSmileBeam, faFaceSmile, faFaceMeh, faFaceFrown, faFaceSadTear, faCircleCheck, faDumbbell } from '@fortawesome/free-solid-svg-icons'

const moods = [
  { icon: faFaceSmileBeam, label: 'Great', value: 5, color: '#22c55e' },
  { icon: faFaceSmile, label: 'Good', value: 4, color: '#84cc16' },
  { icon: faFaceMeh, label: 'Okay', value: 3, color: '#eab308' },
  { icon: faFaceFrown, label: 'Low', value: 2, color: '#f97316' },
  { icon: faFaceSadTear, label: 'Bad', value: 1, color: '#ef4444' },
]

export default function MoodTracker() {
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="text-center space-y-4">
      <p className="text-gray-600 text-sm">How are you feeling today?</p>
      <div className="flex justify-center gap-4">
        {moods.map(m => (
          <button
            key={m.value}
            onClick={() => setSelected(m.value)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition
              ${selected === m.value ? 'bg-purple-100 scale-110' : 'hover:bg-gray-100'}`}
          >
            <span className="text-3xl"><FontAwesomeIcon icon={m.icon} style={{ color: m.color }} /></span>
            <span className="text-xs text-gray-500">{m.label}</span>
          </button>
        ))}
      </div>
      {selected && !submitted && (
        <button
          onClick={() => setSubmitted(true)}
          className="bg-purple-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-purple-700 transition"
        >
          Log Mood
        </button>
      )}
      {submitted && <p className="text-green-600 text-sm font-medium"><FontAwesomeIcon icon={faCircleCheck} className="mr-1" /> Mood logged! Keep going <FontAwesomeIcon icon={faDumbbell} className="ml-1" /></p>}
    </div>
  )
}