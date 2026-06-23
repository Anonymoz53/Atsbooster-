import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Point to the pdfjs worker (Vite will bundle it)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href;

/**
 * Extract plain text from a File object (PDF or DOCX).
 */
export async function extractTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'pdf') {
    return await extractFromPdf(file);
  } else if (ext === 'docx' || ext === 'doc') {
    return await extractFromDocx(file);
  } else {
    throw new Error(`Unsupported file type: .${ext}. Please upload a PDF or DOCX file.`);
  }
}

async function extractFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textParts = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    if (pageText.trim()) textParts.push(pageText.trim());
  }

  const fullText = textParts.join('\n\n');
  if (!fullText.trim()) {
    throw new Error('Could not extract text from the PDF. It may be a scanned image — please use a text-based PDF.');
  }
  return fullText;
}

async function extractFromDocx(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value;
  if (!text.trim()) {
    throw new Error('Could not extract text from the DOCX file.');
  }
  return text;
}
