import React, { type FC } from 'react'
import { Navbar } from './Navbar'
import './PlatformWorkspace.css'

interface PlatformWorkspaceProps {
  onThemeToggle: () => void
  theme: 'dark' | 'light' | 'system'
  onNavigate: (path: string) => void
}

export const PlatformWorkspace: FC<PlatformWorkspaceProps> = ({
  onThemeToggle,
  theme,
  onNavigate
}) => {
  const modules = [
    {
      id: 'knowledge-hub',
      step: 'STEP 1 — LEARN',
      title: 'Knowledge Hub',
      description: 'Every great project starts with learning.\n\nUpload PDFs, research papers, class notes, books, and study materials. Use AI to summarize content, generate smart notes, ask questions, and instantly understand complex topics.\n\nTurn scattered information into organized knowledge.',
      features: ['Document Chat', 'AI Summaries', 'Smart Notes', 'Research Workspace'],
      ctaText: 'Start Learning',
      url: 'https://gnosisapp-theta.vercel.app',
      highlightClass: 'step-start',
      icon: '📚'
    },
    {
      id: 'workflow-studio',
      step: 'STEP 2 — BUILD',
      title: 'NodeCraft AI',
      description: 'Knowledge becomes valuable when you apply it.\n\nDesign AI workflows, automate repetitive tasks, connect powerful tools, and build real-world projects that strengthen your portfolio and practical skills.\n\nTransform ideas into working systems without complexity.',
      features: ['Visual Workflow Builder', 'AI Automation', 'Node-Based Canvas', 'Project Creation'],
      ctaText: 'Start Building',
      url: '/workflow-studio',
      highlightClass: '',
      icon: '⚡'
    },
    {
      id: 'career-suite',
      step: 'STEP 3 — GET HIRED',
      title: 'CareerOS',
      description: 'Your skills deserve opportunities.\n\nConvert your learning and projects into a professional resume that stands out. Generate ATS-optimized resumes, improve job applications, and present your achievements with confidence.\n\nTurn your work into career opportunities.',
      features: ['AI Resume Builder', 'ATS Optimization', 'Professional PDF Export', 'Career Growth Tools'],
      ctaText: 'Launch CareerOS',
      url: 'https://careeros-six.vercel.app/',
      highlightClass: 'featured',
      icon: '💼'
    }
  ]

  return (
    <div className="pw-root">
      <div className="pw-noise" />
      
      {/* Navigation */}
      <Navbar
        currentPath="/platform"
        onNavigate={onNavigate}
        theme={theme}
        onThemeToggle={onThemeToggle}
      />

      {/* Main Content */}
      <main className="pw-main">
        <div className="pw-container">
          <div className="pw-intro">
            <h1 className="pw-title">FlowForge AI Workspace</h1>
            <p className="pw-subtitle">
              Learn, Build, and Get Hired using the complete FlowForge ecosystem.
            </p>

            <div className="pw-journey-section">
              <span className="pw-journey-eyebrow">YOUR GROWTH JOURNEY</span>
              <div className="pw-journey-indicator">
                <span className="pw-journey-step">Learn Skills</span>
                <span className="pw-journey-arrow" />
                <span className="pw-journey-step">Build Real Projects</span>
                <span className="pw-journey-arrow" />
                <span className="pw-journey-step">Get Hired</span>
              </div>
              <p className="pw-journey-desc">
                FlowForge helps students and professionals move from learning concepts to building practical projects and ultimately showcasing their skills to employers.
              </p>
            </div>
          </div>

          <div className="pw-grid">
            {modules.map((mod, index) => (
              <React.Fragment key={mod.id}>
                {index > 0 && (
                  <div className="pw-connector" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                    <div className="pw-connector-line" />
                  </div>
                )}
                <div className={`pw-card ${mod.highlightClass}`} style={{ animationDelay: `${0.1 + index * 0.1}s` }}>
                  <div className="pw-card-header-row">
                    <div className="pw-card-step">{mod.step}</div>
                    <span className="pw-status-badge">
                      <span className="pw-pulse-dot" /> STATUS: ACTIVE
                    </span>
                  </div>
                  <div className="pw-card-icon">{mod.icon}</div>
                  <h3 className="pw-card-title">{mod.title}</h3>
                  <p className="pw-card-desc" style={{ whiteSpace: 'pre-line' }}>{mod.description}</p>
                  
                  <ul className="pw-card-features">
                    {mod.features.map((feat, idx) => (
                      <li key={idx}>→ {feat}</li>
                    ))}
                  </ul>

                  <a
                    href={mod.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pw-card-btn"
                  >
                    {mod.ctaText}
                  </a>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>

      <footer className="pw-footer">
        <div className="pw-container">
          <span>© 2026 FlowForge AI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
