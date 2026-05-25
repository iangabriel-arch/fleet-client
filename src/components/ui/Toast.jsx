import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const toast = {
    success: (msg) => add(msg, 'success'),
    error:   (msg) => add(msg, 'error'),
    warning: (msg) => add(msg, 'warning'),
    info:    (msg) => add(msg, 'info'),
  };

  const STYLES = {
    success: { border:'rgba(46,200,129,0.3)',  bg:'rgba(46,200,129,0.08)',  text:'#2EC881', icon:'✓' },
    error:   { border:'rgba(224,82,82,0.3)',   bg:'rgba(224,82,82,0.08)',   text:'#E05252', icon:'✕' },
    warning: { border:'rgba(240,165,0,0.3)',   bg:'rgba(240,165,0,0.08)',   text:'#F0A500', icon:'⚠' },
    info:    { border:'rgba(77,168,255,0.3)',  bg:'rgba(77,168,255,0.08)',  text:'#4DA8FF', icon:'ℹ' },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 320 }}>
        <AnimatePresence>
          {toasts.map(t => {
            const s = STYLES[t.type] || STYLES.info;
            return (
              <motion.div key={t.id}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0,  scale: 1    }}
                exit={{    opacity: 0, x: 40, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-3 px-4 py-3 rounded-2xl pointer-events-auto"
                style={{ background: 'rgba(10,15,30,0.97)', border: `1px solid ${s.border}`, backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: s.bg, color: s.text }}>
                  {s.icon}
                </div>
                <div className="text-sm text-white leading-relaxed">{t.message}</div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
