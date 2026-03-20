import { useState, useEffect } from 'react';
import api from '../api/client';

export default function Reports({ admin }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, investigating, resolved
  
  const isSuperAdmin = admin.role === 'super_admin';

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = { limit: 500 };
      if (!isSuperAdmin) {
        params.district_id = admin.district_id;
      }
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      const res = await api.get('/reports', { params });
      setReports(res.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filterStatus, admin.district_id]);

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await api.patch(`/reports/${reportId}/status`, { status: newStatus });
      // Instant UI update
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Error updating report status.');
    }
  };

  const tabs = [
    { id: 'all', label: 'All Reports' },
    { id: 'pending', label: 'Pending' },
    { id: 'investigating', label: 'Investigating' },
    { id: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">Incidents & Reports</h1>
        <p className="text-sm text-slate-400 mt-1">
          {isSuperAdmin ? 'Manage all incident reports across Kerala' : `Manage reports for ${admin.district_name || 'your district'}`}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 space-x-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              filterStatus === tab.id ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
            {filterStatus === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] rounded-t"></div>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/20 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">ID / Type</th>
                <th className="p-4">Location</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Date Reported</th>
                <th className="p-4 w-48">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">
                    <div className="flex justify-center mb-3">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    Loading reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">
                    No reports found.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-200">#{report.id} {report.crime_type}</div>
                      <div className="text-xs text-slate-400 mt-1 truncate max-w-xs">{report.description || 'No description provided'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-300">{report.district_name || 'Unknown'}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</div>
                    </td>
                    <td className="p-4">
                      <span className={`badge-severity-${report.severity}`}>Level {report.severity}</span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(report.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                    </td>
                    <td className="p-4">
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusChange(report.id, e.target.value)}
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-1.5 rounded outline-none border transition-colors cursor-pointer ${
                          report.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                          report.status === 'investigating' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                          'bg-slate-700/50 text-slate-300 border-slate-600'
                        }`}
                      >
                        <option value="pending" className="bg-slate-800 text-slate-200">Pending</option>
                        <option value="investigating" className="bg-slate-800 text-amber-400">Investigating</option>
                        <option value="resolved" className="bg-slate-800 text-emerald-400">Resolved</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      {report.evidence_hash ? (
                        <a 
                          href={`${api.defaults.baseURL}/uploads/${report.evidence_hash}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center text-xs font-semibold text-blue-400 hover:text-blue-300"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                          Evidence
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">No Evidence</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
