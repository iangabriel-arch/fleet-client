import { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import LoginScene from '../components/three/LoginScene.jsx';

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form,     setForm]    = useState({ email: '', password: '' });
  const [error,    setError]   = useState('');
  const [loading,  setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please enter your email and password.'); return; }
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-ink flex items-center justify-center">

      {/* 3D Background */}
      <Suspense fallback={<div className="absolute inset-0 bg-ink" />}>
        <LoginScene />
      </Suspense>

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(5,8,22,0.3) 0%, rgba(5,8,22,0.75) 100%)' }} />

      {/* Card */}
      <motion.div {...fadeUp(0.1)}
        className="relative z-10 w-full max-w-md mx-4">

        {/* Logo */}
        <motion.div {...fadeUp(0.2)} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl glass-gold glow-gold mb-4">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="8"  width="22" height="13" rx="3.5" fill="#C8A96E" opacity="0.9"/>
              <circle cx="8.5"  cy="21" r="2.5" fill="#C8A96E"/>
              <circle cx="19.5" cy="21" r="2.5" fill="#C8A96E"/>
              <rect x="1" y="11" width="3.5" height="6" rx="1" fill="#C8A96E" opacity="0.5"/>
              <rect x="23.5" y="11" width="3.5" height="6" rx="1" fill="#C8A96E" opacity="0.5"/>
            </svg>
          </div>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight glow-text">
            FLEET<span className="text-gold">OS</span>
          </h1>
          <p className="text-xs text-gray-500 tracking-widest uppercase mt-1.5">
            Enterprise Fleet Management
          </p>
        </motion.div>

        {/* Glass card */}
        <motion.div {...fadeUp(0.3)} className="glass rounded-2xl p-8 glow-gold">

          <div className="mb-7">
            <h2 className="font-display font-semibold text-xl text-white">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-1">Sign in to your operations center</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
              <span className="text-base">⚠</span>
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="admin@fleetos.com"
                autoComplete="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-gold/40 focus:bg-white/8 transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••••"
                autoComplete="current-password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-gold/40 focus:bg-white/8 transition-all duration-200"
              />
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="relative w-full mt-2 py-3.5 rounded-xl font-display font-semibold text-sm tracking-wide transition-all duration-200 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: loading ? '#8B6E2A' : 'linear-gradient(135deg, #C8A96E, #E8C87A)', color: '#050816' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Authenticating...
                </span>
              ) : 'Sign In to FleetOS'}
            </button>
          </form>

          {/* Role hint */}
          <div className="mt-6 pt-5 border-t border-white/5">
            <p className="text-xs text-gray-600 text-center">
              Authorized personnel only · FleetOS Enterprise
            </p>
          </div>
        </motion.div>

        <motion.p {...fadeUp(0.5)} className="text-center text-xs text-gray-700 mt-6">
          © 2026 FleetOS — All rights reserved
        </motion.p>
      </motion.div>
    </div>
  );
}
