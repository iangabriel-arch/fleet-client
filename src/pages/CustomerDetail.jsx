import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
    <input {...props} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-gold/40 transition-colors" />
  </div>
);

function EditCustomerModal({ customer, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    firstName:    customer.firstName || '',
    lastName:     customer.lastName  || '',
    email:        customer.email     || '',
    phone:        customer.phone     || '',
    alternatePhone: customer.alternatePhone || '',
    nationalId:   customer.nationalId || '',
    drivingLicense: customer.drivingLicense || '',
    drivingLicenseExpiry: customer.drivingLicenseExpiry?.split('T')[0] || '',
    address: {
      street:  customer.address?.street  || '',
      city:    customer.address?.city    || '',
      county:  customer.address?.county  || '',
      country: customer.address?.country || 'Kenya',
    },
    emergencyContact: {
      name:         customer.emergencyContact?.name         || '',
      phone:        customer.emergencyContact?.phone        || '',
      relationship: customer.emergencyContact?.relationship || '',
    },
    notes: customer.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [tab,     setTab]     = useState('basic');
  const set  = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setA = (k) => (e) => setForm(f => ({ ...f, address:{ ...f.address, [k]: e.target.value } }));
  const setE = (k) => (e) => setForm(f => ({ ...f, emergencyContact:{ ...f.emergencyContact, [k]: e.target.value } }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.put(`/customers/${customer._id}`, form);
      toast.success('Customer updated successfully');
      onSaved(); onClose();
    } catch(err) {
      toast.error(err.response?.data?.message || 'Failed to update customer');
    } finally { setLoading(false); }
  };

  const tabs = ['basic','address','emergency'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background:'rgba(5,8,22,0.85)', backdropFilter:'blur(8px)' }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-5 max-h-[92vh] overflow-y-auto scrollbar-hide"
        style={{ background:'#0A0F1E', border:'1px solid rgba(200,169,110,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-white text-lg">Edit Customer</h2>
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
              <Input label="First Name *" value={form.firstName} onChange={set('firstName')} required />
              <Input label="Last Name *"  value={form.lastName}  onChange={set('lastName')}  required />
            </div>
            <Input label="Phone *"    value={form.phone}    onChange={set('phone')}    required />
            <Input label="Email"      value={form.email}    onChange={set('email')}    type="email" />
            <Input label="National ID *" value={form.nationalId} onChange={set('nationalId')} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="License"  value={form.drivingLicense}       onChange={set('drivingLicense')} />
              <Input label="Expiry"   value={form.drivingLicenseExpiry} onChange={set('drivingLicenseExpiry')} type="date" />
            </div>
            <Input label="Notes" value={form.notes} onChange={set('notes')} />
          </>)}
          {tab==='address' && (<>
            <Input label="Street"  value={form.address.street}  onChange={setA('street')} />
            <Input label="City"    value={form.address.city}    onChange={setA('city')} />
            <Input label="County"  value={form.address.county}  onChange={setA('county')} />
            <Input label="Country" value={form.address.country} onChange={setA('country')} />
          </>)}
          {tab==='emergency' && (<>
            <Input label="Contact Name"  value={form.emergencyContact.name}         onChange={setE('name')} />
            <Input label="Phone"         value={form.emergencyContact.phone}        onChange={setE('phone')} />
            <Input label="Relationship"  value={form.emergencyContact.relationship} onChange={setE('relationship')} />
          </>)}
          <div className="flex gap-3 pt-2">
            {tab!=='basic' && (
              <button type="button" onClick={() => setTab(tabs[tabs.indexOf(tab)-1])}
                className="px-4 py-3 rounded-xl text-sm text-gray-400 border border-white/10">← Back</button>
            )}
            {tab!=='emergency' ? (
              <button type="button" onClick={() => setTab(tabs[tabs.indexOf(tab)+1])}
                className="flex-1 py-3 rounded-xl text-sm text-white border border-white/10">Next →</button>
            ) : (
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-display font-semibold text-ink disabled:opacity-50"
                style={{ background:'linear-gradient(135deg,#C8A96E,#E8C87A)' }}>
                {loading?'Saving...':'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}

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
  const [showEdit,  setShowEdit]  = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [blForm,    setBlForm]    = useState({ isBlacklisted:false, blacklistReason:'' });
  const [blLoading, setBlLoading] = useState(false);

  const load = async () => {
    try {
      const [c, r, h, p] = await Promise.all([
        api.get(`/customers/${id}`),
        api.get('/rentals',       { params:{ customerId:id, limit:20 } }),
        api.get('/hire-purchase', { params:{ customerId:id, limit:20 } }),
        api.get('/payments',      { params:{ customerId:id, limit:20 } }),
      ]);
      setCustomer(c.data.customer);
      setBlForm({ isBlacklisted:c.data.customer.isBlacklisted, blacklistReason:c.data.customer.blacklistReason||'' });
      setRentals(r.data.rentals||[]);
      setHps(h.data.agreements||[]);
      setPayments(p.data.payments||[]);
    } catch(e) { toast.error('Failed to load customer'); navigate('/customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleBlacklist = async () => {
    setBlLoading(true);
    try {
      await api.patch(`/customers/${id}/blacklist`, blForm);
      setCustomer(c => ({ ...c, isBlacklisted:blForm.isBlacklisted, blacklistReason:blForm.blacklistReason }));
      toast.success(blForm.isBlacklisted?'Customer blacklisted':'Customer removed from blacklist');
    } catch(e) { toast.error(e.response?.data?.message||'Failed to update'); }
    finally { setBlLoading(false); }
  };

  const handleDelete = async () => {
    const name = customer.fullName || `${customer.firstName} ${customer.lastName}`;
    if (!confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Customer record deleted');
      navigate('/customers');
    } catch(e) { toast.error(e.response?.data?.message||'Failed to delete customer'); }
    finally { setDeleting(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-xs text-gray-600 tracking-widest uppercase animate-pulse">Loading customer...</div>
    </div>
  );

  if (!customer) return null;

  const fullName = customer.fullName || `${customer.firstName} ${customer.lastName}`;

  return (
    <div className="max-w-4xl mx-auto">

      <button onClick={() => navigate('/customers')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gold transition-colors mb-5">
        ← Back to Customers
      </button>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        className="rounded-2xl p-5 md:p-6 mb-4"
        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl font-bold text-gold"
            style={{ background:'rgba(200,169,110,0.12)', border:'1px solid rgba(200,169,110,0.2)' }}>
            {initials(fullName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="font-display font-bold text-xl md:text-2xl text-white">{fullName}</h1>
                <div className="text-sm text-gray-500 mt-0.5">{customer.email||'—'}</div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {customer.isBlacklisted
                  ? <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-3 py-1.5 rounded-full font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-current"/>Blacklisted</span>
                  : <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-3 py-1.5 rounded-full font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-current"/>Active</span>}
                <button onClick={() => setShowEdit(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-white border border-white/10 hover:border-gold/30 transition-colors">
                  ✎ Edit
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors disabled:opacity-50">
                  {deleting?'Deleting...':'✕ Delete'}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400 flex-wrap">
              <span>📞 {customer.phone}</span>
              {customer.alternatePhone && <span>📞 {customer.alternatePhone}</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label:'Total Rentals',  value:customer.totalRentals||0,         color:'#4DA8FF' },
            { label:'HP Agreements',  value:customer.totalHirePurchases||0,   color:'#A78BFA' },
            { label:'Outstanding',    value:fmt(customer.outstandingBalance),  color:customer.outstandingBalance>0?'#C8A96E':'#2EC881' },
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
          ['info','Details'],
          ['rentals',`Rentals (${rentals.length})`],
          ['hire_purchase',`Hire Purchase (${hps.length})`],
          ['payments',`Payments (${payments.length})`],
        ].map(([val,label]) => (
          <button key={val} onClick={() => setTab(val)}
            className="flex-1 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all px-2"
            style={tab===val?{ background:'rgba(200,169,110,0.15)', color:'#C8A96E' }:{ color:'#6B7280' }}>
            {label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.25 }}>

        {tab==='info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Identification</div>
              <InfoRow label="National ID"     value={customer.nationalId} />
              <InfoRow label="Driving License" value={customer.drivingLicense} />
              <InfoRow label="License Expiry"  value={fmtDate(customer.drivingLicenseExpiry)} />
              <InfoRow label="Member Since"    value={fmtDate(customer.createdAt)} />
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
            <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Account Management</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Blacklist Status</span>
                  <button onClick={() => setBlForm(f => ({ ...f, isBlacklisted:!f.isBlacklisted }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${blForm.isBlacklisted?'bg-red-500':'bg-white/10'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${blForm.isBlacklisted?'left-7':'left-1'}`}/>
                  </button>
                </div>
                {blForm.isBlacklisted && (
                  <input value={blForm.blacklistReason}
                    onChange={e => setBlForm(f => ({ ...f, blacklistReason:e.target.value }))}
                    placeholder="Reason for blacklisting..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-red-500/40" />
                )}
                <button onClick={handleBlacklist} disabled={blLoading}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${blForm.isBlacklisted?'bg-red-500/20 text-red-400 border border-red-500/20':'bg-green-500/20 text-green-400 border border-green-500/20'}`}>
                  {blLoading?'Updating...':blForm.isBlacklisted?'Apply Blacklist':'Remove from Blacklist'}
                </button>
              </div>
            </div>
          </div>
        )}

        {tab==='rentals' && (
          <div className="space-y-3">
            {rentals.length===0 ? (
              <div className="text-center py-16 rounded-2xl text-gray-600 text-xs" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>No rental history</div>
            ) : rentals.map((r,i) => (
              <motion.div key={r._id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                className="rounded-2xl p-4 cursor-pointer" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}
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

        {tab==='hire_purchase' && (
          <div className="space-y-3">
            {hps.length===0 ? (
              <div className="text-center py-16 rounded-2xl text-gray-600 text-xs" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>No hire purchase agreements</div>
            ) : hps.map((h,i) => (
              <motion.div key={h._id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                className="rounded-2xl p-4" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
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

        {tab==='payments' && (
          <div className="space-y-3">
            {payments.length===0 ? (
              <div className="text-center py-16 rounded-2xl text-gray-600 text-xs" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>No payment history</div>
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

      <AnimatePresence>
        {showEdit && <EditCustomerModal customer={customer} onClose={() => setShowEdit(false)} onSaved={load} />}
      </AnimatePresence>
    </div>
  );
}
