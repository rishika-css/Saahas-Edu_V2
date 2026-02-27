import { useState } from 'react'

const moods = [
  { emoji: '😄', label: 'Great', value: 5 },
  { emoji: '🙂', label: 'Good', value: 4 },
  { emoji: '😐', label: 'Okay', value: 3 },
  { emoji: '😔', label: 'Low', value: 2 },
  { emoji: '😢', label: 'Bad', value: 1 },
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
            <span className="text-3xl">{m.emoji}</span>
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
      {submitted && <p className="text-green-600 text-sm font-medium">✅ Mood logged! Keep going 💪</p>}
    </div>
  )
}