import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios.js';

const fmt     = (n) => n==null?'—':`KES ${Number(n).toLocaleString()}`;
const fmtDate = (d) => d?new Date(d).toLocaleDateString('en-KE',{day:'2-digit',month:'short',year:'numeric'}):'—';

const TYPE_STYLES = {
  rental:        'bg-blue-500/10   text-blue-400   border-blue-500/20',
  hire_purchase: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  deposit:       'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  damage:        'bg-red-500/10    text-red-400    border-red-500/20',
  penalty:       'bg-orange-500/10 text-orange-400 border-orange-500/20',
  other:         'bg-gray-500/10   text-gray-400   border-gray-500/20',
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [stats,    setStats]    = useState(null);
  const [type,     setType]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([api.get('/payments',{params:{type,limit:25}}), api.get('/payments/stats')]);
      setPayments(p.data.payments||[]); setStats(s.data.stats);
    } catch(e){ console.error(e); }
    finally{ setLoading(false); }
  }, [type]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-5">
        <h1 className="font-display font-bold text-xl md:text-2xl text-white">Payments</h1>
        <p className="text-sm text-gray-500 mt-0.5">Transaction history</p>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-5">
          {[
            { label:'Total Revenue',   value:fmt(stats.totalRevenue),   color:'#C8A96E' },
            { label:'This Month',      value:fmt(stats.monthlyRevenue), color:'#2EC881' },
            { label:'Transactions',    value:stats.byType?.reduce((s,t)=>s+t.count,0)||0, color:'#4DA8FF' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl p-3 md:p-5" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xs text-gray-600 uppercase tracking-widest mb-1.5">{label}</div>
              <div className="font-display font-bold text-lg md:text-2xl" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {[['','All'],['rental','Rental'],['hire_purchase','HP'],['deposit','Deposit'],['damage','Damage'],['penalty','Penalty']].map(([val,label]) => (
          <button key={val} onClick={() => setType(val)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex-shrink-0 ${type===val?'text-gold':'text-gray-500'}`}
            style={type===val?{ background:'rgba(200,169,110,0.1)', border:'1px solid rgba(200,169,110,0.2)' }:{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl overflow-hidden" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              {['Receipt','Customer','Type','Amount','Method','Date'].map(h => (
                <th key={h} className="text-left text-xs text-gray-600 uppercase tracking-widest px-5 py-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center text-gray-600 py-16 text-xs animate-pulse">Loading...</td></tr>
            ) : payments.length===0 ? (
              <tr><td colSpan={6} className="text-center text-gray-600 py-16 text-xs">No payments found</td></tr>
            ) : payments.map((p,i) => (
              <motion.tr key={p._id} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.025 }}
                className="transition-colors" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <td className="px-5 py-4 font-mono text-xs text-gray-500">{p.receiptNumber}</td>
                <td className="px-5 py-4 text-white">{p.customer?.firstName} {p.customer?.lastName}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${TYPE_STYLES[p.type]||TYPE_STYLES.other}`}>
                    {p.type?.replace('_',' ')}
                  </span>
                </td>
                <td className="px-5 py-4 text-gold font-semibold">{fmt(p.amount)}</td>
                <td className="px-5 py-4 text-gray-400 capitalize text-xs">{p.method?.replace('_',' ')}</td>
                <td className="px-5 py-4 text-gray-500 text-xs">{fmtDate(p.createdAt)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center text-gray-600 py-16 text-xs animate-pulse">Loading...</div>
        ) : payments.length===0 ? (
          <div className="text-center text-gray-600 py-16 text-xs">No payments found</div>
        ) : payments.map((p,i) => (
          <motion.div key={p._id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
            className="rounded-2xl p-4" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-medium text-white text-sm">{p.customer?.firstName} {p.customer?.lastName}</div>
                <div className="text-xs text-gray-500 font-mono mt-0.5">{p.receiptNumber}</div>
              </div>
              <div className="text-gold font-semibold text-sm">{fmt(p.amount)}</div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${TYPE_STYLES[p.type]||TYPE_STYLES.other}`}>
                {p.type?.replace('_',' ')}
              </span>
              <div className="text-xs text-gray-500">{p.method?.replace('_',' ').toUpperCase()} · {fmtDate(p.createdAt)}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
