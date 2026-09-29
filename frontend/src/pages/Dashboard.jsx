import { useState, useEffect } from 'react';
import api from '../api';
import BOQLedger from '../components/BOQLedger';
import VendorMatrix from '../components/VendorMatrix';
import SiteAudit from '../components/SiteAudit';
import { LayoutDashboard, Users2, Camera, ChevronRight, Activity, GitCommit } from 'lucide-react';

export default function Dashboard({ user }) {
  const [activeTab, setActiveTab] = useState('boq');
  const [project, setProject] = useState(null);

  const phaseMap = {
    SCOUTING: 'Phase 1: Scouting',
    DESIGN: 'Phase 2: Design',
    BOQ: 'Phase 3: BOQ / Procurement',
    EXECUTION: 'Phase 4: Execution',
    HANDOVER: 'Phase 5: Handover'
  };

  useEffect(() => {
    api.get('/boq/first').then(res => setProject(res.data)).catch(console.error);
  }, []);

  const updateStatus = async (e) => {
    const newStatus = e.target.value;
    try {
      await api.put(`/boq/${project._id}/status`, { status: newStatus });
      setProject({ ...project, status: newStatus });
    } catch (err) {
      alert('Error updating status');
    }
  };

  const tabs = [
    { id: 'boq', label: 'Budget Integrity', icon: LayoutDashboard, roles: ['PROJECT_MANAGER', 'ADMIN', 'SITE_ENGINEER'] },
    { id: 'vendor', label: 'Vendor Matrix', icon: Users2, roles: ['PROJECT_MANAGER', 'ADMIN'] },
    { id: 'audit', label: 'Site Verification', icon: Camera, roles: ['PROJECT_MANAGER', 'SITE_ENGINEER', 'ADMIN'] }
  ];

  const visibleTabs = tabs.filter(t => t.roles.includes(user.role));

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 py-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 print:hidden">
        <div>
          <div className="flex items-center text-xs font-semibold text-primary-600 tracking-wider uppercase mb-2">
            <Activity className="w-3.5 h-3.5 mr-1" /> Live Environment
            <ChevronRight className="w-3 h-3 mx-1 text-slate-300" /> Bengaluru
            <ChevronRight className="w-3 h-3 mx-1 text-slate-300" /> 
            {project && user.role === 'PROJECT_MANAGER' ? (
              <div className="flex items-center ml-1 bg-primary-50 rounded-lg px-2 py-1 shadow-sm border border-primary-100">
                <GitCommit className="w-3.5 h-3.5 mr-1.5 text-primary-500" />
                <select 
                  value={project.status} 
                  onChange={updateStatus}
                  className="bg-transparent text-primary-700 font-bold outline-none cursor-pointer text-xs"
                >
                  {Object.entries(phaseMap).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
            ) : project ? (
              <span className="text-primary-700 font-bold ml-1">{phaseMap[project.status] || project.status}</span>
            ) : null}
          </div>
          <h1 className="text-4xl font-extrabold text-brand-dark tracking-tight font-['Outfit']">Project Command Center</h1>
          <p className="text-brand-muted mt-2 text-sm max-w-xl leading-relaxed">
            Monitor capital envelopes, normalize multi-vendor RFQs, and auto-verify site progress using our enterprise vision AI.
          </p>
        </div>

        <div className="glass p-1.5 rounded-full inline-flex self-start md:self-end border border-white shadow-soft">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-white text-primary-600 shadow-sm border border-slate-100 transform scale-100' 
                  : 'text-brand-muted hover:text-brand-dark hover:bg-slate-50/50 scale-95'
              }`}
            >
              <tab.icon className={`w-4 h-4 mr-2 transition-colors ${activeTab === tab.id ? 'text-primary-500' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-slide-up bg-white/60 backdrop-blur-3xl rounded-[2rem] shadow-soft border border-white/80 overflow-hidden min-h-[600px] relative print:bg-transparent print:shadow-none print:border-none print:overflow-visible">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-indigo-500 to-primary-600"></div>
        {activeTab === 'boq' && <BOQLedger projectPhase={project?.status} user={user} />}
        {activeTab === 'vendor' && <VendorMatrix />}
        {activeTab === 'audit' && <SiteAudit user={user} projectPhase={project?.status} />}
      </div>
    </div>
  );
}
