import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useToast } from '../components/ui/Toast.jsx';

const STATUS_STYLES = {
  available:         'bg-green-500/10  text-green-400  border-green-500/20',
  rented:            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  reserved:          'bg-blue-500/10   text-blue-400   border-blue-500/20',
  under_maintenance: 'bg-red-500/10    text-red-400    border-red-500/20',
  hire_purchase:     'bg-purple-500/10 text-purple-400 border-purple-500/20',
  sold:              'bg-gray-500/10   text-gray-400   border-gray-500/20',
  repossessed:       'bg-red-900/20    text-red-600    border-red-900/30',
};

const fmt = (n) => n == null ? '—' : `KES ${Number(n).toLocaleString()}`;

const EMPTY = {
  make:'', model:'', year: new Date().getFullYear(), color:'',
  registrationNumber:'', vin:'', category:'suv', fuelType:'petrol',
  transmission:'automatic', seatingCapacity:5, mileage:0,
  engineSize:'', dailyRate:'', sellingPrice:'', notes:'',
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
    <input {...props} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-gold/40 transition-colors" />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
    <select {...props} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-gold/40 transition-colors" style={{ background:'#0A0F1E' }}>
      {children}
    </select>
  </div>
);

function AddVehicleModal({ onClose, onSaved }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/vehicles', {
        ...form,
        year:            parseInt(form.year),
        seatingCapacity: parseInt(form.seatingCapacity),
        mileage:         parseInt(form.mileage) || 0,
        dailyRate:       parseFloat(form.dailyRate),
        sellingPrice:    form.sellingPrice ? parseFloat(form.sellingPrice) : undefined,
      });
      toast.success('Vehicle added to fleet successfully');
      onSaved(); onClose();
    } catch(err) {
      toast.error(err.response?.data?.message || 'Failed to add vehicle');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background:'rgba(5,8,22,0.85)', backdropFilter:'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-5 max-h-[92vh] overflow-y-auto scrollbar-hide"
        style={{ background:'#0A0F1E', border:'1px solid rgba(200,169,110,0.15)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-white text-lg">Add Vehicle</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Make *"  value={form.make}  onChange={set('make')}  placeholder="Toyota" required />
            <Input label="Model *" value={form.model} onChange={set('model')} placeholder="Land Cruiser" required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Year *" type="number" value={form.year}       onChange={set('year')}       min="1990" max="2026" required />
            <Input label="Color"              value={form.color}        onChange={set('color')}        placeholder="White" />
            <Input label="Engine"             value={form.engineSize}   onChange={set('engineSize')}   placeholder="2.0L" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Reg. No. *" value={form.registrationNumber} onChange={set('registrationNumber')} placeholder="KDA 001X" required />
            <Input label="VIN"        value={form.vin}                onChange={set('vin')}                placeholder="Optional" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select label="Category *" value={form.category} onChange={set('category')}>
              {['sedan','suv','pickup','van','coupe','hatchback','bus','truck'].map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
              ))}
            </Select>
            <Select label="Fuel" value={form.fuelType} onChange={set('fuelType')}>
              {['petrol','diesel','electric','hybrid'].map(f => (
                <option key={f} value={f}>{f.charAt(0).toUpperCase()+f.slice(1)}</option>
              ))}
            </Select>
            <Select label="Gearbox" value={form.transmission} onChange={set('transmission')}>
              <option value="automatic">Auto</option>
              <option value="manual">Manual</option>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Seats"      type="number" value={form.seatingCapacity} onChange={set('seatingCapacity')} min="1" max="60" />
            <Input label="Mileage"    type="number" value={form.mileage}         onChange={set('mileage')}         min="0" />
            <Input label="Daily Rate *" type="number" value={form.dailyRate}     onChange={set('dailyRate')}       placeholder="9500" required />
          </div>
          <Input label="Selling Price (KES)" type="number" value={form.sellingPrice} onChange={set('sellingPrice')} placeholder="Optional" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm text-gray-400 border border-white/10">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl text-sm font-display font-semibold text-ink disabled:opacity-50" style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>
              {loading ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Vehicles() {
  const toast    = useToast();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('');
  const [showAdd,  setShowAdd]  = useState(false);
  const [stats,    setStats]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [v, s] = await Promise.all([
        api.get('/vehicles', { params:{ search, status, limit:25 } }),
        api.get('/vehicles/stats'),
      ]);
      setVehicles(v.data.vehicles || []);
      setStats(s.data.stats);
    } catch(e) { toast.error('Failed to load vehicles'); }
    finally { setLoading(false); }
  }, [search, status]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display font-bold text-xl md:text-2xl text-white">Vehicles</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fleet inventory</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-sm font-display font-semibold text-ink hover:opacity-90"
          style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>
          + Add
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label:'Total',     value:stats.total,             color:'#fff'    },
            { label:'Available', value:stats.available,         color:'#2EC881' },
            { label:'Rented',    value:stats.rented,            color:'#C8A96E' },
            { label:'Service',   value:stats.under_maintenance, color:'#E05252' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-2.5 text-center"
              style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div className="font-display font-bold text-lg md:text-xl" style={{ color }}>{value||0}</div>
              <div className="text-xs text-gray-600 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-gold/40" />
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ background:'#0A0F1E' }}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none">
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="rented">Rented</option>
          <option value="reserved">Reserved</option>
          <option value="under_maintenance">Maintenance</option>
          <option value="hire_purchase">Hire Purchase</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl overflow-hidden"
        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              {['Vehicle','Registration','Category','Daily Rate','Selling Price','Status'].map(h => (
                <th key={h} className="text-left text-xs text-gray-600 uppercase tracking-widest px-5 py-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center text-gray-600 py-16 text-xs animate-pulse">Loading fleet...</td></tr>
            ) : vehicles.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-16">
                <div className="text-gray-600 text-xs mb-3">No vehicles found</div>
                <button onClick={() => setShowAdd(true)} className="text-xs text-gold">+ Add vehicle</button>
              </td></tr>
            ) : vehicles.map((v, i) => (
              <motion.tr key={v._id}
                initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:i*0.025 }}
                className="transition-colors cursor-pointer"
                style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                onClick={() => navigate(`/vehicles/${v._id}`)}
                onTap={() => navigate(`/vehicles/${v._id}`)}
                role="button"
                tabIndex={0}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <td className="px-5 py-4">
                  <div className="font-medium text-white">{v.year} {v.make} {v.model}</div>
                  <div className="text-xs text-gray-600 mt-0.5 capitalize">{v.color} · {v.fuelType} · {v.transmission}</div>
                </td>
                <td className="px-5 py-4 font-mono text-xs text-gray-400">{v.registrationNumber}</td>
                <td className="px-5 py-4 text-gray-500 capitalize">{v.category}</td>
                <td className="px-5 py-4 font-medium text-gold">{fmt(v.dailyRate)}<span className="text-gray-600 font-normal">/day</span></td>
                <td className="px-5 py-4 text-gray-400">{fmt(v.sellingPrice)}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${STATUS_STYLES[v.status] || STATUS_STYLES.sold}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"/>
                    {v.status?.replace(/_/g,' ')}
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
          <div className="text-center text-gray-600 py-16 text-xs animate-pulse">Loading fleet...</div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-600 text-xs mb-3">No vehicles found</div>
            <button onClick={() => setShowAdd(true)} className="text-xs text-gold">+ Add vehicle</button>
          </div>
        ) : vehicles.map((v, i) => (
          <motion.div key={v._id}
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:i*0.04 }}
            onClick={() => navigate(`/vehicles/${v._id}`)}
            onTap={() => navigate(`/vehicles/${v._id}`)}
            role="button"
            tabIndex={0}
            whileTap={{ scale:0.995 }}
            className="rounded-2xl p-4 cursor-pointer active:opacity-80 transition-opacity"
            style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-medium text-white">{v.year} {v.make} {v.model}</div>
                <div className="text-xs text-gray-500 font-mono mt-0.5">{v.registrationNumber}</div>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize flex-shrink-0 ${STATUS_STYLES[v.status] || STATUS_STYLES.sold}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"/>
                {v.status?.replace(/_/g,' ')}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><div className="text-gray-600 mb-0.5">Category</div><div className="text-gray-300 capitalize">{v.category}</div></div>
              <div><div className="text-gray-600 mb-0.5">Daily Rate</div><div className="text-gold font-medium">{fmt(v.dailyRate)}</div></div>
              <div><div className="text-gray-600 mb-0.5">Fuel</div><div className="text-gray-300 capitalize">{v.fuelType}</div></div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && <AddVehicleModal onClose={() => setShowAdd(false)} onSaved={load} />}
      </AnimatePresence>
    </div>
  );
}
