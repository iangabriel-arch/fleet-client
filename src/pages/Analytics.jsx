import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../api/axios.js';

const fmt = (n) => n==null?'—':`KES ${Number(n).toLocaleString()}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background:'rgba(10,15,30,0.95)', border:'1px solid rgba(200,169,110,0.2)' }}>
      <div className="text-gray-400 mb-1">{label}</div>
      {payload.map(p => <div key={p.name} className="font-medium" style={{ color:p.color }}>{p.name}: {typeof p.value==='number'&&p.value>1000?fmt(p.value):p.value}</div>)}
    </div>
  );
};

const COLORS = ['#2EC881','#C8A96E','#4DA8FF','#E05252','#A78BFA','#6B7280'];

export default function Analytics() {
  const [summary,     setSummary]     = useState(null);
  const [revenue,     setRevenue]     = useState([]);
  const [utilization, setUtilization] = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([api.get('/analytics'), api.get('/analytics/revenue?months=6'), api.get('/analytics/utilization')])
      .then(([s,r,u]) => {
        setSummary(s.data.summary); setUtilization(u.data);
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const now    = new Date();
        const labels = Array.from({length:6},(_,i) => {
          const d = new Date(now.getFullYear(),now.getMonth()-5+i,1);
          return { label:months[d.getMonth()], month:d.getMonth()+1, year:d.getFullYear() };
        });
        const raw = r.data.revenue||[];
        setRevenue(labels.map(({ label, month, year }) => {
          const rental = raw.find(x => x._id?.type==='rental'       && x._id?.month===month && x._id?.year===year);
          const hp     = raw.find(x => x._id?.type==='hire_purchase' && x._id?.month===month && x._id?.year===year);
          return { month:label, Rental:rental?.total||0, 'HP':hp?.total||0, Total:(rental?.total||0)+(hp?.total||0) };
        }));
      }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const fleetPie = utilization?.breakdown?.map((b,i) => ({ name:b._id?.replace(/_/g,' '), value:b.count, color:COLORS[i]||'#6B7280' })) || [];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-xs text-gray-600 tracking-widest uppercase animate-pulse">Loading analytics...</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
        <h1 className="font-display font-bold text-xl md:text-2xl text-white">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Performance metrics</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label:'Monthly Revenue',   value:fmt(summary?.monthlyRevenue),          color:'#C8A96E' },
          { label:'Active Rentals',    value:summary?.activeRentals??0,             color:'#2EC881' },
          { label:'Active HP',         value:summary?.activeHirePurchases??0,       color:'#4DA8FF' },
          { label:'Fleet Utilization', value:`${utilization?.utilizationRate??0}%`, color:'#A78BFA' },
        ].map(({ label, value, color },i) => (
          <motion.div key={label} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
            className="rounded-2xl p-3 md:p-5" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-xs text-gray-600 uppercase tracking-widest mb-1.5">{label}</div>
            <div className="font-display font-bold text-xl md:text-2xl" style={{ color }}>{value}</div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
        className="rounded-2xl p-4 md:p-6" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold text-white text-sm">Revenue Breakdown</h2>
            <p className="text-xs text-gray-600 mt-0.5">Last 6 months</p>
          </div>
          <div className="flex gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gold inline-block"/>Rental</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block"/>HP</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={revenue} margin={{ top:0, right:0, left:-20, bottom:0 }}>
            <XAxis dataKey="month" tick={{ fill:'#4B5563', fontSize:10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'#4B5563', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v => v>0?`${(v/1000).toFixed(0)}K`:'0'} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Rental" fill="#C8A96E" radius={[3,3,0,0]} />
            <Bar dataKey="HP"     fill="#4DA8FF" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="rounded-2xl p-4 md:p-6" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-display font-semibold text-white text-sm mb-4">Fleet Distribution</h2>
          {fleetPie.length>0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={fleetPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {fleetPie.map((entry,i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={val => <span style={{ color:'#9CA3AF', fontSize:'10px' }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-40 text-xs text-gray-600">No fleet data</div>}
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
          className="rounded-2xl p-4 md:p-6" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-display font-semibold text-white text-sm mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenue} margin={{ top:0, right:0, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#C8A96E" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#C8A96E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill:'#4B5563', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#4B5563', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v => v>0?`${(v/1000).toFixed(0)}K`:'0'} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Total" stroke="#C8A96E" strokeWidth={2} fill="url(#gTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
