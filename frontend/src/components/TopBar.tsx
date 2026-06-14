import { useState, useEffect, useRef } from 'react'
import type { FC } from 'react'
import { useAuth } from '../context/AuthContext'

interface TopBarProps {
  executionState: 'idle' | 'running' | 'completed' | 'error'
  isRunning: boolean
  onRunWorkflow: () => void
  onSaveWorkflow: () => void
  workflowName: string
  onWorkflowNameChange: (name: string) => void
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  onLogoClick: () => void
  theme: 'dark' | 'light' | 'system'
  onThemeChange: (theme: 'dark' | 'light' | 'system') => void
}

export const TopBar: FC<TopBarProps> = ({
  executionState,
  isRunning,
  onRunWorkflow,
  onSaveWorkflow,
  workflowName,
  onWorkflowNameChange,
  saveStatus,
  onLogoClick,
  theme,
  onThemeChange
}) => {
  const { user, signInWithGoogle, signOut, loading } = useAuth()
  const [avatarError, setAvatarError] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Reset avatar error when user changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAvatarError(false)
    }, 0)
    return () => clearTimeout(timer)
  }, [user])

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [dropdownOpen])

  // Helper to render user avatar with fallback
  const renderAvatar = () => {
    if (!user) return null

    const meta = user.user_metadata
    const email = user.email || ''
    const name = meta?.full_name || meta?.name || email
    const firstLetter = name ? name.charAt(0).toUpperCase() : '?'
    const avatarUrl = meta?.avatar_url || meta?.picture

    if (avatarUrl && !avatarError) {
      return (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="user-avatar"
          onError={() => setAvatarError(true)}
        />
      )
    }

    return (
      <div className="user-avatar-placeholder">
        {firstLetter}
      </div>
    )
  }

  return (
    <header className="top-nav">
      <div className="brand-and-name">
        <div className="brand-logo-clickable" onClick={onLogoClick} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8.5px' }} title="Return to Landing Page">
          <img src="/logo.png" className="nav-logo-img" alt="FlowForge Logo" style={{ height: '24px', width: 'auto', objectFit: 'contain' }} />
          <span className="brand-text">FlowForge AI</span>
        </div>
        <span className="divider">/</span>
        <input
          type="text"
          className="workflow-name-input"
          value={workflowName}
          onChange={(e) => onWorkflowNameChange(e.target.value)}
          disabled={isRunning}
          placeholder="Untitled Workflow"
          title="Click to rename workflow"
        />
        
        <div className="status-container" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {import.meta.env.DEV && (
            <span className="status-chip" style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.15)', textTransform: 'none', letterSpacing: 'normal' }}>
              ⚡ frontend
            </span>
          )}
          {executionState === 'running' && (
            <span className="status-chip running">
              <span className="status-chip-dot" /> Running
            </span>
          )}
          {executionState === 'error' && (
            <span className="status-chip error">
              <span className="status-chip-dot" /> Exec Error
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="status-chip saving">
              <span className="status-chip-dot" /> Saving...
            </span>
          )}
          {(saveStatus === 'saved' || saveStatus === 'idle') && (
            <span className="status-chip saved">
              <span className="status-chip-dot" /> Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="status-chip error">
              <span className="status-chip-dot" /> Save Error
            </span>
          )}
        </div>
      </div>

      <div className="nav-actions">
        <button
          type="button"
          className="btn primary"
          onClick={onRunWorkflow}
          disabled={isRunning}
        >
          {isRunning ? 'Running...' : 'Run'}
        </button>
        <button className="btn" onClick={onSaveWorkflow} disabled={isRunning}>
          Save
        </button>

        {loading ? (
          <span className="auth-loading-text">Loading auth...</span>
        ) : user ? (
          <div className="user-profile">
            {renderAvatar()}
            <span className="user-name">
              {user.user_metadata?.full_name || user.email}
            </span>
            <button type="button" className="btn logout-btn" onClick={signOut}>
              Sign Out
            </button>
          </div>
        ) : (
          <button type="button" className="btn login-btn" onClick={signInWithGoogle}>
            Sign In with Google
          </button>
        )}

        <div className="settings-dropdown-container" ref={dropdownRef}>
          <button
            type="button"
            className={`btn icon-btn ${dropdownOpen ? 'active' : ''}`}
            disabled={isRunning}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="Settings"
            title="Settings"
          >
            ⚙️
          </button>
          
          {dropdownOpen && (
            <div className="settings-dropdown-menu">
              <div className="dropdown-header">Theme Settings</div>
              <button
                type="button"
                className={`dropdown-item ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => {
                  onThemeChange('dark')
                  setDropdownOpen(false)
                }}
              >
                <span className="dropdown-item-icon">🌙</span> Dark Mode
              </button>
              <button
                type="button"
                className={`dropdown-item ${theme === 'light' ? 'active' : ''}`}
                onClick={() => {
                  onThemeChange('light')
                  setDropdownOpen(false)
                }}
              >
                <span className="dropdown-item-icon">☀️</span> Light Mode
              </button>
              <button
                type="button"
                className={`dropdown-item ${theme === 'system' ? 'active' : ''}`}
                onClick={() => {
                  onThemeChange('system')
                  setDropdownOpen(false)
                }}
              >
                <span className="dropdown-item-icon">💻</span> System Theme
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
