import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import PaywallModal from '../components/PaywallModal';
import ApiKeyModal from '../components/ApiKeyModal';
import OptimizeLoader from '../components/OptimizeLoader';
import { optimizeResume } from '../lib/api';
import { isPaywalled, incrementUsage, getFreeRemaining } from '../lib/usage';
import { hasApiKey } from '../lib/api-key';
import { extractTextFromFile } from '../lib/file-parser';
import { computeAtsScore } from '../lib/ats-scorer';
import { callGroqOptimize } from '../lib/groq';

const ATS_PLATFORMS = [
  'General ATS', 'Workday', 'Greenhouse', 'Taleo (Oracle)',
  'iCIMS', 'Lever', 'BambooHR', 'SmartRecruiters', 'Jobvite',
];

const FRIENDLY_ERRORS = {
  'Invalid Groq API key': { msg: 'Your API key seems invalid.', action: 'Update API Key', actionType: 'apikey' },
  'rate limit': { msg: 'Groq rate limit hit — wait 30 seconds and try again.', action: 'Try Again', actionType: 'retry' },
  'No Groq API key': { msg: 'You need a Groq API key to use ATSBoost.', action: 'Add API Key', actionType: 'apikey' },
  'Could not extract text': { msg: 'We couldn\'t read your file. Try a different PDF — make sure it\'s text-based, not a scan.', action: null, actionType: null },
  'too short': { msg: 'Please paste the full job description — not just the title.', action: null, actionType: null },
};

function getFriendlyError(rawError) {
  for (const [key, val] of Object.entries(FRIENDLY_ERRORS)) {
    if (rawError.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return { msg: rawError, action: null, actionType: null };
}

export default function Optimize() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [targetAts, setTargetAts] = useState('General ATS');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [error, setError] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const remaining = getFreeRemaining();

  // Compute active step for progress bar
  const progressStep = file ? (jobDescription.trim().length >= 50 ? 3 : 2) : 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!hasApiKey()) { setShowApiKeyModal(true); return; }
    if (isPaywalled()) { setShowPaywall(true); return; }
    if (!file) { setError('Please upload your resume file.'); return; }
    if (jobDescription.trim().length < 50) {
      setError('Please paste the full job description (at least 50 characters).'); return;
    }

    setLoading(true);
    setLoadingStep(1);

    try {
      // Step 1: Parse
      setLoadingStep(1);
      const originalText = await extractTextFromFile(file);

      // Step 2: Score before
      setLoadingStep(2);
      const scoreBefore = computeAtsScore(originalText, jobDescription);

      // Step 3: LLM
      setLoadingStep(3);
      const llmResult = await callGroqOptimize(originalText, jobDescription, targetAts);
      const optimizedText = llmResult.optimized_resume || '';

      // Step 4: Score after
      setLoadingStep(4);
      const scoreAfter = computeAtsScore(optimizedText, jobDescription);

      // Step 5: Package & navigate
      setLoadingStep(5);
      incrementUsage();
      const result = {
        original_text: originalText,
        optimized_text: optimizedText,
        summary: llmResult.summary || '',
        changes: llmResult.changes || [],
        keywords_added: llmResult.keywords_added || [],
        keywords_missing: llmResult.keywords_missing || [],
        score_before: scoreBefore,
        score_after: scoreAfter,
      };
      sessionStorage.setItem('optimizeResult', JSON.stringify(result));
      navigate('/results');
    } catch (err) {
      const { msg } = getFriendlyError(err.message || '');
      setError(msg || err.message);
    } finally {
      setLoading(false);
      setLoadingStep(1);
    }
  };

  if (loading) return <OptimizeLoader currentStep={loadingStep} />;

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 80px' }}>
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      {showApiKeyModal && <ApiKeyModal onSaved={() => setShowApiKeyModal(false)} />}

      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', marginBottom: '10px' }}>
            Optimize Your Resume
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Upload your resume and paste the job description — our AI handles the rest.
          </p>
        </div>

        {/* ── Step Progress Bar ── */}
        <div className="step-progress" style={{ marginBottom: '32px' }}>
          {[
            { n: 1, label: 'Upload Resume' },
            { n: 2, label: 'Add Job Description' },
            { n: 3, label: 'Optimize' },
          ].map(({ n, label }, i) => {
            const done = progressStep > n;
            const active = progressStep === n;
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.85rem',
                    background: done
                      ? 'var(--accent-primary)'
                      : active
                        ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                        : 'var(--bg-tertiary)',
                    color: done || active ? '#080c14' : 'var(--text-muted)',
                    border: active ? 'none' : done ? 'none' : '2px solid var(--border-secondary)',
                    transition: 'all 0.3s ease',
                    boxShadow: active ? '0 0 16px rgba(0,212,170,0.4)' : 'none',
                  }}>
                    {done ? '✓' : n}
                  </div>
                  <span style={{
                    fontSize: '0.72rem', marginTop: '6px', textAlign: 'center',
                    color: active ? 'var(--accent-primary)' : done ? 'var(--text-secondary)' : 'var(--text-muted)',
                    fontWeight: active ? 600 : 400,
                  }}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div style={{
                    height: '2px', flex: 1, margin: '0 4px', marginBottom: '22px',
                    background: progressStep > n ? 'var(--accent-primary)' : 'var(--border-secondary)',
                    transition: 'background 0.3s ease',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Free uses badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '28px',
          background: remaining > 0 ? 'rgba(0,212,170,0.08)' : 'rgba(244,63,94,0.08)',
          border: `1px solid ${remaining > 0 ? 'var(--border-primary)' : 'rgba(244,63,94,0.25)'}`,
          borderRadius: '999px', padding: '6px 16px', fontSize: '0.85rem',
          color: remaining > 0 ? 'var(--accent-primary)' : 'var(--accent-danger)',
        }}>
          {remaining > 0
            ? `✨ ${remaining} free optimization${remaining !== 1 ? 's' : ''} remaining`
            : '🔒 No free uses left — ₹500/resume'}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Step 1: Upload */}
          <div className={`card step-card ${progressStep >= 1 ? 'step-active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div className="step-badge">1</div>
              <div>
                <h3 style={{ marginBottom: '2px' }}>Upload Your Resume</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PDF or DOCX — parsed securely in your browser</p>
              </div>
              {file && <span style={{ marginLeft: 'auto', color: 'var(--accent-primary)', fontSize: '1.2rem' }}>✓</span>}
            </div>
            <FileUploader onFileSelected={setFile} />
          </div>

          {/* Step 2: Job Description */}
          <div className={`card step-card ${progressStep >= 2 ? 'step-active' : ''}`} style={{ opacity: progressStep < 2 ? 0.6 : 1, transition: 'opacity 0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div className="step-badge">2</div>
              <div>
                <h3 style={{ marginBottom: '2px' }}>Paste Job Description</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>The more detail you paste, the better the keyword matching</p>
              </div>
              {jobDescription.trim().length >= 50 && <span style={{ marginLeft: 'auto', color: 'var(--accent-primary)', fontSize: '1.2rem' }}>✓</span>}
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="targetAts">Target ATS Platform</label>
              <select id="targetAts" className="form-select" value={targetAts} onChange={e => setTargetAts(e.target.value)}>
                {ATS_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="jobDesc">Job Description</label>
              <textarea
                id="jobDesc" className="form-textarea"
                placeholder="Paste the full job description here — including requirements, responsibilities, and qualifications..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                style={{ minHeight: '200px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {jobDescription.length} characters {jobDescription.trim().length < 50 ? '— minimum 50 required' : '✓'}
                </p>
                {/* Character progress bar */}
                <div style={{ width: '100px', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', alignSelf: 'center' }}>
                  <div style={{
                    height: '100%', borderRadius: '2px',
                    width: `${Math.min(100, (jobDescription.trim().length / 50) * 100)}%`,
                    background: jobDescription.trim().length >= 50 ? 'var(--accent-primary)' : 'var(--accent-warning)',
                    transition: 'width 0.2s ease',
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-error" style={{ alignItems: 'flex-start' }}>
              <span>⚠️</span>
              <div>
                <p>{error}</p>
                {error.toLowerCase().includes('api key') && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: '8px', fontSize: '0.8rem', padding: '4px 12px' }}
                    onClick={() => setShowApiKeyModal(true)}
                  >
                    Update API Key →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Ethics notice */}
          <div className="alert alert-info">
            <span>🛡️</span>
            <p style={{ fontSize: '0.85rem' }}>
              <strong>Ethical Promise:</strong> ATSBoost only rephrases and restructures your existing experience — never adds fabricated skills or achievements.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading || progressStep < 2}
            style={{ opacity: progressStep < 2 ? 0.5 : 1, transition: 'opacity 0.3s' }}
          >
            ⚡ Optimize My Resume
            {remaining > 0
              ? ` (${remaining} free use${remaining !== 1 ? 's' : ''} left)`
              : ' — ₹500'}
          </button>
        </form>
      </div>
    </div>
  );
}
