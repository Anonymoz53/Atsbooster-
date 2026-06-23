import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ATSScoreCard from '../components/ATSScoreCard';
import ChangesLog from '../components/ChangesLog';
import { downloadPdf } from '../lib/pdf-generator';

export default function Results() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('original');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('optimizeResult');
    if (!stored) {
      navigate('/optimize');
      return;
    }
    try {
      setResult(JSON.parse(stored));
    } catch {
      navigate('/optimize');
    }
  }, [navigate]);

  const handleExportPdf = () => {
    setExportError('');
    setExporting(true);
    try {
      const firstLine = result.optimized_text.split('\n')[0].trim();
      const candidateName = firstLine.length < 60 ? firstLine : 'Candidate';
      downloadPdf(result.optimized_text, candidateName);
    } catch (err) {
      setExportError('PDF export failed. Please try again or copy the text manually.');
    } finally {
      setExporting(false);
    }
  };

  if (!result) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <p className="loading-text">Loading results...</p>
      </div>
    );
  }

  const improvement = result.score_after.total_score - result.score_before.total_score;

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 80px' }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: '36px', display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: '999px', padding: '6px 16px', fontSize: '0.8rem',
              color: 'var(--accent-success)', marginBottom: '12px', fontWeight: 600,
            }}>
              ✅ Optimization Complete
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', marginBottom: '8px' }}>
              Your Optimized Resume
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              ATS score improved by{' '}
              <span style={{ color: 'var(--accent-success)', fontWeight: 700 }}>
                {improvement > 0 ? `+${improvement}` : improvement} points
              </span>
              . Download your optimized resume as a PDF below.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={handleExportPdf}
              disabled={exporting}
            >
              {exporting ? (
                <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> Generating PDF...</>
              ) : (
                '⬇ Download PDF'
              )}
            </button>
            <Link to="/optimize" className="btn btn-outline">
              + Optimize Another
            </Link>
          </div>
        </div>

        {exportError && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            <span>⚠️</span><p>{exportError}</p>
          </div>
        )}

        {/* Main layout: Resume + Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>

          {/* Left: Resume Before/After */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Tabs */}
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === 'original' ? 'active' : ''}`}
                onClick={() => setActiveTab('original')}
              >
                📄 Original Resume
              </button>
              <button
                className={`tab-btn ${activeTab === 'optimized' ? 'active' : ''}`}
                onClick={() => setActiveTab('optimized')}
              >
                ⚡ Optimized Resume
              </button>
              <button
                className={`tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
                onClick={() => setActiveTab('compare')}
              >
                ↔ Side by Side
              </button>
            </div>

            {activeTab === 'original' && (
              <div className="card animate-fadeIn" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="diff-panel-header before" style={{ padding: '14px 20px' }}>
                  Original Resume
                </div>
                <div className="diff-panel-content" style={{ maxHeight: '70vh', padding: '20px' }}>
                  {result.original_text}
                </div>
              </div>
            )}

            {activeTab === 'optimized' && (
              <div className="card animate-fadeIn" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="diff-panel-header after" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Optimized Resume</span>
                  <button className="btn btn-primary btn-sm" onClick={handleExportPdf} disabled={exporting}>
                    {exporting ? 'Generating...' : '⬇ Download PDF'}
                  </button>
                </div>
                <div className="diff-panel-content" style={{ maxHeight: '70vh', padding: '20px' }}>
                  {result.optimized_text}
                </div>
              </div>
            )}

            {activeTab === 'compare' && (
              <div className="diff-container animate-fadeIn">
                <div className="diff-panel">
                  <div className="diff-panel-header before">Original</div>
                  <div className="diff-panel-content">{result.original_text}</div>
                </div>
                <div className="diff-panel">
                  <div className="diff-panel-header after">Optimized</div>
                  <div className="diff-panel-content">{result.optimized_text}</div>
                </div>
              </div>
            )}

            {/* Changes Log */}
            <ChangesLog
              changes={result.changes}
              summary={result.summary}
              keywordsAdded={result.keywords_added}
              keywordsMissing={result.keywords_missing}
            />
          </div>

          {/* Right Sidebar: Scores */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '80px' }}>
            <ATSScoreCard
              scoreBefore={result.score_before}
              scoreAfter={result.score_after}
            />

            {/* Quick tips */}
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>💡 Pro Tips</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none' }}>
                {[
                  'Submit the PDF — it preserves formatting and is readable by all ATS',
                  'Apply within 24–48 hours of posting for best visibility',
                  'Tailor a fresh optimization for each unique job description',
                  'Check LinkedIn for the ATS the company uses before applying',
                ].map((tip, i) => (
                  <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent-primary)', flexShrink: 0 }}>→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
