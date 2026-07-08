/**
 * Browser-native PDF generation via window.print()
 * Same approach used by rxresu.me v5+ — renders HTML and uses
 * the browser's PDF engine for professional quality output.
 */

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildResumeHtml(data) {
  const c = data.contact || {};

  const contactItems = [
    c.email && `<a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a>`,
    c.phone && escapeHtml(c.phone),
    c.location && escapeHtml(c.location),
    c.linkedin && `<a href="https://${escapeHtml(c.linkedin)}" target="_blank">${escapeHtml(c.linkedin)}</a>`,
    c.github && `<a href="https://${escapeHtml(c.github)}" target="_blank">${escapeHtml(c.github)}</a>`,
    c.website && `<a href="${escapeHtml(c.website)}" target="_blank">${escapeHtml(c.website)}</a>`,
  ].filter(Boolean);

  const experienceHtml = (data.experience || []).map(exp => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <div class="entry-title">${escapeHtml(exp.title)}</div>
          <div class="entry-subtitle">${escapeHtml(exp.company)}${exp.location ? ` &mdash; ${escapeHtml(exp.location)}` : ''}</div>
        </div>
        <div class="entry-date">${escapeHtml(exp.dates || '')}</div>
      </div>
      <ul class="bullet-list">
        ${(exp.bullets || []).map(b => `<li>${escapeHtml(b.replace(/^[•\-\*]\s*/, ''))}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  const educationHtml = (data.education || []).map(edu => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <div class="entry-title">${escapeHtml([edu.degree, edu.field].filter(Boolean).join(' in '))}</div>
          <div class="entry-subtitle">${escapeHtml(edu.school || '')}${edu.location ? ` &mdash; ${escapeHtml(edu.location)}` : ''}</div>
          ${edu.details ? `<div class="entry-details">${escapeHtml(edu.details)}</div>` : ''}
        </div>
        <div class="entry-date">${escapeHtml(edu.dates || '')}</div>
      </div>
    </div>
  `).join('');

  const skillsHtml = Object.entries(data.skills || {}).map(([cat, items]) => `
    <div class="skill-row">
      <span class="skill-cat">${escapeHtml(cat)}:</span>
      <span class="skill-items">${(Array.isArray(items) ? items : [items]).map(escapeHtml).join(' &bull; ')}</span>
    </div>
  `).join('');

  const projectsHtml = (data.projects || []).map(proj => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-title">${escapeHtml(proj.name || '')}</div>
        ${proj.tech?.length ? `<div class="entry-date">${proj.tech.map(escapeHtml).join(', ')}</div>` : ''}
      </div>
      ${proj.description ? `<ul class="bullet-list"><li>${escapeHtml(proj.description)}</li></ul>` : ''}
    </div>
  `).join('');

  const certsHtml = (data.certifications || []).map(c =>
    `<li>${escapeHtml(c)}</li>`
  ).join('');

  const awardsHtml = (data.awards || []).map(a =>
    `<li>${escapeHtml(a)}</li>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${escapeHtml(data.name || 'Resume')}</title>
<style>
  /* ── Reset ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Page setup ── */
  @page {
    size: A4;
    margin: 14mm 16mm;
  }

  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 10.5pt;
    line-height: 1.5;
    color: #1a1a2e;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  a { color: #0d7377; text-decoration: none; }

  /* ── Header ── */
  .header {
    text-align: center;
    padding-bottom: 10pt;
    border-bottom: 2pt solid #0d7377;
    margin-bottom: 10pt;
  }

  .name {
    font-size: 22pt;
    font-weight: bold;
    letter-spacing: 1px;
    color: #0d0d2b;
    margin-bottom: 4pt;
  }

  .contact-line {
    font-size: 9pt;
    color: #555;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4pt 10pt;
  }

  .contact-line span::before {
    content: '•';
    margin-right: 10pt;
    color: #0d7377;
  }
  .contact-line span:first-child::before { content: ''; margin-right: 0; }

  /* ── Sections ── */
  .section { margin-bottom: 10pt; page-break-inside: avoid; }

  .section-title {
    font-size: 10pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #0d7377;
    border-bottom: 1pt solid #0d7377;
    padding-bottom: 2pt;
    margin-bottom: 7pt;
  }

  /* ── Entries ── */
  .entry { margin-bottom: 8pt; page-break-inside: avoid; }

  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8pt;
    margin-bottom: 3pt;
  }

  .entry-title {
    font-weight: bold;
    font-size: 10.5pt;
    color: #0d0d2b;
  }

  .entry-subtitle {
    font-style: italic;
    color: #555;
    font-size: 9.5pt;
  }

  .entry-details {
    font-size: 9pt;
    color: #666;
    margin-top: 2pt;
  }

  .entry-date {
    font-size: 9pt;
    color: #666;
    white-space: nowrap;
    flex-shrink: 0;
    text-align: right;
  }

  /* ── Bullets ── */
  .bullet-list {
    list-style: none;
    padding-left: 12pt;
    margin-top: 3pt;
  }

  .bullet-list li {
    position: relative;
    padding-left: 10pt;
    margin-bottom: 2pt;
    font-size: 9.5pt;
    color: #2d2d2d;
    line-height: 1.45;
  }

  .bullet-list li::before {
    content: '▸';
    position: absolute;
    left: 0;
    color: #0d7377;
    font-size: 8pt;
    top: 1pt;
  }

  /* ── Skills ── */
  .skill-row {
    display: flex;
    gap: 6pt;
    margin-bottom: 4pt;
    font-size: 9.5pt;
    align-items: baseline;
    flex-wrap: wrap;
  }

  .skill-cat {
    font-weight: bold;
    color: #0d0d2b;
    white-space: nowrap;
    min-width: 90pt;
  }

  .skill-items { color: #333; line-height: 1.4; }

  /* ── Summary ── */
  .summary-text {
    font-size: 9.5pt;
    color: #2d2d2d;
    line-height: 1.6;
    text-align: justify;
  }

  /* ── Print only ── */
  @media print {
    body { background: white; }
    .no-print { display: none !important; }
  }

  /* ── Screen preview ── */
  @media screen {
    body {
      max-width: 210mm;
      margin: 0 auto;
      padding: 14mm 16mm;
      box-shadow: 0 4px 32px rgba(0,0,0,0.15);
      min-height: 297mm;
    }
  }
</style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="name">${escapeHtml(data.name || 'Your Name')}</div>
    <div class="contact-line">
      ${contactItems.map(item => `<span>${item}</span>`).join('')}
    </div>
  </div>

  ${data.summary ? `
  <!-- Summary -->
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <p class="summary-text">${escapeHtml(data.summary)}</p>
  </div>` : ''}

  ${data.experience?.length ? `
  <!-- Experience -->
  <div class="section">
    <div class="section-title">Work Experience</div>
    ${experienceHtml}
  </div>` : ''}

  ${data.education?.length ? `
  <!-- Education -->
  <div class="section">
    <div class="section-title">Education</div>
    ${educationHtml}
  </div>` : ''}

  ${Object.keys(data.skills || {}).length ? `
  <!-- Skills -->
  <div class="section">
    <div class="section-title">Skills</div>
    ${skillsHtml}
  </div>` : ''}

  ${data.projects?.length ? `
  <!-- Projects -->
  <div class="section">
    <div class="section-title">Projects</div>
    ${projectsHtml}
  </div>` : ''}

  ${data.certifications?.length ? `
  <!-- Certifications -->
  <div class="section">
    <div class="section-title">Certifications</div>
    <ul class="bullet-list">${certsHtml}</ul>
  </div>` : ''}

  ${data.awards?.length ? `
  <!-- Awards -->
  <div class="section">
    <div class="section-title">Awards &amp; Achievements</div>
    <ul class="bullet-list">${awardsHtml}</ul>
  </div>` : ''}

</body>
</html>`;
}

/**
 * Open the resume in a new tab and trigger browser print → Save as PDF
 */
export function downloadStructuredPdf(data) {
  const html = buildResumeHtml(data);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const win = window.open(url, '_blank');
  if (win) {
    win.onload = () => {
      setTimeout(() => {
        win.print();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }, 500);
    };
  } else {
    // Fallback: just open in new tab if popup blocked
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

/**
 * Get a blob URL for the HTML resume (for iframe preview)
 */
export function getPdfBlobUrl(data) {
  const html = buildResumeHtml(data);
  const blob = new Blob([html], { type: 'text/html' });
  return URL.createObjectURL(blob);
}

// Legacy compat
export function downloadPdf(resumeText, candidateName = 'Resume') {
  downloadStructuredPdf({ name: candidateName, summary: resumeText });
}
