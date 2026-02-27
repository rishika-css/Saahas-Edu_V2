export default function ProgressCard({ subject, progress, color = 'purple' }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-white/80">{subject}</span>
          <span className="text-white/40">{progress}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className={`h-2 rounded-full bg-${color}-500 transition-all`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}