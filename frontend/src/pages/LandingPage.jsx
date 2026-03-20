import { useNavigate } from 'react-router-dom';

export default function LandingPage({ onClearAdmin, onClearCitizen }) {
  const navigate = useNavigate();

  const handleCitizenClick = () => {
    if (onClearCitizen) onClearCitizen();
    navigate('/citizen-login');
  };

  const handleAdminClick = () => {
    if (onClearAdmin) onClearAdmin();
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-4xl text-center animate-fade-in">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/20">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4 tracking-tight">
          Crime Pattern Detection System
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12">
          An AI-powered system for the seamless reporting, tracking, and geospatial analysis of incidents across all 14 districts of Kerala.
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Citizen Card */}
          <div 
            onClick={handleCitizenClick}
            className="glass-card p-8 group cursor-pointer hover:bg-slate-800/80 transition-all duration-300 hover:scale-[1.02] border-slate-700/50 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 text-left"
          >
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Report an Incident</h2>
            <p className="text-sm text-slate-400 mb-6">
              Citizen portal. Securely file a report with photo/video evidence. Sent directly to the relevant district authority.
            </p>
            <div className="flex items-center text-sm font-semibold text-blue-400 group-hover:text-blue-300">
              Continue as Citizen <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
            </div>
          </div>

          {/* Admin Card */}
          <div 
            onClick={handleAdminClick}
            className="glass-card p-8 group cursor-pointer hover:bg-slate-800/80 transition-all duration-300 hover:scale-[1.02] border-slate-700/50 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 text-left"
          >
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Law Enforcement</h2>
            <p className="text-sm text-slate-400 mb-6">
              Admin dashboard. Requires Blink-ID biometric authentication. View hotspots, heatmaps, and secure evidence.
            </p>
            <div className="flex items-center text-sm font-semibold text-indigo-400 group-hover:text-indigo-300">
              Continue as Admin <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
            </div>
          </div>
        </div>

        <p className="text-[12px] text-slate-500 mt-16 font-medium">
          Secure · Encrypted · Real-time
        </p>
      </div>
    </div>
  );
}
