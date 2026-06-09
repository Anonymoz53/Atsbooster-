import io
import pdfplumber
from docx import Document


def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """Extract plain text from an uploaded PDF or DOCX file."""
    ext = filename.lower().split(".")[-1]

    if ext == "pdf":
        return _extract_from_pdf(file_bytes)
    elif ext in ("docx", "doc"):
        return _extract_from_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: .{ext}. Please upload a PDF or DOCX file.")


def _extract_from_pdf(file_bytes: bytes) -> str:
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text.strip())
    full_text = "\n\n".join(text_parts)
    if not full_text.strip():
        raise ValueError("Could not extract text from the PDF. It may be scanned/image-based.")
    return full_text


def _extract_from_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    full_text = "\n".join(paragraphs)
    if not full_text.strip():
        raise ValueError("Could not extract text from the DOCX file.")
    return full_text
