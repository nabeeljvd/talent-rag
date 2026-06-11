import { useState, useRef } from 'react'

const API_BASE = 'http://127.0.0.1:8000'

export default function Jobs() {
  const [file, setFile] = useState(null)
  const [dragover, setDragover] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [jobInfo, setJobInfo] = useState(null)
  const fileInputRef = useRef()

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setMessage(null)
    setJobInfo(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_BASE}/upload-job`, { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) {
        setMessage({ type: 'error', text: data.error })
      } else {
        setMessage({ type: 'success', text: 'Job description uploaded successfully' })
        setJobInfo({ name: file.name, size: file.size })
      }
    } catch (err) {
      console.error("Upload error:", err)
      setMessage({
        type: 'error',
        text: err.message || 'Failed to connect to backend'
      })
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragover(false)
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.pdf'))
    if (dropped.length > 0) setFile(dropped[0])
  }

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Job Descriptions</h1>
        <p className="page-desc">Upload job descriptions to match candidates against</p>
      </div>

      <div className="upload-section">
        <div className="card">
          <div className="job-upload-visual">
            <div className="job-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <h3>Job Description PDF</h3>
            <p>Upload a job description to enable candidate matching</p>
          </div>

          <div
            className={`file-drop-zone ${dragover ? 'dragover' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragover(true) }}
            onDragLeave={() => setDragover(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={e => setFile(e.target.files[0])}
            />
            {file ? (
              <div className="file-selected">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <span className="file-name">{file.name}</span>
                <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            ) : (
              <div className="file-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Drop PDF here or click to browse</span>
              </div>
            )}
          </div>

          {message && (
            <div className={`message mt-4 ${message.type === 'error' ? 'message-error' : 'message-success'}`}>
              {message.text}
            </div>
          )}

          <button
            className="btn btn-primary w-full mt-4"
            onClick={handleUpload}
            disabled={!file || loading}
          >
            {loading ? <span className="spinner"></span> : null}
            {loading ? 'Processing...' : 'Upload Job Description'}
          </button>
        </div>
      </div>

      {jobInfo && (
        <div className="mt-6">
          <h2 className="section-title">Current Job Description</h2>
          <div className="job-card card">
            <div className="job-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div className="job-card-info">
              <div className="job-card-name">{jobInfo.name}</div>
              <div className="job-card-meta">{(jobInfo.size / 1024).toFixed(1)} KB · Indexed</div>
            </div>
            <span className="badge badge-success">Active</span>
          </div>
        </div>
      )}

      <div className="info-cards mt-6">
        <h2 className="section-title">How It Works</h2>
        <div className="grid-2">
          <div className="info-card card">
            <div className="info-num mono">01</div>
            <h4>Upload Job Description</h4>
            <p>Upload any job description as a PDF. The system extracts and indexes the text automatically.</p>
          </div>
          <div className="info-card card">
            <div className="info-num mono">02</div>
            <h4>Match Candidates</h4>
            <p>Once candidates are loaded, go to Rankings to see how each candidate scores against the job requirements.</p>
          </div>
        </div>
      </div>

      <style>{`
        .page-header { margin-bottom: 32px; }
        .page-title {
          font-family: 'Space Mono', monospace;
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 6px 0;
        }
        .page-desc { font-size: 14px; color: var(--text-secondary); margin: 0; }
        .upload-section { max-width: 600px; }
        .job-upload-visual {
          text-align: center;
          padding: 20px 0 28px;
        }
        .job-icon {
          width: 80px;
          height: 80px;
          background: var(--accent-glow);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          margin: 0 auto 16px;
        }
        .job-upload-visual h3 { font-size: 18px; font-weight: 600; margin: 0 0 6px; }
        .job-upload-visual p { font-size: 13px; color: var(--text-secondary); margin: 0; }
        .file-selected, .file-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
        }
        .file-name { font-weight: 600; color: var(--text-primary); }
        .file-size { font-size: 12px; color: var(--text-muted); }
        .job-card {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .job-card-icon {
          width: 48px;
          height: 48px;
          background: var(--bg-tertiary);
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
        }
        .job-card-info { flex: 1; min-width: 0; }
        .job-card-name { font-weight: 600; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .job-card-meta { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }
        .info-cards .section-title { margin-top: 48px; }
        .info-card { display: flex; flex-direction: column; gap: 12px; }
        .info-num {
          font-size: 36px;
          font-weight: 700;
          color: var(--accent);
          opacity: 0.2;
          line-height: 1;
        }
        .info-card h4 { font-size: 16px; font-weight: 600; margin: 0; }
        .info-card p { font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.6; }
      `}</style>
    </div>
  )
}
