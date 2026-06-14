import React, { type FC, Fragment } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { platformModules } from '../config/platform.config'
import { Navbar } from './Navbar'
import { LPCanvasBackground } from './LPCanvasBackground'
import './LandingPage.css'

interface LandingPageProps {
  onLaunchApp: () => void
  theme: 'dark' | 'light' | 'system'
  onThemeChange: (theme: 'dark' | 'light' | 'system') => void
}

export const LandingPage: FC<LandingPageProps> = ({
  onLaunchApp,
  theme,
  onThemeChange
}) => {
  // Scroll Progress Setup
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const handleScroll = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }


  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
  }

  const containerVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  }

  const floatVariant = (delay: number) => ({
    animate: {
      y: [0, -15, 0],
      transition: { duration: 6, ease: "easeInOut" as const, repeat: Infinity, delay }
    }
  })

  const pathVariant = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 0.4, transition: { duration: 2, ease: "easeInOut" as const, delay: 0.5 } }
  }

  const audiences = [
    { 
      name: 'Students', icon: '🎓', module: 'Knowledge Hub',
      desc: 'Transform study materials into an intelligent learning system.',
      steps: ['Upload notes, PDFs, and syllabi', 'Generate AI summaries instantly', 'Create flashcards automatically', 'Chat with study materials', 'Organize knowledge efficiently'] 
    },
    { 
      name: 'Creators', icon: '🎨', module: 'Workflow Studio',
      desc: 'Automate content production and creative workflows.',
      steps: ['Generate content ideas', 'Build content pipelines', 'Automate publishing tasks', 'Repurpose content across platforms', 'Save hours of repetitive work'] 
    },
    { 
      name: 'Professionals', icon: '💼', module: 'Workflow Studio',
      desc: 'Optimize daily work through intelligent automation.',
      steps: ['Automate repetitive tasks', 'Organize information efficiently', 'Build custom AI workflows', 'Increase productivity', 'Streamline operations'] 
    },
    { 
      name: 'Job Seekers', icon: '🚀', module: 'Career Suite',
      desc: 'Accelerate career growth with AI-powered tools.',
      steps: ['Build ATS-friendly resumes', 'Generate tailored cover letters', 'Prepare for interviews', 'Track career progress', 'Improve application quality'] 
    },
    { 
      name: 'Researchers', icon: '🔬', module: 'Knowledge Hub',
      desc: 'Turn large amounts of information into actionable insights.',
      steps: ['Analyze research papers', 'Generate AI notes', 'Extract key findings', 'Build research knowledge bases', 'Accelerate discovery'] 
    },
    { 
      name: 'Startup Founders', icon: '💡', module: 'Workflow Studio',
      desc: 'Scale operations without increasing complexity.',
      steps: ['Automate business workflows', 'Manage company knowledge', 'Build AI-powered processes', 'Improve team efficiency', 'Focus on growth'] 
    }
  ]

  return (
    <div className="landing-page-root">
      <motion.div className="lp-progress-bar" style={{ scaleX }} />
      <div className="lp-noise" />
      
      {/* Interactive 3D Canvas Background */}
      <LPCanvasBackground theme={theme} />

      {/* Living Ambient Background */}
      <div className="lp-bg-flow-container">
        <div className="lp-bg-flow orb-1" />
        <div className="lp-bg-flow orb-2" />
        <div className="lp-bg-flow orb-3" />
      </div>

      {/* 1. Header Navigation */}
      <Navbar
        currentPath="/"
        onNavigate={(path) => {
          if (path === '/') {
            const el = document.getElementById('hero');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          } else {
            onLaunchApp();
          }
        }}
        theme={theme}
        onThemeToggle={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
      />

      {/* 2. Hero Section */}
      <section id="hero" className="lp-section lp-hero-section">
        <div className="lp-container">
          <motion.div initial="hidden" animate="visible" variants={containerVariant}>
            <motion.div variants={fadeUpVariant} className="lp-hero-badge">
              <span style={{ color: 'var(--lp-accent)' }}>●</span> FlowForge OS 1.0 is now available
            </motion.div>
            
            <motion.h1 variants={fadeUpVariant} className="lp-hero-headline">
              The AI Operating System<br/>For Modern Work
            </motion.h1>
            
            <motion.p variants={fadeUpVariant} className="lp-hero-subheadline">
              Build AI workflows, manage knowledge, create career assets, and automate your work from a single intelligent workspace.
            </motion.p>
            
            <motion.div variants={fadeUpVariant} className="lp-hero-ctas">
              <motion.button 
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                type="button" 
                className="lp-btn-link primary" 
                onClick={onLaunchApp}
              >
                Launch Platform
              </motion.button>
              <motion.a 
                whileHover={{ scale: 1.05, backgroundColor: 'var(--lp-panel-hover)' }}
                whileTap={{ scale: 0.95 }}
                href="#modules" 
                className="lp-btn-link secondary" 
                onClick={handleScroll('modules')}
              >
                Explore Modules
              </motion.a>
            </motion.div>
          </motion.div>

          <motion.div 
            className="lp-hero-visual"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          >
            <div className="lp-visual-grid" />
            
            <svg className="lp-visual-connections" viewBox="0 0 1000 500" preserveAspectRatio="none">
              <motion.path 
                d="M 300,120 C 500,120 500,250 500,250" 
                className="lp-vpath animated" 
                variants={pathVariant}
                initial="hidden"
                animate="visible"
              />
              <motion.path 
                d="M 700,120 C 500,120 500,250 500,250" 
                className="lp-vpath animated" 
                variants={pathVariant}
                initial="hidden"
                animate="visible"
              />
              <motion.path 
                d="M 700,380 C 500,380 500,250 500,250" 
                className="lp-vpath animated" 
                variants={pathVariant}
                initial="hidden"
                animate="visible"
              />
            </svg>

            <div className="lp-visual-nodes">
              <motion.div className="lp-vnode" style={{ top: '15%', left: '10%' }} animate={floatVariant(0).animate}>
                <div className="lp-vnode-header"><div className="lp-vnode-icon">📚</div> Knowledge Hub</div>
                <div className="lp-vnode-desc">Vector DB active. Analyzing 1,200 documents in real-time.</div>
              </motion.div>

              <motion.div className="lp-vnode" style={{ bottom: '15%', right: '10%' }} animate={floatVariant(1.5).animate}>
                <div className="lp-vnode-header"><div className="lp-vnode-icon">💼</div> Career Suite</div>
                <div className="lp-vnode-desc">Generating tailored cover letters and resume matrices.</div>
              </motion.div>

              <motion.div className="lp-vnode" style={{ top: '15%', right: '10%', opacity: 0.5 }} animate={floatVariant(2.5).animate}>
                <div className="lp-vnode-header"><div className="lp-vnode-icon">📊</div> Analytics</div>
                <div className="lp-vnode-desc">Processing usage trends (coming soon).</div>
              </motion.div>

              <motion.div className="lp-vnode" style={{ top: '50%', left: '50%', x: '-50%', y: '-50%', width: '280px', borderColor: 'var(--lp-text-h)' }} animate={floatVariant(0.8).animate}>
                <div className="lp-vnode-header"><div className="lp-vnode-icon">⚡</div> Workflow Studio</div>
                <div className="lp-vnode-desc">Orchestrating agents and executing AI pipelines across all connected platform modules.</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Why FlowForge */}
      <section id="why-flowforge" className="lp-section lp-section-border">
        <div className="lp-container">
          <motion.div 
            className="lp-section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20px" }}
            variants={fadeUpVariant}
          >
            <span className="lp-eyebrow">The Problem</span>
            <h2 className="lp-section-title">Context Switching Kills Productivity</h2>
            <p className="lp-section-desc">Modern work is fragmented across too many unintegrated tools.</p>
          </motion.div>

          <motion.div className="lp-fragment-grid" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-20px" }} variants={containerVariant}>
            <motion.div variants={fadeUpVariant} className="lp-fragment-col">
              <h3>The Old Way</h3>
              <p>You constantly switch between isolated apps, losing context and wasting time copying data back and forth.</p>
              <div className="lp-tool-list">
                <div className="lp-tool-item strike"><span>✕</span> ChatGPT for AI writing</div>
                <div className="lp-tool-item strike"><span>✕</span> Notion for documentation</div>
                <div className="lp-tool-item strike"><span>✕</span> Make.com for workflows</div>
                <div className="lp-tool-item strike"><span>✕</span> Canvas for resumes</div>
              </div>
            </motion.div>

            <motion.div variants={fadeUpVariant} className="lp-fragment-col">
              <motion.div className="lp-unity-box" whileHover={{ scale: 1.02 }} transition={{ duration: 0.4, ease: "easeOut" }}>
                <img src="/logo.png" className="lp-unity-logo-img" alt="FlowForge Logo" />
                <h4>The FlowForge Way</h4>
                <p>One unified platform where your data, AI tools, and workflows live together. Everything connects seamlessly, automating away the manual copy-paste work.</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. Platform Modules */}
      <section id="modules" className="lp-section lp-section-border">
        <div className="lp-container">
          <motion.div 
            className="lp-section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20px" }}
            variants={fadeUpVariant}
          >
            <span className="lp-eyebrow">The Journey</span>
            <h2 className="lp-section-title">Your AI-Powered Growth Journey</h2>
            <p className="lp-section-desc" style={{ marginBottom: '32px' }}>Learn faster, build real-world projects, and turn your skills into opportunities using the FlowForge ecosystem.</p>
            <div className="lp-journey-indicator-bar">
              <span className="lp-journey-step"><span className="lp-step-icon">📚</span> Learn</span>
              <span className="lp-journey-step-arrow">→</span>
              <span className="lp-journey-step"><span className="lp-step-icon">⚡</span> Build</span>
              <span className="lp-journey-step-arrow">→</span>
              <span className="lp-journey-step"><span className="lp-step-icon">💼</span> Get Hired</span>
            </div>
          </motion.div>

          <motion.div className="lp-modules-container" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-20px" }} variants={containerVariant}>
            {['knowledge-hub', 'workflow-studio', 'career-suite'].map((id, index) => {
              const mod = platformModules.find(m => m.id === id);
              if (!mod) return null;
              const CardComponent = mod.enabled ? motion.a : motion.div;
              return (
                <Fragment key={mod.id}>
                  {index > 0 && (
                    <div className="lp-journey-connector">
                      <div className="lp-connector-arrow" />
                    </div>
                  )}
                  <CardComponent 
                    variants={fadeUpVariant}
                    whileHover={
                      mod.id === 'career-suite'
                        ? { y: -12, scale: 1.025, rotateX: 2, rotateY: -2, boxShadow: 'var(--lp-shadow-hover), var(--lp-featured-glow-hover)' }
                        : (mod.enabled ? { y: -10, rotateX: 2, rotateY: -2, boxShadow: 'var(--lp-shadow-hover)' } : {})
                    }
                    className={`lp-mod-card ${mod.id === 'career-suite' ? 'featured' : ''} ${mod.id === 'knowledge-hub' ? 'step-start' : ''} ${!mod.enabled ? 'disabled' : ''}`}
                    style={{ cursor: mod.enabled ? 'pointer' : 'default', opacity: mod.enabled ? 1 : 0.7 }}
                    {...(mod.enabled ? {
                      href: "/platform",
                      onClick: (e: React.MouseEvent) => {
                        e.preventDefault();
                        onLaunchApp();
                      }
                    } : {})}
                  >
                    {mod.journeyLabel && (
                      <div className="lp-mod-journey-label">
                        {mod.journeyLabel}
                      </div>
                    )}
                    <div className="lp-mod-icon">{mod.icon}</div>
                    <h3 className="lp-mod-title">
                      {mod.enabled ? (
                        <span className="lp-mod-title-link">{mod.name}</span>
                      ) : (
                        <span style={{ color: 'var(--lp-text-h)' }}>{mod.name}</span>
                      )}
                    </h3>
                    
                    <div className="lp-mod-meta">
                      {mod.provider && <span className="lp-mod-badge provider">Powered by {mod.provider}</span>}
                      {mod.status === 'active' && <span className="lp-mod-badge status">STATUS: ACTIVE</span>}
                      {mod.status === 'active' && (
                        <div className="lp-live-badge-container">
                          <span className="lp-mod-badge live-indicator">
                            <span className="lp-pulse-dot" /> LIVE NOW
                          </span>
                        </div>
                      )}
                      {mod.launchMessage && <span className="lp-mod-badge status" style={{ background: 'transparent', border: '1px dashed var(--lp-border-strong)', color: 'var(--lp-text)' }}>{mod.launchMessage}</span>}
                    </div>

                    <p className="lp-mod-desc">{mod.description}</p>
                    <ul className="lp-mod-features" style={{ opacity: mod.enabled ? 1 : 0.6 }}>
                      {mod.features.map((feat, j) => (
                        <li key={j}>{feat}</li>
                      ))}
                    </ul>

                    {mod.enabled && (
                      <div className="lp-mod-cta-wrapper">
                        <span className="lp-mod-cta-btn">
                          {mod.ctaText || 'Launch'} <span className="arrow">→</span>
                        </span>
                      </div>
                    )}
                  </CardComponent>
                </Fragment>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* 4.5. Why This Journey Works */}
      <section className="lp-section lp-journey-why lp-section-border">
        <div className="lp-container">
          <motion.div 
            className="lp-section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20px" }}
            variants={fadeUpVariant}
          >
            <span className="lp-eyebrow">Synergy</span>
            <h2 className="lp-section-title">Why This Journey Works</h2>
            <p className="lp-section-desc">Traditional learning is broken and fragmented. FlowForge closes the loop.</p>
          </motion.div>

          <motion.div 
            className="lp-journey-why-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20px" }}
            variants={containerVariant}
          >
            <motion.div variants={fadeUpVariant} className="lp-journey-why-card">
              <div className="lp-journey-why-icon">📚</div>
              <h4>Learn Without Building Creates Limited Experience</h4>
              <p>Passively consuming tutorials leads to the tutorial hell. FlowForge immediately guides you from learning concepts to building active workflows in NodeCraft AI.</p>
            </motion.div>

            <motion.div variants={fadeUpVariant} className="lp-journey-why-card">
              <div className="lp-journey-why-icon">⚡</div>
              <h4>Building Without Showcasing Creates Limited Opportunities</h4>
              <p>Creating portfolio projects without presenting them properly makes you invisible to recruiters. CareerOS helps you package your automated workflows and turn them into visible opportunities.</p>
            </motion.div>

            <motion.div variants={fadeUpVariant} className="lp-journey-why-card highlighted">
              <div className="lp-journey-why-icon">✓</div>
              <h4>FlowForge helps you:</h4>
              <ul className="lp-journey-why-list">
                <li><span className="check">✓</span> Learn valuable skills</li>
                <li><span className="check">✓</span> Apply them through real projects</li>
                <li><span className="check">✓</span> Present them professionally to employers</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section id="how-it-works" className="lp-section lp-section-border">
        <div className="lp-container">
          <motion.div className="lp-section-header" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-20px" }} variants={fadeUpVariant}>
            <span className="lp-eyebrow">Workflow</span>
            <h2 className="lp-section-title">From Idea to Execution</h2>
            <p className="lp-section-desc">How data moves through the FlowForge ecosystem.</p>
          </motion.div>

          <motion.div className="lp-timeline" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-20px" }} variants={containerVariant}>
            {[
              { step: '01', title: 'Import Information', desc: 'Bring your documents, notes, and raw data into the secure Knowledge Hub.' },
              { step: '02', title: 'Organize Knowledge', desc: 'AI automatically categorizes, tags, and prepares your data for instant retrieval.' },
              { step: '03', title: 'Build AI Workflows', desc: 'Connect logic nodes in the Studio to tell the AI exactly how to process your information.' },
              { step: '04', title: 'Generate Results', desc: 'Execute your pipeline to generate tailored cover letters, deep research, or formatted content.' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUpVariant} className="lp-timeline-step">
                <div className="lp-step-dot">{item.step}</div>
                <h4 className="lp-step-title">{item.title}</h4>
                <p className="lp-step-desc">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. Built For Everyone (Use Cases) */}
      <section className="lp-section lp-section-border">
        <div className="lp-container">
          <motion.div 
            className="lp-section-header" 
            style={{ marginBottom: '64px' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20px" }}
            variants={fadeUpVariant}
          >
            <span className="lp-eyebrow">Audience</span>
            <h2 className="lp-section-title">Built For Everyone</h2>
          </motion.div>
          
          <motion.div className="lp-usecases-grid" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-20px" }} variants={containerVariant}>
            {audiences.map((audience, i) => (
              <motion.div 
                key={i} 
                variants={fadeUpVariant}
                className="lp-usecase-card"
              >
                <div className="lp-usecase-header">
                  <span className="lp-usecase-icon">{audience.icon}</span>
                  <h3>{audience.name}</h3>
                </div>
                <div className="lp-usecase-module-badge">Powered by {audience.module}</div>
                <p className="lp-usecase-desc">{audience.desc}</p>
                <ul className="lp-usecase-workflow">
                  {audience.steps.map((step, j) => (
                    <li key={j}>{step}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 7. Future Ecosystem */}
      <section id="ecosystem" className="lp-section lp-section-border">
        <div className="lp-container">
          <motion.div className="lp-section-header" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-20px" }} variants={fadeUpVariant}>
            <span className="lp-eyebrow">Architecture</span>
            <h2 className="lp-section-title">The Living Ecosystem</h2>
            <p className="lp-section-desc">FlowForge is continuously expanding its capabilities.</p>
          </motion.div>

          <motion.div className="lp-ecosystem" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-20px" }} variants={fadeUpVariant}>
            <motion.div className="lp-eco-core" whileHover={{ scale: 1.05 }}>
              FlowForge Core OS
            </motion.div>
            
            <motion.div className="lp-eco-branches" variants={containerVariant}>
              {/* Active Modules */}
              {platformModules.filter(m => m.status === 'active').map(mod => (
                <motion.div key={mod.id} variants={fadeUpVariant} className="lp-eco-node active">
                  {mod.name}
                </motion.div>
              ))}
              
              {/* Future Modules */}
              {platformModules.filter(m => m.status === 'coming_soon').map(mod => (
                <motion.div key={mod.id} variants={fadeUpVariant} className="lp-eco-node future">
                  {mod.name}
                  <span className="lp-eco-badge">Coming Soon</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="lp-cta-section">
        <div className="lp-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-20px" }} variants={fadeUpVariant}>
            <h2 className="lp-cta-title">Stop Managing Tools.<br/>Start Building Flow.</h2>
            <div className="lp-cta-actions">
              <motion.button 
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                type="button" 
                className="lp-btn-link primary" 
                style={{ padding: '16px 40px', fontSize: '16px' }}
                onClick={onLaunchApp}
              >
                Launch FlowForge
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <a href="#" className="lp-logo-link" onClick={handleScroll('hero')}>
                <img src="/logo.png" className="lp-logo-img" alt="FlowForge Logo" />
                <span>FlowForge</span>
              </a>
              <p>The Operating System For AI-Powered Work.</p>
            </div>

            <div>
              <h5 className="lp-footer-title">Platform</h5>
              <ul className="lp-footer-links">
                <li><a href="#modules" onClick={handleScroll('modules')}>Workflow Studio</a></li>
                <li><a href="#modules" onClick={handleScroll('modules')}>Knowledge Hub</a></li>
                <li><a href="#modules" onClick={handleScroll('modules')}>Career Suite</a></li>
              </ul>
            </div>

            <div>
              <h5 className="lp-footer-title">Resources</h5>
              <ul className="lp-footer-links">
                <li><a href="#how-it-works" onClick={handleScroll('how-it-works')}>How it Works</a></li>
                <li><a href="#ecosystem" onClick={handleScroll('ecosystem')}>Ecosystem</a></li>
                <li><a href="#why-flowforge" onClick={handleScroll('why-flowforge')}>Why Us</a></li>
              </ul>
            </div>

            <div>
              <h5 className="lp-footer-title">Connect</h5>
              <ul className="lp-footer-links">
                <li><a href="https://github.com/jeedijoshua-art/flowforgeai" target="_blank" rel="noopener noreferrer">GitHub Repo</a></li>
                <li><a href="https://github.com/jeedijoshua-art/flowforgeai/issues" target="_blank" rel="noopener noreferrer">Report Issue</a></li>
              </ul>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <span>© 2026 FlowForge AI. All rights reserved.</span>
            <span>Designed for peak productivity.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
