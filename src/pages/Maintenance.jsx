import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios.js';

const fmt     = (n) => n==null?'—':`KES ${Number(n).toLocaleString()}`;
const fmtDate = (d) => d?new Date(d).toLocaleDateString('en-KE',{day:'2-digit',month:'short',year:'numeric'}):'—';

const STATUS_STYLES = {
  scheduled:   'bg-blue-500/10   text-blue-400   border-blue-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  completed:   'bg-green-500/10  text-green-400  border-green-500/20',
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
    <input {...props} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-gold/40 transition-colors" />
  </div>
);

function AddMaintenanceModal({ onClose, onSaved }) {
  const [vehicles, setVehicles] = useState([]);
  const [form,     setForm]     = useState({ vehicle:'', type:'oil_change', description:'', status:'scheduled', cost:'', serviceDate:'', nextServiceDate:'', mileageAtService:'', serviceProvider:'' });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    api.get('/vehicles',{params:{limit:100}}).then(({data}) => setVehicles(data.vehicles||[]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/maintenance',{ ...form, cost:parseFloat(form.cost)||0, mileageAtService:parseInt(form.mileageAtService)||0 });
      onSaved(); onClose();
    } catch(err){ setError(err.response?.data?.message||'Failed to create record.'); }
    finally{ setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background:'rgba(5,8,22,0.85)', backdropFilter:'blur(8px)' }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-5 max-h-[92vh] overflow-y-auto scrollbar-hide"
        style={{ background:'#0A0F1E', border:'1px solid rgba(200,169,110,0.15)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-white text-lg">Add Maintenance</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Vehicle *</label>
            <select value={form.vehicle} onChange={set('vehicle')} required style={{ background:'#0A0F1E' }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none">
              <option value="">Select vehicle...</option>
              {vehicles.map(v => <option key={v._id} value={v._id}>{v.year} {v.make} {v.model} — {v.registrationNumber}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Type *</label>
              <select value={form.type} onChange={set('type')} style={{ background:'#0A0F1E' }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none">
                {['oil_change','tire_replacement','brake_service','engine_repair','body_repair','insurance_renewal','inspection','other'].map(t => (
                  <option key={t} value={t}>{t.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Status</label>
              <select value={form.status} onChange={set('status')} style={{ background:'#0A0F1E' }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none">
                {['scheduled','in_progress','completed'].map(s => <option key={s} value={s}>{s.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
              </select>
            </div>
          </div>
          <Input label="Description" value={form.description} onChange={set('description')} placeholder="Service description" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Cost (KES)"    type="number" value={form.cost}              onChange={set('cost')}              placeholder="0" />
            <Input label="Mileage (km)"  type="number" value={form.mileageAtService}  onChange={set('mileageAtService')}  placeholder="km" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Service Date"  type="date" value={form.serviceDate}     onChange={set('serviceDate')} />
            <Input label="Next Service"  type="date" value={form.nextServiceDate} onChange={set('nextServiceDate')} />
          </div>
          <Input label="Service Provider" value={form.serviceProvider} onChange={set('serviceProvider')} placeholder="Garage name" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm text-gray-400 border border-white/10">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl text-sm font-display font-semibold text-ink disabled:opacity-50" style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>
              {loading?'Saving...':'Save Record'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Maintenance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status,  setStatus]  = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [due,     setDue]     = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, d] = await Promise.all([api.get('/maintenance',{params:{status,limit:25}}), api.get('/maintenance/due')]);
      setRecords(m.data.records||[]); setDue(d.data.records||[]);
    } catch(e){ console.error(e); }
    finally{ setLoading(false); }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display font-bold text-xl md:text-2xl text-white">Maintenance</h1>
          <p className="text-sm text-gray-500 mt-0.5">Service records</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-sm font-display font-semibold text-ink hover:opacity-90"
          style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>
          + Add
        </button>
      </div>

      {due.length>0 && (
        <div className="rounded-2xl p-4 mb-4" style={{ background:'rgba(224,82,82,0.06)', border:'1px solid rgba(224,82,82,0.15)' }}>
          <div className="text-xs text-red-400 uppercase tracking-widest font-medium mb-2">⚠ {due.length} service(s) due within 7 days</div>
          <div className="flex flex-wrap gap-2">
            {due.map(d => (
              <span key={d._id} className="text-xs bg-red-500/10 text-red-300 border border-red-500/20 px-3 py-1 rounded-full">
                {d.vehicle?.registrationNumber} — {d.type?.replace(/_/g,' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {[['','All'],['scheduled','Scheduled'],['in_progress','In Progress'],['completed','Completed']].map(([val,label]) => (
          <button key={val} onClick={() => setStatus(val)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex-shrink-0 ${status===val?'text-gold':'text-gray-500'}`}
            style={status===val?{ background:'rgba(200,169,110,0.1)', border:'1px solid rgba(200,169,110,0.2)' }:{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl overflow-hidden" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              {['Vehicle','Type','Description','Cost','Service Date','Next Service','Status'].map(h => (
                <th key={h} className="text-left text-xs text-gray-600 uppercase tracking-widest px-5 py-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center text-gray-600 py-16 text-xs animate-pulse">Loading...</td></tr>
            ) : records.length===0 ? (
              <tr><td colSpan={7} className="text-center py-16">
                <div className="text-gray-600 text-xs mb-3">No records found</div>
                <button onClick={() => setShowAdd(true)} className="text-xs text-gold">+ Add record</button>
              </td></tr>
            ) : records.map((r,i) => (
              <motion.tr key={r._id} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.025 }}
                className="transition-colors" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <td className="px-5 py-4">
                  <div className="font-medium text-white text-xs">{r.vehicle?.make} {r.vehicle?.model}</div>
                  <div className="text-xs text-gray-600 font-mono">{r.vehicle?.registrationNumber}</div>
                </td>
                <td className="px-5 py-4 text-gray-300 text-xs capitalize">{r.type?.replace(/_/g,' ')}</td>
                <td className="px-5 py-4 text-gray-500 text-xs">{r.description||'—'}</td>
                <td className="px-5 py-4 text-gold text-xs font-medium">{fmt(r.cost)}</td>
                <td className="px-5 py-4 text-gray-400 text-xs">{fmtDate(r.serviceDate)}</td>
                <td className="px-5 py-4 text-gray-400 text-xs">{fmtDate(r.nextServiceDate)}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${STATUS_STYLES[r.status]}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"/>{r.status?.replace('_',' ')}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center text-gray-600 py-16 text-xs animate-pulse">Loading...</div>
        ) : records.length===0 ? (
          <div className="text-center py-16">
            <div className="text-gray-600 text-xs mb-3">No records found</div>
            <button onClick={() => setShowAdd(true)} className="text-xs text-gold">+ Add record</button>
          </div>
        ) : records.map((r,i) => (
          <motion.div key={r._id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
            className="rounded-2xl p-4" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-medium text-white text-sm">{r.vehicle?.make} {r.vehicle?.model}</div>
                <div className="text-xs text-gray-500 font-mono">{r.vehicle?.registrationNumber}</div>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize flex-shrink-0 ${STATUS_STYLES[r.status]}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"/>{r.status?.replace('_',' ')}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><div className="text-gray-600 mb-0.5">Type</div><div className="text-gray-300 capitalize">{r.type?.replace(/_/g,' ')}</div></div>
              <div><div className="text-gray-600 mb-0.5">Cost</div><div className="text-gold font-medium">{fmt(r.cost)}</div></div>
              <div><div className="text-gray-600 mb-0.5">Date</div><div className="text-gray-300">{fmtDate(r.serviceDate)}</div></div>
            </div>
            {r.description && <div className="text-xs text-gray-600 mt-2">{r.description}</div>}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && <AddMaintenanceModal onClose={() => setShowAdd(false)} onSaved={load} />}
      </AnimatePresence>
    </div>
  );
}
