import { useEffect, useState } from 'react';

export default function AlertBanner({ admin, reports }) {
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!reports || reports.length === 0) return;

    // Filter reports from last 24 hours in admin's district
    const now = new Date();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);

    const alerts = reports.filter((r) => {
      const rDate = new Date(r.timestamp);
      const isRecent = rDate >= dayAgo;
      if (admin.role === 'super_admin') return isRecent;
      return isRecent && r.district_id === admin.district_id;
    });

    setRecentAlerts(alerts);
  }, [reports, admin]);

  if (!visible || recentAlerts.length === 0) return null;

  return (
    <div className="glass-card border-l-4 border-l-amber-500 p-4 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-500/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-400">
              {recentAlerts.length} Alert{recentAlerts.length !== 1 ? 's' : ''} in Last 24 Hours
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {admin.role === 'super_admin'
                ? 'Across all Kerala districts'
                : `In ${admin.district_name || 'your district'}`}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {recentAlerts.slice(0, 5).map((alert) => (
                <span
                  key={alert.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/50 rounded text-[11px] text-slate-300"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    alert.severity >= 4 ? 'bg-red-400' : alert.severity >= 3 ? 'bg-amber-400' : 'bg-blue-400'
                  }`}></span>
                  {alert.crime_type}
                </span>
              ))}
              {recentAlerts.length > 5 && (
                <span className="text-[11px] text-slate-500">+{recentAlerts.length - 5} more</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
