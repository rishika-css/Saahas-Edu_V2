import { useState } from 'react'

export default function BrailleInput({ onConvert }) {
  const [input, setInput] = useState('')
  
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type a word or sentence (e.g., 'the children like braille')"
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none h-24 transition-all"
      />
      <button
        onClick={() => onConvert(input)}
        className="w-full bg-purple-600 text-white px-6 py-4 rounded-xl text-lg font-bold hover:bg-purple-700 hover:shadow-lg transition-all active:scale-[0.98]"
      >
        Show Braille Logic
      </button>
    </div>
  )
}