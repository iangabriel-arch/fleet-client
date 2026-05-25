import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios.js';
import { useToast } from '../components/ui/Toast.jsx';

const STATUS_STYLES = {
  reserved:  'bg-blue-500/10   text-blue-400   border-blue-500/20',
  active:    'bg-green-500/10  text-green-400  border-green-500/20',
  completed: 'bg-gray-500/10   text-gray-400   border-gray-500/20',
  cancelled: 'bg-red-500/10    text-red-400    border-red-500/20',
};

const fmt     = (n) => n==null?'—':`KES ${Number(n).toLocaleString()}`;
const fmtDate = (d) => d?new Date(d).toLocaleDateString('en-KE',{day:'2-digit',month:'short',year:'numeric'}):'—';

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
    <input {...props} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-gold/40 transition-colors" />
  </div>
);

function CreateRentalModal({ onClose, onSaved }) {
  const [vehicles,  setVehicles]  = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form,      setForm]      = useState({ vehicle:'', customer:'', startDate:'', endDate:'', depositAmount:'', notes:'' });
  const [preview,   setPreview]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    Promise.all([api.get('/vehicles',{params:{status:'available',limit:100}}), api.get('/customers',{params:{limit:100}})]).then(([v,c]) => {
      setVehicles(v.data.vehicles||[]); setCustomers(c.data.customers||[]);
    });
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (form.vehicle && form.startDate && form.endDate) {
      const v    = vehicles.find(v => v._id===form.vehicle);
      const days = Math.ceil((new Date(form.endDate)-new Date(form.startDate))/(1000*60*60*24));
      if (v && days>0) setPreview({ days, daily:v.dailyRate, total:days*v.dailyRate });
      else setPreview(null);
    } else setPreview(null);
  }, [form.vehicle, form.startDate, form.endDate, vehicles]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await api.post('/rentals',{...form,depositAmount:parseFloat(form.depositAmount)||0}); onSaved(); onClose(); }
    catch(err){ setError(err.response?.data?.message||'Failed to create rental.'); }
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
          <h2 className="font-display font-semibold text-white text-lg">New Booking</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Vehicle *</label>
            <select value={form.vehicle} onChange={set('vehicle')} required style={{ background:'#0A0F1E' }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-gold/40">
              <option value="">Select vehicle...</option>
              {vehicles.map(v => <option key={v._id} value={v._id}>{v.year} {v.make} {v.model} — {v.registrationNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Customer *</label>
            <select value={form.customer} onChange={set('customer')} required style={{ background:'#0A0F1E' }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-gold/40">
              <option value="">Select customer...</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName} — {c.phone}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date *" type="date" value={form.startDate} onChange={set('startDate')} required />
            <Input label="End Date *"   type="date" value={form.endDate}   onChange={set('endDate')}   required />
          </div>
          <Input label="Deposit (KES)" type="number" value={form.depositAmount} onChange={set('depositAmount')} placeholder="0" />
          {preview && (
            <div className="rounded-xl p-4" style={{ background:'rgba(200,169,110,0.06)', border:'1px solid rgba(200,169,110,0.15)' }}>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Cost Preview</div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">{preview.days} days × {fmt(preview.daily)}</span>
                <span className="text-white font-medium">{fmt(preview.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Balance Due</span>
                <span className="text-gold font-semibold">{fmt(preview.total-(parseFloat(form.depositAmount)||0))}</span>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm text-gray-400 border border-white/10">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl text-sm font-display font-semibold text-ink disabled:opacity-50" style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>
              {loading?'Creating...':'Create Booking'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ReturnModal({ rental, onClose, onSaved }) {
  const [form,    setForm]    = useState({ returnMileage:'', fuelLevel:'full', damageCharge:0, inspectionNotes:'' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await api.patch(`/rentals/${rental._id}/return`,{...form,damageCharge:parseFloat(form.damageCharge)||0}); onSaved(); onClose(); }
    catch(err){ setError(err.response?.data?.message||'Failed to process return.'); }
    finally{ setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background:'rgba(5,8,22,0.85)', backdropFilter:'blur(8px)' }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5"
        style={{ background:'#0A0F1E', border:'1px solid rgba(200,169,110,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-white text-lg">Vehicle Return</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>
        <div className="rounded-xl p-3 mb-4" style={{ background:'rgba(255,255,255,0.03)' }}>
          <div className="text-xs text-gray-400">{rental.vehicle?.make} {rental.vehicle?.model} — {rental.vehicle?.registrationNumber}</div>
          <div className="text-xs text-gray-500">{rental.customer?.firstName} {rental.customer?.lastName}</div>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Return Mileage" type="number" value={form.returnMileage} onChange={set('returnMileage')} placeholder="km" />
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Fuel Level</label>
            <select value={form.fuelLevel} onChange={set('fuelLevel')} style={{ background:'#0A0F1E' }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none">
              {['empty','quarter','half','three_quarter','full'].map(f => <option key={f} value={f}>{f.replace('_',' ')}</option>)}
            </select>
          </div>
          <Input label="Damage Charge (KES)" type="number" value={form.damageCharge} onChange={set('damageCharge')} placeholder="0" />
          <Input label="Inspection Notes" value={form.inspectionNotes} onChange={set('inspectionNotes')} placeholder="Vehicle condition..." />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm text-gray-400 border border-white/10">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl text-sm font-display font-semibold text-ink disabled:opacity-50" style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>
              {loading?'Processing...':'Complete Return'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Rentals() {
  const [rentals,   setRentals]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [status,    setStatus]    = useState('');
  const [showAdd,   setShowAdd]   = useState(false);
  const [returning, setReturning] = useState(null);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/rentals',{params:{status,limit:25}}); setRentals(data.rentals||[]); }
    catch(e){ console.error(e); }
    finally{ setLoading(false); }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const handlePickup = async (id) => {
    try { await api.patch(`/rentals/${id}/pickup`); toast.success('Vehicle picked up — rental is now active'); load(); }
    catch(e){ toast.error(e.response?.data?.message||'Action failed'); }
  };
  const handleCancel = async (id) => {
    if (!confirm('Cancel this rental?')) return;
    try { await api.patch(`/rentals/${id}/cancel`,{reason:'Cancelled by staff'}); toast.success('Rental cancelled successfully'); load(); }
    catch(e){ toast.error(e.response?.data?.message||'Action failed'); }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display font-bold text-xl md:text-2xl text-white">Rentals</h1>
          <p className="text-sm text-gray-500 mt-0.5">Vehicle bookings</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-sm font-display font-semibold text-ink hover:opacity-90"
          style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>
          + Book
        </button>
      </div>

      {/* Status tabs - scrollable on mobile */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {[['','All'],['reserved','Reserved'],['active','Active'],['completed','Completed'],['cancelled','Cancelled']].map(([val,label]) => (
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
              {['Vehicle','Customer','Period','Days','Total','Status','Actions'].map(h => (
                <th key={h} className="text-left text-xs text-gray-600 uppercase tracking-widest px-5 py-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center text-gray-600 py-16 text-xs animate-pulse">Loading...</td></tr>
            ) : rentals.length===0 ? (
              <tr><td colSpan={7} className="text-center py-16">
                <div className="text-gray-600 text-xs mb-3">No rentals found</div>
                <button onClick={() => setShowAdd(true)} className="text-xs text-gold">+ Create booking</button>
              </td></tr>
            ) : rentals.map((r,i) => (
              <motion.tr key={r._id} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.025 }}
                className="transition-colors" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <td className="px-5 py-4">
                  <div className="font-medium text-white">{r.vehicle?.make} {r.vehicle?.model}</div>
                  <div className="text-xs text-gray-600 font-mono">{r.vehicle?.registrationNumber}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-white">{r.customer?.firstName} {r.customer?.lastName}</div>
                  <div className="text-xs text-gray-600">{r.customer?.phone}</div>
                </td>
                <td className="px-5 py-4 text-gray-400 text-xs">
                  <div>{fmtDate(r.startDate)}</div>
                  <div className="text-gray-600">→ {fmtDate(r.endDate)}</div>
                </td>
                <td className="px-5 py-4 text-gray-400">{r.days}d</td>
                <td className="px-5 py-4 text-gold font-medium">{fmt(r.totalCost)}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${STATUS_STYLES[r.status]}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"/>{r.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    {r.status==='reserved' && <>
                      <button onClick={() => handlePickup(r._id)} className="text-xs px-3 py-1.5 rounded-lg font-medium text-ink" style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>Pickup</button>
                      <button onClick={() => handleCancel(r._id)} className="text-xs px-3 py-1.5 rounded-lg text-red-400 border border-red-500/20">Cancel</button>
                    </>}
                    {r.status==='active' && <button onClick={() => setReturning(r)} className="text-xs px-3 py-1.5 rounded-lg font-medium text-ink" style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>Return</button>}
                    {['completed','cancelled'].includes(r.status) && <span className="text-xs text-gray-700">—</span>}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center text-gray-600 py-16 text-xs animate-pulse">Loading rentals...</div>
        ) : rentals.length===0 ? (
          <div className="text-center py-16">
            <div className="text-gray-600 text-xs mb-3">No rentals found</div>
            <button onClick={() => setShowAdd(true)} className="text-xs text-gold">+ Create booking</button>
          </div>
        ) : rentals.map((r,i) => (
          <motion.div key={r._id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
            className="rounded-2xl p-4" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-medium text-white text-sm">{r.vehicle?.make} {r.vehicle?.model}</div>
                <div className="text-xs text-gray-500 font-mono">{r.vehicle?.registrationNumber}</div>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize flex-shrink-0 ${STATUS_STYLES[r.status]}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"/>{r.status}
              </span>
            </div>
            <div className="text-xs text-gray-400 mb-3">
              {r.customer?.firstName} {r.customer?.lastName} · {r.customer?.phone}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              <div>
                <div className="text-gray-600 mb-0.5">Start</div>
                <div className="text-gray-300">{fmtDate(r.startDate)}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-0.5">End</div>
                <div className="text-gray-300">{fmtDate(r.endDate)}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-0.5">Total</div>
                <div className="text-gold font-medium">{fmt(r.totalCost)}</div>
              </div>
            </div>
            <div className="flex gap-2">
              {r.status==='reserved' && <>
                <button onClick={() => handlePickup(r._id)} className="flex-1 py-2 rounded-xl text-xs font-semibold text-ink" style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>Pickup</button>
                <button onClick={() => handleCancel(r._id)} className="flex-1 py-2 rounded-xl text-xs text-red-400 border border-red-500/20">Cancel</button>
              </>}
              {r.status==='active' && <button onClick={() => setReturning(r)} className="w-full py-2 rounded-xl text-xs font-semibold text-ink" style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>Return Vehicle</button>}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAdd   && <CreateRentalModal onClose={() => setShowAdd(false)}   onSaved={load} />}
        {returning && <ReturnModal rental={returning} onClose={() => setReturning(null)} onSaved={load} />}
      </AnimatePresence>
    </div>
  );
}
