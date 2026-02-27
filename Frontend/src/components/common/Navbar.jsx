import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const navLinks = [
  { path: '/braille', label: 'Braille', icon: '⠿' },
  { path: '/sign-language', label: 'Signs', icon: '🤟' },
  { path: '/dashboard', label: 'Stats', icon: '📊' },
  { path: '/games', label: 'Play', icon: '🎮' },
  { path: '/mental-health', label: 'Wellness', icon: '🧠' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-[100] transition-all duration-500">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        
        {/* Cyber Logo */}
        <Link to="/home" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#D2FF00] flex items-center justify-center text-black font-black italic transition-transform group-hover:rotate-12 group-hover:scale-110 shadow-[0_0_20px_rgba(210,255,0,0.3)]">
            S
          </div>
          <span className="font-display text-2xl tracking-tighter text-white uppercase italic hidden sm:block">
            Saahas <span className="text-[#D2FF00] font-sans text-[10px] tracking-[0.4em] not-italic ml-2 opacity-50">// Archive</span>
          </span>
        </Link>

        {/* High-Speed Links */}
        <div className="hidden lg:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 text-[20px] font-black uppercase tracking-[0.2em] transition-all
                  ${isActive ? 'text-[#D2FF00]' : 'text-white/40 hover:text-white'}`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm">{link.icon}</span>
                  {link.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D2FF00] shadow-[0_0_10px_#D2FF00]"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Profile & Logout */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end leading-none">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#D2FF00] mb-1">Authenticated</span>
            <span className="text-xs font-bold text-white italic">{user?.name}</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="text-[9px] font-black uppercase tracking-[0.2em] border border-[#D2FF00]/40 text-[#D2FF00] px-5 py-2.5 hover:bg-[#D2FF00] hover:text-black transition-all"
          >
            Terminal Out
          </button>
        </div>
      </div>

      {/* Mobile Cyber-Shelf */}
      <div className="lg:hidden flex overflow-x-auto no-scrollbar gap-2 px-6 pb-4">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 border transition-all text-[9px] font-black uppercase tracking-widest
              ${pathname === link.path 
                ? 'bg-[#D2FF00] text-black border-[#D2FF00]' 
                : 'bg-white/5 text-white/40 border-white/10'}`}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}