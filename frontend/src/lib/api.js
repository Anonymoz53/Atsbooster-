import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 min timeout for LLM calls
});

/**
 * Optimize a resume file against a job description.
 * @param {File} file - The resume file (PDF or DOCX)
 * @param {string} jobDescription - The job description text
 * @param {string} targetAts - Target ATS platform name
 * @returns {Promise<Object>} - Optimization result
 */
export async function optimizeResume(file, jobDescription, targetAts = 'General ATS') {
  const formData = new FormData();
  formData.append('resume_file', file);
  formData.append('job_description', jobDescription);
  formData.append('target_ats', targetAts);

  const response = await api.post('/api/optimize', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Export optimized resume as PDF.
 * @param {string} resumeText - The optimized resume text
 * @param {string} candidateName - The candidate's name for filename
 */
export async function exportPdf(resumeText, candidateName = 'Resume') {
  const response = await api.post(
    '/api/export/pdf',
    { resume_text: resumeText, candidate_name: candidateName },
    { responseType: 'blob' }
  );

  // Trigger browser download
  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${candidateName.replace(/\s+/g, '_')}_Optimized_Resume.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function checkHealth() {
  try {
    const res = await api.get('/health');
    return res.data;
  } catch {
    return null;
  }
}
