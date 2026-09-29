import { useState } from 'react';
import api from '../api';
import { Building2, Hexagon, ArrowRight } from 'lucide-react';

export default function Login({ setUser }) {
  const [email, setEmail] = useState('pm@entai.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 selection:bg-primary-500/30">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary-600/20 blur-[150px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[150px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-emerald-600/10 blur-[100px]"></div>

      {/* Masily Platform Logo (Top Left) */}
      <div className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center space-x-3 z-20">
        <div className="bg-gradient-to-tr from-primary-600 to-indigo-500 p-2.5 rounded-xl shadow-lg shadow-primary-500/20">
          <Hexagon className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col text-left">
          <span className="font-extrabold text-2xl tracking-tight text-white font-['Outfit']">Masily</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-1">Manage Easily</span>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[420px] mx-4 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl p-10 sm:p-12 border border-white/10 relative z-10 animate-slide-up">
        
        <div className="flex flex-col items-center mb-10">
          <div className="bg-gradient-to-tr from-slate-800 to-slate-900 p-4 rounded-2xl shadow-inner border border-slate-700/50 mb-6 group hover:scale-105 transition-transform duration-300">
            <Building2 className="text-primary-400 w-10 h-10 group-hover:text-primary-300 transition-colors" />
          </div>
          <h2 className="text-3xl font-black text-center text-white font-['Outfit'] tracking-tight mb-2">Welcome Back</h2>
          <p className="text-slate-400 text-sm font-medium tracking-wide">Enterprise Command Portal</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-8 text-sm font-medium flex items-center justify-center animate-fade-in">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Work Email</label>
            <input 
              type="email" 
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder-slate-600"
              placeholder="name@mint-enterprise.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder-slate-600"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-primary-500/25 flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : (
              <>Sign In <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>
        
        <div className="mt-10 pt-8 border-t border-slate-800/50">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">Demo Credentials (Password: password123)</p>
          <div className="space-y-2 text-xs font-medium text-slate-400 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50">
            <div className="flex justify-between items-center"><span className="text-slate-300">Project Manager</span><span className="font-mono text-primary-400 text-[10px]">pm@entai.com</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-300">Site Engineer</span><span className="font-mono text-indigo-400 text-[10px]">engineer@entai.com</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
