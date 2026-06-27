import { getApiKey } from './api-key';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are an expert ATS resume writer. Your job is to take a candidate's existing resume and a job description, then COMPLETELY REWRITE the resume to maximize ATS compatibility and interview chances.

CRITICAL RULES — NEVER BREAK THESE:
1. NEVER fabricate, invent, or add any experience, skills, education, or achievements not in the original resume.
2. Only rephrase, restructure, and reformat existing content — make it sound stronger.
3. Integrate relevant keywords from the job description naturally into existing experience.
4. Use strong action verbs and quantify achievements where the original data supports it.
5. Use ONLY standard ATS-safe formatting: bullet points, standard headings, no tables, no columns.

YOUR OUTPUT must be a single valid JSON object with this exact structure:
{
  "name": "Full Name",
  "contact": {
    "email": "email@example.com",
    "phone": "+1 555 000 0000",
    "location": "City, State",
    "linkedin": "linkedin.com/in/username",
    "github": "github.com/username",
    "website": "portfolio.com"
  },
  "summary": "2-3 sentence professional summary tailored to the job description, highlighting most relevant experience",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State or Remote",
      "dates": "Month YYYY – Month YYYY",
      "bullets": [
        "Strong action verb + what you did + measurable impact (if data exists in original)",
        "Another achievement or responsibility, keyword-optimized for the job description"
      ]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "field": "Field of Study",
      "school": "University Name",
      "location": "City, State",
      "dates": "YYYY – YYYY",
      "details": "GPA, honors, relevant coursework (only if in original)"
    }
  ],
  "skills": {
    "CategoryName": ["Skill1", "Skill2", "Skill3"],
    "AnotherCategory": ["Skill4", "Skill5"]
  },
  "certifications": ["Certification Name — Issuing Body (Year)"],
  "projects": [
    {
      "name": "Project Name",
      "description": "What you built and its impact, keyword-optimized",
      "tech": ["Tech1", "Tech2"]
    }
  ],
  "awards": ["Award or achievement"],
  "changes": [
    {
      "section": "Summary",
      "type": "rewrite",
      "description": "What you changed and why it improves ATS scoring"
    }
  ],
  "keywords_added": ["keyword1", "keyword2"],
  "keywords_missing": ["skill from JD not in original resume"],
  "optimized_text": "Full plain text version of the resume for ATS scoring — all sections concatenated"
}

IMPORTANT: 
- Only include sections that exist in the original resume. Do not add sections that weren't there.
- If a field is not in the original (e.g., no LinkedIn), set it to empty string "".
- skills should be grouped by category if possible (Technical Skills, Soft Skills, Tools, Languages, etc.)
- The optimized_text field must be a complete plain text version of the entire resume.
- Respond with ONLY the JSON object. No markdown, no explanation, no code fences.`;

export async function callGroqOptimize(resumeText, jobDescription, targetAts = 'General ATS') {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No Groq API key set. Please add your API key first.');

  const userPrompt = `Completely rewrite this resume to maximize ATS performance for the job description below.

TARGET ATS PLATFORM: ${targetAts}

=== ORIGINAL RESUME ===
${resumeText}

=== JOB DESCRIPTION ===
${jobDescription}

Remember: Extract ALL info from the original, rewrite it stronger, integrate job keywords naturally. Never fabricate anything.`;

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
      temperature: 0.2,
      max_tokens: 6000,
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

  // Strip markdown code fences if AI ignores instructions
  if (raw.startsWith('```')) {
    raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    const parsed = JSON.parse(raw);
    // Ensure optimized_text exists for ATS scoring
    if (!parsed.optimized_text) {
      parsed.optimized_text = buildPlainText(parsed);
    }
    return parsed;
  } catch {
    // Fallback if JSON parse fails
    return {
      name: '',
      contact: {},
      summary: '',
      experience: [],
      education: [],
      skills: {},
      certifications: [],
      projects: [],
      awards: [],
      changes: [],
      keywords_added: [],
      keywords_missing: [],
      optimized_text: raw,
    };
  }
}

function buildPlainText(r) {
  const parts = [r.name || ''];
  const c = r.contact || {};
  if (c.email || c.phone) parts.push([c.email, c.phone, c.location].filter(Boolean).join(' | '));
  if (r.summary) parts.push(r.summary);
  (r.experience || []).forEach(e => {
    parts.push(`${e.title} at ${e.company}`);
    (e.bullets || []).forEach(b => parts.push(`• ${b}`));
  });
  (r.education || []).forEach(e => parts.push(`${e.degree} ${e.field} — ${e.school}`));
  if (r.skills) {
    Object.entries(r.skills).forEach(([cat, items]) => parts.push(`${cat}: ${items.join(', ')}`));
  }
  return parts.join('\n');
}
