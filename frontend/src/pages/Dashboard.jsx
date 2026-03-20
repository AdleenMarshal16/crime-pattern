import { useState, useEffect } from 'react';
import api from '../api/client';
import StatsCards from '../components/StatsCards';
import HeatmapMap from '../components/HeatmapMap';
import RecentReports from '../components/RecentReports';
import AlertBanner from '../components/AlertBanner';

export default function Dashboard({ admin }) {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(
    admin.role === 'district_admin' ? admin.district_id : null
  );
  const [loading, setLoading] = useState(true);

  // Fetch all data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params = {};
        if (selectedDistrict) params.district_id = selectedDistrict;

        const [statsRes, reportsRes, heatmapRes, districtsRes] = await Promise.all([
          api.get('/stats', { params }),
          api.get('/reports', { params: { ...params, limit: 50 } }),
          api.get('/heatmap', { params }),
          api.get('/districts'),
        ]);

        setStats(statsRes.data);
        setReports(reportsRes.data);
        setHeatmapData(heatmapRes.data);
        setDistricts(districtsRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedDistrict]);

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            {admin.role === 'super_admin'
              ? 'Overview of all Kerala districts'
              : `Monitoring ${admin.district_name || 'assigned district'}`}
          </p>
        </div>
        
        {/* District Filter (Super Admin only) */}
        {admin.role === 'super_admin' && (
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-slate-400">Filter by district:</label>
            <select
              value={selectedDistrict || ''}
              onChange={(e) => setSelectedDistrict(e.target.value ? Number(e.target.value) : null)}
              className="input-field w-48 text-sm"
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Alerts */}
      <AlertBanner admin={admin} reports={reports} />

      {/* Stats Cards */}
      <StatsCards stats={stats} loading={loading} />

      {/* Map + Crime Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Heatmap */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title">Crime Heatmap</h3>
            <span className="text-xs text-slate-500">{heatmapData.length} data points</span>
          </div>
          <div className="h-[420px]">
            <HeatmapMap heatmapData={heatmapData} loading={loading} />
          </div>
        </div>

        {/* Crime Type Distribution */}
        <div>
          <h3 className="section-title mb-3">Crime Distribution</h3>
          <div className="glass-card p-4 space-y-3 animate-fade-in">
            {stats?.crime_type_distribution ? (
              Object.entries(stats.crime_type_distribution)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count], i) => {
                  const maxCount = Math.max(...Object.values(stats.crime_type_distribution));
                  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  const colors = [
                    'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
                    'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500', 'bg-red-500',
                    'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500',
                    'bg-green-500', 'bg-emerald-500',
                  ];
                  return (
                    <div key={type} className="animate-slide-in" style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">{type}</span>
                        <span className="text-slate-400">{count}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-6 bg-slate-700/50 rounded animate-pulse"></div>
                ))}
              </div>
            )}
          </div>

          {/* Severity Distribution */}
          <h3 className="section-title mb-3 mt-6">Severity Breakdown</h3>
          <div className="glass-card p-4 animate-fade-in">
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((sev) => {
                const count = stats?.severity_distribution?.[String(sev)] || 0;
                const labels = ['Low', 'Minor', 'Mod', 'High', 'Crit'];
                const colors = ['bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
                return (
                  <div key={sev} className="text-center">
                    <div className={`w-full h-16 ${colors[sev - 1]}/15 rounded-lg flex items-end justify-center pb-1 border ${colors[sev - 1].replace('bg-', 'border-')}/20`}>
                      <span className="text-lg font-bold text-white">{count}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{labels[sev - 1]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <RecentReports reports={reports} loading={loading} />
    </div>
  );
}
