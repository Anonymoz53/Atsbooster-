// Client-side pipeline — no backend required
import { extractTextFromFile } from './file-parser';
import { callGroqOptimize } from './groq';
import { computeAtsScore } from './ats-scorer';

export async function optimizeResume(file, jobDescription, targetAts = 'General ATS') {
  // 1. Parse file → plain text
  const originalText = await extractTextFromFile(file);

  if (jobDescription.trim().length < 50) {
    throw new Error('Job description is too short. Please paste the full job posting.');
  }

  // 2. Score BEFORE (using original plain text)
  const scoreBefore = computeAtsScore(originalText, jobDescription);

  // 3. Call Groq AI → get fully structured, rewritten resume
  const structured = await callGroqOptimize(originalText, jobDescription, targetAts);

  // 4. Score AFTER (using optimized plain text from structured output)
  const optimizedText = structured.optimized_text || '';
  const scoreAfter = computeAtsScore(optimizedText, jobDescription);

  return {
    // Original
    original_text: originalText,
    score_before: scoreBefore,

    // AI output — structured for PDF generation
    structured,           // full structured JSON for PDF
    optimized_text: optimizedText,
    score_after: scoreAfter,

    // Change metadata
    summary: structured.summary || '',
    changes: structured.changes || [],
    keywords_added: structured.keywords_added || [],
    keywords_missing: structured.keywords_missing || [],
  };
}
