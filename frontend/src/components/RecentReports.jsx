const severityLabels = {
  1: { text: 'Low', class: 'badge-severity-1' },
  2: { text: 'Minor', class: 'badge-severity-2' },
  3: { text: 'Moderate', class: 'badge-severity-3' },
  4: { text: 'High', class: 'badge-severity-4' },
  5: { text: 'Critical', class: 'badge-severity-5' },
};

export default function RecentReports({ reports, loading }) {
  if (loading) {
    return (
      <div className="glass-card animate-fade-in">
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="section-title">Recent Reports</h3>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-700/50 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card animate-fade-in">
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <h3 className="section-title">Recent Reports</h3>
        <span className="text-xs text-slate-400">{reports?.length || 0} entries</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Severity</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">District</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/20">
            {reports?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">
                  No reports found
                </td>
              </tr>
            ) : (
              reports?.map((report, i) => {
                const sev = severityLabels[report.severity] || severityLabels[1];
                const date = new Date(report.timestamp).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                });
                return (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-700/20 transition-colors duration-150 animate-slide-in"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-200">{report.crime_type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={sev.class}>{sev.text}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-300">{report.district_name || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400 font-mono">
                        {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-400">{date}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
