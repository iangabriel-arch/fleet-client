import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios.js';

const STATUS_COLORS = {
  available: '#2EC881', rented: '#C8A96E', reserved: '#4DA8FF',
  under_maintenance: '#E05252', hire_purchase: '#A78BFA', sold: '#6B7280',
};

export default function GlobalSearch() {
  const navigate   = useNavigate();
  const inputRef   = useRef(null);
  const wrapRef    = useRef(null);
  const [query,    setQuery]    = useState('');
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [customers,setCustomers]= useState([]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setVehicles([]);
    setCustomers([]);
  }, []);

  const go = useCallback((path) => {
    close();
    // Small timeout ensures modal unmounts before navigation
    setTimeout(() => navigate(path), 50);
  }, [navigate, close]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 80);
      }
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [close]);

  // Click outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) close();
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setVehicles([]); setCustomers([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [v, c] = await Promise.all([
          api.get('/vehicles',  { params:{ search:query, limit:5 } }),
          api.get('/customers', { params:{ search:query, limit:5 } }),
        ]);
        setVehicles(v.data.vehicles  || []);
        setCustomers(c.data.customers || []);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const hasResults = vehicles.length > 0 || customers.length > 0;

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 80); }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-300 transition-colors"
        style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
        </svg>
        <span className="hidden sm:block text-xs">Search</span>
        <kbd className="hidden md:block text-xs px-1.5 py-0.5 rounded font-mono" style={{ background:'rgba(255,255,255,0.08)', color:'#6B7280' }}>⌘K</kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[200] flex items-start justify-center pt-16 px-4"
            style={{ background:'rgba(5,8,22,0.8)', backdropFilter:'blur(8px)' }}>
            <motion.div
              ref={wrapRef}
              initial={{ opacity:0, scale:0.96, y:-10 }}
              animate={{ opacity:1, scale:1,    y:0   }}
              exit={{    opacity:0, scale:0.96, y:-10 }}
              transition={{ duration:0.2, ease:[0.22,1,0.36,1] }}
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background:'#0A0F1E', border:'1px solid rgba(200,169,110,0.2)', boxShadow:'0 24px 64px rgba(0,0,0,0.6)' }}>

              {/* Input row */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor:'rgba(255,255,255,0.07)' }}>
                <svg width="16" height="16" fill="none" stroke="#6B7280" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search vehicles, customers..."
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-600"
                />
                {loading && (
                  <svg className="animate-spin w-4 h-4 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                )}
                <button onClick={close}
                  className="text-xs px-2 py-1 rounded-lg text-gray-600 hover:text-white transition-colors"
                  style={{ background:'rgba(255,255,255,0.06)' }}>
                  ESC
                </button>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto scrollbar-hide">
                {query.trim() ? (
                  !hasResults && !loading ? (
                    <div className="text-center py-10 text-gray-600 text-sm">
                      No results for "{query}"
                    </div>
                  ) : (
                    <>
                      {/* Vehicle results */}
                      {vehicles.length > 0 && (
                        <div>
                          <div className="px-4 py-2 text-xs text-gray-600 uppercase tracking-widest font-medium sticky top-0"
                            style={{ background:'rgba(10,15,30,0.95)' }}>
                            Vehicles
                          </div>
                          {vehicles.map(v => (
                            <button
                              key={v._id}
                              onClick={() => go(`/vehicles/${v._id}`)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-white/5 active:bg-white/10">
                              <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-base"
                                style={{ background:'rgba(200,169,110,0.1)' }}>
                                🚗
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-white font-medium truncate">
                                  {v.year} {v.make} {v.model}
                                </div>
                                <div className="text-xs text-gray-500 font-mono mt-0.5">
                                  {v.registrationNumber}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <div className="w-2 h-2 rounded-full"
                                  style={{ background: STATUS_COLORS[v.status] || '#6B7280' }}/>
                                <span className="text-xs text-gray-500 capitalize hidden sm:block">
                                  {v.status?.replace(/_/g,' ')}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Customer results */}
                      {customers.length > 0 && (
                        <div>
                          <div className="px-4 py-2 text-xs text-gray-600 uppercase tracking-widest font-medium sticky top-0"
                            style={{ background:'rgba(10,15,30,0.95)' }}>
                            Customers
                          </div>
                          {customers.map(c => {
                            const name = c.fullName || `${c.firstName} ${c.lastName}`;
                            const inits = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
                            return (
                              <button
                                key={c._id}
                                onClick={() => go(`/customers/${c._id}`)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-white/5 active:bg-white/10">
                                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-gold"
                                  style={{ background:'rgba(200,169,110,0.12)', border:'1px solid rgba(200,169,110,0.2)' }}>
                                  {inits}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm text-white font-medium truncate">{name}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {c.phone} · {c.nationalId}
                                  </div>
                                </div>
                                {c.isBlacklisted && (
                                  <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                                    Blacklisted
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )
                ) : (
                  /* Empty state — quick nav */
                  <div className="px-4 py-5">
                    <div className="text-xs text-gray-600 uppercase tracking-widest mb-3 font-medium">Quick Navigation</div>
                    <div className="space-y-1">
                      {[
                        { label:'Vehicles',     path:'/vehicles',      icon:'🚗' },
                        { label:'Customers',    path:'/customers',     icon:'👥' },
                        { label:'Rentals',      path:'/rentals',       icon:'📅' },
                        { label:'Hire Purchase',path:'/hire-purchase', icon:'💳' },
                        { label:'Analytics',    path:'/analytics',     icon:'📊' },
                        { label:'Alerts',       path:'/alerts',        icon:'🔔' },
                      ].map(({ label, path, icon }) => (
                        <button key={path} onClick={() => go(path)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all hover:bg-white/5 text-left">
                          <span className="text-base">{icon}</span>
                          <span>{label}</span>
                          <span className="ml-auto text-gray-700 text-xs">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
