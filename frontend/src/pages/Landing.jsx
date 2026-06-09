import { Link } from 'react-router-dom';
import { getFreeRemaining } from '../lib/usage';

const ATS_PLATFORMS = [
  { name: 'Workday', share: '~35%', color: '#4b9cd3', tip: 'Parses standard sections well. Avoid headers/footers and tables.' },
  { name: 'Greenhouse', share: '~20%', color: '#3cb371', tip: 'Good at parsing modern resumes. Keep sections clearly labeled.' },
  { name: 'Taleo (Oracle)', share: '~18%', color: '#f04e23', tip: 'Older system — avoid special characters, use simple formatting.' },
  { name: 'iCIMS', share: '~12%', color: '#0061a8', tip: 'Keyword-heavy scoring. Dense skills section helps.' },
  { name: 'Lever', share: '~8%', color: '#5b00de', tip: 'Modern system, handles PDFs well. Natural language is fine.' },
];

const HOW_ATS_WORKS = [
  {
    icon: '📥',
    title: 'Document Parsing',
    desc: 'ATS software extracts text from your resume. PDFs with embedded text, simple DOCX files, and plain text work best. Scanned images, tables, and graphics are often unreadable.',
  },
  {
    icon: '🔍',
    title: 'Keyword Matching',
    desc: 'The system compares your resume against the job description using exact and semantic keyword matching. Missing key terms = lower score, even if you are qualified.',
  },
  {
    icon: '📊',
    title: 'Scoring & Ranking',
    desc: 'Resumes are ranked by match percentage. Hiring managers typically only review the top candidates. Most companies set a threshold (e.g. 70%) below which resumes are auto-rejected.',
  },
  {
    icon: '✅',
    title: 'Human Review',
    desc: 'Only resumes that pass ATS screening reach human eyes. This makes ATS optimization the critical first gate every job application must clear.',
  },
];

const DOS_DONTS = [
  { type: 'do', text: 'Use standard section headings (Work Experience, Education, Skills)' },
  { type: 'do', text: 'Submit as a simple, text-based PDF or DOCX' },
  { type: 'do', text: 'Include keywords from the job description naturally in context' },
  { type: 'do', text: 'Use bullet points for responsibilities and achievements' },
  { type: 'do', text: 'Spell out acronyms on first use (e.g., ML (Machine Learning))' },
  { type: 'dont', text: 'Use tables, multi-column layouts, or text boxes' },
  { type: 'dont', text: 'Include images, logos, charts, or infographics' },
  { type: 'dont', text: 'Use headers, footers, or content in margins' },
  { type: 'dont', text: 'Rely on fancy fonts or colored text for structure' },
  { type: 'dont', text: 'Keyword-stuff or use invisible white text' },
];

export default function Landing() {
  const remaining = getFreeRemaining();

  return (
    <div className="hero-bg">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ padding: '80px 0 60px', textAlign: 'center' }}>
        <div className="container">
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(0,212,170,0.08)', border: '1px solid var(--border-primary)',
              borderRadius: '999px', padding: '6px 16px', fontSize: '0.8rem',
              color: 'var(--accent-primary)', marginBottom: '24px', fontWeight: 600,
            }}
          >
            ⚡ AI-Powered ATS Optimizer &nbsp;·&nbsp; {remaining > 0 ? `${remaining} free uses remaining` : 'Pay-per-use'}
          </div>

          <h1 style={{ marginBottom: '20px' }}>
            Beat the ATS.<br />
            <span className="gradient-text">Land the Interview.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 36px',
            lineHeight: 1.7,
          }}>
            Upload your resume, paste the job description. Our AI rewrites and restructures
            your resume to maximize ATS match scores — without fabricating a single word.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/optimize" className="btn btn-primary btn-lg animate-pulse-glow">
              🚀 Optimize My Resume
            </Link>
            <a href="#how-it-works" className="btn btn-outline btn-lg">
              Learn How It Works
            </a>
          </div>

          <div style={{
            display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '48px',
            flexWrap: 'wrap',
          }}>
            {[
              ['75%', 'of resumes are filtered before humans see them'],
              ['3 Free', 'full optimizations to get you started'],
              ['100%', 'truthful — we only reformat your actual experience'],
            ].map(([stat, label]) => (
              <div key={stat} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'Outfit, sans-serif', fontWeight: 800,
                  fontSize: '2rem', color: 'var(--accent-primary)',
                }}>{stat}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '140px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How ATS Works ─────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2>How ATS Systems <span className="gradient-text">Actually Work</span></h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '12px', maxWidth: '500px', margin: '12px auto 0' }}>
              Understanding the machine that stands between your resume and a hiring manager.
            </p>
          </div>

          <div className="grid-2" style={{ gap: '20px' }}>
            {HOW_ATS_WORKS.map((item, i) => (
              <div key={i} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '48px', height: '48px', background: 'var(--accent-glow)',
                  border: '1px solid var(--border-primary)', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ATS Platforms ─────────────────────────────── */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2>Major <span className="gradient-text">ATS Platforms</span></h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>
              Different platforms have different quirks. ATSBoost optimizes for all of them.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ATS_PLATFORMS.map(p => (
              <div key={p.name} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: p.color, flexShrink: 0, boxShadow: `0 0 8px ${p.color}80`,
                }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{p.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '8px' }}>
                    Market share: {p.share}
                  </span>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>{p.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dos and Don'ts ────────────────────────────── */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2>ATS Resume <span className="gradient-text">Dos & Don'ts</span></h2>
          </div>

          <div className="grid-2">
            <div className="card">
              <h3 style={{ color: 'var(--accent-success)', marginBottom: '20px' }}>✅ Do This</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none' }}>
                {DOS_DONTS.filter(d => d.type === 'do').map((d, i) => (
                  <li key={i} style={{ display: 'flex', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--accent-success)', flexShrink: 0 }}>→</span>
                    {d.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h3 style={{ color: 'var(--accent-danger)', marginBottom: '20px' }}>❌ Avoid This</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none' }}>
                {DOS_DONTS.filter(d => d.type === 'dont').map((d, i) => (
                  <li key={i} style={{ display: 'flex', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--accent-danger)', flexShrink: 0 }}>✗</span>
                    {d.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section style={{ padding: '0 0 100px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(0,212,170,0.05), rgba(14,165,233,0.05))',
            border: '1px solid var(--border-primary)',
            padding: '60px 40px',
          }}>
            <h2 style={{ marginBottom: '12px' }}>
              Ready to pass the ATS?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1rem' }}>
              {remaining > 0
                ? `You have ${remaining} free optimization${remaining !== 1 ? 's' : ''} remaining. No signup required.`
                : 'Unlock more optimizations for just ₹500 per resume.'}
            </p>
            <Link to="/optimize" className="btn btn-primary btn-lg">
              🚀 Start Optimizing for Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
