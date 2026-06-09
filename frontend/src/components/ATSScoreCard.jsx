import { useEffect, useRef, useState } from 'react';

function ScoreRing({ score, max = 100, color, size = 120 }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const [displayScore, setDisplayScore] = useState(0);
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const target = Math.min(score, max);
    const targetOffset = circumference - (target / max) * circumference;
    setTimeout(() => {
      setOffset(targetOffset);
      // Animate number
      let start = 0;
      const step = target / 40;
      const interval = setInterval(() => {
        start = Math.min(start + step, target);
        setDisplayScore(Math.round(start));
        if (start >= target) clearInterval(interval);
      }, 25);
    }, 200);
  }, [score, max, circumference]);

  const grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'F';

  return (
    <div className="score-ring-container" style={{ width: size, height: size }}>
      <svg className="score-ring" width={size} height={size} viewBox="0 0 100 100">
        <circle className="score-ring-bg" cx="50" cy="50" r={radius} />
        <circle
          className="score-ring-fill"
          cx="50"
          cy="50"
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-center">
        <div className="score-number" style={{ color }}>{displayScore}</div>
        <div className="score-label">/ {max}</div>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, max, color }) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  return (
    <div style={{ marginBottom: '12px' }}>
      <div className="flex justify-between mb-4" style={{ fontSize: '0.8rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ color, fontWeight: 600 }}>{score}/{max}</span>
      </div>
      <div className="score-bar">
        <div
          className="score-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function ATSScoreCard({ scoreBefore, scoreAfter }) {
  const [view, setView] = useState('after');
  const score = view === 'before' ? scoreBefore : scoreAfter;
  const improvement = scoreAfter.total_score - scoreBefore.total_score;

  const gradeColor = (s) => {
    if (s >= 85) return 'var(--accent-success)';
    if (s >= 70) return 'var(--accent-primary)';
    if (s >= 55) return 'var(--accent-warning)';
    return 'var(--accent-danger)';
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-16">
        <h3>🎯 ATS Match Score</h3>
        {improvement > 0 && (
          <div style={{
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.3)',
            color: 'var(--accent-success)',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}>
            +{improvement} pts improvement
          </div>
        )}
      </div>

      {/* Before / After Toggle */}
      <div className="tabs mb-24">
        <button
          className={`tab-btn ${view === 'before' ? 'active' : ''}`}
          onClick={() => setView('before')}
        >
          Before
        </button>
        <button
          className={`tab-btn ${view === 'after' ? 'active' : ''}`}
          onClick={() => setView('after')}
        >
          After
        </button>
      </div>

      {/* Main score display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '28px' }}>
        <ScoreRing
          score={score.total_score}
          max={score.max_score}
          color={gradeColor(score.total_score)}
          size={130}
        />
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '2.5rem',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 800,
            color: gradeColor(score.total_score),
            lineHeight: 1,
            marginBottom: '4px',
          }}>
            Grade: {score.grade}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {score.total_score >= 70
              ? 'Good ATS compatibility. Likely to pass screening.'
              : score.total_score >= 50
              ? 'Fair. Some improvements still possible.'
              : 'Poor ATS compatibility. Significant optimization needed.'}
          </p>
        </div>
      </div>

      {/* Sub-score bars */}
      <div className="section-divider">Score Breakdown</div>
      <div style={{ marginTop: '16px' }}>
        <ScoreBar
          label="Keyword Match"
          score={score.breakdown.keyword_match.score}
          max={score.breakdown.keyword_match.max}
          color="var(--accent-primary)"
        />
        <ScoreBar
          label="Section Structure"
          score={score.breakdown.section_structure.score}
          max={score.breakdown.section_structure.max}
          color="var(--accent-secondary)"
        />
        <ScoreBar
          label="Formatting"
          score={score.breakdown.formatting.score}
          max={score.breakdown.formatting.max}
          color="#a78bfa"
        />
        <ScoreBar
          label="Length & Depth"
          score={score.breakdown.length.score}
          max={score.breakdown.length.max}
          color="var(--accent-warning)"
        />
      </div>

      {/* Detected sections */}
      {score.breakdown.section_structure.detected_sections?.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Detected Sections
          </p>
          <div className="keyword-tags">
            {score.breakdown.section_structure.detected_sections.map(s => (
              <span key={s} className="keyword-tag added">✓ {s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
