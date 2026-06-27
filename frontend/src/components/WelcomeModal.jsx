import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiKeyModal from './ApiKeyModal';
import { hasApiKey } from '../lib/api-key';

export default function WelcomeModal({ onDismiss }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = welcome, 2 = api key setup
  const [apiKeySaved, setApiKeySaved] = useState(hasApiKey());

  const handleGetStarted = () => {
    if (!apiKeySaved) {
      setStep(2);
    } else {
      onDismiss();
      navigate('/optimize');
    }
  };

  const handleApiKeySaved = () => {
    setApiKeySaved(true);
    onDismiss();
    navigate('/optimize');
  };

  if (step === 2) {
    return <ApiKeyModal onSaved={handleApiKeySaved} />;
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="modal-box welcome-modal">
        {/* Logo */}
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚡</div>
        <h2 className="modal-title" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
          Welcome to ATSBoost
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.6 }}>
          AI-powered resume optimization that helps you beat Applicant Tracking Systems —
          honestly, without fabricating a single word.
        </p>

        {/* How it works */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
          {[
            { icon: '📄', title: 'Upload your resume', desc: 'PDF or DOCX — we parse it in your browser' },
            { icon: '🤖', title: 'AI rewrites it', desc: 'Groq LLM optimizes keywords and structure for ATS' },
            { icon: '📊', title: 'See your score improve', desc: 'Get a before/after ATS score and download a clean PDF' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
              padding: '12px 16px', textAlign: 'left',
            }}>
              <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>{item.title}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Free tier notice */}
        <div style={{
          background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)',
          borderRadius: 'var(--radius-md)', padding: '10px 16px',
          fontSize: '0.82rem', color: 'var(--accent-primary)', marginBottom: '24px',
        }}>
          ✨ <strong>3 free optimizations</strong> — no credit card required. You'll need a free Groq API key to get started.
        </div>

        <button className="btn btn-primary btn-lg w-full" onClick={handleGetStarted}>
          {apiKeySaved ? 'Start Optimizing →' : 'Get Started — Add API Key →'}
        </button>

        <button
          className="btn btn-ghost w-full"
          style={{ marginTop: '10px', fontSize: '0.82rem' }}
          onClick={() => { onDismiss(); }}
        >
          Skip for now
        </button>

        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '16px', lineHeight: 1.5 }}>
          🔒 Everything runs in your browser. Your resume and API key are never sent to our servers.
        </p>
      </div>
    </div>
  );
}
