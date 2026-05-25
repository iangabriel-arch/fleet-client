import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import GlobalSearch from './GlobalSearch.jsx';

const NAV = [
  { to:'/',              label:'Dashboard',     icon:'⬡', end:true },
  { to:'/vehicles',      label:'Vehicles',      icon:'◈' },
  { to:'/customers',     label:'Customers',     icon:'◉' },
  { to:'/rentals',       label:'Rentals',       icon:'◷' },
  { to:'/hire-purchase', label:'Hire Purchase', icon:'◈' },
  { to:'/payments',      label:'Payments',      icon:'◆' },
  { to:'/maintenance',   label:'Maintenance',   icon:'⚙' },
  { to:'/analytics',     label:'Analytics',     icon:'◎' },
  { to:'/alerts',        label:'Alerts',        icon:'◬' },
];

const initials = (name='') => name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);

export default function DashboardLayout() {
  const { user, logout }      = useAuth();
  const navigate               = useNavigate();
  const location               = useLocation();
  const [open,    setOpen]     = useState(false);
  const [desktop, setDesktop]  = useState(window.innerWidth >= 768);

  useEffect(() => {
    const h = () => setDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => { if (!desktop) setOpen(false); }, [location.pathname, desktop]);

  return (
    <div className="flex h-screen overflow-hidden bg-ink">

      {/* Mobile overlay */}
      <AnimatePresence>
        {!desktop && open && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)} />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <AnimatePresence>
        {(desktop || open) && (
          <motion.aside
            initial={desktop ? false : { x:-240 }}
            animate={{ x:0 }}
            exit={{ x:-240 }}
            transition={{ duration:0.25, ease:[0.22,1,0.36,1] }}
            className={`flex-shrink-0 flex flex-col z-50 ${desktop?'relative':'fixed top-0 left-0 h-full'}`}
            style={{ width:240, background:'rgba(10,15,30,0.98)', backdropFilter:'blur(20px)', borderRight:'1px solid rgba(255,255,255,0.05)' }}>

            {/* Logo */}
            <div className="flex items-center justify-between px-4 py-5 border-b" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-display font-bold text-ink text-sm"
                  style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>F</div>
                <span className="font-display font-bold text-white text-[15px] tracking-tight">
                  FLEET<span className="text-gold">OS</span>
                </span>
              </div>
              {!desktop && (
                <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white text-lg">✕</button>
              )}
            </div>

            {/* Nav */}
            <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto scrollbar-hide">
              {NAV.map(item => (
                <NavLink key={item.to} to={item.to} end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-150 ${isActive?'text-gold font-medium':'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`
                  }
                  style={({ isActive }) => isActive ? { background:'rgba(200,169,110,0.08)', boxShadow:'inset 2px 0 0 #C8A96E' } : {}}>
                  <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* User */}
            <div className="p-3 border-t" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-gold"
                  style={{ background:'rgba(200,169,110,0.12)', border:'1px solid rgba(200,169,110,0.2)' }}>
                  {initials(user?.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{user?.name}</div>
                  <div className="text-xs text-gray-600 capitalize">{user?.role?.replace('_',' ')}</div>
                </div>
              </div>
              <button onClick={() => { logout(); navigate('/login'); }}
                className="w-full mt-3 text-xs text-gray-600 hover:text-red-400 transition-colors text-left px-1">
                Sign out →
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor:'rgba(255,255,255,0.05)', background:'rgba(10,15,30,0.9)', backdropFilter:'blur(20px)' }}>

          <button onClick={() => setOpen(!open)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all flex-shrink-0">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Global Search */}
          <GlobalSearch />

          <div className="flex-1" />

          <div className="hidden md:block text-xs text-gray-600">
            {new Date().toLocaleDateString('en-KE',{ weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </div>

          <div className="w-px h-4 bg-white/10 hidden md:block" />

          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-gold capitalize hidden sm:block">
              {user?.role?.replace('_',' ')}
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gold flex-shrink-0"
              style={{ background:'rgba(200,169,110,0.12)', border:'1px solid rgba(200,169,110,0.2)' }}>
              {initials(user?.name)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-6"
          style={{ background:'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(200,169,110,0.03) 0%, transparent 60%)' }}>
          <motion.div key={location.pathname}
            initial={{ opacity:0, y:10 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}>
            <Outlet />
          </motion.div>
        </main>

        {/* Mobile bottom nav */}
        {!desktop && (
          <nav className="flex-shrink-0 flex border-t"
            style={{ borderColor:'rgba(255,255,255,0.05)', background:'rgba(10,15,30,0.98)', backdropFilter:'blur(20px)' }}>
            {NAV.slice(0,5).map(item => (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${isActive?'text-gold':'text-gray-600'}`
                }>
                <span className="text-base">{item.icon}</span>
                <span className="text-[10px]">{item.label.split(' ')[0]}</span>
              </NavLink>
            ))}
            <button onClick={() => setOpen(true)}
              className="flex-1 flex flex-col items-center gap-1 py-3 text-xs text-gray-600">
              <span className="text-base">☰</span>
              <span className="text-[10px]">More</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
