import { useState } from 'react';

export default function EmergencyContacts() {
  const [isOpen, setIsOpen] = useState(false);

  const contacts = [
    { name: 'National Emergency', number: '112', icon: '🚨', color: 'text-red-400', bg: 'bg-red-500/10' },
    { name: 'Police', number: '100', icon: '🚓', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { name: 'Fire Force', number: '101', icon: '🔥', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { name: 'Ambulance', number: '102', icon: '🚑', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'Women Helpline', number: '1091', icon: '🛡️', color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { name: 'Highway Rescue', number: '1033', icon: '🛣️', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="fixed top-6 right-6 z-[9999] font-sans">
      <div 
        className="relative"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {/* Toggle Button */}
        <button 
          className="flex items-center gap-2 bg-glassy-navy backdrop-blur-md border border-white/10 shadow-lg px-4 py-2.5 rounded-full hover:bg-slate-800/80 transition-colors focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-sm font-semibold text-slate-200">Emergency Numbers</span>
        </button>

        {/* Dropdown Menu */}
        <div 
          className={`absolute right-0 mt-3 w-64 bg-glassy-navy backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 origin-top-right overflow-hidden ${
            isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
          }`}
        >
          <div className="p-3 bg-red-500/10 border-b border-white/5">
            <p className="text-xs font-bold text-red-400 uppercase tracking-wider text-center">
              India Emergency Hotlines
            </p>
          </div>
          <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto">
            {contacts.map((contact, i) => (
              <a 
                key={i} 
                href={`tel:${contact.number}`}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${contact.bg} ${contact.color}`}>
                    {contact.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                      {contact.name}
                    </h4>
                  </div>
                </div>
                <span className={`text-sm font-bold tracking-wider ${contact.color}`}>
                  {contact.number}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
