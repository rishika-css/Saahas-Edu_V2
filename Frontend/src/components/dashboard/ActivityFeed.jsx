const activities = [
    { id: 1, text: 'Completed Braille Module 3', time: '2h ago', icon: '⠿' },
    { id: 2, text: 'Sign Language Quiz - 85%', time: '5h ago', icon: '🤟' },
    { id: 3, text: 'Mood Check-in completed', time: '1d ago', icon: '💚' },
    { id: 4, text: 'Braille Module 2 completed', time: '2d ago', icon: '⠿' },
  ]
  
  export default function ActivityFeed() {
    return (
      <ul className="space-y-3">
        {activities.map(a => (
          <li key={a.id} className="flex items-center gap-3 text-sm">
            <span className="text-xl">{a.icon}</span>
            <div className="flex-1">
              <p className="text-gray-700 font-medium">{a.text}</p>
              <p className="text-gray-400 text-xs">{a.time}</p>
            </div>
          </li>
        ))}
      </ul>
    )
  }