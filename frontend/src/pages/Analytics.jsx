import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../api/client';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9'];

export default function Analytics({ admin }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/stats', {
          params: admin.role === 'district_admin' ? { district_id: admin.district_id } : {},
        });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [admin]);

  const crimeTypeData = stats?.crime_type_distribution 
    ? Object.entries(stats.crime_type_distribution).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value)
    : [];

  const severityData = stats?.severity_distribution
    ? Object.entries(stats.severity_distribution).map(([sev, val]) => ({
        name: `Severity ${sev}`,
        value: val,
        raw: sev
      }))
    : [];

  const severityColors = ['#22c55e', '#3b82f6', '#eab308', '#f97316', '#ef4444'];

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title">Advanced Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">
          {admin.role === 'super_admin' ? 'State-wide crime pattern analysis' : 'District-level crime pattern analysis'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crime Type Frequencies Bar Chart */}
        <div className="glass-card p-6">
          <h3 className="section-title mb-6">Incidents by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crimeTypeData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {crimeTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Breakdown Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="section-title mb-6">Severity Distribution</h3>
          <div className="h-80 flex items-center justify-center">
            {severityData.length > 0 && severityData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={severityColors[parseInt(entry.raw) - 1]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500">No severity data available</p>
            )}
          </div>
        </div>

        {/* Actionable Insights Panel */}
        <div className="lg:col-span-2 glass-card p-6 bg-gradient-to-r from-blue-900/10 to-transparent">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Generated Insights
          </h3>
          <ul className="space-y-4 text-sm text-slate-300">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 font-bold">1</span>
              <p>Top prevalent crime: <span className="text-white font-medium">{crimeTypeData.length > 0 ? crimeTypeData[0].name : 'N/A'}</span> accounts for the majority of reported incidents in the region.</p>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 font-bold">2</span>
              <p>Active DBSCAN Hotspots: <span className="text-white font-medium">{stats?.active_hotspots || 0}</span> significant clusters of criminal activity detected requiring immediate patrol augmentation.</p>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 font-bold">3</span>
              <p>Severity Trend: Highest concentration found in Severity Level <span className="text-white font-medium">{severityData.sort((a,b)=>b.value - a.value)[0]?.raw || 'N/A'}</span>.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
