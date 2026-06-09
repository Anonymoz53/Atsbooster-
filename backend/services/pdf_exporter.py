import io
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER


def generate_pdf(resume_text: str, candidate_name: str = "Resume") -> bytes:
    """Convert optimized resume text to an ATS-safe PDF."""
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()

    # Custom styles — clean, ATS-safe
    name_style = ParagraphStyle(
        "NameStyle",
        parent=styles["Normal"],
        fontSize=20,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#1a1a2e"),
        spaceAfter=4,
        alignment=TA_CENTER,
    )
    contact_style = ParagraphStyle(
        "ContactStyle",
        parent=styles["Normal"],
        fontSize=9,
        fontName="Helvetica",
        textColor=colors.HexColor("#555555"),
        spaceAfter=12,
        alignment=TA_CENTER,
    )
    section_heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontSize=11,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#0d7377"),
        spaceBefore=12,
        spaceAfter=4,
        borderPadding=(0, 0, 2, 0),
    )
    body_style = ParagraphStyle(
        "BodyStyle",
        parent=styles["Normal"],
        fontSize=10,
        fontName="Helvetica",
        textColor=colors.HexColor("#222222"),
        spaceAfter=3,
        leading=14,
    )
    bullet_style = ParagraphStyle(
        "BulletStyle",
        parent=styles["Normal"],
        fontSize=10,
        fontName="Helvetica",
        textColor=colors.HexColor("#222222"),
        spaceAfter=2,
        leading=13,
        leftIndent=12,
        bulletIndent=0,
    )

    story = []

    # Known ATS section keywords
    section_keywords = {
        "professional summary", "summary", "objective", "profile",
        "work experience", "experience", "employment history",
        "education", "academic background",
        "skills", "technical skills", "core competencies",
        "certifications", "licenses", "projects", "awards",
        "publications", "volunteer", "references",
    }

    lines = resume_text.split("\n")
    i = 0

    while i < len(lines):
        line = lines[i].strip()

        if not line:
            story.append(Spacer(1, 4))
            i += 1
            continue

        # Detect section heading
        line_lower = line.lower().rstrip(":").strip()
        if line_lower in section_keywords or (len(line) < 50 and line.isupper()):
            story.append(Spacer(1, 6))
            story.append(Paragraph(_escape(line), section_heading_style))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#0d7377"), spaceAfter=4))
            i += 1
            continue

        # Detect candidate name (usually first non-empty line)
        if i == 0 or (i < 3 and len(line.split()) <= 5 and not line.startswith(("•", "-", "*"))):
            story.append(Paragraph(_escape(line), name_style))
            i += 1
            continue

        # Detect contact info line (contains @, phone patterns, linkedin)
        if re.search(r"@|linkedin\.com|\+?\d[\d\s\-\(\)]{7,}|github\.com", line, re.IGNORECASE):
            story.append(Paragraph(_escape(line), contact_style))
            i += 1
            continue

        # Detect bullet points
        if line.startswith(("•", "-", "*", "–", "▪")):
            bullet_text = line.lstrip("•-*–▪ ").strip()
            story.append(Paragraph(f"• {_escape(bullet_text)}", bullet_style))
            i += 1
            continue

        # Regular body line
        story.append(Paragraph(_escape(line), body_style))
        i += 1

    doc.build(story)
    return buffer.getvalue()


def _escape(text: str) -> str:
    """Escape special XML characters for ReportLab."""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#39;")
    )
