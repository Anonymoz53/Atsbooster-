import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are an expert ATS (Applicant Tracking System) resume optimizer. Your job is to rewrite a candidate's resume to maximize its performance against ATS systems while maintaining complete accuracy and honesty.

CRITICAL RULES:
1. NEVER fabricate, invent, or add any experience, skills, education, or achievements that are not in the original resume.
2. Only rephrase, restructure, and reformat existing content.
3. Naturally integrate relevant keywords from the job description without keyword stuffing.
4. Use standard ATS-safe formatting: simple bullet points, standard section headings, no tables, no columns.
5. Use strong action verbs and quantify achievements where the original data supports it.

ATS OPTIMIZATION RULES:
- Use standard section headings: "Professional Summary", "Work Experience", "Education", "Skills", "Certifications"
- Bullet points should start with strong action verbs
- Spell out acronyms on first use
- Remove graphics, text boxes, headers/footers references
- Ensure keywords from the job description appear naturally in context

OUTPUT FORMAT — respond with ONLY a valid JSON object, no markdown code fences, no extra text:
{
  "optimized_resume": "the full optimized resume text here",
  "summary": "2-3 sentence summary of the main improvements made",
  "changes": [
    {
      "section": "section name (e.g. Professional Summary)",
      "type": "keyword_integration | reformatting | rewrite | restructure",
      "description": "clear explanation of what changed and why it helps ATS scoring"
    }
  ],
  "keywords_added": ["keyword1", "keyword2"],
  "keywords_missing": ["keyword from JD not in resume that candidate might want to add if they have experience"]
}"""


def optimize_resume(resume_text: str, job_description: str, target_ats: str = "General ATS") -> dict:
    """Call Groq LLM to optimize resume for ATS."""
    user_prompt = f"""Please optimize this resume for the following job description.

TARGET ATS PLATFORM: {target_ats}

=== ORIGINAL RESUME ===
{resume_text}

=== JOB DESCRIPTION ===
{job_description}

Remember: Only rephrase/restructure existing content. Never add fabricated experience."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=4096,
    )

    raw_content = response.choices[0].message.content.strip()

    # Strip markdown code fences if present
    if raw_content.startswith("```"):
        lines = raw_content.split("\n")
        raw_content = "\n".join(lines[1:-1]) if lines[-1] == "```" else "\n".join(lines[1:])

    try:
        result = json.loads(raw_content)
    except json.JSONDecodeError:
        # Fallback: return raw text if JSON parsing fails
        result = {
            "optimized_resume": raw_content,
            "summary": "Resume has been optimized for ATS compatibility.",
            "changes": [],
            "keywords_added": [],
            "keywords_missing": [],
        }

    return result
