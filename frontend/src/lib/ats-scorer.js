// Browser-side ATS scoring — ported from Python backend
const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','are','was','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'must','shall','this','that','these','those','i','you','he','she','we',
  'they','it','as','up','about','into','through','during','including',
  'until','against','among','throughout','despite','towards','upon',
]);

const ATS_SECTIONS = [
  'professional summary','summary','objective','profile',
  'work experience','experience','employment',
  'education',
  'skills','technical skills','core competencies',
  'certifications','projects','awards','publications',
];

const PROBLEMATIC_PATTERNS = [/\btable\b/i, /\bcolumn\b/i, /\btext box\b/i, /\bgraphic\b/i];

function tokenize(text) {
  return new Set(
    (text.toLowerCase().match(/\b[a-zA-Z][a-zA-Z0-9+#.]{2,}\b/g) || [])
      .filter(w => !STOP_WORDS.has(w))
  );
}

function gradeScore(score) {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export function computeAtsScore(resumeText, jobDescription) {
  const resumeLower = resumeText.toLowerCase();
  const resumeTokens = tokenize(resumeText);
  const jdTokens = tokenize(jobDescription);

  // ── Keyword Match (40 pts) ──────────────────────
  const topJdKeywords = [...jdTokens].filter(w => w.length > 4).slice(0, 20);
  const matchedTop = topJdKeywords.filter(w => resumeTokens.has(w));
  const missingKeywords = topJdKeywords.filter(w => !resumeTokens.has(w)).slice(0, 10);
  const keywordScore = Math.min(40, Math.round((matchedTop.length / Math.max(topJdKeywords.length, 1)) * 80));

  // ── Section Structure (25 pts) ──────────────────
  const detectedSections = ATS_SECTIONS.filter(s => resumeLower.includes(s));
  const sectionScore = Math.min(25, Math.round((detectedSections.length / 5) * 25));

  // ── Formatting (20 pts) ─────────────────────────
  let formattingScore = 20;
  const formattingIssues = [];
  PROBLEMATIC_PATTERNS.forEach(p => {
    if (p.test(resumeLower)) {
      formattingScore -= 3;
      formattingIssues.push(`Possible problematic element: ${p.source}`);
    }
  });
  const bulletCount = (resumeText.match(/^[•\-\*▪–]/gm) || []).length;
  if (bulletCount < 3) {
    formattingScore -= 5;
    formattingIssues.push('Very few bullet points — ATS prefers structured bullet points');
  }
  formattingScore = Math.max(0, formattingScore);

  // ── Length (15 pts) ─────────────────────────────
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  let lengthScore, lengthNote;
  if (wordCount >= 300 && wordCount <= 800) {
    lengthScore = 15;
    lengthNote = `Good length (${wordCount} words)`;
  } else if (wordCount < 300) {
    lengthScore = 8;
    lengthNote = `Resume may be too short (${wordCount} words) — aim for 300–800 words`;
  } else {
    lengthScore = 10;
    lengthNote = `Resume may be too long (${wordCount} words) — consider trimming`;
  }

  const totalScore = keywordScore + sectionScore + formattingScore + lengthScore;

  return {
    total_score: totalScore,
    max_score: 100,
    grade: gradeScore(totalScore),
    breakdown: {
      keyword_match: { score: keywordScore, max: 40, matched_count: matchedTop.length, total_jd_keywords: topJdKeywords.length },
      section_structure: { score: sectionScore, max: 25, detected_sections: detectedSections },
      formatting: { score: formattingScore, max: 20, issues: formattingIssues },
      length: { score: lengthScore, max: 15, note: lengthNote, word_count: wordCount },
    },
    matched_keywords: matchedTop,
    missing_keywords: missingKeywords,
  };
}
