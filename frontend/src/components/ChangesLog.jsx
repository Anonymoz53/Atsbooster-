import { useState } from 'react';

const TYPE_LABELS = {
  keyword_integration: 'Keyword',
  reformatting: 'Format',
  rewrite: 'Rewrite',
  restructure: 'Restructure',
};

export default function ChangesLog({ changes, summary, keywordsAdded, keywordsMissing }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="card">
      <h3 style={{ marginBottom: '8px' }}>📋 What Changed & Why</h3>

      {summary && (
        <div className="alert alert-info" style={{ marginBottom: '20px' }}>
          <span>ℹ️</span>
          <p style={{ fontSize: '0.875rem' }}>{summary}</p>
        </div>
      )}

      {/* Changes accordion */}
      {changes && changes.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {changes.map((change, i) => (
            <div key={i} className="change-item">
              <div
                className="change-item-header"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className={`change-badge badge-${change.type || 'rewrite'}`}>
                  {TYPE_LABELS[change.type] || change.type}
                </span>
                <span style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {change.section || `Change ${i + 1}`}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {openIndex === i ? '▲' : '▼'}
                </span>
              </div>
              {openIndex === i && (
                <div className="change-item-body animate-fadeIn">
                  {change.description}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
          No detailed changes were logged by the AI.
        </p>
      )}

      {/* Keywords Added */}
      {keywordsAdded && keywordsAdded.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div className="section-divider">Keywords Integrated</div>
          <div className="keyword-tags mt-12">
            {keywordsAdded.map(kw => (
              <span key={kw} className="keyword-tag added">+ {kw}</span>
            ))}
          </div>
        </div>
      )}

      {/* Keywords Missing */}
      {keywordsMissing && keywordsMissing.length > 0 && (
        <div>
          <div className="section-divider">Keywords You May Want to Add</div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '8px 0' }}>
            (Only add these if you genuinely have this experience)
          </p>
          <div className="keyword-tags mt-8">
            {keywordsMissing.map(kw => (
              <span key={kw} className="keyword-tag missing">⚠ {kw}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
