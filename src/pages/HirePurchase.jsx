import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios.js';

const fmt     = (n) => n==null?'—':`KES ${Number(n).toLocaleString()}`;
const fmtDate = (d) => d?new Date(d).toLocaleDateString('en-KE',{day:'2-digit',month:'short',year:'numeric'}):'—';

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
    <input {...props} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-gold/40 transition-colors" />
  </div>
);

function CreateHPModal({ onClose, onSaved }) {
  const [vehicles,  setVehicles]  = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form,      setForm]      = useState({ vehicle:'', customer:'', depositAmount:'', totalMonths:24, interestRate:0, startDate:'' });
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
    const v = vehicles.find(v => v._id===form.vehicle);
    if (v?.sellingPrice && form.depositAmount && form.totalMonths) {
      const principal = v.sellingPrice - parseFloat(form.depositAmount);
      const interest  = (principal*(parseFloat(form.interestRate||0)/100)*parseInt(form.totalMonths))/12;
      const total     = principal + interest;
      const monthly   = total / parseInt(form.totalMonths);
      if (principal>0) setPreview({ price:v.sellingPrice, principal, interest, total, monthly });
      else setPreview(null);
    } else setPreview(null);
  }, [form.vehicle, form.depositAmount, form.totalMonths, form.interestRate, vehicles]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/hire-purchase',{ ...form, depositAmount:parseFloat(form.depositAmount), totalMonths:parseInt(form.totalMonths), interestRate:parseFloat(form.interestRate||0) });
      onSaved(); onClose();
    } catch(err){ setError(err.response?.data?.message||'Failed to create agreement.'); }
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
          <h2 className="font-display font-semibold text-white text-lg">New Hire Purchase</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Vehicle *</label>
            <select value={form.vehicle} onChange={set('vehicle')} required style={{ background:'#0A0F1E' }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-gold/40">
              <option value="">Select vehicle...</option>
              {vehicles.map(v => <option key={v._id} value={v._id}>{v.year} {v.make} {v.model} — {fmt(v.sellingPrice)}</option>)}
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
            <Input label="Deposit (KES) *" type="number" value={form.depositAmount} onChange={set('depositAmount')} placeholder="500000" required />
            <Input label="Months *"        type="number" value={form.totalMonths}   onChange={set('totalMonths')}   min="1" max="60" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Interest Rate (%)" type="number" value={form.interestRate} onChange={set('interestRate')} placeholder="0" step="0.1" />
            <Input label="Start Date"        type="date"   value={form.startDate}    onChange={set('startDate')} />
          </div>
          {preview && (
            <div className="rounded-xl p-4" style={{ background:'rgba(200,169,110,0.06)', border:'1px solid rgba(200,169,110,0.15)' }}>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-3">Preview</div>
              <div className="space-y-1.5">
                {[['Vehicle Price',fmt(preview.price)],['Deposit',fmt(parseFloat(form.depositAmount))],['Principal',fmt(preview.principal)],['Interest',fmt(preview.interest)],['Total Repayable',fmt(preview.total)],['Monthly',fmt(preview.monthly)]].map(([l,v]) => (
                  <div key={l} className="flex justify-between text-xs">
                    <span className="text-gray-500">{l}</span>
                    <span className={l==='Monthly'?'text-gold font-semibold':'text-white'}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm text-gray-400 border border-white/10">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl text-sm font-display font-semibold text-ink disabled:opacity-50" style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>
              {loading?'Creating...':'Create Agreement'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function PaymentModal({ agreement, onClose, onSaved }) {
  const [form,    setForm]    = useState({ installmentNumber:'', paidAmount:'', paymentMethod:'cash' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const pending = agreement.schedule?.filter(s => s.status==='pending') || [];

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.patch(`/hire-purchase/${agreement._id}/payment`,{ ...form, installmentNumber:parseInt(form.installmentNumber), paidAmount:parseFloat(form.paidAmount) });
      onSaved(); onClose();
    } catch(err){ setError(err.response?.data?.message||'Failed to record payment.'); }
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
          <h2 className="font-display font-semibold text-white text-lg">Record Payment</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>
        <div className="rounded-xl p-3 mb-4" style={{ background:'rgba(255,255,255,0.03)' }}>
          <div className="text-xs text-gray-400">{agreement.vehicle?.make} {agreement.vehicle?.model}</div>
          <div className="text-xs text-gray-500">{agreement.customer?.firstName} {agreement.customer?.lastName} · Balance: {fmt(agreement.remainingBalance)}</div>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Installment #</label>
            <select value={form.installmentNumber} onChange={set('installmentNumber')} required style={{ background:'#0A0F1E' }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none">
              <option value="">Select installment...</option>
              {pending.map(s => <option key={s.installmentNumber} value={s.installmentNumber}>#{s.installmentNumber} — {fmtDate(s.dueDate)} — {fmt(s.amount)}</option>)}
            </select>
          </div>
          <Input label="Amount Paid (KES) *" type="number" value={form.paidAmount} onChange={set('paidAmount')} required />
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Method</label>
            <select value={form.paymentMethod} onChange={set('paymentMethod')} style={{ background:'#0A0F1E' }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none">
              {['cash','mpesa','bank_transfer','card','cheque'].map(m => <option key={m} value={m}>{m.replace('_',' ').toUpperCase()}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm text-gray-400 border border-white/10">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl text-sm font-display font-semibold text-ink disabled:opacity-50" style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>
              {loading?'Recording...':'Record Payment'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function HirePurchase() {
  const [agreements, setAgreements] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [status,     setStatus]     = useState('');
  const [showAdd,    setShowAdd]    = useState(false);
  const [paying,     setPaying]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/hire-purchase',{params:{status,limit:25}}); setAgreements(data.agreements||[]); }
    catch(e){ console.error(e); }
    finally{ setLoading(false); }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display font-bold text-xl md:text-2xl text-white">Hire Purchase</h1>
          <p className="text-sm text-gray-500 mt-0.5">Installment agreements</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-sm font-display font-semibold text-ink hover:opacity-90"
          style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>
          + New
        </button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {[['','All'],['active','Active'],['completed','Completed'],['repossessed','Repossessed']].map(([val,label]) => (
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
              {['Vehicle','Customer','Price','Deposit','Monthly','Progress','Balance','Status',''].map(h => (
                <th key={h} className="text-left text-xs text-gray-600 uppercase tracking-widest px-4 py-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center text-gray-600 py-16 text-xs animate-pulse">Loading...</td></tr>
            ) : agreements.length===0 ? (
              <tr><td colSpan={9} className="text-center py-16">
                <div className="text-gray-600 text-xs mb-3">No agreements found</div>
                <button onClick={() => setShowAdd(true)} className="text-xs text-gold">+ Create agreement</button>
              </td></tr>
            ) : agreements.map((a,i) => (
              <motion.tr key={a._id} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.025 }}
                className="transition-colors" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <td className="px-4 py-4">
                  <div className="font-medium text-white text-xs">{a.vehicle?.make} {a.vehicle?.model}</div>
                  <div className="text-xs text-gray-600 font-mono">{a.vehicle?.registrationNumber}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-white text-xs">{a.customer?.firstName} {a.customer?.lastName}</div>
                  <div className="text-xs text-gray-600">{a.customer?.phone}</div>
                </td>
                <td className="px-4 py-4 text-gray-400 text-xs">{fmt(a.vehiclePrice)}</td>
                <td className="px-4 py-4 text-gray-400 text-xs">{fmt(a.depositAmount)}</td>
                <td className="px-4 py-4 text-gold text-xs font-medium">{fmt(a.monthlyInstallment)}</td>
                <td className="px-4 py-4">
                  <div className="text-xs text-gray-400 mb-1">{a.paidMonths}/{a.totalMonths}</div>
                  <div className="h-1.5 w-20 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width:`${(a.paidMonths/a.totalMonths)*100}%`, background:'linear-gradient(90deg,#C8A96E,#E8C87A)' }} />
                  </div>
                </td>
                <td className="px-4 py-4 text-gold text-xs font-medium">{fmt(a.remainingBalance)}</td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border capitalize ${a.status==='active'?'bg-green-500/10 text-green-400 border-green-500/20':a.status==='completed'?'bg-gray-500/10 text-gray-400 border-gray-500/20':'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"/>{a.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {a.status==='active' && (
                    <button onClick={() => setPaying(a)} className="text-xs px-3 py-1.5 rounded-lg font-medium text-ink" style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>Pay</button>
                  )}
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
        ) : agreements.length===0 ? (
          <div className="text-center py-16">
            <div className="text-gray-600 text-xs mb-3">No agreements found</div>
            <button onClick={() => setShowAdd(true)} className="text-xs text-gold">+ Create agreement</button>
          </div>
        ) : agreements.map((a,i) => (
          <motion.div key={a._id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
            className="rounded-2xl p-4" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-medium text-white text-sm">{a.vehicle?.make} {a.vehicle?.model}</div>
                <div className="text-xs text-gray-500 font-mono">{a.vehicle?.registrationNumber}</div>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize flex-shrink-0 ${a.status==='active'?'bg-green-500/10 text-green-400 border-green-500/20':a.status==='completed'?'bg-gray-500/10 text-gray-400 border-gray-500/20':'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"/>{a.status}
              </span>
            </div>
            <div className="text-xs text-gray-400 mb-3">{a.customer?.firstName} {a.customer?.lastName} · {a.customer?.phone}</div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              <div><div className="text-gray-600 mb-0.5">Monthly</div><div className="text-gold font-medium">{fmt(a.monthlyInstallment)}</div></div>
              <div><div className="text-gray-600 mb-0.5">Progress</div><div className="text-gray-300">{a.paidMonths}/{a.totalMonths} mo</div></div>
              <div><div className="text-gray-600 mb-0.5">Balance</div><div className="text-gold font-medium">{fmt(a.remainingBalance)}</div></div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background:'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full" style={{ width:`${(a.paidMonths/a.totalMonths)*100}%`, background:'linear-gradient(90deg,#C8A96E,#E8C87A)' }} />
            </div>
            {a.status==='active' && (
              <button onClick={() => setPaying(a)} className="w-full py-2.5 rounded-xl text-sm font-display font-semibold text-ink" style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>
                Record Payment
              </button>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && <CreateHPModal onClose={() => setShowAdd(false)} onSaved={load} />}
        {paying  && <PaymentModal agreement={paying} onClose={() => setPaying(null)} onSaved={load} />}
      </AnimatePresence>
    </div>
  );
}
