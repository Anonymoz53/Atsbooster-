import { useState, useRef } from 'react';

export default function FileUploader({ onFileSelected }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'doc'].includes(ext)) {
      alert('Please upload a PDF or DOCX file.');
      return;
    }
    setFile(f);
    onFileSelected(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const onInputChange = (e) => handleFile(e.target.files[0]);

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    onFileSelected(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      className={`file-uploader ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !file && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.doc"
        onChange={onInputChange}
        style={{ display: 'none' }}
      />

      {!file ? (
        <>
          <span className="file-uploader-icon">📄</span>
          <div className="file-uploader-title">
            Drop your resume here, or <span className="text-accent">browse</span>
          </div>
          <div className="file-uploader-sub">Supports PDF and DOCX • Max 10MB</div>
        </>
      ) : (
        <>
          <span className="file-uploader-icon">✅</span>
          <div className="file-uploader-title">Resume uploaded successfully!</div>
          <div className="file-name">
            <span>📎</span>
            <span>{file.name}</span>
            <span style={{ marginLeft: '4px', opacity: 0.6, fontSize: '0.75rem' }}>
              ({(file.size / 1024).toFixed(0)} KB)
            </span>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginTop: '12px' }}
            onClick={removeFile}
          >
            Remove & re-upload
          </button>
        </>
      )}
    </div>
  );
}
