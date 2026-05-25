import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios.js';

const SEVERITY = {
  critical: { bg:'rgba(224,82,82,0.08)', border:'rgba(224,82,82,0.2)', text:'#E05252', badge:'bg-red-500/10 text-red-400 border-red-500/20' },
  warning:  { bg:'rgba(240,165,0,0.08)',  border:'rgba(240,165,0,0.2)',  text:'#F0A500', badge:'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
};

const TYPE_ICONS = {
  overdue_rental:'🚗', rental_ending:'⏰', overdue_installment:'💳', maintenance_due:'🔧', insurance_expiring:'📋',
};

export default function Alerts() {
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  const load = () => {
    setLoading(true);
    api.get('/notifications/alerts').then(({data}) => setAlerts(data.alerts||[])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = filter==='all' ? alerts : alerts.filter(a => a.severity===filter);
  const critical = alerts.filter(a => a.severity==='critical').length;
  const warning  = alerts.filter(a => a.severity==='warning').length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display font-bold text-xl md:text-2xl text-white">Alerts</h1>
          <p className="text-sm text-gray-500 mt-0.5">System notifications</p>
        </div>
        <button onClick={load} className="text-xs text-gray-500 hover:text-gold transition-colors border border-white/10 px-3 py-2 rounded-xl">↻ Refresh</button>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-5">
        {[
          { label:'Total',    value:alerts.length, color:'#fff'    },
          { label:'Critical', value:critical,      color:'#E05252' },
          { label:'Warnings', value:warning,       color:'#F0A500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-3 md:p-4 text-center" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="font-display font-bold text-2xl" style={{ color }}>{value}</div>
            <div className="text-xs text-gray-600 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {[['all','All'],['critical','Critical'],['warning','Warning']].map(([val,label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filter===val?'text-gold':'text-gray-500'}`}
            style={filter===val?{ background:'rgba(200,169,110,0.1)', border:'1px solid rgba(200,169,110,0.2)' }:{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center text-gray-600 py-16 text-xs animate-pulse">Loading alerts...</div>
        ) : filtered.length===0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-3xl mb-3">✓</div>
            <div className="text-white font-medium text-sm">All systems nominal</div>
            <div className="text-gray-600 text-xs mt-1">No alerts at this time</div>
          </div>
        ) : filtered.map((alert,i) => {
          const s = SEVERITY[alert.severity]||SEVERITY.warning;
          return (
            <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{ background:s.bg, border:`1px solid ${s.border}` }}>
              <div className="text-xl flex-shrink-0">{TYPE_ICONS[alert.type]||'⚠'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${s.badge}`}>{alert.severity}</span>
                  <span className="text-xs text-gray-500 capitalize">{alert.type?.replace(/_/g,' ')}</span>
                </div>
                <div className="text-sm font-medium" style={{ color:s.text }}>{alert.message}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
