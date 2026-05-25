import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useToast } from '../components/ui/Toast.jsx';

const EMPTY = {
  firstName:'', lastName:'', email:'', phone:'', alternatePhone:'',
  nationalId:'', drivingLicense:'', drivingLicenseExpiry:'',
  address:{ street:'', city:'', county:'', country:'Kenya' },
  emergencyContact:{ name:'', phone:'', relationship:'' },
  notes:'',
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
    <input {...props} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-gold/40 transition-colors" />
  </div>
);

const initials = (name='') => name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-KE',{day:'2-digit',month:'short',year:'numeric'}) : '—';

function AddCustomerModal({ onClose, onSaved }) {
  const toast = useToast();
  const [form,    setForm]    = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [tab,     setTab]     = useState('basic');
  const set  = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setA = (k) => (e) => setForm(f => ({ ...f, address:{ ...f.address, [k]: e.target.value } }));
  const setE = (k) => (e) => setForm(f => ({ ...f, emergencyContact:{ ...f.emergencyContact, [k]: e.target.value } }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/customers', form);
      toast.success('Customer registered successfully');
      onSaved(); onClose();
    } catch(err) {
      toast.error(err.response?.data?.message || 'Failed to add customer');
    } finally { setLoading(false); }
  };

  const tabs = ['basic', 'address', 'emergency'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background:'rgba(5,8,22,0.85)', backdropFilter:'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-5 max-h-[92vh] overflow-y-auto scrollbar-hide"
        style={{ background:'#0A0F1E', border:'1px solid rgba(200,169,110,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-white text-lg">Add Customer</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>
        <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background:'rgba(255,255,255,0.04)' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all"
              style={tab===t?{ background:'rgba(200,169,110,0.15)', color:'#C8A96E' }:{ color:'#6B7280' }}>
              {t==='basic'?'Basic':t==='address'?'Address':'Emergency'}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {tab==='basic' && (<>
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name *" value={form.firstName} onChange={set('firstName')} placeholder="James" required />
              <Input label="Last Name *"  value={form.lastName}  onChange={set('lastName')}  placeholder="Ochieng" required />
            </div>
            <Input label="Phone *"    value={form.phone}    onChange={set('phone')}    placeholder="+254712345678" required />
            <Input label="Email"      value={form.email}    onChange={set('email')}    placeholder="james@email.com" type="email" />
            <Input label="National ID *" value={form.nationalId} onChange={set('nationalId')} placeholder="32145678" required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="License"   value={form.drivingLicense}       onChange={set('drivingLicense')}       placeholder="DL-2024-001" />
              <Input label="Expiry"    value={form.drivingLicenseExpiry} onChange={set('drivingLicenseExpiry')} type="date" />
            </div>
          </>)}
          {tab==='address' && (<>
            <Input label="Street"  value={form.address.street}  onChange={setA('street')}  placeholder="123 Moi Avenue" />
            <Input label="City"    value={form.address.city}    onChange={setA('city')}    placeholder="Nairobi" />
            <Input label="County"  value={form.address.county}  onChange={setA('county')}  placeholder="Nairobi County" />
            <Input label="Country" value={form.address.country} onChange={setA('country')} placeholder="Kenya" />
          </>)}
          {tab==='emergency' && (<>
            <Input label="Contact Name"  value={form.emergencyContact.name}         onChange={setE('name')}         placeholder="Mary Ochieng" />
            <Input label="Phone"         value={form.emergencyContact.phone}        onChange={setE('phone')}        placeholder="+254722000000" />
            <Input label="Relationship"  value={form.emergencyContact.relationship} onChange={setE('relationship')} placeholder="Spouse" />
          </>)}
          <div className="flex gap-3 pt-2">
            {tab !== 'basic' && (
              <button type="button" onClick={() => setTab(tabs[tabs.indexOf(tab)-1])}
                className="px-4 py-3 rounded-xl text-sm text-gray-400 border border-white/10">← Back</button>
            )}
            {tab !== 'emergency' ? (
              <button type="button" onClick={() => setTab(tabs[tabs.indexOf(tab)+1])}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-white border border-white/10">Next →</button>
            ) : (
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-display font-semibold text-ink disabled:opacity-50"
                style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>
                {loading ? 'Saving...' : 'Add Customer'}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Customers() {
  const toast    = useToast();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('');
  const [showAdd,   setShowAdd]   = useState(false);
  const [stats,     setStats]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, limit:25 };
      if (filter === 'blacklisted') params.isBlacklisted = true;
      const [c, s] = await Promise.all([
        api.get('/customers', { params }),
        api.get('/customers/stats'),
      ]);
      setCustomers(c.data.customers || []);
      setStats(s.data.stats);
    } catch(e) { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  }, [search, filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display font-bold text-xl md:text-2xl text-white">Customers</h1>
          <p className="text-sm text-gray-500 mt-0.5">Customer records</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-sm font-display font-semibold text-ink hover:opacity-90"
          style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>
          + Add
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label:'Total',        value:stats.total,                  color:'#fff'    },
            { label:'With Balance', value:stats.withOutstandingBalance, color:'#C8A96E' },
            { label:'Blacklisted',  value:stats.blacklisted,            color:'#E05252' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-3 text-center"
              style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div className="font-display font-bold text-xl" style={{ color }}>{value||0}</div>
              <div className="text-xs text-gray-600 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search name, phone, ID..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-gold/40" />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ background:'#0A0F1E' }}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none">
          <option value="">All</option>
          <option value="blacklisted">Blacklisted</option>
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl overflow-hidden"
        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              {['Customer','Phone','National ID','Rentals','Balance','Status','Joined'].map(h => (
                <th key={h} className="text-left text-xs text-gray-600 uppercase tracking-widest px-5 py-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center text-gray-600 py-16 text-xs animate-pulse">Loading...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16">
                <div className="text-gray-600 text-xs mb-3">No customers found</div>
                <button onClick={() => setShowAdd(true)} className="text-xs text-gold">+ Add customer</button>
              </td></tr>
            ) : customers.map((c, i) => (
              <motion.tr key={c._id}
                initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:i*0.025 }}
                className="transition-colors cursor-pointer"
                style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                onClick={() => navigate(`/customers/${c._id}`)}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-gold"
                      style={{ background:'rgba(200,169,110,0.12)', border:'1px solid rgba(200,169,110,0.2)' }}>
                      {initials(c.fullName || `${c.firstName} ${c.lastName}`)}
                    </div>
                    <div>
                      <div className="font-medium text-white">{c.fullName || `${c.firstName} ${c.lastName}`}</div>
                      <div className="text-xs text-gray-600">{c.email || '—'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-400">{c.phone}</td>
                <td className="px-5 py-4 font-mono text-xs text-gray-500">{c.nationalId}</td>
                <td className="px-5 py-4 text-gray-400">{c.totalRentals || 0}</td>
                <td className="px-5 py-4" style={{ color:c.outstandingBalance>0?'#C8A96E':'#4B5563' }}>
                  {c.outstandingBalance > 0 ? `KES ${c.outstandingBalance.toLocaleString()}` : '—'}
                </td>
                <td className="px-5 py-4">
                  {c.isBlacklisted
                    ? <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-2.5 py-1 rounded-full font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-current"/>Blacklisted</span>
                    : <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-2.5 py-1 rounded-full font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-current"/>Active</span>}
                </td>
                <td className="px-5 py-4 text-gray-600 text-xs">{fmtDate(c.createdAt)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center text-gray-600 py-16 text-xs animate-pulse">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-600 text-xs mb-3">No customers found</div>
            <button onClick={() => setShowAdd(true)} className="text-xs text-gold">+ Add customer</button>
          </div>
        ) : customers.map((c, i) => (
          <motion.div key={c._id}
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:i*0.04 }}
            onClick={() => navigate(`/customers/${c._id}`)}
            className="rounded-2xl p-4 cursor-pointer active:opacity-80 transition-opacity"
            style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-gold"
                  style={{ background:'rgba(200,169,110,0.12)', border:'1px solid rgba(200,169,110,0.2)' }}>
                  {initials(c.fullName || `${c.firstName} ${c.lastName}`)}
                </div>
                <div>
                  <div className="font-medium text-white text-sm">{c.fullName || `${c.firstName} ${c.lastName}`}</div>
                  <div className="text-xs text-gray-500">{c.phone}</div>
                </div>
              </div>
              {c.isBlacklisted
                ? <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">Blacklisted</span>
                : <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">Active</span>}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><div className="text-gray-600 mb-0.5">National ID</div><div className="text-gray-300 font-mono">{c.nationalId}</div></div>
              <div><div className="text-gray-600 mb-0.5">Rentals</div><div className="text-gray-300">{c.totalRentals || 0}</div></div>
              <div><div className="text-gray-600 mb-0.5">Balance</div>
                <div style={{ color:c.outstandingBalance>0?'#C8A96E':'#4B5563' }}>
                  {c.outstandingBalance > 0 ? `KES ${c.outstandingBalance.toLocaleString()}` : '—'}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && <AddCustomerModal onClose={() => setShowAdd(false)} onSaved={load} />}
      </AnimatePresence>
    </div>
  );
}
