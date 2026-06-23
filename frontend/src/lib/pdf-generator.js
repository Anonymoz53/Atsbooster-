import { jsPDF } from 'jspdf';

const ATS_SECTION_KEYWORDS = new Set([
  'professional summary','summary','objective','profile',
  'work experience','experience','employment history',
  'education','academic background',
  'skills','technical skills','core competencies',
  'certifications','licenses','projects','awards',
  'publications','volunteer','references',
]);

export function generatePdf(resumeText) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const PAGE_W = 210;
  const MARGIN = 18;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  // Fonts & sizes
  const NAME_SIZE = 20;
  const CONTACT_SIZE = 9;
  const HEADING_SIZE = 11;
  const BODY_SIZE = 10;

  // Colors
  const HEADING_COLOR = [13, 115, 119]; // teal
  const BODY_COLOR = [34, 34, 34];
  const MUTED_COLOR = [85, 85, 85];

  let y = MARGIN;

  const checkPageBreak = (needed = 8) => {
    if (y + needed > 285) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const lines = resumeText.split('\n');
  let firstLine = true;

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      y += 3;
      return;
    }

    const lineLower = line.toLowerCase().replace(/:$/, '').trim();
    const isSection = ATS_SECTION_KEYWORDS.has(lineLower) || (line.length < 50 && line === line.toUpperCase() && line.length > 3);
    const isBullet = /^[•\-\*–▪]/.test(line);
    const isContact = /@|linkedin\.com|\+?\d[\d\s\-()]{7,}|github\.com/i.test(line);

    if (firstLine) {
      // Candidate name
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(NAME_SIZE);
      doc.setTextColor(...BODY_COLOR);
      doc.text(line, PAGE_W / 2, y, { align: 'center' });
      y += 8;
      firstLine = false;
      return;
    }

    if (isContact) {
      checkPageBreak(6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(CONTACT_SIZE);
      doc.setTextColor(...MUTED_COLOR);
      doc.text(line, PAGE_W / 2, y, { align: 'center', maxWidth: CONTENT_W });
      y += 5;
      return;
    }

    if (isSection) {
      checkPageBreak(12);
      y += 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(HEADING_SIZE);
      doc.setTextColor(...HEADING_COLOR);
      doc.text(line.toUpperCase(), MARGIN, y);
      y += 2;
      // Underline
      doc.setDrawColor(...HEADING_COLOR);
      doc.setLineWidth(0.4);
      doc.line(MARGIN, y, PAGE_W - MARGIN, y);
      y += 5;
      return;
    }

    if (isBullet) {
      const bulletText = line.replace(/^[•\-\*–▪]\s*/, '');
      checkPageBreak(6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(BODY_SIZE);
      doc.setTextColor(...BODY_COLOR);
      // Bullet dot
      doc.text('•', MARGIN + 2, y);
      const wrapped = doc.splitTextToSize(bulletText, CONTENT_W - 6);
      doc.text(wrapped, MARGIN + 6, y);
      y += wrapped.length * 5 + 1;
      return;
    }

    // Regular body line
    checkPageBreak(6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BODY_SIZE);
    doc.setTextColor(...BODY_COLOR);
    const wrapped = doc.splitTextToSize(line, CONTENT_W);
    doc.text(wrapped, MARGIN, y);
    y += wrapped.length * 5 + 1;
  });

  return doc.output('blob');
}

export function downloadPdf(resumeText, candidateName = 'Resume') {
  const blob = generatePdf(resumeText);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${candidateName.replace(/\s+/g, '_')}_Optimized_Resume.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
