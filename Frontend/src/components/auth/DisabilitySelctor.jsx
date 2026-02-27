const disabilities = [
    { id: 'visual', label: 'Visual Impairment', icon: '👁️' },
    { id: 'hearing', label: 'Hearing Impairment', icon: '👂' },
    { id: 'motor', label: 'Motor Disability', icon: '🤝' },
    { id: 'cognitive', label: 'Cognitive Disability', icon: '🧠' },
    { id: 'speech', label: 'Speech Disability', icon: '🗣️' },
    { id: 'none', label: 'No Disability', icon: '✅' },
  ]
  
  export default function DisabilitySelector({ selected, onChange }) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {disabilities.map((d) => (
          <button
            key={d.id}
            onClick={() => onChange(d.id)}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all
              ${selected === d.id
                ? 'border-purple-600 bg-purple-50 text-purple-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'}`}
          >
            <span className="text-xl">{d.icon}</span>
            <span>{d.label}</span>
          </button>
        ))}
      </div>
    )
  }