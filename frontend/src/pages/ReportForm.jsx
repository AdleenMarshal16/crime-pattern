import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const CRIME_TYPES = [
  'Theft', 'Assault', 'Robbery', 'Burglary', 'Cybercrime',
  'Drug Offense', 'Murder', 'Kidnapping', 'Fraud', 'Vandalism',
  'Domestic Violence', 'Chain Snatching', 'Eve Teasing', 'Arms Act Violation',
];

export default function ReportForm({ admin }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    crime_type: 'Theft',
    description: '',
    severity: 3,
    latitude: '',
    longitude: '',
    reported_by: '',
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
        reported_by: form.reported_by || 'anonymous',
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
      <div className="p-6 max-w-2xl mx-auto">
        <div className="glass-card p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Report Submitted Successfully</h2>
          <p className="text-sm text-slate-400 mb-1">
            Crime report has been filed and auto-routed to:
          </p>
          <p className="text-lg font-semibold text-blue-400 mb-6">{assignedDistrict} District</p>
          {evidenceFile && (
            <p className="text-xs text-slate-500 mb-4">
              📎 Evidence file hashed (SHA-256) and stored securely
            </p>
          )}
          <div className="flex justify-center gap-3">
            <button
              onClick={() => { setSuccess(false); setForm({ crime_type: 'Theft', description: '', severity: 3, latitude: '', longitude: '', reported_by: '' }); setEvidenceFile(null); }}
              className="btn-secondary text-sm"
            >
              Submit Another
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title">Submit Crime Report</h1>
        <p className="text-sm text-slate-400 mt-1">
          Enter incident details. The system will auto-route to the appropriate district.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5 animate-fade-in">
        {/* Crime Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Crime Type
          </label>
          <select
            name="crime_type"
            value={form.crime_type}
            onChange={handleChange}
            className="input-field"
          >
            {CRIME_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Brief description of the incident..."
            className="input-field resize-none"
          />
        </div>

        {/* Severity */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Severity: <span className={`ml-1 ${
              form.severity <= 2 ? 'text-green-400' : form.severity <= 3 ? 'text-yellow-400' : 'text-red-400'
            }`}>{form.severity}/5</span>
          </label>
          <input
            type="range"
            name="severity"
            min="1"
            max="5"
            value={form.severity}
            onChange={handleChange}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Low</span>
            <span>Minor</span>
            <span>Moderate</span>
            <span>High</span>
            <span>Critical</span>
          </div>
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Latitude
            </label>
            <input
              type="number"
              name="latitude"
              step="0.000001"
              value={form.latitude}
              onChange={handleChange}
              placeholder="e.g. 9.90"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Longitude
            </label>
            <input
              type="number"
              name="longitude"
              step="0.000001"
              value={form.longitude}
              onChange={handleChange}
              placeholder="e.g. 76.50"
              className="input-field"
              required
            />
          </div>
        </div>

        {/* Quick fill for Piravom test */}
        <button
          type="button"
          onClick={() => setForm((prev) => ({ ...prev, latitude: '9.90', longitude: '76.50' }))}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          📍 Quick fill: Piravom, Ernakulam (9.90, 76.50)
        </button>

        {/* Reported By */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Reported By
          </label>
          <input
            type="text"
            name="reported_by"
            value={form.reported_by}
            onChange={handleChange}
            placeholder="Name or anonymous"
            className="input-field"
          />
        </div>

        {/* Evidence Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Evidence (Photo/Video)
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-200"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            {evidenceFile ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-slate-300">{evidenceFile.name}</span>
                <span className="text-xs text-slate-500">
                  ({(evidenceFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 text-slate-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-slate-400">Click to upload evidence</p>
                <p className="text-xs text-slate-500 mt-1">Files will be SHA-256 hashed for integrity</p>
              </>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-primary py-3 text-sm"
        >
          {submitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
