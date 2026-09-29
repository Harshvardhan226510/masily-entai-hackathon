import { useState, useRef, useEffect } from 'react';
import api from '../api';
import { Camera, UploadCloud, CheckCircle2, AlertTriangle, ShieldCheck, FileImage, Crosshair, ShieldAlert } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function SiteAudit({ user, projectPhase }) {
  const [projectId, setProjectId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [claimedCompletionPercentage, setClaimedCompletionPercentage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: project } = await api.get('/boq/first');
        setProjectId(project._id);
        const { data: siteLogs } = await api.get(`/ai/audit/${project._id}`);
        setLogs(siteLogs);
      } catch (err) {
        console.error(err);
      }
    };
    if (projectPhase) {
      fetchData();
    }
  }, [projectPhase]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageBase64) return alert('Please upload a site photo');
    
    setSubmitting(true);
    try {
      const { data } = await api.post('/ai/audit-site-log', {
        projectId,
        taskName,
        claimedCompletionPercentage: Number(claimedCompletionPercentage),
        imageBase64
      });
      
      setLogs([data, ...logs]);
      setTaskName('');
      setClaimedCompletionPercentage('');
      setImagePreview(null);
      setImageBase64('');
      if(fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      alert('Audit failed: ' + (err.response?.data?.details || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const CircularProgress = ({ value = 0, color, label }) => {
    const safeValue = Number(value) || 0;
    const data = [
      { name: 'Done', value: safeValue, color },
      { name: 'Pending', value: 100 - safeValue, color: '#F1F5F9' },
    ];
    return (
      <div className="relative w-24 h-24 flex flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={40} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-brand-dark" style={{color}}>{value}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[750px] animate-fade-in">
      {/* Input Module */}
      <div className="w-full lg:w-[40%] p-8 lg:p-12 bg-gradient-to-b from-white to-slate-50/50 border-r border-slate-200/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-200/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <h3 className="text-3xl font-extrabold text-brand-dark tracking-tight mb-3 relative font-['Outfit']">Field Telemetry</h3>
        <p className="text-sm text-slate-500 mb-10 relative leading-relaxed font-medium">
          Transmit daily site execution logs. Gemini Vision acts as a remote auditor, validating claims against visual truth and scanning for safety protocol breaches.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-8 relative">
          <div className="glass-card p-8 rounded-3xl border border-slate-200 shadow-soft">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                  <Crosshair className="w-3.5 h-3.5 mr-1.5" /> Execution Vector
                </label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-brand-dark focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
                  placeholder="e.g. Ground Floor HVAC Ducting"
                  value={taskName}
                  onChange={e => setTaskName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Claimed Progress (%)</label>
                <input
                  type="number"
                  min="0" max="100"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-brand-dark focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
                  placeholder="e.g. 60"
                  value={claimedCompletionPercentage}
                  onChange={e => setClaimedCompletionPercentage(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Visual Evidence Matrix</label>
                
                <div 
                  className={`border-2 border-dashed rounded-3xl overflow-hidden relative transition-all duration-300 group ${
                    imagePreview 
                      ? 'border-primary-300 shadow-md' 
                      : 'border-slate-300 bg-slate-50/80 hover:bg-primary-50/50 hover:border-primary-400'
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative h-56 w-full group">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[4px]">
                        <button 
                          type="button" 
                          onClick={() => { setImagePreview(null); setImageBase64(''); if(fileInputRef.current) fileInputRef.current.value=''; }}
                          className="bg-white hover:bg-red-50 text-red-600 rounded-full px-6 py-3 font-black text-sm transition-all shadow-xl flex items-center transform hover:scale-105"
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" /> Scrap Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="flex flex-col items-center justify-center h-56 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 border border-slate-100">
                        <Camera className="w-7 h-7 text-primary-500" />
                      </div>
                      <span className="text-base font-black text-brand-dark">Initialize Sensor Upload</span>
                      <span className="text-xs text-slate-400 mt-2 font-medium">JPEG, PNG, HEIC up to 10MB</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden" 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-brand-dark hover:bg-black text-white font-black text-lg py-5 rounded-2xl transition-all shadow-float hover:shadow-2xl disabled:opacity-70 disabled:shadow-none flex items-center justify-center transform hover:-translate-y-1 disabled:transform-none"
          >
            {submitting ? (
              <span className="flex items-center"><UploadCloud className="w-6 h-6 mr-3 animate-pulse" /> Establishing AI Uplink...</span>
            ) : (
              'Transmit to Vision Core'
            )}
          </button>
        </form>
      </div>

      {/* Audit Feed */}
      <div className="w-full lg:w-[60%] bg-[#FAFAFC] p-8 lg:p-12 overflow-y-auto max-h-[800px] relative">
        <h3 className="text-2xl font-black text-brand-dark tracking-tight mb-10 flex items-center font-['Outfit']">
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mr-4 border border-primary-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          Automated Audit Log
        </h3>
        
        <div className="space-y-8 relative">
          {/* Timeline track */}
          <div className="absolute left-8 top-8 bottom-4 w-0.5 bg-gradient-to-b from-primary-200 via-slate-200 to-transparent"></div>

          {logs.map(log => (
            <div key={log._id} className="relative pl-24 animate-slide-up group">
              {/* Timeline dot */}
              <div className={`absolute left-[27px] top-8 w-5 h-5 rounded-full border-4 border-white shadow-md z-10 transition-transform group-hover:scale-125 duration-300 ${
                log.auditStatus === 'VERIFIED' ? 'bg-emerald-500' :
                log.auditStatus === 'DISCREPANCY_FLAGGED' ? 'bg-amber-500' :
                'bg-slate-400'
              }`}></div>
              
              <div className="glass-card rounded-3xl p-8 border border-slate-200 shadow-soft transition-all duration-500 hover:shadow-float hover:border-primary-100 bg-white">
                <div className="flex flex-wrap justify-between items-start mb-6 gap-4 border-b border-slate-100 pb-6">
                  <div>
                    <h4 className="font-black text-xl text-brand-dark">{log.taskName}</h4>
                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></span>
                      Logged by {log.engineerId?.name || 'Engineer'}
                    </p>
                  </div>
                  <div className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center shadow-sm ${
                    log.auditStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    log.auditStatus === 'DISCREPANCY_FLAGGED' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                    'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}>
                    {log.auditStatus === 'VERIFIED' && <CheckCircle2 className="w-4 h-4 mr-2" />}
                    {log.auditStatus === 'DISCREPANCY_FLAGGED' && <AlertTriangle className="w-4 h-4 mr-2" />}
                    {log.auditStatus.replace('_', ' ')}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 mb-6">
                  <div className="flex items-center gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-100 flex-1">
                    <CircularProgress value={log.claimedCompletionPercentage} color="#94A3B8" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Human Claim</p>
                      <p className="text-sm font-semibold text-brand-dark">Reported Progress</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-primary-50/50 p-4 rounded-2xl border border-primary-100 flex-1 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/40 blur-xl rounded-full mix-blend-overlay"></div>
                    <CircularProgress value={log.visualProgressEstimate} color={log.auditStatus === 'VERIFIED' ? '#10B981' : '#F59E0B'} />
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${log.auditStatus === 'VERIFIED' ? 'text-emerald-600' : 'text-amber-600'}`}>AI Assessed</p>
                      <p className="text-sm font-semibold text-brand-dark">Visual Evidence</p>
                    </div>
                  </div>
                </div>

                {log.auditStatus === 'DISCREPANCY_FLAGGED' && log.discrepancyReasoning && (
                  <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200/60 shadow-sm">
                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-amber-600" /> Discrepancy Analysis
                    </p>
                    <p className="text-sm font-semibold text-amber-900 leading-relaxed pl-6">{log.discrepancyReasoning}</p>
                  </div>
                )}

                {log.safetyHazardsDetected && log.safetyHazardsDetected.length > 0 && (
                  <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                    <p className="text-[10px] font-black text-red-800 uppercase tracking-widest mb-4 flex items-center">
                      <ShieldAlert className="w-4 h-4 mr-2 text-red-600" /> Critical Safety Alerts
                    </p>
                    <ul className="grid grid-cols-1 gap-2 pl-6">
                      {log.safetyHazardsDetected.map((hazard, i) => (
                        <li key={i} className="text-sm font-bold text-red-900 flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-3"></div>
                          {hazard}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {logs.length === 0 && (
            <div className="pl-24 py-20 opacity-40 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-200 rounded-3xl flex items-center justify-center mb-6 shadow-inner transform rotate-3">
                <FileImage className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-500 font-bold text-lg tracking-tight">System awaiting field telemetry.</p>
              <p className="text-slate-400 text-sm mt-2">Submit an execution vector to begin AI audit.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
