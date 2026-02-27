export default function SignDisplay({ gesture }) {
  return (
    <div className="bg-gray-900 rounded-2xl min-h-64 flex items-center justify-center">
      {gesture
        ? <span className="text-white text-6xl">{gesture}</span>
        : <span className="text-gray-500 text-sm">Camera feed / gesture will appear here</span>}
    </div>
  )
}