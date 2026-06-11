import { useState, useEffect } from 'react'

const API_BASE = 'http://127.0.0.1:8000'

export default function Query() {
  const [candidates, setCandidates] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('ask')

  const presetQuestions = [
    'What programming languages does this candidate know?',
    'What are the key skills and technologies listed?',
    'What is the candidate\'s work experience summary?',
    'What education and certifications does the candidate have?',
    'What are the candidate\'s notable achievements?',
  ]

  async function loadCandidates() {
    // We need a way to list loaded candidates. If the backend doesn't expose this,
    // we'll keep candidates in memory on the frontend side.
    // For now, show empty and let user type the candidate ID.
  }

  async function handleAsk() {
    if (!selectedId.trim() || !question.trim()) return
    setLoading(true)
    setResponse(null)
    try {
      const res = await fetch(`${API_BASE}/ask/${selectedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      setResponse(data.answer || data.error || 'No response')
    } catch {
      setResponse('Failed to connect to backend')
    } finally {
      setLoading(false)
    }
  }

  function handlePreset(candidateId, q) {
    setSelectedId(candidateId)
    setQuestion(q)
  }

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Query Resume</h1>
        <p className="page-desc">Ask questions about any loaded candidate</p>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'ask' ? 'active' : ''}`} onClick={() => setTab('ask')}>
          Ask Question
        </button>
        <button className={`tab ${tab === 'presets' ? 'active' : ''}`} onClick={() => setTab('presets')}>
          Preset Queries
        </button>
      </div>

      {tab === 'ask' ? (
        <div className="query-layout">
          <div className="query-form">
            <div className="card">
              <label className="label">Candidate ID</label>
              <input
                className="input"
                placeholder="e.g. candidate_001"
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
              />

              <label className="label mt-4">Question</label>
              <textarea
                className="textarea"
                placeholder="Ask about skills, experience, education, etc."
                rows={4}
                value={question}
                onChange={e => setQuestion(e.target.value)}
              />

              {response && (
                <div className="response-box mt-4" style={{ position: 'relative' }}>
                  {loading ? <div className="loading-overlay"><span className="spinner"></span></div> : null}
                  {response}
                </div>
              )}

              <button
                className="btn btn-primary w-full mt-4"
                onClick={handleAsk}
                disabled={!selectedId.trim() || !question.trim() || loading}
              >
                {loading ? <span className="spinner"></span> : null}
                {loading ? 'Processing...' : 'Ask Question'}
              </button>
            </div>
          </div>

          <div className="query-sidebar">
            <h2 className="section-title">Preset Questions</h2>
            <div className="preset-list">
              {presetQuestions.map((q, i) => (
                <button
                  key={i}
                  className="preset-item"
                  onClick={() => { setQuestion(q) }}
                >
                  <span className="preset-num mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="preset-text">{q}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="query-layout">
          <div className="query-form">
            <div className="card">
              <label className="label">Candidate ID</label>
              <input
                className="input"
                placeholder="e.g. candidate_001"
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
              />
              <p className="text-sm text-muted mt-2">Enter the candidate ID, then click a preset question to fill and ask it.</p>
            </div>
          </div>
          <div className="query-sidebar">
            <h2 className="section-title">Preset Questions</h2>
            <div className="preset-list">
              {presetQuestions.map((q, i) => (
                <button
                  key={i}
                  className="preset-item"
                  onClick={() => handlePreset(selectedId || 'unknown', q)}
                >
                  <span className="preset-num mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="preset-text">{q}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              ))}
            </div>
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
        .query-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 32px;
          align-items: start;
        }
        .query-form { max-width: 600px; }
        .preset-list { display: flex; flex-direction: column; gap: 8px; }
        .preset-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
          font-family: inherit;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .preset-item:hover {
          border-color: var(--accent-dim);
          color: var(--text-primary);
          transform: translateX(4px);
        }
        .preset-num {
          font-size: 12px;
          color: var(--accent);
          opacity: 0.6;
          flex-shrink: 0;
        }
        .preset-text { flex: 1; line-height: 1.4; }
        .preset-item svg { flex-shrink: 0; opacity: 0; transition: opacity 0.2s ease; }
        .preset-item:hover svg { opacity: 1; }
        @media (max-width: 768px) {
          .query-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
