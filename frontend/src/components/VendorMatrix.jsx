import { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { Sparkles, Trophy, AlertTriangle, ShieldCheck, BarChart3, Presentation, Radar as RadarIcon, FileText, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ComposedChart, Line, LineChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis, ReferenceLine, AreaChart, Area } from 'recharts';

export default function VendorMatrix() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [viewMode, setViewMode] = useState('radar'); // 'radar', 'cards' or 'analytics'
  const [activeCategory, setActiveCategory] = useState('');
  const [aiSummary, setAiSummary] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: project } = await api.get('/boq/first');
        setProjectId(project._id);
        const { data: quotes } = await api.get(`/ai/${project._id}`);
        setQuotations(quotes);
        if (quotes.length > 0) {
          const cats = [...new Set(quotes.map(q => q.category))];
          if (cats.length > 0) setActiveCategory(cats[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const analyzeQuotations = async () => {
    setAnalyzing(true);
    try {
      const { data } = await api.post('/ai/compare-quotations', { projectId });
      setQuotations(data.quotations);
      setAiSummary(data.summary);
      setShowModal(true);
      setViewMode('radar');
    } catch (err) {
      alert('Analysis failed: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const categories = useMemo(() => {
    return [...new Set(quotations.map(q => q.category))].filter(Boolean);
  }, [quotations]);

  const filteredQuotations = useMemo(() => {
    if (!activeCategory) return quotations;
    return quotations.filter(q => q.category === activeCategory);
  }, [quotations, activeCategory]);
  const chartData = useMemo(() => {
    return filteredQuotations.map(q => ({
      name: q.vendorName || 'Vendor', 
      Raw: q.submittedAmount || 0,
      Normalized: q.normalizedTotal || 0,
      Score: q.costEfficiencyScore || 0,
      isRecommended: q.isRecommended || false
    }));
  }, [filteredQuotations]);

  const radarData = useMemo(() => {
    if (!filteredQuotations.some(q => q.metrics)) return [];
    
    // Convert multiple vendors into a single radar dataset comparing them
    const axes = [
      { subject: 'Cost Efficiency', key: 'costScore', fullMark: 100 },
      { subject: 'Delivery Speed', key: 'speedScore', fullMark: 100 },
      { subject: 'Quality/Brand', key: 'qualityScore', fullMark: 100 },
      { subject: 'Risk Aversion', key: 'riskScore', fullMark: 100 },
    ];
    
    return axes.map(axis => {
      const dataPoint = { subject: axis.subject };
      filteredQuotations.forEach(q => {
        const vendorKey = q.vendorName || 'Vendor';
        dataPoint[vendorKey] = q.metrics?.[axis.key] || 0;
      });
      return dataPoint;
    });
  }, [filteredQuotations]);

  if (loading) return <div className="p-12 text-center text-slate-400 font-medium">Loading vendor matrix...</div>;

  const hasAnalysis = quotations.length > 0;
  const hasDeepMetrics = quotations.some(q => q.metrics);

  const radarColors = ['#6366F1', '#10B981', '#F59E0B', '#EC4899'];

  return (
    <>
    <div className={`p-8 animate-fade-in ${showModal ? 'print:hidden' : ''}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-slate-700 tracking-tight font-['Outfit']">Multi-Vendor Predictive Analytics</h2>
          <p className="text-slate-500 mt-1 text-xs leading-relaxed font-medium">
            AI-driven normalisation of un-structured RFQs. Predicts commercial impact, operational delivery speeds, and contract risks instantly.
          </p>
        </div>
        <div className="flex w-full md:w-auto">
          <button 
            onClick={analyzeQuotations}
            disabled={analyzing}
            className="flex-1 md:flex-none flex items-center justify-center px-8 py-3 bg-gradient-to-r from-brand-dark to-black hover:from-black hover:to-slate-900 text-white rounded-xl font-bold shadow-float hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
          >
            <Sparkles className={`w-5 h-5 mr-2 ${analyzing ? 'animate-spin' : 'text-primary-400'}`} />
            {analyzing ? 'Processing...' : 'Run Deep Analytics'}
          </button>
        </div>
      </div>

      {hasAnalysis && (
        <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-3 rounded-3xl border border-slate-200 shadow-sm mb-10 animate-fade-in gap-4 lg:gap-0">
          <div className="flex items-center w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mx-4 whitespace-nowrap">Category</span>
            <div className="flex gap-2">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all duration-300 whitespace-nowrap ${activeCategory === cat ? 'bg-primary-50 text-primary-600 shadow-sm ring-1 ring-primary-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-10 w-px bg-slate-200 hidden lg:block mx-6"></div>

          <div className="flex items-center w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
            <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {hasDeepMetrics && (
                <button 
                  onClick={() => setViewMode('radar')}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${viewMode === 'radar' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <RadarIcon className="w-4 h-4 inline mr-1.5" /> Vector
                </button>
              )}
              <button 
                onClick={() => setViewMode('analytics')}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${viewMode === 'analytics' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <BarChart3 className="w-4 h-4 inline mr-1.5" /> Normalization
              </button>
              <button 
                onClick={() => setViewMode('cards')}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${viewMode === 'cards' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Presentation className="w-4 h-4 inline mr-1.5" /> Scorecards
              </button>
            </div>
          </div>
        </div>
      )}

      {hasDeepMetrics && viewMode === 'radar' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200 mb-10 animate-slide-up flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col items-center">
            <div className="text-center mb-6">
               <h3 className="text-lg font-black text-brand-dark tracking-tight">AI Vector Comparison: {activeCategory}</h3>
               <p className="text-slate-500 text-xs mt-1">Multi-dimensional analysis of supplier capabilities vs financial impact.</p>
            </div>
            <div className="h-[500px] w-full max-w-2xl relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontWeight: 800, fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)', fontWeight: 'bold' }}
                />
                {filteredQuotations.map((q, idx) => (
                  <Radar 
                    key={q._id}
                    name={q.vendorName || 'Vendor'} 
                    dataKey={q.vendorName || 'Vendor'} 
                    stroke={radarColors[idx % radarColors.length]} 
                    fill={radarColors[idx % radarColors.length]} 
                    fillOpacity={0.4} 
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
          </div>
          
          <div className="w-full lg:w-72 flex flex-col gap-4">
             <div className="bg-gradient-to-br from-primary-50 to-indigo-50 p-5 rounded-2xl border border-primary-100">
               <h4 className="text-[10px] font-black text-primary-700 uppercase tracking-widest mb-3">Category Insights</h4>
               <p className="text-sm text-primary-900 font-medium leading-relaxed">
                 The AI has evaluated <span className="font-black">{filteredQuotations.length}</span> vendors in the {activeCategory} category. 
                 <br/><br/>
                 Highest Value Score: <span className="font-black">{Math.max(...filteredQuotations.map(q => q.costEfficiencyScore || 0))}</span>
                 <br/><br/>
                 The recommended vendor aligns best across all 4 critical vector dimensions.
               </p>
             </div>
             <div className="flex flex-col gap-2">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Vector Alignment Rankings</h4>
               {[...filteredQuotations].sort((a,b)=>(b.costEfficiencyScore||0)-(a.costEfficiencyScore||0)).map(q => {
                 const originalIdx = filteredQuotations.findIndex(fq => fq._id === q._id);
                 return (
                   <div key={q._id} className={`p-3 rounded-xl border ${q.isRecommended ? 'border-emerald-300 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}>
                     <div className="flex justify-between items-center">
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: radarColors[originalIdx % radarColors.length] }}></div>
                         <span className="font-bold text-sm text-slate-700">{q.vendorName}</span>
                       </div>
                       <span className={`text-xs font-black ${q.isRecommended ? 'text-emerald-700' : 'text-slate-600'}`}>{q.costEfficiencyScore}</span>
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>
        </div>
      )}

      {hasAnalysis && viewMode === 'analytics' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10 animate-slide-up">
          <div className="glass-card p-6 rounded-3xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Price Normalization Variance</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => `₹${value.toLocaleString()}`}
                    cursor={{fill: '#F1F5F9'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)', fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                  <Bar dataKey="Raw" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Raw Quote" />
                  <Bar dataKey="Normalized" fill="#6366F1" radius={[4, 4, 0, 0]} name="AI Normalized">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isRecommended ? '#10B981' : '#6366F1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-3xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Commercial Value Score</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{fill: '#F1F5F9'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="Score" barSize={40} radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isRecommended ? '#10B981' : '#CBD5E1'} />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="Score" stroke="#4338CA" strokeWidth={3} dot={{r: 6, fill: '#4338CA', strokeWidth: 2, stroke: '#fff'}} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Quality vs Speed Analysis</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredQuotations.map(q => ({ name: q.vendorName, Speed: q.metrics?.speedScore || 0, Quality: q.metrics?.qualityScore || 0 }))} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} dy={10} padding={{ left: 30, right: 30 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)', fontWeight: 'bold' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="Quality" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorQuality)" />
                  <Area type="monotone" dataKey="Speed" stroke="#14B8A6" strokeWidth={3} fillOpacity={1} fill="url(#colorSpeed)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Risk Profile Expsoure (Lower is better)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredQuotations.map(q => ({ name: q.vendorName, Risk: 100 - (q.metrics?.riskScore || 0) }))} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} dy={10} padding={{ left: 30, right: 30 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="Risk" stroke="#EF4444" strokeWidth={4} dot={{r: 8, fill: '#EF4444', strokeWidth: 2, stroke: '#fff'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {(viewMode === 'cards' || (!hasAnalysis && !hasDeepMetrics)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-slide-up">
          {filteredQuotations.map(q => (
            <div key={q._id} className={`glass-card rounded-3xl relative overflow-hidden transition-all duration-500 ${q.isRecommended ? 'border-primary-500 shadow-float ring-4 ring-primary-500/10 scale-[1.02]' : 'border-slate-200 shadow-soft'}`}>
              
              {q.isRecommended && (
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-primary-500 to-indigo-600"></div>
              )}
              
              <div className="p-5 border-b border-slate-100 bg-white/60">
                {q.isRecommended && (
                  <div className="inline-flex items-center px-3 py-1 mb-3 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-200 shadow-sm animate-pulse">
                    <Trophy className="w-3 h-3 mr-1.5" /> Recommended
                  </div>
                )}
                <h3 className="text-xl font-black text-brand-dark tracking-tight">{q.vendorName}</h3>
                <div className="flex items-center mt-3 space-x-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-widest rounded-lg">{q.category}</span>
                  <span className="text-sm font-bold text-primary-600">{q.brandProposed}</span>
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Raw Quote Submitted</p>
                  <p className={`text-xl font-bold ${q.normalizedTotal ? 'text-slate-300 line-through decoration-slate-300 decoration-2' : 'text-slate-600'}`}>₹{q.submittedAmount.toLocaleString()}</p>
                </div>

                {q.normalizedTotal && (
                  <div className="bg-gradient-to-br from-primary-50 to-indigo-50/50 p-4 rounded-2xl border border-primary-100/60 relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full -mr-8 -mt-8 blur-xl"></div>
                    <div className="mb-3">
                      <p className="text-[9px] font-black text-primary-700/70 uppercase tracking-widest mb-1">AI Normalized Cost</p>
                      <p className="text-3xl font-black text-primary-700 tracking-tighter">₹{q.normalizedTotal.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-center bg-white/80 p-2.5 rounded-xl border border-primary-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Value Score</span>
                      <div className="flex items-center">
                        <span className="text-lg font-black text-brand-dark">{q.costEfficiencyScore}</span>
                        <span className="text-xs text-slate-400 font-bold ml-1">/100</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3 bg-white/60 p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Delivery SLA</span>
                    <span className="text-brand-dark font-black">{q.deliveryTimelineDays} Days</span>
                  </div>
                  <div className="h-px w-full bg-slate-100"></div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Capital Terms</span>
                    <span className="text-brand-dark font-black text-right pl-4">{q.paymentTerms}</span>
                  </div>
                </div>

                {q.riskFlags && q.riskFlags.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Hidden Contract Risks
                    </h4>
                    <ul className="space-y-2">
                      {q.riskFlags.map((risk, i) => (
                        <li key={i} className="text-sm font-semibold text-amber-900 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 rounded-xl border border-amber-200/60 flex items-start shadow-sm">
                          <div className="mt-1.5 mr-3 w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {q.normalizedTotal && (!q.riskFlags || q.riskFlags.length === 0) && (
                  <div className="pt-2">
                    <div className="text-sm font-bold text-emerald-800 bg-emerald-50 px-5 py-4 rounded-xl border border-emerald-200/60 flex items-center shadow-sm">
                      <ShieldCheck className="w-5 h-5 mr-3 text-emerald-500" />
                      Cleared: No Contractual Risks
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Executive AI Report Full-Screen Overlay */}
    {showModal && (
      <div className="fixed inset-0 z-[100] bg-slate-50 print:static print:inset-auto print:h-auto print:bg-white print:block overflow-y-auto print:overflow-visible">
        <div className="min-h-screen flex flex-col print:block print:min-h-0">
          <div className="p-6 md:p-8 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm print:hidden sticky top-0 z-10">
            <h3 className="text-2xl font-black text-brand-dark flex items-center">
              <Sparkles className="w-7 h-7 mr-3 text-primary-600" /> Executive AI Report
            </h3>
            <div className="flex space-x-4">
              <button onClick={() => window.print()} className="px-6 py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center shadow-md text-sm">
                <FileText className="w-5 h-5 mr-2" /> Export PDF
              </button>
              <button onClick={() => setShowModal(false)} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Scrollable Printable Content Area */}
          <div 
            className="flex-1 p-8 md:p-12 print:p-0 print:block print:text-black"
            style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
          >
            <div className="max-w-5xl mx-auto pb-20 print:pb-0 print:max-w-none">
             <div className="hidden print:block mb-10 border-b-2 border-slate-800 pb-6">
               <h1 className="text-4xl font-black text-slate-900 tracking-tighter">MINTops Enterprise</h1>
               <h2 className="text-2xl font-bold text-slate-600 mt-2">Executive Procurement Report</h2>
               <div className="flex justify-between mt-4">
                 <p className="text-slate-500 font-bold">Category Analysis: <span className="text-slate-900">{activeCategory}</span></p>
                 <p className="text-slate-400 text-sm font-semibold">Generated by Gemini Vision AI</p>
               </div>
             </div>
             
             <h4 className="text-2xl font-black mb-6 text-slate-800 border-l-4 border-primary-500 pl-4">AI Recommendation Rationale</h4>
             <div className="prose prose-slate max-w-none mb-12">
               {aiSummary && aiSummary.split('\n').map((para, i) => (
                 para.trim() && <p key={i} className="mb-4 text-slate-700 leading-relaxed text-[16px] font-medium">{para}</p>
               ))}
             </div>
             
             <h4 className="text-2xl font-black mb-8 text-slate-800 border-l-4 border-primary-500 pl-4">Vector Performance Matrix</h4>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {filteredQuotations.map(q => (
                  <div key={q._id} className={`p-8 rounded-3xl border-2 ${q.isRecommended ? 'border-primary-500 bg-primary-50/50 shadow-md' : 'border-slate-200 bg-white shadow-sm'} print:break-inside-avoid`}>
                    <div className="flex justify-between items-center mb-6">
                      <h5 className="font-black text-2xl text-slate-800">{q.vendorName}</h5>
                      {q.isRecommended && <span className="bg-primary-500 text-white text-[11px] px-4 py-2 rounded-full font-black uppercase tracking-widest shadow-sm">Recommended</span>}
                    </div>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-100"><span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Value Score:</span> <span className="font-black text-xl">{q.costEfficiencyScore}/100</span></div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-100"><span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Normalized Cost:</span> <span className="font-black text-xl text-primary-700">₹{q.normalizedTotal?.toLocaleString()}</span></div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-200/50">
                        <div className="bg-white p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-1">Delivery SLA</span>
                          <span className="font-black text-slate-700 text-lg">{q.deliveryTimelineDays} Days</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-1">Brand Eq.</span>
                          <span className="font-black text-slate-700 text-lg">{q.brandProposed}</span>
                        </div>
                      </div>

                      {q.riskFlags?.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-slate-200/60">
                           <span className="text-amber-600 font-black text-[11px] uppercase tracking-widest block mb-3 flex items-center">
                             <AlertTriangle className="w-4 h-4 mr-1.5" /> Contract Risks Identified
                           </span>
                           <ul className="text-sm font-semibold text-amber-900 bg-amber-50 p-4 rounded-2xl border border-amber-100/50 space-y-2">
                             {q.riskFlags.map((r,i)=><li key={i} className="flex items-start"><div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 mr-2.5 shrink-0"></div>{r}</li>)}
                           </ul>
                        </div>
                      )}
                    </div>
                  </div>
               ))}
             </div>
          </div>
        </div>
        </div>
      </div>
    )}
    </>
  );
}
