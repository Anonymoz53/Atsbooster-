import { jsPDF } from 'jspdf';

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  accent:  [13, 115, 119],   // teal #0d7377
  dark:    [22,  31,  48],   // near-black
  body:    [45,  55,  72],   // dark gray
  muted:   [107, 114, 128],  // gray-500
  divider: [209, 213, 219],  // gray-300
  white:   [255, 255, 255],
};

const F = {
  name:       { size: 22, style: 'bold' },
  contact:    { size: 9,  style: 'normal' },
  sectionHdr: { size: 11, style: 'bold' },
  jobTitle:   { size: 10.5, style: 'bold' },
  company:    { size: 10, style: 'italic' },
  body:       { size: 10, style: 'normal' },
  bullet:     { size: 9.5, style: 'normal' },
  skills:     { size: 9.5, style: 'normal' },
  small:      { size: 8.5, style: 'normal' },
};

// A4 layout
const PW = 210, PH = 297;
const ML = 16, MR = 16, MT = 16, MB = 20;
const CW = PW - ML - MR;

export function generatePdfFromStructured(data) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  let y = MT;

  // ── Helpers ────────────────────────────────────────────────────────────
  const font = (f) => { doc.setFont('helvetica', f.style); doc.setFontSize(f.size); };
  const color = (rgb) => doc.setTextColor(...rgb);
  const checkBreak = (needed = 8) => {
    if (y + needed > PH - MB) { doc.addPage(); y = MT; }
  };

  const sectionHeader = (title) => {
    checkBreak(14);
    y += 4;
    font(F.sectionHdr); color(C.accent);
    doc.text(title.toUpperCase(), ML, y);
    y += 2;
    doc.setDrawColor(...C.accent);
    doc.setLineWidth(0.6);
    doc.line(ML, y, PW - MR, y);
    y += 5;
  };

  // ── 1. NAME ────────────────────────────────────────────────────────────
  if (data.name) {
    font(F.name); color(C.dark);
    doc.text(data.name, PW / 2, y, { align: 'center' });
    y += 7;
  }

  // ── 2. CONTACT ────────────────────────────────────────────────────────
  const c = data.contact || {};
  const contactParts = [c.email, c.phone, c.location, c.linkedin, c.github, c.website]
    .filter(Boolean);
  if (contactParts.length) {
    font(F.contact); color(C.muted);
    const contactLine = contactParts.join('  •  ');
    const wrapped = doc.splitTextToSize(contactLine, CW);
    wrapped.forEach(line => {
      doc.text(line, PW / 2, y, { align: 'center' });
      y += 4.5;
    });
    y += 2;
  }

  // Thin top divider under header
  doc.setDrawColor(...C.divider);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PW - MR, y);
  y += 5;

  // ── 3. SUMMARY ────────────────────────────────────────────────────────
  if (data.summary) {
    sectionHeader('Professional Summary');
    font(F.body); color(C.body);
    const lines = doc.splitTextToSize(data.summary, CW);
    lines.forEach(line => { checkBreak(6); doc.text(line, ML, y); y += 5; });
    y += 2;
  }

  // ── 4. EXPERIENCE ─────────────────────────────────────────────────────
  if (data.experience?.length) {
    sectionHeader('Work Experience');
    data.experience.forEach((exp) => {
      checkBreak(14);

      // Title + dates on same line
      font(F.jobTitle); color(C.dark);
      doc.text(exp.title || '', ML, y);
      font(F.small); color(C.muted);
      const dates = exp.dates || '';
      const datesW = doc.getTextWidth(dates);
      doc.text(dates, PW - MR - datesW, y);
      y += 5;

      // Company + location
      font(F.company); color(C.muted);
      const companyStr = [exp.company, exp.location].filter(Boolean).join(' — ');
      doc.text(companyStr, ML, y);
      y += 5;

      // Bullets
      (exp.bullets || []).forEach(bullet => {
        const text = bullet.replace(/^[•\-\*]\s*/, '');
        const lines = doc.splitTextToSize(text, CW - 6);
        checkBreak(lines.length * 4.5 + 2);
        font(F.bullet); color(C.body);
        doc.text('•', ML + 1, y);
        lines.forEach((line, i) => { doc.text(line, ML + 5, y); y += 4.5; });
        y += 0.5;
      });
      y += 3;
    });
  }

  // ── 5. EDUCATION ──────────────────────────────────────────────────────
  if (data.education?.length) {
    sectionHeader('Education');
    data.education.forEach((edu) => {
      checkBreak(12);
      font(F.jobTitle); color(C.dark);
      const degreeStr = [edu.degree, edu.field].filter(Boolean).join(' in ');
      doc.text(degreeStr, ML, y);
      font(F.small); color(C.muted);
      const dates = edu.dates || '';
      doc.text(dates, PW - MR - doc.getTextWidth(dates), y);
      y += 5;

      font(F.company); color(C.muted);
      const schoolStr = [edu.school, edu.location].filter(Boolean).join(' — ');
      doc.text(schoolStr, ML, y);
      y += 5;

      if (edu.details) {
        font(F.small); color(C.muted);
        const lines = doc.splitTextToSize(edu.details, CW);
        lines.forEach(line => { doc.text(line, ML, y); y += 4; });
      }
      y += 2;
    });
  }

  // ── 6. SKILLS ─────────────────────────────────────────────────────────
  if (data.skills && Object.keys(data.skills).length) {
    sectionHeader('Skills');
    Object.entries(data.skills).forEach(([cat, items]) => {
      if (!items?.length) return;
      checkBreak(6);
      font({ size: 9.5, style: 'bold' }); color(C.dark);
      const catStr = `${cat}: `;
      const catW = doc.getTextWidth(catStr);
      doc.text(catStr, ML, y);
      font(F.skills); color(C.body);
      const skillsText = Array.isArray(items) ? items.join(', ') : items;
      const skillLines = doc.splitTextToSize(skillsText, CW - catW);
      doc.text(skillLines[0], ML + catW, y);
      y += 4.5;
      if (skillLines.length > 1) {
        skillLines.slice(1).forEach(line => { doc.text(line, ML + catW, y); y += 4.5; });
      }
    });
    y += 2;
  }

  // ── 7. PROJECTS ───────────────────────────────────────────────────────
  if (data.projects?.length) {
    sectionHeader('Projects');
    data.projects.forEach((proj) => {
      checkBreak(10);
      font(F.jobTitle); color(C.dark);
      doc.text(proj.name || 'Project', ML, y);
      if (proj.tech?.length) {
        font(F.small); color(C.muted);
        const techStr = proj.tech.join(', ');
        doc.text(techStr, PW - MR - doc.getTextWidth(techStr), y);
      }
      y += 5;
      if (proj.description) {
        font(F.bullet); color(C.body);
        const lines = doc.splitTextToSize(proj.description, CW);
        lines.forEach(line => { checkBreak(5); doc.text(line, ML, y); y += 4.5; });
      }
      y += 2;
    });
  }

  // ── 8. CERTIFICATIONS ─────────────────────────────────────────────────
  if (data.certifications?.length) {
    sectionHeader('Certifications');
    data.certifications.forEach(cert => {
      checkBreak(6);
      font(F.bullet); color(C.body);
      doc.text('•', ML + 1, y);
      const lines = doc.splitTextToSize(cert, CW - 6);
      lines.forEach(line => { doc.text(line, ML + 5, y); y += 4.5; });
    });
    y += 2;
  }

  // ── 9. AWARDS ─────────────────────────────────────────────────────────
  if (data.awards?.length) {
    sectionHeader('Awards & Achievements');
    data.awards.forEach(award => {
      checkBreak(6);
      font(F.bullet); color(C.body);
      doc.text('•', ML + 1, y);
      const lines = doc.splitTextToSize(award, CW - 6);
      lines.forEach(line => { doc.text(line, ML + 5, y); y += 4.5; });
    });
  }

  return doc;
}

export function downloadStructuredPdf(data) {
  const doc = generatePdfFromStructured(data);
  const safeName = (data.name || 'Resume').replace(/\s+/g, '_');
  doc.save(`${safeName}_ATS_Optimized.pdf`);
}

export function getPdfBlobUrl(data) {
  const doc = generatePdfFromStructured(data);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}

// Legacy plain-text fallback
export function downloadPdf(resumeText, candidateName = 'Resume') {
  const data = { name: candidateName, optimized_text: resumeText };
  downloadStructuredPdf(data);
}
