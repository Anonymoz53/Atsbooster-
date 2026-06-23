// Client-side API — no backend required!
// All processing happens in the browser.
import { extractTextFromFile } from './file-parser';
import { callGroqOptimize } from './groq';
import { computeAtsScore } from './ats-scorer';
import { downloadPdf } from './pdf-generator';

export { downloadPdf as exportPdf };

/**
 * Full optimization pipeline — runs entirely in the browser.
 */
export async function optimizeResume(file, jobDescription, targetAts = 'General ATS') {
  // 1. Parse file → text
  const originalText = await extractTextFromFile(file);

  if (jobDescription.trim().length < 50) {
    throw new Error('Job description is too short. Please paste the full job posting.');
  }

  // 2. Score BEFORE
  const scoreBefore = computeAtsScore(originalText, jobDescription);

  // 3. Call Groq AI
  const llmResult = await callGroqOptimize(originalText, jobDescription, targetAts);
  const optimizedText = llmResult.optimized_resume || '';

  // 4. Score AFTER
  const scoreAfter = computeAtsScore(optimizedText, jobDescription);

  return {
    original_text: originalText,
    optimized_text: optimizedText,
    summary: llmResult.summary || '',
    changes: llmResult.changes || [],
    keywords_added: llmResult.keywords_added || [],
    keywords_missing: llmResult.keywords_missing || [],
    score_before: scoreBefore,
    score_after: scoreAfter,
  };
}
