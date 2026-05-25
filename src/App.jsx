import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login        from './pages/Login.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import Dashboard    from './pages/Dashboard.jsx';
import Vehicles     from './pages/Vehicles.jsx';
import Customers    from './pages/Customers.jsx';
import Rentals      from './pages/Rentals.jsx';
import HirePurchase from './pages/HirePurchase.jsx';
import Payments     from './pages/Payments.jsx';
import Maintenance  from './pages/Maintenance.jsx';
import Analytics    from './pages/Analytics.jsx';
import Alerts       from './pages/Alerts.jsx';
import VehicleDetail  from './pages/VehicleDetail.jsx';
import CustomerDetail from './pages/CustomerDetail.jsx';

const Guard = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="w-full h-screen bg-ink flex items-center justify-center">
      <div className="text-center">
        <div className="font-display font-bold text-2xl text-white mb-2">FLEET<span className="text-gold">OS</span></div>
        <div className="text-xs text-gray-600 tracking-widest uppercase animate-pulse">Initializing...</div>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<Guard><DashboardLayout /></Guard>}>
        <Route index                  element={<Dashboard />} />
        <Route path="vehicles"        element={<Vehicles />} />
        <Route path="vehicles/:id"   element={<VehicleDetail />} />
        <Route path="customers/:id"  element={<CustomerDetail />} />
        <Route path="customers"       element={<Customers />} />
        <Route path="rentals"         element={<Rentals />} />
        <Route path="hire-purchase"   element={<HirePurchase />} />
        <Route path="payments"        element={<Payments />} />
        <Route path="maintenance"     element={<Maintenance />} />
        <Route path="analytics"       element={<Analytics />} />
        <Route path="alerts"          element={<Alerts />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
