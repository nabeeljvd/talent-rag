import { useState, useEffect } from 'react'

const API_BASE = 'http://127.0.0.1:8000'

export default function Dashboard() {
  const [stats, setStats] = useState({ candidates: 0, jobUploaded: false, lastMatch: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkStatus()
  }, [])

  async function checkStatus() {
    try {
      const res = await fetch(`${API_BASE}/health`)
      if (res.ok) {
        setStats({ candidates: 0, jobUploaded: false, lastMatch: null })
      }
    } catch {
      // backend not running
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1 className="hero-title">TalentRAG</h1>
        <p className="hero-sub">AI-powered resume analysis and candidate ranking system</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value mono">{loading ? '—' : stats.candidates}</span>
            <span className="stat-label">Candidates Loaded</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div className="stat-content">
            <span className={`stat-value mono ${stats.jobUploaded ? 'text-accent' : ''}`}>
              {stats.jobUploaded ? 'Yes' : 'No'}
            </span>
            <span className="stat-label">Job Description</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value mono">{stats.lastMatch || '—'}</span>
            <span className="stat-label">Last Match Score</span>
          </div>
        </div>

        <div className="stat-card accent">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value mono">Active</span>
            <span className="stat-label">System Status</span>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <section className="quick-start">
          <h2 className="section-title">Quick Start Guide</h2>
          <div className="steps">
            <div className="step-card">
              <div className="step-num mono">01</div>
              <div className="step-content">
                <h3>Upload Job Description</h3>
                <p>Start by uploading a job description PDF from the Jobs page</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-card">
              <div className="step-num mono">02</div>
              <div className="step-content">
                <h3>Add Candidates</h3>
                <p>Upload one or multiple candidate resumes in PDF format</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-card">
              <div className="step-num mono">03</div>
              <div className="step-content">
                <h3>Match & Rank</h3>
                <p>Let the AI analyze and rank candidates against the job</p>
              </div>
            </div>
          </div>
        </section>

        <section className="capabilities">
          <h2 className="section-title">System Capabilities</h2>
          <div className="grid-3">
            <div className="capability-card">
              <div className="cap-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <h4>Resume Upload</h4>
              <p>Single or batch PDF upload with automatic text extraction</p>
            </div>
            <div className="capability-card">
              <div className="cap-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h4>Smart Querying</h4>
              <p>Ask natural language questions about any candidate</p>
            </div>
            <div className="capability-card">
              <div className="cap-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
              <h4>ATS Scoring</h4>
              <p>Automatic compatibility scoring against job requirements</p>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .page-header {
          margin-bottom: 48px;
        }
        .hero-title {
          font-family: 'Space Mono', monospace;
          font-size: 48px;
          font-weight: 700;
          letter-spacing: -0.03em;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, var(--accent) 0%, #00ccaa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: 16px;
          color: var(--text-secondary);
          margin: 0;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 48px;
        }
        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .stat-card.accent {
          border-color: var(--accent-dim);
          background: linear-gradient(135deg, var(--bg-card) 0%, var(--accent-glow) 100%);
        }
        .stat-icon {
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
        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .stat-label {
          font-size: 12px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .text-accent { color: var(--accent); }
        .dashboard-sections {
          display: flex;
          flex-direction: column;
          gap: 48px;
        }
        .quick-start .steps {
          display: flex;
          align-items: center;
          gap: 0;
        }
        .step-card {
          flex: 1;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          display: flex;
          gap: 16px;
        }
        .step-num {
          font-size: 32px;
          font-weight: 700;
          color: var(--accent);
          opacity: 0.3;
          line-height: 1;
        }
        .step-content h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 6px 0;
        }
        .step-content p {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
        }
        .step-connector {
          width: 40px;
          height: 1px;
          background: var(--border-light);
          flex-shrink: 0;
          margin: 0 -1px;
          position: relative;
          z-index: 1;
          align-self: flex-end;
          margin-bottom: 30px;
        }
        .capability-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
        }
        .cap-icon {
          width: 40px;
          height: 40px;
          background: var(--accent-glow);
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          margin-bottom: 16px;
        }
        .capability-card h4 {
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }
        .capability-card p {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .quick-start .steps { flex-direction: column; }
          .step-connector { width: 1px; height: 20px; margin: -1px 0; }
        }
        @media (max-width: 768px) {
          .hero-title { font-size: 32px; }
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
