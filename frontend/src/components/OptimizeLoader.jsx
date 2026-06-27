import { useState, useEffect } from 'react';

const STEPS = [
  { id: 1, label: 'Parsing your resume...', duration: 2000 },
  { id: 2, label: 'Scoring original resume against job description...', duration: 2500 },
  { id: 3, label: 'AI rewriting with Groq LLM — this is the magic ✨', duration: 30000 },
  { id: 4, label: 'Scoring optimized resume...', duration: 1500 },
  { id: 5, label: 'Preparing your results...', duration: 1000 },
];

export default function OptimizeLoader({ currentStep = 1 }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 20px',
    }}>
      <div style={{ maxWidth: '520px', width: '100%' }}>
        {/* Main spinner */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '72px', height: '72px', margin: '0 auto 20px',
            borderRadius: '50%',
            border: '3px solid var(--border-primary)',
            borderTopColor: 'var(--accent-primary)',
            animation: 'spin 1s linear infinite',
          }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>Optimizing Your Resume</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Usually takes 20–40 seconds · {elapsed}s elapsed
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {STEPS.map((step, i) => {
            const stepNum = i + 1;
            const isDone = currentStep > stepNum;
            const isActive = currentStep === stepNum;
            const isPending = currentStep < stepNum;

            return (
              <div key={step.id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: isActive
                  ? 'rgba(0,212,170,0.08)'
                  : isDone
                    ? 'rgba(0,212,170,0.04)'
                    : 'var(--bg-secondary)',
                border: `1px solid ${isActive ? 'rgba(0,212,170,0.3)' : 'var(--border-secondary)'}`,
                transition: 'all 0.4s ease',
                opacity: isPending ? 0.45 : 1,
              }}>
                {/* Icon */}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isDone
                    ? 'var(--accent-primary)'
                    : isActive
                      ? 'rgba(0,212,170,0.15)'
                      : 'var(--bg-tertiary)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: isDone ? '#080c14' : isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                }}>
                  {isDone ? '✓' : isActive ? (
                    <div style={{
                      width: '12px', height: '12px',
                      border: '2px solid var(--accent-primary)',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                  ) : stepNum}
                </div>

                <span style={{
                  fontSize: '0.88rem',
                  color: isDone
                    ? 'var(--accent-primary)'
                    : isActive
                      ? 'var(--text-primary)'
                      : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 400,
                }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <p style={{
          textAlign: 'center', marginTop: '24px',
          fontSize: '0.78rem', color: 'var(--text-muted)',
        }}>
          💡 Did you know? 75% of resumes are rejected by ATS before a human ever sees them.
        </p>
      </div>
    </div>
  );
}
