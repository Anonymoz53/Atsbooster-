from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.file_parser import extract_text_from_file
from services.llm_service import optimize_resume
from services.ats_scorer import compute_ats_score

router = APIRouter()


@router.post("/optimize")
async def optimize(
    resume_file: UploadFile = File(...),
    job_description: str = Form(...),
    target_ats: str = Form(default="General ATS"),
):
    if not resume_file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    file_bytes = await resume_file.read()

    try:
        original_text = extract_text_from_file(file_bytes, resume_file.filename)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    if len(job_description.strip()) < 50:
        raise HTTPException(status_code=400, detail="Job description is too short. Please provide the full job posting.")

    # Compute score BEFORE optimization
    score_before = compute_ats_score(original_text, job_description)

    try:
        llm_result = optimize_resume(original_text, job_description, target_ats)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM service error: {str(e)}")

    optimized_text = llm_result.get("optimized_resume", "")

    # Compute score AFTER optimization
    score_after = compute_ats_score(optimized_text, job_description)

    return {
        "original_text": original_text,
        "optimized_text": optimized_text,
        "summary": llm_result.get("summary", ""),
        "changes": llm_result.get("changes", []),
        "keywords_added": llm_result.get("keywords_added", []),
        "keywords_missing": llm_result.get("keywords_missing", []),
        "score_before": score_before,
        "score_after": score_after,
    }
