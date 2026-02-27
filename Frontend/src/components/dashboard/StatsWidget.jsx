export default function StatsWidget({ label, value, icon, color = 'purple' }) {
    const colors = {
      purple: 'bg-purple-50 text-purple-700',
      blue: 'bg-blue-50 text-blue-700',
      green: 'bg-green-50 text-green-700',
      orange: 'bg-orange-50 text-orange-700',
    }
    return (
      <div className={`rounded-2xl p-5 ${colors[color]}`}>
        <div className="text-3xl mb-2">{icon}</div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm font-medium opacity-80">{label}</div>
      </div>
    )
  }