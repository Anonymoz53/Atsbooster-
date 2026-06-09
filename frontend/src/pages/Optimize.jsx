import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import PaywallModal from '../components/PaywallModal';
import { optimizeResume } from '../lib/api';
import { isPaywalled, incrementUsage, getFreeRemaining } from '../lib/usage';

const ATS_PLATFORMS = [
  'General ATS',
  'Workday',
  'Greenhouse',
  'Taleo (Oracle)',
  'iCIMS',
  'Lever',
  'BambooHR',
  'SmartRecruiters',
  'Jobvite',
];

export default function Optimize() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [targetAts, setTargetAts] = useState('General ATS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);

  const remaining = getFreeRemaining();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isPaywalled()) {
      setShowPaywall(true);
      return;
    }

    if (!file) {
      setError('Please upload your resume file.');
      return;
    }
    if (jobDescription.trim().length < 50) {
      setError('Please paste the full job description (at least 50 characters).');
      return;
    }

    setLoading(true);
    try {
      const result = await optimizeResume(file, jobDescription, targetAts);
      incrementUsage();
      // Pass result via sessionStorage to avoid URL params
      sessionStorage.setItem('optimizeResult', JSON.stringify(result));
      navigate('/results');
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Something went wrong. Make sure the backend is running.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 80px' }}>
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}

      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', marginBottom: '10px' }}>
            Optimize Your Resume
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Upload your resume and paste the job description — our AI handles the rest.
          </p>

          {/* Usage counter */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            marginTop: '16px',
            background: remaining > 0 ? 'rgba(0,212,170,0.08)' : 'rgba(244,63,94,0.08)',
            border: `1px solid ${remaining > 0 ? 'var(--border-primary)' : 'rgba(244,63,94,0.25)'}`,
            borderRadius: '999px', padding: '6px 16px',
            fontSize: '0.85rem',
            color: remaining > 0 ? 'var(--accent-primary)' : 'var(--accent-danger)',
          }}>
            {remaining > 0
              ? `✨ ${remaining} free optimization${remaining !== 1 ? 's' : ''} remaining`
              : '🔒 No free uses left — ₹500/resume'}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Step 1: Upload */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '28px', height: '28px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#080c14', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0,
              }}>1</div>
              <h3>Upload Your Resume</h3>
            </div>
            <FileUploader onFileSelected={setFile} />
          </div>

          {/* Step 2: Job Description */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '28px', height: '28px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#080c14', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0,
              }}>2</div>
              <h3>Paste the Job Description</h3>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" htmlFor="targetAts">Target ATS Platform</label>
              <select
                id="targetAts"
                className="form-select"
                value={targetAts}
                onChange={e => setTargetAts(e.target.value)}
              >
                {ATS_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Check the company's careers page or LinkedIn job posting for platform clues.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="jobDesc">Job Description</label>
              <textarea
                id="jobDesc"
                className="form-textarea"
                placeholder="Paste the full job description here — including requirements, responsibilities, and qualifications. The more detail, the better the keyword matching."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                style={{ minHeight: '220px' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {jobDescription.length} characters {jobDescription.length < 50 ? '(minimum 50 required)' : ''}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* Ethics notice */}
          <div className="alert alert-info">
            <span>🛡️</span>
            <p style={{ fontSize: '0.85rem' }}>
              <strong>Ethical Promise:</strong> ATSBoost will only rephrase and restructure
              your existing experience. We never add fabricated skills, titles, or achievements.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                Analyzing with AI — this may take 30–60 seconds...
              </>
            ) : (
              <>
                ⚡ Optimize My Resume
                {remaining > 0
                  ? ` (${remaining} free use${remaining !== 1 ? 's' : ''} left)`
                  : ' — ₹500'}
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
