from fastapi import APIRouter, Body, HTTPException
from fastapi.responses import StreamingResponse
from services.pdf_exporter import generate_pdf
import io

router = APIRouter()


@router.post("/export/pdf")
async def export_pdf(payload: dict = Body(...)):
    resume_text = payload.get("resume_text", "")
    candidate_name = payload.get("candidate_name", "Resume")

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="No resume text provided.")

    try:
        pdf_bytes = generate_pdf(resume_text, candidate_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

    filename = f"{candidate_name.replace(' ', '_')}_Optimized_Resume.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
