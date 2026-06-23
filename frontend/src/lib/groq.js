import { getApiKey } from './api-key';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) resume optimizer. Your job is to rewrite a candidate's resume to maximize its performance against ATS systems while maintaining complete accuracy and honesty.

CRITICAL RULES:
1. NEVER fabricate, invent, or add any experience, skills, education, or achievements not in the original resume.
2. Only rephrase, restructure, and reformat existing content.
3. Naturally integrate relevant keywords from the job description without keyword stuffing.
4. Use standard ATS-safe formatting: simple bullet points, standard section headings, no tables, no columns.
5. Use strong action verbs and quantify achievements where the original data supports it.

ATS OPTIMIZATION RULES:
- Use standard section headings: "Professional Summary", "Work Experience", "Education", "Skills", "Certifications"
- Bullet points should start with strong action verbs
- Spell out acronyms on first use
- Remove references to graphics, text boxes, headers/footers

OUTPUT FORMAT — respond with ONLY a valid JSON object, no markdown fences, no extra text:
{
  "optimized_resume": "the full optimized resume text here",
  "summary": "2-3 sentence summary of the main improvements made",
  "changes": [
    {
      "section": "section name",
      "type": "keyword_integration | reformatting | rewrite | restructure",
      "description": "clear explanation of what changed and why it helps ATS scoring"
    }
  ],
  "keywords_added": ["keyword1", "keyword2"],
  "keywords_missing": ["keyword from JD not in resume that candidate might want to add if they have experience"]
}`;

export async function callGroqOptimize(resumeText, jobDescription, targetAts = 'General ATS') {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No Groq API key set. Please add your API key first.');

  const userPrompt = `Please optimize this resume for the following job description.

TARGET ATS PLATFORM: ${targetAts}

=== ORIGINAL RESUME ===
${resumeText}

=== JOB DESCRIPTION ===
${jobDescription}

Remember: Only rephrase/restructure existing content. Never add fabricated experience.`;

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error('Invalid Groq API key. Please check your key and try again.');
    if (response.status === 429) throw new Error('Groq rate limit reached. Please wait a moment and try again.');
    throw new Error(err.error?.message || `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  let raw = data.choices[0].message.content.trim();

  // Strip markdown code fences if present
  if (raw.startsWith('```')) {
    const lines = raw.split('\n');
    raw = lines.slice(1, lines[lines.length - 1] === '```' ? -1 : undefined).join('\n');
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {
      optimized_resume: raw,
      summary: 'Resume has been optimized for ATS compatibility.',
      changes: [],
      keywords_added: [],
      keywords_missing: [],
    };
  }
}
