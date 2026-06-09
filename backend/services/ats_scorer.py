import re
from collections import Counter


ATS_SECTIONS = [
    "professional summary", "summary", "objective", "profile",
    "work experience", "experience", "employment",
    "education",
    "skills", "technical skills", "core competencies",
    "certifications", "projects", "awards", "publications",
]

PROBLEMATIC_PATTERNS = [
    r"\btable\b", r"\bcolumn\b", r"\btext box\b", r"\bgraphic\b",
    r"\bheader\b", r"\bfooter\b", r"\bimage\b",
]

STOP_WORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "must", "shall", "this", "that",
    "these", "those", "i", "you", "he", "she", "we", "they", "it",
}


def compute_ats_score(resume_text: str, job_description: str) -> dict:
    """Compute a mock ATS score with detailed breakdown."""

    resume_lower = resume_text.lower()
    jd_lower = job_description.lower()

    # --- Keyword Match Score (40 pts) ---
    jd_tokens = set(re.findall(r"\b[a-zA-Z][a-zA-Z0-9+#.]{2,}\b", jd_lower)) - STOP_WORDS
    resume_tokens = set(re.findall(r"\b[a-zA-Z][a-zA-Z0-9+#.]{2,}\b", resume_lower)) - STOP_WORDS

    matched_keywords = jd_tokens & resume_tokens
    keyword_score = min(40, int((len(matched_keywords) / max(len(jd_tokens), 1)) * 80))

    top_jd_keywords = [w for w in jd_tokens if len(w) > 4][:20]
    matched_top = [w for w in top_jd_keywords if w in resume_tokens]
    missing_keywords = [w for w in top_jd_keywords if w not in resume_tokens][:10]

    # --- Section Detection Score (25 pts) ---
    detected_sections = []
    for section in ATS_SECTIONS:
        if section in resume_lower:
            detected_sections.append(section)

    section_score = min(25, int((len(detected_sections) / 5) * 25))

    # --- Formatting Score (20 pts) ---
    formatting_score = 20
    formatting_issues = []
    for pattern in PROBLEMATIC_PATTERNS:
        if re.search(pattern, resume_lower):
            formatting_score -= 3
            formatting_issues.append(f"Possible problematic element detected: '{pattern}'")

    # Check for bullet points (good)
    bullet_count = len(re.findall(r"^[•\-\*▪–]", resume_text, re.MULTILINE))
    if bullet_count < 3:
        formatting_score -= 5
        formatting_issues.append("Very few bullet points detected — ATS prefers structured bullet points")

    formatting_score = max(0, formatting_score)

    # --- Length Score (15 pts) ---
    word_count = len(resume_text.split())
    if 300 <= word_count <= 800:
        length_score = 15
        length_note = f"Good length ({word_count} words)"
    elif word_count < 300:
        length_score = 8
        length_note = f"Resume may be too short ({word_count} words) — aim for 300–800 words"
    else:
        length_score = 10
        length_note = f"Resume may be too long ({word_count} words) — consider trimming"

    total_score = keyword_score + section_score + formatting_score + length_score

    return {
        "total_score": total_score,
        "max_score": 100,
        "grade": _grade(total_score),
        "breakdown": {
            "keyword_match": {"score": keyword_score, "max": 40, "matched_count": len(matched_top), "total_jd_keywords": len(top_jd_keywords)},
            "section_structure": {"score": section_score, "max": 25, "detected_sections": detected_sections},
            "formatting": {"score": formatting_score, "max": 20, "issues": formatting_issues},
            "length": {"score": length_score, "max": 15, "note": length_note, "word_count": word_count},
        },
        "matched_keywords": matched_top,
        "missing_keywords": missing_keywords,
    }


def _grade(score: int) -> str:
    if score >= 85:
        return "A"
    elif score >= 70:
        return "B"
    elif score >= 55:
        return "C"
    elif score >= 40:
        return "D"
    else:
        return "F"
