export default function StatsWidget({ label, value, icon, color = 'purple' }) {
  const colors = {
    purple: 'bg-purple-500/15 text-purple-400',
    blue: 'bg-blue-500/15 text-blue-400',
    green: 'bg-green-500/15 text-green-400',
    orange: 'bg-orange-500/15 text-orange-400',
  }
  return (
    <div className={`rounded-2xl p-5 border border-white/10 ${colors[color]}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm font-medium opacity-80">{label}</div>
    </div>
  )
}