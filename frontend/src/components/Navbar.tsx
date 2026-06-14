import React, { useState, useEffect, useRef } from 'react'
import type { FC } from 'react'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

interface NavbarProps {
  currentPath: string
  onNavigate: (path: string) => void
  theme: 'dark' | 'light' | 'system'
  onThemeToggle: () => void
}

export const Navbar: FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  theme,
  onThemeToggle
}) => {
  const { user, signInWithGoogle, signOut, loading } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Track scroll position for scroll reactions
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  // Reset avatar error when user changes
  const [prevUserId, setPrevUserId] = useState<string | undefined>(user?.id)
  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id)
    setAvatarError(false)
  }

  const handleNavClick = (targetPath: string, scrollId?: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    if (scrollId) {
      if (currentPath === '/') {
        const el = document.getElementById(scrollId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        }
      } else {
        onNavigate('/')
        // Wait for landing page to render before scrolling
        setTimeout(() => {
          const el = document.getElementById(scrollId)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }, 150)
      }
    } else {
      onNavigate(targetPath)
    }
  }

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
          className="nav-avatar-img"
          onError={() => setAvatarError(true)}
        />
      )
    }
    return <div className="nav-avatar-placeholder">{firstLetter}</div>
  }

  const getUsername = () => {
    if (!user) return ''
    const meta = user.user_metadata
    return meta?.full_name || meta?.name || user.email?.split('@')[0] || 'User'
  }

  const isActive = (path: string) => currentPath === path

  return (
    <header className={`lp-navbar-root ${scrolled ? 'scrolled' : ''}`}>
      <div className="lp-navbar-container">
        {/* Logo */}
        <a href="/" className="nav-logo" onClick={handleNavClick('/')}>
          <img src="/logo.png" className="nav-logo-img" alt="FlowForge AI Logo" />
          <span className="nav-logo-text">FlowForge AI</span>
        </a>

        {/* Desktop Navigation Menu */}
        <nav className="nav-menu-desktop">
          <a
            href="/platform"
            className={`nav-menu-link ${isActive('/platform') ? 'active' : ''}`}
            onClick={handleNavClick('/platform')}
          >
            Workspace
            <span className="nav-link-indicator" />
          </a>
          <a
            href="#why-flowforge"
            className="nav-menu-link"
            onClick={handleNavClick('/', 'why-flowforge')}
          >
            About
            <span className="nav-link-indicator" />
          </a>
          <a
            href="#ecosystem"
            className="nav-menu-link"
            onClick={handleNavClick('/', 'ecosystem')}
          >
            Roadmap
            <span className="nav-link-indicator" />
          </a>
        </nav>

        {/* Actions Menu */}
        <div className="nav-actions-group">
          {/* Theme Toggle */}
          <button
            type="button"
            className="nav-theme-toggle"
            onClick={onThemeToggle}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '☼' : '☾'}
          </button>

          {/* User Section */}
          {loading ? (
            <div className="nav-auth-loading">Loading...</div>
          ) : user ? (
            <div className="nav-profile-container" ref={dropdownRef}>
              <button
                type="button"
                className={`nav-profile-trigger ${dropdownOpen ? 'active' : ''}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {renderAvatar()}
                <span className="nav-username">{getUsername()}</span>
              </button>

              {dropdownOpen && (
                <div className="nav-profile-dropdown">
                  <div className="nav-dropdown-header">
                    <span className="nav-dropdown-user-email">{user.email}</span>
                  </div>
                  <div className="nav-dropdown-divider" />
                  <button
                    type="button"
                    className="nav-dropdown-item"
                    onClick={() => {
                      setDropdownOpen(false)
                      onNavigate('/platform')
                    }}
                  >
                    <span>💻</span> Workspace
                  </button>
                  <button
                    type="button"
                    className="nav-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span>👤</span> Profile
                  </button>
                  <button
                    type="button"
                    className="nav-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span>⚙️</span> Settings
                  </button>
                  <div className="nav-dropdown-divider" />
                  <button
                    type="button"
                    className="nav-dropdown-item logout-item"
                    onClick={() => {
                      setDropdownOpen(false)
                      signOut()
                    }}
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="nav-signin-btn"
              onClick={signInWithGoogle}
            >
              Sign In
            </button>
          )}

          {/* Launch Platform Button */}
          <button
            type="button"
            className={`nav-cta-btn ${loading ? 'loading' : ''}`}
            onClick={() => onNavigate('/platform')}
          >
            {loading ? (
              <span className="nav-spinner" />
            ) : (
              <>
                Launch Platform <span className="cta-arrow">→</span>
              </>
            )}
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className={`nav-hamburger ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className="hamburger-line top" />
            <span className="hamburger-line mid" />
            <span className="hamburger-line bot" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="nav-mobile-drawer">
          <nav className="nav-menu-mobile">
            <a
              href="/platform"
              className={`nav-mobile-link ${isActive('/platform') ? 'active' : ''}`}
              onClick={handleNavClick('/platform')}
            >
              Workspace
            </a>
            <a
              href="#why-flowforge"
              className="nav-mobile-link"
              onClick={handleNavClick('/', 'why-flowforge')}
            >
              About
            </a>
            <a
              href="#ecosystem"
              className="nav-mobile-link"
              onClick={handleNavClick('/', 'ecosystem')}
            >
              Roadmap
            </a>
            <div className="nav-mobile-divider" />
            
            {user ? (
              <>
                <div className="nav-mobile-profile-info">
                  {renderAvatar()}
                  <div className="nav-mobile-user-details">
                    <span className="nav-mobile-name">{getUsername()}</span>
                    <span className="nav-mobile-email">{user.email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="nav-mobile-btn secondary"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    signOut()
                  }}
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                className="nav-mobile-btn secondary"
                onClick={() => {
                  setMobileMenuOpen(false)
                  signInWithGoogle()
                }}
              >
                Sign In
              </button>
            )}

            <button
              type="button"
              className="nav-mobile-btn primary"
              onClick={() => {
                setMobileMenuOpen(false)
                onNavigate('/platform')
              }}
            >
              Launch Platform →
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
