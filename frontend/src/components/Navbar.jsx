import { Link, useLocation } from 'react-router-dom';
import { getUsageCount, getFreeRemaining, FREE_LIMIT_CONST } from '../lib/usage';

export default function Navbar() {
  const location = useLocation();
  const used = getUsageCount();
  const remaining = getFreeRemaining();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">⚡</div>
          <span>ATSBoost</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <span>
              {remaining > 0
                ? `${remaining} free left`
                : 'Free uses exhausted'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
