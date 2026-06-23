import { useState } from 'react';
import { setApiKey, getApiKey, clearApiKey } from '../lib/api-key';

export default function ApiKeyModal({ onSaved, isUpdate = false }) {
  const [key, setKey] = useState(isUpdate ? getApiKey() : '');
  const [error, setError] = useState('');
  const [testing, setTesting] = useState(false);

  const handleSave = async () => {
    const trimmed = key.trim();
    if (!trimmed.startsWith('gsk_')) {
      setError('Groq API keys start with "gsk_". Please check your key.');
      return;
    }
    setError('');
    setTesting(true);

    // Quick validation — test the key with a tiny request
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${trimmed}` },
      });
      if (!res.ok) {
        setError('Invalid API key — could not authenticate with Groq.');
        setTesting(false);
        return;
      }
    } catch {
      setError('Could not reach Groq API. Check your internet connection.');
      setTesting(false);
      return;
    }

    setApiKey(trimmed);
    setTesting(false);
    onSaved();
  };

  const handleClear = () => {
    clearApiKey();
    setKey('');
    onSaved();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: '520px' }}>
        <span className="modal-icon">🔑</span>
        <h2 className="modal-title" style={{ marginBottom: '8px' }}>
          {isUpdate ? 'Update API Key' : 'Enter Your Groq API Key'}
        </h2>
        <p className="modal-desc">
          ATSBoost uses the <strong>Groq AI API</strong> to optimize your resume. Your key is saved
          only in your browser — never sent to any server.
        </p>

        {/* How to get a key */}
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
          padding: '14px 16px', marginBottom: '20px', textAlign: 'left',
        }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '8px' }}>
            Get a free key in 2 minutes:
          </p>
          <ol style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: 2 }}>
            <li>Go to <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>console.groq.com</a></li>
            <li>Sign up (free — no credit card)</li>
            <li>Click <strong>API Keys</strong> → <strong>Create API Key</strong></li>
            <li>Copy and paste it below</li>
          </ol>
        </div>

        <div className="form-group" style={{ marginBottom: '16px', textAlign: 'left' }}>
          <label className="form-label">Your Groq API Key</label>
          <input
            type="password"
            className="form-input"
            placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxx"
            value={key}
            onChange={e => { setKey(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          {error && (
            <p style={{ fontSize: '0.8rem', color: 'var(--accent-danger)', marginTop: '6px' }}>⚠ {error}</p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            className="btn btn-primary w-full"
            onClick={handleSave}
            disabled={testing || !key.trim()}
          >
            {testing ? (
              <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> Validating key...</>
            ) : (
              '✓ Save & Continue'
            )}
          </button>

          {isUpdate && (
            <button className="btn btn-ghost w-full" onClick={handleClear} style={{ color: 'var(--accent-danger)', borderColor: 'rgba(244,63,94,0.25)' }}>
              Remove API Key
            </button>
          )}
        </div>

        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '16px', lineHeight: 1.6 }}>
          🔒 Your key is stored only in your browser's localStorage.
          It is never uploaded to any server.
        </p>
      </div>
    </div>
  );
}
