import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getDashboardSummary } from '../../api/analytics.js';
import { getVehicleStats } from '../../api/vehicles.js';
import { formatCurrency } from '../../utils/formatters.js';

const KpiCard = ({ label, value, sub, accent, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass rounded-xl p-5 relative overflow-hidden hover:-translate-y-1 transition-transform duration-200">
    <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accent }} />
    <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">{label}</div>
    <div className="text-3xl font-display font-bold text-white">{value}</div>
    {sub && <div className="text-xs text-gray-500 mt-2">{sub}</div>}
  </motion.div>
);

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, v] = await Promise.all([getDashboardSummary(), getVehicleStats()]);
        setSummary(s.data.summary);
        setStats(v.data.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-500">Loading dashboard...</div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white">Operations Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Live fleet and financial overview</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Monthly Revenue"  value={formatCurrency(summary?.monthlyRevenue || 0)} accent="linear-gradient(90deg,#C8A96E,#8B6E2A)" delay={0.05} />
        <KpiCard label="Active Rentals"   value={summary?.activeRentals || 0}    sub="Vehicles currently rented"    accent="linear-gradient(90deg,#2EC881,#1A7A50)" delay={0.1} />
        <KpiCard label="Hire Purchase"    value={summary?.activeHirePurchases || 0} sub="Active HP agreements"      accent="linear-gradient(90deg,#4A8FE8,#1A5FA8)" delay={0.15} />
        <KpiCard label="Overdue Rentals"  value={summary?.overdueRentals || 0}   sub="Require immediate attention"  accent="linear-gradient(90deg,#E05252,#8B2A2A)" delay={0.2} />
      </div>

      {/* Fleet Status Grid */}
      {stats && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="glass rounded-xl p-6 mb-8">
          <h2 className="text-sm font-display font-semibold text-white mb-5">Fleet Status — {stats.total} vehicles</h2>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { key: 'available',         label: 'Available',    color: '#2EC881' },
              { key: 'rented',            label: 'Rented',       color: '#C8A96E' },
              { key: 'reserved',          label: 'Reserved',     color: '#4A8FE8' },
              { key: 'under_maintenance', label: 'Maintenance',  color: '#E05252' },
              { key: 'hire_purchase',     label: 'Hire Purchase',color: '#A855F7' },
              { key: 'sold',              label: 'Sold',         color: '#6B7280' },
            ].map(({ key, label, color }) => (
              <div key={key} className="text-center p-3 rounded-lg bg-white/3">
                <div className="text-2xl font-display font-bold" style={{ color }}>{stats[key] || 0}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Total customers */}
      {summary && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass rounded-xl p-6">
          <h2 className="text-sm font-display font-semibold text-white mb-2">Customer Base</h2>
          <div className="text-4xl font-display font-bold text-white">{summary.totalCustomers}</div>
          <div className="text-xs text-gray-500 mt-1">Total registered customers</div>
        </motion.div>
      )}
    </div>
  );
}
