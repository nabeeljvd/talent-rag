import { useState } from 'react'

const API_BASE = 'http://127.0.0.1:8000'

export default function Rankings() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [hasJob, setHasJob] = useState(false)
  const [expanded, setExpanded] = useState({})

  async function handleMatch() {
    setLoading(true)
    setMessage(null)
    setResults([])
    try {
      const res = await fetch(`${API_BASE}/match-candidates`)
      const data = await res.json()
      if (data.error) {
        if (data.error.includes('job') || data.error.includes('first')) {
          setMessage({ type: 'error', text: 'Please upload a job description first' })
        } else {
          setMessage({ type: 'error', text: data.error })
        }
      } else if (data.results === 'Upload job description first.') {
        setMessage({ type: 'error', text: 'Upload a job description first' })
      } else {
        setResults(data.results || [])
        setHasJob(true)
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to connect to backend' })
    } finally {
      setLoading(false)
    }
  }

  async function handleReset() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`${API_BASE}/reset-all`, { method: 'DELETE' })
      const data = await res.json()
      if (data.error) {
        setMessage({ type: 'error', text: data.error })
      } else {
        setMessage({ type: 'success', text: 'System reset successfully' })
        setResults([])
        setHasJob(false)
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to connect to backend' })
    } finally {
      setLoading(false)
    }
  }

  function toggleExpand(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function getScoreColor(score) {
    if (score >= 75) return 'var(--accent)'
    if (score >= 50) return 'var(--warning)'
    return 'var(--danger)'
  }

  function getScoreLabel(score) {
    if (score >= 75) return 'Strong Match'
    if (score >= 50) return 'Moderate Match'
    return 'Low Match'
  }

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Rankings</h1>
        <p className="page-desc">Match and rank candidates against the job description</p>
      </div>

      <div className="rank-actions">
        <button
          className="btn btn-primary"
          onClick={handleMatch}
          disabled={loading}
        >
          {loading ? <span className="spinner"></span> : null}
          {loading ? 'Analyzing...' : 'Match & Rank Candidates'}
        </button>
        <button
          className="btn btn-danger"
          onClick={handleReset}
          disabled={loading}
        >
          Reset System
        </button>
      </div>

      {message && (
        <div className={`message mt-4 ${message.type === 'error' ? 'message-error' : 'message-success'}`}>
          {message.text}
        </div>
      )}

      {results.length > 0 && (
        <div className="rankings-section mt-6">
          <h2 className="section-title">Candidate Rankings</h2>
          <div className="rankings-list">
            {results.map((r, i) => (
              <div key={r.candidate} className={`rank-card card ${i === 0 ? 'top-rank' : ''}`}>
                <div className="rank-position">{i + 1}</div>
                <div className="rank-header">
                  <div className="rank-left">
                    <div className="candidate-avatar">{r.candidate.charAt(0).toUpperCase()}</div>
                    <div className="rank-info">
                      <div className="rank-name">{r.candidate}</div>
                      <div className="rank-badge-label">{getScoreLabel(r.score)}</div>
                    </div>
                  </div>
                  <div className="rank-score">
                    <div className="score-ring" style={{ '--size': '80px' }}>
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle className="bg" cx="40" cy="40" r="32" />
                        <circle
                          className="progress"
                          cx="40" cy="40" r="32"
                          stroke={getScoreColor(r.score)}
                          strokeDasharray={`${2 * Math.PI * 32}`}
                          strokeDashoffset={`${2 * Math.PI * 32 * (1 - r.score / 100)}`}
                        />
                      </svg>
                      <span className="score-value" style={{ fontSize: '20px', color: getScoreColor(r.score) }}>
                        {r.score}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className="expand-btn"
                  onClick={() => toggleExpand(r.candidate)}
                >
                  <span>{expanded[r.candidate] ? 'Hide Details' : 'Show Details'}</span>
                  <svg
                    width="14" height="14"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ transform: expanded[r.candidate] ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {expanded[r.candidate] && (
                  <div className="rank-details">
                    <pre className="rank-analysis">{r.analysis}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && !loading && !message && (
        <div className="empty-state mt-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <p>No rankings yet. Click "Match & Rank Candidates" to begin.</p>
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
        .rank-actions { display: flex; gap: 12px; }
        .rankings-list { display: flex; flex-direction: column; gap: 16px; }
        .rank-card {
          position: relative;
          padding: 24px;
        }
        .rank-card.top-rank {
          border-color: var(--accent-dim);
          box-shadow: 0 0 30px var(--accent-glow);
        }
        .rank-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .rank-left { display: flex; align-items: center; gap: 16px; }
        .rank-info { display: flex; flex-direction: column; gap: 4px; }
        .rank-name { font-weight: 600; font-size: 16px; }
        .rank-badge-label {
          font-size: 11px;
          font-family: 'Space Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
        }
        .expand-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 16px;
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          padding: 0;
          font-family: 'Space Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: color 0.2s ease;
        }
        .expand-btn:hover { color: var(--accent); }
        .rank-details {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        .rank-analysis {
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          line-height: 1.7;
          white-space: pre-wrap;
          color: var(--text-secondary);
          margin: 0;
        }
      `}</style>
    </div>
  )
}
