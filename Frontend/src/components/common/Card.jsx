export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#0a0f18] rounded-2xl shadow-lg border border-white/10 p-5 ${className}`}>
      {children}
    </div>
  )
}