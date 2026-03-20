import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CitizenLogin({ onLogin }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Please provide your name and phone number to continue.');
      return;
    }
    if (phone.length < 10) {
      setError('Please provide a valid phone number.');
      return;
    }

    const citizenData = { name, phone };
    onLogin(citizenData);
    navigate('/report');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      <div className="absolute top-0 right-0 p-6">
        <button onClick={() => navigate('/')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2">
          ← Back
        </button>
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Citizen Portal</h1>
          <p className="text-sm text-slate-400 mt-1">Provide your details to securely report an incident.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="input-field"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button type="submit" className="w-full btn-primary py-3 text-sm">
            Continue to Report
          </button>
          
          <div className="mt-4 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10 flex gap-3 text-left">
            <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your details are required for verification purposes. False reporting may result in legal consequences. Your identity will be kept strictly confidential by law enforcement.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
