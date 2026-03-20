export default function StatsCards({ stats, loading }) {
  const cards = [
    {
      label: 'Total Reports',
      value: stats?.total_reports ?? '—',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      bgGlow: 'bg-blue-500/10',
    },
    {
      label: 'Active Hotspots',
      value: stats?.active_hotspots ?? '—',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'from-amber-500 to-orange-600',
      bgGlow: 'bg-amber-500/10',
    },
    {
      label: "Today's Alerts",
      value: stats?.today_alerts ?? '—',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      color: 'from-red-500 to-rose-600',
      bgGlow: 'bg-red-500/10',
    },
    {
      label: 'Districts Covered',
      value: stats?.districts_covered ?? '—',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-emerald-500 to-green-600',
      bgGlow: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="stat-card animate-fade-in"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.label}</p>
              <p className="text-3xl font-bold text-white mt-1">
                {loading ? (
                  <span className="inline-block w-12 h-8 bg-slate-700 rounded animate-pulse"></span>
                ) : (
                  card.value
                )}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl ${card.bgGlow} flex items-center justify-center`}>
              <div className={`bg-gradient-to-br ${card.color} bg-clip-text text-transparent`}>
                {card.icon}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
