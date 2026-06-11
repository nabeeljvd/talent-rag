import { useState, useRef } from 'react'

const API_BASE = 'http://127.0.0.1:8000'

export default function Candidates() {
  const [mode, setMode] = useState('single')
  const [candidateId, setCandidateId] = useState('')
  const [file, setFile] = useState(null)
  const [files, setFiles] = useState([])
  const [dragover, setDragover] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const fileInputRef = useRef()
  const multiFileInputRef = useRef()

  async function handleUpload(file, id) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${API_BASE}/upload-resume/${id || file.name.replace('.pdf', '')}`, {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    const data = await res.json()
    return data
  }

  async function handleSingleUpload() {
    if (!file) return
    setLoading(true)
    setMessage(null)
    try {
      const id = candidateId.trim() || file.name.replace('.pdf', '')
      const result = await handleUpload(file, id)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: `Resume uploaded for ${result.candidate || id}` })
        setCandidates(prev => [...prev.filter(c => c.id !== id), { id, name: id }])
        setFile(null)
        setCandidateId('')
      }
    } catch (e) {
      console.error('Upload error:', e)
      setMessage({ type: 'error', text: `Failed to upload: ${e.message}` })
    } finally {
      setLoading(false)
    }
  }

  async function handleMultiUpload() {
    if (files.length === 0) return
    setLoading(true)
    setMessage(null)
    let success = 0
    let failed = 0
    for (const f of files) {
      try {
        const id = f.name.replace('.pdf', '')
        const result = await handleUpload(f, id)
        if (!result.error) {
          success++
          setCandidates(prev => [...prev.filter(c => c.id !== id), { id, name: id }])
        } else {
          console.error(`Upload failed for ${id}:`, result.error)
          failed++
        }
      } catch (e) {
        console.error(`Upload error for ${f.name}:`, e)
        failed++
      }
    }
    setLoading(false)
    setMessage({
      type: failed > 0 ? 'warning' : 'success',
      text: `${success} uploaded${failed > 0 ? `, ${failed} failed` : ''}`
    })
    setFiles([])
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragover(false)
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.pdf'))
    if (mode === 'multi') {
      setFiles(prev => [...prev, ...dropped])
    } else {
      if (dropped.length > 0) setFile(dropped[0])
    }
  }

  function handleFileChange(e, isMulti = false) {
    const selected = Array.from(e.target.files).filter(f => f.name.endsWith('.pdf'))
    if (isMulti) {
      setFiles(selected)
    } else {
      setFile(selected[0])
    }
  }

  async function handleAnalyze(candidate) {
    setSelectedCandidate(candidate)
    setAnalyzing(true)
    setAnalysis(null)
    try {
      const res = await fetch(`${API_BASE}/analyze/${candidate.id}`)
      const data = await res.json()
      setAnalysis(data.analysis || data.error || 'No analysis returned')
    } catch {
      setAnalysis('Failed to connect to backend')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Candidates</h1>
        <p className="page-desc">Upload and manage candidate resumes</p>
      </div>

      <div className="tabs">
        <button className={`tab ${mode === 'single' ? 'active' : ''}`} onClick={() => setMode('single')}>
          Single Upload
        </button>
        <button className={`tab ${mode === 'multi' ? 'active' : ''}`} onClick={() => setMode('multi')}>
          Multiple Upload
        </button>
      </div>

      <div className="upload-section">
        {mode === 'single' ? (
          <div className="card">
            <label className="label">Candidate ID / Name</label>
            <input
              className="input mb-4"
              placeholder="e.g. candidate_001"
              value={candidateId}
              onChange={e => setCandidateId(e.target.value)}
            />
            <label className="label">Resume PDF</label>
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
                onChange={e => handleFileChange(e)}
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
              onClick={handleSingleUpload}
              disabled={!file || loading}
            >
              {loading ? <span className="spinner"></span> : null}
              {loading ? 'Uploading...' : 'Upload Resume'}
            </button>
          </div>
        ) : (
          <div className="card">
            <label className="label">Resume PDFs (Multiple)</label>
            <div
              className={`file-drop-zone ${dragover ? 'dragover' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragover(true) }}
              onDragLeave={() => setDragover(false)}
              onDrop={handleDrop}
              onClick={() => multiFileInputRef.current.click()}
            >
              <input
                ref={multiFileInputRef}
                type="file"
                accept=".pdf"
                multiple
                onChange={e => handleFileChange(e, true)}
              />
              {files.length > 0 ? (
                <div className="file-list">
                  {files.map((f, i) => (
                    <div key={i} className="file-list-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      <span>{f.name}</span>
                      <button className="remove-btn" onClick={e => { e.stopPropagation(); setFiles(prev => prev.filter((_, j) => j !== i)) }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="file-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>Drop multiple PDFs here or click to browse</span>
                </div>
              )}
            </div>
            {message && (
              <div className={`message mt-4 ${message.type === 'error' ? 'message-error' : message.type === 'warning' ? 'message-error' : 'message-success'}`}>
                {message.text}
              </div>
            )}
            <button
              className="btn btn-primary w-full mt-4"
              onClick={handleMultiUpload}
              disabled={files.length === 0 || loading}
            >
              {loading ? <span className="spinner"></span> : null}
              {loading ? 'Uploading...' : `Upload ${files.length} Resume${files.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        )}
      </div>

      {candidates.length > 0 && (
        <div className="mt-6">
          <h2 className="section-title">Loaded Candidates ({candidates.length})</h2>
          <div className="candidate-list">
            {candidates.map(c => (
              <div key={c.id} className="candidate-card" onClick={() => setSelectedCandidate(selectedCandidate?.id === c.id ? null : c)}>
                <div className="candidate-avatar">{c.name.charAt(0).toUpperCase()}</div>
                <div className="candidate-info">
                  <div className="candidate-name">{c.id}</div>
                  <div className="candidate-meta">PDF uploaded</div>
                </div>
                <button
                  className="btn btn-secondary btn-icon"
                  onClick={e => { e.stopPropagation(); handleAnalyze(c) }}
                  title="Analyze"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {(selectedCandidate || analyzing) && (
        <div className="mt-6">
          <h2 className="section-title">
            {analyzing ? 'Analyzing...' : `Analysis: ${selectedCandidate?.id}`}
          </h2>
          <div className="response-box" style={{ position: 'relative' }}>
            {analyzing ? (
              <div className="loading-overlay">
                <span className="spinner"></span>
              </div>
            ) : null}
            {analysis}
          </div>
        </div>
      )}

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
        .file-selected, .file-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
        }
        .file-name { font-weight: 600; color: var(--text-primary); }
        .file-size { font-size: 12px; color: var(--text-muted); }
        .file-list { display: flex; flex-direction: column; gap: 8px; width: 100%; }
        .file-list-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: var(--bg-tertiary);
          border-radius: var(--radius);
          font-size: 13px;
        }
        .file-list-item svg { flex-shrink: 0; color: var(--text-muted); }
        .file-list-item span { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .remove-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px;
          display: flex;
        }
        .remove-btn:hover { color: var(--danger); }
        .candidate-list { display: flex; flex-direction: column; gap: 8px; }
      `}</style>
    </div>
  )
}
