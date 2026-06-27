import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ATSScoreCard from '../components/ATSScoreCard';
import ChangesLog from '../components/ChangesLog';
import { downloadStructuredPdf, getPdfBlobUrl } from '../lib/pdf-generator';

export default function Results() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('preview');
  const [pdfUrl, setPdfUrl] = useState('');
  const [scoreView, setScoreView] = useState('after');
  const [copied, setCopied] = useState(false);
  const pdfRef = useRef(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('optimizeResult');
    if (!stored) { navigate('/optimize'); return; }
    try {
      const parsed = JSON.parse(stored);
      setResult(parsed);
      // Generate PDF preview blob URL
      if (parsed.structured) {
        const url = getPdfBlobUrl(parsed.structured);
        setPdfUrl(url);
      }
    } catch {
      navigate('/optimize');
    }
    return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
  }, [navigate]);

  if (!result) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
      </div>
    );
  }

  const before = result.score_before?.total_score || 0;
  const after = result.score_after?.total_score || 0;
  const improvement = after - before;
  const scoreData = scoreView === 'after' ? result.score_after : result.score_before;

  const handleDownload = () => {
    downloadStructuredPdf(result.structured || { name: 'Resume', optimized_text: result.optimized_text });
  };

  const handleShare = () => {
    const text = `I just improved my ATS resume score from ${before} → ${after} (+${improvement} points) using ATSBoost! 🚀`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ minHeight: '100vh', padding: '32px 0 80px' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>

        {/* ── Top bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '16px', marginBottom: '28px',
        }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', marginBottom: '4px' }}>
              ✅ Your Resume is Ready
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              AI has completely rewritten your resume. Download your polished PDF below.
            </p>
          </div>

          {/* Score improvement badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: 'rgba(0,212,170,0.1)',
            border: '1px solid rgba(0,212,170,0.3)',
            borderRadius: 'var(--radius-lg)', padding: '12px 20px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>BEFORE</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{before}</div>
            </div>
            <div style={{ fontSize: '1.4rem', color: 'var(--accent-primary)' }}>→</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>AFTER</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{after}</div>
            </div>
            <div style={{
              background: 'var(--accent-primary)', color: '#080c14',
              borderRadius: '999px', padding: '4px 12px',
              fontSize: '0.9rem', fontWeight: 800,
            }}>
              +{improvement}
            </div>
          </div>
        </div>

        {/* ── Main layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>

          {/* Left — PDF Preview + Tabs */}
          <div>
            {/* Tab bar */}
            <div className="tab-bar" style={{ marginBottom: '16px' }}>
              {[
                { id: 'preview', label: '📄 PDF Preview' },
                { id: 'original', label: '📋 Original' },
                { id: 'changes', label: `🔧 Changes (${result.changes?.length || 0})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* PDF Preview tab — primary */}
            {activeTab === 'preview' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Download bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px',
                  background: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border-secondary)',
                  flexWrap: 'wrap', gap: '10px',
                }}>
                  <div style={{ display: 'flex', align: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      📄 {result.structured?.name || 'Your Resume'} — ATS Optimized
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={handleShare}>
                      {copied ? '✓ Copied!' : '🔗 Share Score'}
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleDownload}>
                      ⬇ Download PDF
                    </button>
                  </div>
                </div>

                {/* PDF embed */}
                {pdfUrl ? (
                  <iframe
                    ref={pdfRef}
                    src={pdfUrl}
                    style={{
                      width: '100%',
                      height: '800px',
                      border: 'none',
                      display: 'block',
                      background: '#f5f5f5',
                    }}
                    title="Optimized Resume Preview"
                  />
                ) : (
                  <div style={{
                    height: '400px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexDirection: 'column', gap: '12px',
                    color: 'var(--text-muted)',
                  }}>
                    <div style={{ fontSize: '2rem' }}>📄</div>
                    <p>PDF preview not available — download to view</p>
                    <button className="btn btn-primary" onClick={handleDownload}>
                      ⬇ Download PDF
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Original tab */}
            {activeTab === 'original' && (
              <div className="card">
                <h3 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Original Resume</h3>
                <pre style={{
                  whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.82rem',
                  color: 'var(--text-secondary)', lineHeight: 1.7,
                  maxHeight: '700px', overflowY: 'auto',
                }}>
                  {result.original_text}
                </pre>
              </div>
            )}

            {/* Changes tab */}
            {activeTab === 'changes' && (
              <div>
                {result.changes?.length > 0 ? (
                  <ChangesLog
                    changes={result.changes}
                    keywordsAdded={result.keywords_added}
                    keywordsMissing={result.keywords_missing}
                  />
                ) : (
                  <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: 'var(--text-muted)' }}>No change log available.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right — Score + Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Score card */}
            <ATSScoreCard
              scoreBefore={result.score_before}
              scoreAfter={result.score_after}
              scoreView={scoreView}
              onToggle={() => setScoreView(v => v === 'after' ? 'before' : 'after')}
            />

            {/* Download CTA */}
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📥</div>
              <h3 style={{ marginBottom: '8px', fontSize: '1rem' }}>Your Resume is Ready</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Fully rewritten by AI, ATS-safe formatting, ready to submit.
              </p>
              <button className="btn btn-primary w-full" onClick={handleDownload} style={{ marginBottom: '10px' }}>
                ⬇ Download PDF
              </button>
              <button className="btn btn-ghost w-full btn-sm" onClick={handleShare}>
                {copied ? '✓ Copied to clipboard!' : '🔗 Share your score'}
              </button>
            </div>

            {/* What's next */}
            <div className="card">
              <h3 style={{ fontSize: '0.95rem', marginBottom: '14px' }}>What's Next?</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { icon: '🎯', label: 'Try a different job description', to: '/optimize', sameResume: true },
                  { icon: '📄', label: 'Optimize a different resume', to: '/optimize', sameResume: false },
                  { icon: '📚', label: 'Learn more ATS tips', to: '/' },
                ].map((item, i) => (
                  <Link
                    key={i}
                    to={item.to}
                    onClick={() => {
                      if (!item.sameResume) sessionStorage.removeItem('optimizeResult');
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 12px', borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-secondary)',
                      color: 'var(--text-primary)', textDecoration: 'none',
                      fontSize: '0.85rem', fontWeight: 500,
                      transition: 'all 0.2s',
                    }}
                    className="what-next-link"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Keywords missing */}
            {result.keywords_missing?.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--accent-warning)' }}>
                  ⚠ Keywords Still Missing
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  These were in the job description but not in your original resume. Only add them if you genuinely have this experience.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {result.keywords_missing.map((kw, i) => (
                    <span key={i} className="keyword-tag missing">{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
