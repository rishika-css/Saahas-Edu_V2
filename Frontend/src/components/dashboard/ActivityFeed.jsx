import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBraille, faHandPeace, faHeart } from '@fortawesome/free-solid-svg-icons'

const activities = [
  { id: 1, text: 'Completed Braille Module 3', time: '2h ago', icon: <FontAwesomeIcon icon={faBraille} /> },
  { id: 2, text: 'Sign Language Quiz - 85%', time: '5h ago', icon: <FontAwesomeIcon icon={faHandPeace} /> },
  { id: 3, text: 'Mood Check-in completed', time: '1d ago', icon: <FontAwesomeIcon icon={faHeart} style={{ color: '#22c55e' }} /> },
  { id: 4, text: 'Braille Module 2 completed', time: '2d ago', icon: <FontAwesomeIcon icon={faBraille} /> },
]

export default function ActivityFeed() {
  return (
    <ul className="space-y-3">
      {activities.map(a => (
        <li key={a.id} className="flex items-center gap-3 text-sm">
          <span className="text-xl">{a.icon}</span>
          <div className="flex-1">
            <p className="text-white/80 font-medium">{a.text}</p>
            <p className="text-white/40 text-xs">{a.time}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}