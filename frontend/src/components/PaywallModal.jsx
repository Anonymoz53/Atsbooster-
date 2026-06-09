export default function PaywallModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <span className="modal-icon">🔒</span>
        <h2 className="modal-title">Free Uses Exhausted</h2>
        <p className="modal-desc">
          You've used all <strong>3 free resume optimizations</strong>.
          To continue getting ATS-optimized resumes, unlock pay-per-use access.
        </p>

        <div className="price-badge">
          <span className="price-currency">₹</span>
          <span className="price-amount">500</span>
          <span className="price-unit">/ resume</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            className="btn btn-primary btn-lg w-full"
            onClick={() => alert('Payment integration coming soon! Stay tuned.')}
          >
            💳 Pay ₹500 & Continue
          </button>
          <button className="btn btn-ghost w-full" onClick={onClose}>
            Maybe Later
          </button>
        </div>

        <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            ✓ Each payment unlocks 1 full optimization<br />
            ✓ Includes ATS score report & PDF download<br />
            ✓ No subscription required
          </p>
        </div>
      </div>
    </div>
  );
}
