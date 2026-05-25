import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios.js';
import { useToast } from '../components/ui/Toast.jsx';

const fmt     = (n) => n==null?'—':`KES ${Number(n).toLocaleString()}`;
const fmtDate = (d) => d?new Date(d).toLocaleDateString('en-KE',{day:'2-digit',month:'short',year:'numeric'}):'—';
const initials = (name='') => name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);

const RENTAL_STATUS = {
  reserved:  'bg-blue-500/10  text-blue-400  border-blue-500/20',
  active:    'bg-green-500/10 text-green-400 border-green-500/20',
  completed: 'bg-gray-500/10  text-gray-400  border-gray-500/20',
  cancelled: 'bg-red-500/10   text-red-400   border-red-500/20',
};

const HP_STATUS = {
  active:      'bg-green-500/10  text-green-400  border-green-500/20',
  completed:   'bg-gray-500/10   text-gray-400   border-gray-500/20',
  repossessed: 'bg-red-500/10    text-red-400    border-red-500/20',
};

const PAY_TYPE = {
  rental:        'bg-blue-500/10   text-blue-400   border-blue-500/20',
  hire_purchase: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  deposit:       'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  damage:        'bg-red-500/10    text-red-400    border-red-500/20',
  penalty:       'bg-orange-500/10 text-orange-400 border-orange-500/20',
  other:         'bg-gray-500/10   text-gray-400   border-gray-500/20',
};

const InfoRow = ({ label, value, gold }) => (
  <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
    <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
    <span className={`text-sm font-medium ${gold?'text-gold':'text-white'}`}>{value||'—'}</span>
  </div>
);

export default function CustomerDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const toast     = useToast();
  const [customer,  setCustomer]  = useState(null);
  const [rentals,   setRentals]   = useState([]);
  const [hps,       setHps]       = useState([]);
  const [payments,  setPayments]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState('info');
  const [blForm,    setBlForm]    = useState({ isBlacklisted:false, blacklistReason:'' });
  const [blLoading, setBlLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, r, h, p] = await Promise.all([
          api.get(`/customers/${id}`),
          api.get('/rentals',       { params:{ customerId:id, limit:20 } }),
          api.get('/hire-purchase', { params:{ customerId:id, limit:20 } }),
          api.get('/payments',      { params:{ customerId:id, limit:20 } }),
        ]);
        setCustomer(c.data.customer);
        setBlForm({ isBlacklisted: c.data.customer.isBlacklisted, blacklistReason: c.data.customer.blacklistReason||'' });
        setRentals(r.data.rentals||[]);
        setHps(h.data.agreements||[]);
        setPayments(p.data.payments||[]);
      } catch(e) { toast.error('Failed to load customer'); navigate('/customers'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleBlacklist = async () => {
    setBlLoading(true);
    try {
      await api.patch(`/customers/${id}/blacklist`, blForm);
      setCustomer(c => ({ ...c, isBlacklisted: blForm.isBlacklisted, blacklistReason: blForm.blacklistReason }));
      toast.success(blForm.isBlacklisted ? 'Customer blacklisted' : 'Customer removed from blacklist');
    } catch(e) { toast.error(e.response?.data?.message||'Failed to update blacklist status'); }
    finally { setBlLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-xs text-gray-600 tracking-widest uppercase animate-pulse">Loading customer...</div>
    </div>
  );

  if (!customer) return null;

  const fullName = customer.fullName || `${customer.firstName} ${customer.lastName}`;
  const tabs = ['info','rentals','hire_purchase','payments'];

  return (
    <div className="max-w-4xl mx-auto">

      {/* Back */}
      <button onClick={() => navigate('/customers')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gold transition-colors mb-5">
        ← Back to Customers
      </button>

      {/* Header card */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        className="rounded-2xl p-5 md:p-6 mb-4"
        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl font-bold text-gold"
            style={{ background:'rgba(200,169,110,0.12)', border:'1px solid rgba(200,169,110,0.2)' }}>
            {initials(fullName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-display font-bold text-xl md:text-2xl text-white">{fullName}</h1>
                <div className="text-sm text-gray-500 mt-0.5">{customer.email || '—'}</div>
              </div>
              {customer.isBlacklisted
                ? <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-3 py-1.5 rounded-full font-semibold flex-shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-current"/>Blacklisted</span>
                : <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-3 py-1.5 rounded-full font-semibold flex-shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-current"/>Active</span>}
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
              <span>📞 {customer.phone}</span>
              {customer.alternatePhone && <span>📞 {customer.alternatePhone}</span>}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label:'Total Rentals',    value: customer.totalRentals||0,          color:'#4DA8FF' },
            { label:'HP Agreements',    value: customer.totalHirePurchases||0,    color:'#A78BFA' },
            { label:'Outstanding',      value: fmt(customer.outstandingBalance),  color: customer.outstandingBalance>0?'#C8A96E':'#2EC881' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-3 text-center" style={{ background:'rgba(255,255,255,0.03)' }}>
              <div className="font-display font-bold text-lg" style={{ color }}>{value}</div>
              <div className="text-xs text-gray-600 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-4 overflow-x-auto scrollbar-hide" style={{ background:'rgba(255,255,255,0.04)' }}>
        {[
          ['info',         'Details'],
          ['rentals',      `Rentals (${rentals.length})`],
          ['hire_purchase',`Hire Purchase (${hps.length})`],
          ['payments',     `Payments (${payments.length})`],
        ].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            className="flex-1 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all px-2"
            style={tab===val?{ background:'rgba(200,169,110,0.15)', color:'#C8A96E' }:{ color:'#6B7280' }}>
            {label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.25 }}>

        {/* INFO TAB */}
        {tab==='info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Identification</div>
              <InfoRow label="National ID"      value={customer.nationalId} />
              <InfoRow label="Driving License"  value={customer.drivingLicense} />
              <InfoRow label="License Expiry"   value={fmtDate(customer.drivingLicenseExpiry)} />
              <InfoRow label="Member Since"     value={fmtDate(customer.createdAt)} />
            </div>
            <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Address</div>
              <InfoRow label="Street"  value={customer.address?.street} />
              <InfoRow label="City"    value={customer.address?.city} />
              <InfoRow label="County"  value={customer.address?.county} />
              <InfoRow label="Country" value={customer.address?.country} />
            </div>
            {customer.emergencyContact?.name && (
              <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Emergency Contact</div>
                <InfoRow label="Name"         value={customer.emergencyContact.name} />
                <InfoRow label="Phone"        value={customer.emergencyContact.phone} />
                <InfoRow label="Relationship" value={customer.emergencyContact.relationship} />
              </div>
            )}
            {/* Blacklist management */}
            <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Account Management</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Blacklist Status</span>
                  <button
                    onClick={() => setBlForm(f => ({ ...f, isBlacklisted: !f.isBlacklisted }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${blForm.isBlacklisted?'bg-red-500':'bg-white/10'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${blForm.isBlacklisted?'left-7':'left-1'}`}/>
                  </button>
                </div>
                {blForm.isBlacklisted && (
                  <input
                    value={blForm.blacklistReason}
                    onChange={e => setBlForm(f => ({ ...f, blacklistReason: e.target.value }))}
                    placeholder="Reason for blacklisting..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-red-500/40"
                  />
                )}
                <button onClick={handleBlacklist} disabled={blLoading}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${blForm.isBlacklisted?'bg-red-500/20 text-red-400 border border-red-500/20':'bg-green-500/20 text-green-400 border border-green-500/20'}`}>
                  {blLoading ? 'Updating...' : blForm.isBlacklisted ? 'Apply Blacklist' : 'Remove from Blacklist'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RENTALS TAB */}
        {tab==='rentals' && (
          <div className="space-y-3">
            {rentals.length===0 ? (
              <div className="text-center py-16 rounded-2xl text-gray-600 text-xs" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                No rental history for this customer
              </div>
            ) : rentals.map((r,i) => (
              <motion.div key={r._id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                className="rounded-2xl p-4 cursor-pointer"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}
                onClick={() => navigate(`/vehicles/${r.vehicle?._id}`)}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium text-white text-sm">{r.vehicle?.make} {r.vehicle?.model}</div>
                    <div className="text-xs text-gray-500 font-mono">{r.vehicle?.registrationNumber}</div>
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

        {/* HIRE PURCHASE TAB */}
        {tab==='hire_purchase' && (
          <div className="space-y-3">
            {hps.length===0 ? (
              <div className="text-center py-16 rounded-2xl text-gray-600 text-xs" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                No hire purchase agreements for this customer
              </div>
            ) : hps.map((h,i) => (
              <motion.div key={h._id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                className="rounded-2xl p-4"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium text-white text-sm">{h.vehicle?.make} {h.vehicle?.model}</div>
                    <div className="text-xs text-gray-500 font-mono">{h.vehicle?.registrationNumber}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize flex-shrink-0 ${HP_STATUS[h.status]}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"/>{h.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div><div className="text-gray-600 mb-0.5">Monthly</div><div className="text-gold font-medium">{fmt(h.monthlyInstallment)}</div></div>
                  <div><div className="text-gray-600 mb-0.5">Progress</div><div className="text-gray-300">{h.paidMonths}/{h.totalMonths} mo</div></div>
                  <div><div className="text-gray-600 mb-0.5">Balance</div><div className="text-gold font-medium">{fmt(h.remainingBalance)}</div></div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full" style={{ width:`${(h.paidMonths/h.totalMonths)*100}%`, background:'linear-gradient(90deg,#C8A96E,#E8C87A)' }} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* PAYMENTS TAB */}
        {tab==='payments' && (
          <div className="space-y-3">
            {payments.length===0 ? (
              <div className="text-center py-16 rounded-2xl text-gray-600 text-xs" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                No payment history for this customer
              </div>
            ) : payments.map((p,i) => (
              <motion.div key={p._id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                className="rounded-2xl p-4 flex items-center justify-between"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${PAY_TYPE[p.type]||PAY_TYPE.other}`}>
                      {p.type?.replace('_',' ')}
                    </span>
                    <span className="text-xs text-gray-600 capitalize">{p.method?.replace('_',' ')}</span>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">{p.receiptNumber}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{fmtDate(p.createdAt)}</div>
                </div>
                <div className="text-gold font-display font-bold text-lg">{fmt(p.amount)}</div>
              </motion.div>
            ))}
          </div>
        )}

      </motion.div>
    </div>
  );
}
