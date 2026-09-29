import { useState, useEffect } from 'react';
import api from '../api';
import { Lock, IndianRupee, ShieldAlert, ArrowUpRight, CheckCircle2, Activity, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

export default function BOQLedger({ projectPhase, user }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disburseAmount, setDisburseAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await api.get('/boq/first');
        setProject(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, []);

  useEffect(() => {
    if (projectPhase && project && project.status !== projectPhase) {
      setProject(prev => ({ ...prev, status: projectPhase }));
    }
  }, [projectPhase]);

  const handleFreeze = async () => {
    try {
      const { data } = await api.post(`/boq/${project._id}/freeze`);
      setProject(data.project);
    } catch (err) {
      alert(err.response?.data?.message || 'Error freezing BOQ');
    }
  };

  const handleDisburse = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/boq/payments/disburse', {
        projectId: project._id,
        amount: Number(disburseAmount),
        description: 'Vendor Milestone Payment'
      });
      setProject(data.project);
      setDisburseAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'Payment blocked');
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400 font-medium">Synchronizing Ledger...</div>;
  if (!project) return <div className="p-12 text-center text-red-500">No project found. Run seed script.</div>;

  const totalDisbursed = project.disbursements?.reduce((acc, d) => acc + d.amount, 0) || 0;
  const remaining = (project.frozenCapex || 0) - totalDisbursed;
  const unfrozen = (project.allocatedBudget || 0) - (project.frozenCapex || 0);
  
  const burnRate = project.frozenCapex > 0 ? (totalDisbursed / project.frozenCapex) * 100 : 0;

  const pieData = [
    { name: 'Disbursed', value: totalDisbursed, color: '#10B981' },
    { name: 'Remaining', value: remaining, color: '#6366F1' },
    { name: 'Unfrozen Reserve', value: unfrozen > 0 ? unfrozen : 0, color: '#94A3B8' },
  ].filter(d => d.value > 0);

  const trajectoryData = [
    { month: 'Jan', forecast: 0, actual: 0 },
    { month: 'Feb', forecast: (project.frozenCapex || 0) * 0.1, actual: totalDisbursed * 0.1 },
    { month: 'Mar', forecast: (project.frozenCapex || 0) * 0.25, actual: totalDisbursed * 0.4 },
    { month: 'Apr', forecast: (project.frozenCapex || 0) * 0.5, actual: totalDisbursed },
    { month: 'May', forecast: (project.frozenCapex || 0) * 0.8, actual: null },
    { month: 'Jun', forecast: project.frozenCapex || 0, actual: null },
  ];

  return (
    <div className="p-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-brand-dark tracking-tight font-['Outfit']">{project.name}</h2>
          <div className="flex flex-wrap items-center mt-4 gap-3 text-xs font-bold">
            <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 shadow-sm uppercase tracking-wider flex items-center">
              <Activity className="w-4 h-4 mr-2 text-slate-400" /> {project.status} STAGE
            </span>
            <span className={`px-4 py-2 rounded-xl border shadow-sm uppercase tracking-wider flex items-center ${
              project.boqStatus === 'FROZEN' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
            }`}>
              {project.boqStatus === 'FROZEN' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
              BOQ {project.boqStatus}
            </span>
          </div>
        </div>
        
        {project.boqStatus !== 'FROZEN' && user?.role === 'PROJECT_MANAGER' && (
          <button 
            onClick={handleFreeze}
            className="group flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl font-bold shadow-float hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Lock className="w-4 h-4 mr-2" />
            Freeze BOQ & Lock Budget
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Allocated', value: project.allocatedBudget, progress: 100, color: 'bg-slate-500' },
          { label: 'Frozen CAPEX', value: project.frozenCapex, progress: project.allocatedBudget ? (project.frozenCapex/project.allocatedBudget)*100 : 0, color: 'bg-primary-500' },
          { label: 'Total Disbursed', value: totalDisbursed, progress: burnRate, color: 'bg-emerald-500' },
          { label: 'Remaining Balance', value: remaining, progress: project.frozenCapex ? (remaining/project.frozenCapex)*100 : 0, color: 'bg-indigo-500' },
        ].map((kpi, i) => (
          <div key={i} className="glass-card p-6 rounded-3xl relative overflow-hidden group">
            <p className="text-brand-muted text-xs font-bold uppercase tracking-widest mb-2">
              {kpi.label}
            </p>
            <p className="text-3xl font-black text-brand-dark tracking-tight mb-4">
              <span className="text-slate-400 font-normal mr-1">₹</span>
              {kpi.value.toLocaleString()}
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full ${kpi.color} rounded-full transition-all duration-1000 ease-out`} 
                style={{ width: `${Math.min(kpi.progress, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
        <div className="glass-card p-6 rounded-3xl border border-slate-200 xl:col-span-2">
          <h3 className="text-sm font-bold text-brand-dark uppercase tracking-widest mb-6 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-primary-500" /> Capital Burn Trajectory (Predictive)
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CBD5E1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#CBD5E1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} tick={{fill: '#94A3B8', fontSize: 12}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <Tooltip 
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="forecast" name="AI Forecast Limit" stroke="#94A3B8" strokeWidth={3} fillOpacity={1} fill="url(#colorForecast)" />
                <Area type="monotone" dataKey="actual" name="Actual Disbursed" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-200 xl:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center">
              <PieChartIcon className="w-4 h-4 mr-2" /> Asset Distribution
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `₹${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: d.color }}></div>
                    <span className="text-slate-500">{d.name}</span>
                  </div>
                  <span className="text-brand-dark">₹{d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 shadow-sm xl:col-span-2">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
             <h3 className="text-lg font-black text-brand-dark tracking-tight">Bill of Quantities (BOQ) Master</h3>
             <div className="bg-primary-50 text-primary-700 px-4 py-1.5 rounded-xl text-xs font-bold border border-primary-100">
                 {project.boqItems?.length || 0} Core Categories
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-brand-muted font-bold uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5">Description</th>
                  <th className="px-8 py-5 text-right">Est. Rate</th>
                  <th className="px-8 py-5 text-right">Total Estimated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/50">
                {project.boqItems?.map((item, i) => (
                  <tr key={i} className="hover:bg-primary-50/40 transition-colors group">
                    <td className="px-8 py-5 font-black text-brand-dark">{item.category}</td>
                    <td className="px-8 py-5 text-slate-500 font-medium">{item.description}</td>
                    <td className="px-8 py-5 text-right text-slate-500 font-semibold group-hover:text-primary-600 transition-colors">₹{item.estimatedRate}</td>
                    <td className="px-8 py-5 text-right font-black text-brand-dark text-base">₹{item.totalEstimated.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {user?.role === 'PROJECT_MANAGER' && (
          <div className="glass-card p-6 rounded-3xl border border-slate-200 xl:col-span-1">
            <h3 className="text-sm font-bold text-brand-dark uppercase tracking-widest mb-6">Execution & Disbursement</h3>
            <p className="text-xs text-brand-muted mb-8 leading-relaxed">
              Financial requests are strictly programmatically validated against the frozen CAPEX invariant. Excess disbursements are structurally blocked at the database layer.
            </p>
            
            {error && (
              <div className="flex items-start bg-red-50 text-red-700 p-4 rounded-2xl mb-6 border border-red-100 animate-fade-in shadow-sm">
                <ShieldAlert className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-red-500" />
                <div className="text-sm">
                  <p className="font-bold mb-0.5 text-red-800">System Block: Invariant Breach</p>
                  <p className="opacity-90 leading-tight">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleDisburse} className="mt-auto bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <div className="w-full mb-6">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Request Amount (₹)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IndianRupee className="h-6 w-6 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <input
                    type="number"
                    className="pl-14 w-full bg-white border border-slate-200 rounded-2xl px-4 py-5 text-2xl font-black text-brand-dark focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
                    placeholder="50,000"
                    value={disburseAmount}
                    onChange={e => setDisburseAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={project.boqStatus !== 'FROZEN'}
                className="w-full shrink-0 flex items-center justify-center bg-brand-dark hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-float hover:shadow-lg disabled:shadow-none transform hover:-translate-y-1 disabled:transform-none"
              >
                Authorize Tranche <ArrowUpRight className="w-5 h-5 ml-2 text-primary-400" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
