export default function Button({ children, onClick, variant = 'primary', className = '', disabled = false }) {
    const base = 'px-5 py-2.5 rounded-xl font-medium text-sm transition-all focus:outline-none'
    const variants = {
      primary: 'bg-purple-600 text-white hover:bg-purple-700',
      secondary: 'border border-purple-300 text-purple-600 hover:bg-purple-50',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    }
    return (
      <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {children}
      </button>
    )
  }