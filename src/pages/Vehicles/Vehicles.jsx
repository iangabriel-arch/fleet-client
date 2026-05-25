import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getVehicles, getVehicleStats } from '../../api/vehicles.js';
import { formatCurrency } from '../../utils/formatters.js';

const statusColors = {
  available:         'bg-green-500/10  text-green-400',
  rented:            'bg-yellow-500/10 text-yellow-400',
  reserved:          'bg-blue-500/10   text-blue-400',
  under_maintenance: 'bg-red-500/10    text-red-400',
  hire_purchase:     'bg-purple-500/10 text-purple-400',
  sold:              'bg-gray-500/10   text-gray-400',
  repossessed:       'bg-red-900/20    text-red-600',
};

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getVehicles({ search, status, limit: 20 });
      setVehicles(data.vehicles);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, status]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Vehicle Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your entire fleet</p>
        </div>
        <button className="bg-gold hover:bg-gold-light text-ink font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
          + Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search make, model, plate..."
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-gold/50 transition-colors flex-1 max-w-xs" />
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold/50 transition-colors">
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="rented">Rented</option>
          <option value="reserved">Reserved</option>
          <option value="under_maintenance">Maintenance</option>
          <option value="hire_purchase">Hire Purchase</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Vehicle', 'Reg. Number', 'Category', 'Daily Rate', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wider px-5 py-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center text-gray-500 py-12">Loading vehicles...</td></tr>
            ) : vehicles.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-gray-500 py-12">No vehicles found</td></tr>
            ) : vehicles.map((v, i) => (
              <motion.tr key={v._id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer">
                <td className="px-5 py-4">
                  <div className="font-medium text-white">{v.displayName || `${v.year} ${v.make} ${v.model}`}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{v.color} · {v.transmission}</div>
                </td>
                <td className="px-5 py-4 text-gray-300 font-mono text-xs">{v.registrationNumber}</td>
                <td className="px-5 py-4 text-gray-400 capitalize">{v.category}</td>
                <td className="px-5 py-4 text-gold font-medium">{formatCurrency(v.dailyRate)}/day</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[v.status] || 'bg-gray-500/10 text-gray-400'}`}>
                    {v.status?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button className="text-xs text-gray-400 hover:text-gold transition-colors">View →</button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
