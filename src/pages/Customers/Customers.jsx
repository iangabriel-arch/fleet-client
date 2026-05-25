import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getCustomers } from '../../api/customers.js';
import { formatDate, getInitials } from '../../utils/formatters.js';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await getCustomers({ search, limit: 20 });
        setCustomers(data.customers);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer records</p>
        </div>
        <button className="bg-gold hover:bg-gold-light text-ink font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
          + Add Customer
        </button>
      </div>

      <div className="mb-6">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, ID..."
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-gold/50 transition-colors w-full max-w-sm" />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Customer', 'Phone', 'National ID', 'Rentals', 'Balance', 'Status', 'Joined'].map(h => (
                <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wider px-5 py-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center text-gray-500 py-12">Loading customers...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-gray-500 py-12">No customers found</td></tr>
            ) : customers.map((c, i) => (
              <motion.tr key={c._id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">
                      {getInitials(c.fullName || `${c.firstName} ${c.lastName}`)}
                    </div>
                    <div>
                      <div className="font-medium text-white">{c.fullName || `${c.firstName} ${c.lastName}`}</div>
                      <div className="text-xs text-gray-500">{c.email || '—'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-300">{c.phone}</td>
                <td className="px-5 py-4 text-gray-400 font-mono text-xs">{c.nationalId}</td>
                <td className="px-5 py-4 text-gray-300">{c.totalRentals}</td>
                <td className="px-5 py-4 text-gold">{c.outstandingBalance > 0 ? `KES ${c.outstandingBalance.toLocaleString()}` : '—'}</td>
                <td className="px-5 py-4">
                  {c.isBlacklisted
                    ? <span className="bg-red-500/10 text-red-400 text-xs px-2.5 py-1 rounded-full font-semibold">Blacklisted</span>
                    : <span className="bg-green-500/10 text-green-400 text-xs px-2.5 py-1 rounded-full font-semibold">Active</span>}
                </td>
                <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(c.createdAt)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
