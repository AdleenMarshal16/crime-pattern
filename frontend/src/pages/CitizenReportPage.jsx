import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const CRIME_TYPES = [
  'Theft', 'Assault', 'Robbery', 'Burglary', 'Cybercrime',
  'Drug Offense', 'Murder', 'Kidnapping', 'Fraud', 'Vandalism',
  'Domestic Violence', 'Chain Snatching', 'Eve Teasing', 'Arms Act Violation',
];

export default function CitizenReportPage({ citizen, onLogout }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    crime_type: 'Theft',
    description: '',
    severity: 3,
    latitude: '',
    longitude: '',
  });
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [assignedDistrict, setAssignedDistrict] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Validate coordinates
      const lat = parseFloat(form.latitude);
      const lng = parseFloat(form.longitude);
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Please enter valid coordinates');
      }

      // Submit report
      const reportRes = await api.post('/reports', {
        crime_type: form.crime_type,
        description: form.description,
        severity: parseInt(form.severity),
        latitude: lat,
        longitude: lng,
        reported_by: citizen ? `${citizen.name} (${citizen.phone})` : 'anonymous',
      });

      setAssignedDistrict(reportRes.data.district_name || 'Unassigned');

      // Upload evidence if provided
      if (evidenceFile) {
        const formData = new FormData();
        formData.append('file', evidenceFile);
        await api.post(`/evidence/upload?report_id=${reportRes.data.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 p-6 flex flex-col items-center pt-20">
        <div className="glass-card p-10 text-center animate-fade-in max-w-lg w-full">
          <div className="w-20 h-20 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Report Successfully Filed</h2>
          <p className="text-sm text-slate-400 mb-2">
            Thank you for keeping the community safe. Your report has been auto-routed to:
          </p>
          <p className="text-xl font-bold text-blue-400 mb-8">{assignedDistrict} District Authority</p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { 
                setSuccess(false); 
                setForm({ crime_type: 'Theft', description: '', severity: 3, latitude: '', longitude: '' }); 
                setEvidenceFile(null); 
              }}
              className="btn-primary text-sm"
            >
              Report Another Incident
            </button>
            <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-white transition-colors py-2">
              Sign Out & Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative">
      {/* Header */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Secure Report</h1>
            <p className="text-xs text-slate-400 font-medium">Citizen Portal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400 hidden sm:inline-block">
            Logged in as <span className="text-white font-medium">{citizen?.name}</span>
          </span>
          <button onClick={handleLogout} className="btn-secondary py-2 text-xs">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Form Area */}
      <div className="pt-28 pb-12 px-6 max-w-3xl mx-auto">
        <div className="mb-8 text-center animate-fade-in">
          <h2 className="text-3xl font-bold text-white mb-2">File an Incident Report</h2>
          <p className="text-slate-400">Provide as much detail as possible. Attach visual evidence if available safely.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6 animate-fade-in shadow-xl">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Crime Type */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Type of Incident
              </label>
              <select
                name="crime_type"
                value={form.crime_type}
                onChange={handleChange}
                className="input-field py-3"
              >
                {CRIME_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Detailed Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="What happened? When did it happen? Any identifying details of individuals or vehicles involved?"
                className="input-field resize-none py-3"
              />
            </div>

            {/* Severity */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Perceived Severity: <span className={`ml-1 font-bold ${
                  form.severity <= 2 ? 'text-green-400' : form.severity <= 3 ? 'text-yellow-400' : 'text-red-400'
                }`}>{form.severity}/5</span>
              </label>
              <div className="px-1 py-4">
                <input
                  type="range"
                  name="severity"
                  min="1"
                  max="5"
                  value={form.severity}
                  onChange={handleChange}
                  className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-medium text-slate-500 mt-3 pt-1 border-t border-slate-700/50">
                  <span>Non-Urgent</span>
                  <span>Minor</span>
                  <span>Moderate</span>
                  <span>Urgent</span>
                  <span>Critical Emergency</span>
                </div>
              </div>
            </div>

            {/* Coordinates */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Latitude (e.g. 9.90)
              </label>
              <input
                type="number"
                name="latitude"
                step="0.000001"
                value={form.latitude}
                onChange={handleChange}
                placeholder="9.9015"
                className="input-field py-3"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Longitude (e.g. 76.50)
              </label>
              <input
                type="number"
                name="longitude"
                step="0.000001"
                value={form.longitude}
                onChange={handleChange}
                placeholder="76.5020"
                className="input-field py-3"
                required
              />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, latitude: '9.90', longitude: '76.50' }))}
                className="text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors mt-2"
              >
                📍 Auto-fill Piravom Demo Coordinates
              </button>
            </div>

            {/* Evidence Upload */}
            <div className="sm:col-span-2 mt-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Upload Photo/Video Evidence (Optional)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-200"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                {evidenceFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-200 truncate max-w-[200px] sm:max-w-xs">{evidenceFile.name}</p>
                      <p className="text-xs text-slate-500">
                        {(evidenceFile.size / (1024 * 1024)).toFixed(2)} MB • Secure Upload
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <svg className="w-10 h-10 text-slate-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm font-medium text-slate-300">Tap or click to attach files</p>
                    <p className="text-xs text-slate-500 mt-1">Files are hashed (SHA-256) for legal integrity</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-700/50">
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary py-4 text-base shadow-xl"
            >
              {submitting ? 'Authenticating & Submitting...' : 'Submit Incident Report Confidentially'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
