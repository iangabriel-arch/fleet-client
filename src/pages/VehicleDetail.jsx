import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios.js';
import { useToast } from '../components/ui/Toast.jsx';

const fmt     = (n) => n==null?'—':`KES ${Number(n).toLocaleString()}`;
const fmtDate = (d) => d?new Date(d).toLocaleDateString('en-KE',{day:'2-digit',month:'short',year:'numeric'}):'—';

const STATUS_STYLES = {
  available:         'bg-green-500/10  text-green-400  border-green-500/20',
  rented:            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  reserved:          'bg-blue-500/10   text-blue-400   border-blue-500/20',
  under_maintenance: 'bg-red-500/10    text-red-400    border-red-500/20',
  hire_purchase:     'bg-purple-500/10 text-purple-400 border-purple-500/20',
  sold:              'bg-gray-500/10   text-gray-400   border-gray-500/20',
  repossessed:       'bg-red-900/20    text-red-600    border-red-900/30',
};

const RENTAL_STATUS = {
  reserved:  'bg-blue-500/10  text-blue-400  border-blue-500/20',
  active:    'bg-green-500/10 text-green-400 border-green-500/20',
  completed: 'bg-gray-500/10  text-gray-400  border-gray-500/20',
  cancelled: 'bg-red-500/10   text-red-400   border-red-500/20',
};

const MAINT_STATUS = {
  scheduled:   'bg-blue-500/10   text-blue-400   border-blue-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  completed:   'bg-green-500/10  text-green-400  border-green-500/20',
};

const InfoRow = ({ label, value, gold }) => (
  <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
    <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
    <span className={`text-sm font-medium ${gold?'text-gold':'text-white'}`}>{value||'—'}</span>
  </div>
);

export default function VehicleDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const toast       = useToast();
  const [vehicle,   setVehicle]   = useState(null);
  const [rentals,   setRentals]   = useState([]);
  const [maint,     setMaint]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState('info');
  const [updStatus, setUpdStatus] = useState('');
  const [updating,  setUpdating]  = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [v, r, m] = await Promise.all([
          api.get(`/vehicles/${id}`),
          api.get('/rentals',     { params:{ vehicleId:id, limit:20 } }),
          api.get('/maintenance', { params:{ vehicleId:id, limit:20 } }),
        ]);
        setVehicle(v.data.vehicle);
        setUpdStatus(v.data.vehicle.status);
        setRentals(r.data.rentals||[]);
        setMaint(m.data.records||[]);
      } catch(e) { toast.error('Failed to load vehicle'); navigate('/vehicles'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      await api.patch(`/vehicles/${id}/status`, { status: updStatus });
      setVehicle(v => ({ ...v, status: updStatus }));
      toast.success(`Status updated to ${updStatus.replace(/_/g,' ')}`);
    } catch(e) { toast.error(e.response?.data?.message||'Failed to update status'); }
    finally { setUpdating(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-xs text-gray-600 tracking-widest uppercase animate-pulse">Loading vehicle...</div>
    </div>
  );

  if (!vehicle) return null;

  const tabs = ['info','rentals','maintenance'];

  return (
    <div className="max-w-4xl mx-auto">

      {/* Back */}
      <button onClick={() => navigate('/vehicles')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gold transition-colors mb-5">
        ← Back to Fleet
      </button>

      {/* Header card */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        className="rounded-2xl p-5 md:p-6 mb-4"
        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-white">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="font-mono text-sm text-gray-400">{vehicle.registrationNumber}</span>
              {vehicle.vin && <span className="font-mono text-xs text-gray-600">VIN: {vehicle.vin}</span>}
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border capitalize ${STATUS_STYLES[vehicle.status]||STATUS_STYLES.sold}`}>
            <span className="w-2 h-2 rounded-full bg-current"/>{vehicle.status?.replace(/_/g,' ')}
          </span>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label:'Daily Rate',    value:fmt(vehicle.dailyRate),    gold:true  },
            { label:'Weekly Rate',   value:fmt(vehicle.weeklyRate),   gold:false },
            { label:'Monthly Rate',  value:fmt(vehicle.monthlyRate),  gold:false },
          ].map(({ label, value, gold }) => (
            <div key={label} className="rounded-xl p-3 text-center" style={{ background:'rgba(255,255,255,0.03)' }}>
              <div className={`font-display font-bold text-base md:text-lg ${gold?'text-gold':'text-white'}`}>{value}</div>
              <div className="text-xs text-gray-600 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Status update */}
        <div className="flex gap-2 mt-4 pt-4 border-t" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
          <select value={updStatus} onChange={e => setUpdStatus(e.target.value)}
            style={{ background:'#0A0F1E' }}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-gold/40">
            {['available','reserved','under_maintenance','repossessed'].map(s => (
              <option key={s} value={s}>{s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>
            ))}
          </select>
          <button onClick={handleStatusUpdate} disabled={updating||updStatus===vehicle.status}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-ink disabled:opacity-40 transition-all"
            style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>
            {updating?'Updating...':'Update Status'}
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background:'rgba(255,255,255,0.04)' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2.5 rounded-lg text-xs font-medium capitalize transition-all"
            style={tab===t?{ background:'rgba(200,169,110,0.15)', color:'#C8A96E' }:{ color:'#6B7280' }}>
            {t === 'info' ? 'Details' : t === 'rentals' ? `Rentals (${rentals.length})` : `Maintenance (${maint.length})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div key={tab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.25 }}>

        {/* INFO TAB */}
        {tab==='info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Specifications</div>
              <InfoRow label="Category"      value={vehicle.category?.charAt(0).toUpperCase()+vehicle.category?.slice(1)} />
              <InfoRow label="Color"         value={vehicle.color} />
              <InfoRow label="Fuel Type"     value={vehicle.fuelType?.charAt(0).toUpperCase()+vehicle.fuelType?.slice(1)} />
              <InfoRow label="Transmission"  value={vehicle.transmission?.charAt(0).toUpperCase()+vehicle.transmission?.slice(1)} />
              <InfoRow label="Engine"        value={vehicle.engineSize} />
              <InfoRow label="Seating"       value={vehicle.seatingCapacity ? `${vehicle.seatingCapacity} seats` : null} />
              <InfoRow label="Mileage"       value={vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString()} km` : '0 km'} />
            </div>
            <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Financial</div>
              <InfoRow label="Selling Price"  value={fmt(vehicle.sellingPrice)} gold />
              <InfoRow label="Daily Rate"     value={fmt(vehicle.dailyRate)}    gold />
              <InfoRow label="Weekly Rate"    value={fmt(vehicle.weeklyRate)} />
              <InfoRow label="Monthly Rate"   value={fmt(vehicle.monthlyRate)} />
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-3 mt-5 font-medium">Service Dates</div>
              <InfoRow label="Last Service"   value={fmtDate(vehicle.lastServiceDate)} />
              <InfoRow label="Next Service"   value={fmtDate(vehicle.nextServiceDate)} />
              <InfoRow label="Insurance Exp." value={fmtDate(vehicle.insuranceExpiry)} />
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 mt-5 font-medium">Added By</div>
              <div className="text-sm text-white">{vehicle.addedBy?.name || '—'}</div>
              <div className="text-xs text-gray-600">{vehicle.addedBy?.role?.replace('_',' ')}</div>
            </div>
            {vehicle.notes && (
              <div className="md:col-span-2 rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-medium">Notes</div>
                <div className="text-sm text-gray-300 leading-relaxed">{vehicle.notes}</div>
              </div>
            )}
          </div>
        )}

        {/* RENTALS TAB */}
        {tab==='rentals' && (
          <div className="space-y-3">
            {rentals.length===0 ? (
              <div className="text-center py-16 rounded-2xl text-gray-600 text-xs" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                No rental history for this vehicle
              </div>
            ) : rentals.map((r,i) => (
              <motion.div key={r._id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                className="rounded-2xl p-4" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium text-white text-sm">{r.customer?.firstName} {r.customer?.lastName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{r.customer?.phone}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize flex-shrink-0 ${RENTAL_STATUS[r.status]}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"/>{r.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><div className="text-gray-600 mb-0.5">Start</div><div className="text-gray-300">{fmtDate(r.startDate)}</div></div>
                  <div><div className="text-gray-600 mb-0.5">End</div><div className="text-gray-300">{fmtDate(r.endDate)}</div></div>
                  <div><div className="text-gray-600 mb-0.5">Total</div><div className="text-gold font-medium">{fmt(r.totalCost)}</div></div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* MAINTENANCE TAB */}
        {tab==='maintenance' && (
          <div className="space-y-3">
            {maint.length===0 ? (
              <div className="text-center py-16 rounded-2xl text-gray-600 text-xs" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                No maintenance records for this vehicle
              </div>
            ) : maint.map((m,i) => (
              <motion.div key={m._id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                className="rounded-2xl p-4" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium text-white text-sm capitalize">{m.type?.replace(/_/g,' ')}</div>
                    {m.description && <div className="text-xs text-gray-500 mt-0.5">{m.description}</div>}
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize flex-shrink-0 ${MAINT_STATUS[m.status]}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"/>{m.status?.replace('_',' ')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><div className="text-gray-600 mb-0.5">Cost</div><div className="text-gold font-medium">{fmt(m.cost)}</div></div>
                  <div><div className="text-gray-600 mb-0.5">Date</div><div className="text-gray-300">{fmtDate(m.serviceDate)}</div></div>
                  <div><div className="text-gray-600 mb-0.5">Provider</div><div className="text-gray-300">{m.serviceProvider||'—'}</div></div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
