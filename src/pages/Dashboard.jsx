import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api/axios.js';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

const fmt = (n) => n == null ? '—' : `KES ${Number(n).toLocaleString()}`;

const KPI = ({ label, value, sub, accent, delay }) => (
  <motion.div {...fade(delay)}
    className="relative rounded-2xl p-4 md:p-5 overflow-hidden hover:-translate-y-1 transition-transform duration-300 cursor-default"
    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
    <div className="absolute inset-x-0 top-0 h-px" style={{ background: accent }} />
    <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-medium">{label}</div>
    <div className="font-display font-bold text-2xl md:text-3xl text-white">{value ?? '—'}</div>
    {sub && <div className="text-xs text-gray-600 mt-1.5">{sub}</div>}
  </motion.div>
);

const FLEET_ITEMS = [
  { key: 'available',         label: 'Available',     color: '#2EC881' },
  { key: 'rented',            label: 'Rented',        color: '#C8A96E' },
  { key: 'reserved',          label: 'Reserved',      color: '#4DA8FF' },
  { key: 'under_maintenance', label: 'Maintenance',   color: '#E05252' },
  { key: 'hire_purchase',     label: 'Hire Purchase', color: '#A78BFA' },
  { key: 'sold',              label: 'Sold',          color: '#6B7280' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(200,169,110,0.2)' }}>
      <div className="text-gray-400 mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="font-medium" style={{ color: p.color }}>
          {p.name}: KES {Number(p.value).toLocaleString()}
        </div>
      ))}
    </div>
  );
};

const getMonthLabels = () => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { label: months[d.getMonth()], month: d.getMonth() + 1, year: d.getFullYear() };
  });
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [stats,   setStats]   = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/analytics'),
      api.get('/vehicles/stats'),
      api.get('/analytics/revenue?months=6'),
      api.get('/notifications/alerts'),
    ]).then(([a, v, r, n]) => {
      if (a.status === 'fulfilled') setSummary(a.value.data.summary);
      if (v.status === 'fulfilled') setStats(v.value.data.stats);
      if (n.status === 'fulfilled') setAlerts(n.value.data.alerts || []);
      if (r.status === 'fulfilled') {
        const raw    = r.value.data.revenue || [];
        const labels = getMonthLabels();
        setRevenue(labels.map(({ label, month, year }) => {
          const rental = raw.find(x => x._id?.type === 'rental'        && x._id?.month === month && x._id?.year === year);
          const hp     = raw.find(x => x._id?.type === 'hire_purchase'  && x._id?.month === month && x._id?.year === year);
          return { month: label, Rental: rental?.total || 0, 'Hire Purchase': hp?.total || 0 };
        }));
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const utilization = stats?.total > 0
    ? Math.round(((stats.rented + stats.reserved + stats.hire_purchase) / stats.total) * 100)
    : 0;

  const pieData = FLEET_ITEMS
    .map(({ key, label, color }) => ({ name: label, value: stats?.[key] || 0, color }))
    .filter(d => d.value > 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-xs text-gray-600 tracking-widest uppercase animate-pulse">Loading telemetry...</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">

      <motion.div {...fade(0)}>
        <h1 className="font-display font-bold text-xl md:text-2xl text-white">Operations Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Live fleet and financial intelligence</p>
      </motion.div>

      {/* KPIs — 2 col mobile, 4 col desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KPI delay={0.05} label="Monthly Revenue"  value={fmt(summary?.monthlyRevenue)}      accent="linear-gradient(90deg,#C8A96E,transparent)" sub="Current month" />
        <KPI delay={0.10} label="Active Rentals"   value={summary?.activeRentals ?? 0}       accent="linear-gradient(90deg,#2EC881,transparent)" sub="Vehicles out" />
        <KPI delay={0.15} label="Hire Purchase"    value={summary?.activeHirePurchases ?? 0} accent="linear-gradient(90deg,#4DA8FF,transparent)" sub="Agreements" />
        <KPI delay={0.20} label="Overdue"          value={summary?.overdueRentals ?? 0}      accent="linear-gradient(90deg,#E05252,transparent)" sub="Need attention" />
      </div>

      {/* Fleet status — full width on mobile */}
      <motion.div {...fade(0.25)} className="rounded-2xl p-4 md:p-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-white text-sm">Fleet Status</h2>
          <span className="text-xs text-gray-600">{stats?.total ?? 0} total</span>
        </div>
        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
          {FLEET_ITEMS.map(({ key, label, color }) => (
            <div key={key} className="rounded-xl p-2 md:p-3 text-center"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="font-display font-bold text-xl md:text-2xl" style={{ color }}>{stats?.[key] || 0}</div>
              <div className="text-xs text-gray-600 mt-0.5 truncate">{label}</div>
            </div>
          ))}
        </div>
        <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-500">Utilization</span>
            <span className="text-gold font-semibold">{utilization}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${utilization}%` }}
              transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#C8A96E,#E8C87A)' }} />
          </div>
        </div>
      </motion.div>

      {/* Revenue chart — full width */}
      <motion.div {...fade(0.3)} className="rounded-2xl p-4 md:p-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold text-white text-sm">Revenue Trend</h2>
            <p className="text-xs text-gray-600 mt-0.5">Last 6 months</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gold inline-block"/>Rental</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block"/>HP</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={revenue} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#C8A96E" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#C8A96E" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gH" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#4DA8FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4DA8FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill:'#4B5563', fontSize:9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'#4B5563', fontSize:9 }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `${(v/1000).toFixed(0)}K` : '0'} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Rental"        stroke="#C8A96E" strokeWidth={2} fill="url(#gR)" />
            <Area type="monotone" dataKey="Hire Purchase" stroke="#4DA8FF" strokeWidth={2} fill="url(#gH)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bottom row — pie + alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Pie */}
        <motion.div {...fade(0.35)} className="rounded-2xl p-4 md:p-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-display font-semibold text-white text-sm mb-4">Distribution</h2>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <PieChart width={100} height={100}>
                <Pie data={pieData} cx={45} cy={45} innerRadius={28} outerRadius={45} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
              <div className="flex-1 space-y-1.5">
                {pieData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-gray-500">{name}</span>
                    </div>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-24 text-xs text-gray-600">No fleet data yet</div>
          )}
        </motion.div>

        {/* Alerts */}
        <motion.div {...fade(0.4)} className="rounded-2xl p-4 md:p-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white text-sm">Live Alerts</h2>
            {alerts.length > 0 && (
              <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-semibold">{alerts.length}</span>
            )}
          </div>
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-20 text-center">
                <div className="text-xl mb-1">✓</div>
                <div className="text-xs text-gray-600">All systems nominal</div>
              </div>
            ) : alerts.slice(0, 4).map((alert, i) => (
              <div key={i} className={`rounded-xl px-3 py-2 text-xs ${alert.severity === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                <div className="font-medium capitalize">{alert.type?.replace(/_/g, ' ')}</div>
                <div className="opacity-75 mt-0.5 line-clamp-1">{alert.message}</div>
              </div>
            ))}
          </div>
          {summary && (
            <div className="mt-4 pt-3 border-t flex justify-between text-xs"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <span className="text-gray-600">Total Customers</span>
              <span className="text-white font-bold">{summary.totalCustomers}</span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
