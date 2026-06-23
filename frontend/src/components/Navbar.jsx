import { Link, useLocation } from 'react-router-dom';
import { getUsageCount, getFreeRemaining, FREE_LIMIT_CONST } from '../lib/usage';
import { hasApiKey } from '../lib/api-key';

export default function Navbar({ onApiKeyClick }) {
  const location = useLocation();
  const used = getUsageCount();
  const remaining = getFreeRemaining();
  const keySet = hasApiKey();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">⚡</div>
          <span>ATSBoost</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* API Key button */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={onApiKeyClick}
            title={keySet ? 'Update Groq API Key' : 'Add Groq API Key'}
            style={{
              borderColor: keySet ? 'var(--border-primary)' : 'rgba(244,63,94,0.4)',
              color: keySet ? 'var(--text-secondary)' : 'var(--accent-danger)',
              fontSize: '0.78rem',
            }}
          >
            {keySet ? '🔑 API Key' : '⚠ Add API Key'}
          </button>

          {location.pathname !== '/optimize' && (
            <Link to="/optimize" className="btn btn-primary btn-sm">
              Optimize Resume →
            </Link>
          )}

          <div className="usage-badge">
            <span className="usage-dots">
              {Array.from({ length: FREE_LIMIT_CONST }).map((_, i) => (
                <span
                  key={i}
                  className={`usage-dot ${i < used ? (remaining === 0 ? 'exhausted' : 'used') : ''}`}
                />
              ))}
            </span>
            <span style={{ fontSize: '0.75rem' }}>
              {remaining > 0 ? `${remaining} free left` : 'Free uses exhausted'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
