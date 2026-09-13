import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './login.module.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import AuthIllustration from './AuthIllustration'

const Login = () => {
  const navigate = useNavigate()

  // State Management: 'credentials' | 'mfa'
  const [activeTab, setActiveTab] = useState('credentials')

  // Credential Form State
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isCapsLock, setIsCapsLock] = useState(false)

  // Direct MFA Form State
  const [mfaUsername, setMfaUsername] = useState('')
  const [mfaOtp, setMfaOtp] = useState(['', '', '', '', '', ''])
  const mfaOtpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]

  // Overlay MFA State (for 2FA step after password login)
  const [overlayOtp, setOverlayOtp] = useState(['', '', '', '', '', ''])
  const overlayOtpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]

  // Simulated Submission & Auth Pipeline States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitPhase, setSubmitPhase] = useState('tunnel') // 'tunnel', 'mfa', 'handshake'
  const [loaderMessage, setLoaderMessage] = useState('')


  // Caps Lock detection
  const handleKeyUp = (e) => {
    if (e.getModifierState) {
      setIsCapsLock(e.getModifierState('CapsLock'))
    }
  }

  const handleKeyDown = (e) => {
    if (e.getModifierState) {
      setIsCapsLock(e.getModifierState('CapsLock'))
    }
  }

  // Handle Credential Login submit
  const handleCredentialSubmit = (e) => {
    e.preventDefault()
    if (!username || !password) return

    setIsSubmitting(true)
    setSubmitPhase('tunnel')
    setLoaderMessage('Establishing secure cryptographic TLS tunnel...')

    setTimeout(() => {
      setLoaderMessage('Verifying credentials with Identity Provider...')
      setTimeout(() => {
        setSubmitPhase('mfa')
      }, 900)
    }, 1100)
  }

  // Handle Direct MFA Login submit
  const handleDirectMfaSubmit = (e) => {
    e.preventDefault()
    const otpCode = mfaOtp.join('')
    if (!mfaUsername || otpCode.length !== 6) return

    setIsSubmitting(true)
    setSubmitPhase('tunnel')
    setLoaderMessage('Validating TOTP security token with authentication server...')

    setTimeout(() => {
      setLoaderMessage('Security token verified. Establishing user session...')
      setSubmitPhase('handshake')
      setTimeout(() => {
        navigate('/dashboard')
      }, 900)
    }, 1200)
  }

  // Shift focus for Direct MFA OTP inputs
  const handleOtpChange = (index, value, isDirect = true) => {
    const cleanValue = value.replace(/[^0-9]/g, '')
    const targetOtp = isDirect ? mfaOtp : overlayOtp
    const setTargetOtp = isDirect ? setMfaOtp : setOverlayOtp
    const targetRefs = isDirect ? mfaOtpRefs : overlayOtpRefs

    if (!cleanValue) {
      const newOtp = [...targetOtp]
      newOtp[index] = ''
      setTargetOtp(newOtp)
      return
    }

    const singleDigit = cleanValue.substring(cleanValue.length - 1)
    const newOtp = [...targetOtp]
    newOtp[index] = singleDigit
    setTargetOtp(newOtp)

    if (index < 5 && targetRefs[index + 1]?.current) {
      targetRefs[index + 1].current.focus()
    }
  }

  const handleOtpKeyDown = (index, e, isDirect = true) => {
    const targetOtp = isDirect ? mfaOtp : overlayOtp
    const setTargetOtp = isDirect ? setMfaOtp : setOverlayOtp
    const targetRefs = isDirect ? mfaOtpRefs : overlayOtpRefs

    if (e.key === 'Backspace' && !targetOtp[index] && index > 0 && targetRefs[index - 1]?.current) {
      const newOtp = [...targetOtp]
      newOtp[index - 1] = ''
      setTargetOtp(newOtp)
      targetRefs[index - 1].current.focus()
    }
  }

  const handleOtpPaste = (e, isDirect = true) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '')
    const setTargetOtp = isDirect ? setMfaOtp : setOverlayOtp
    const targetRefs = isDirect ? mfaOtpRefs : overlayOtpRefs

    if (pastedData.length === 6) {
      const newOtp = pastedData.split('')
      setTargetOtp(newOtp)
      if (targetRefs[5]?.current) {
        targetRefs[5].current.focus()
      }
    }
  }

  // Handle Overlay MFA verify (after credential login)
  const handleOverlayMfaVerify = (e) => {
    e.preventDefault()
    const otpCode = overlayOtp.join('')
    if (otpCode.length !== 6) return

    setSubmitPhase('handshake')
    setLoaderMessage('MFA verified successfully. Exchanging OIDC access tokens...')

    setTimeout(() => {
      setLoaderMessage('Initializing authenticated workspace session...')
      setTimeout(() => {
        navigate('/dashboard')
      }, 700)
    }, 900)
  }

  // Cancel flow back to form
  const handleCancel = () => {
    setIsSubmitting(false)
    setSubmitPhase('tunnel')
    setOverlayOtp(['', '', '', '', '', ''])
  }

  return (
    <div className={styles.container}>
      <div className={styles.splitLayout}>
        
        {/* Left branding & vector illustration panel */}
        <div className={styles.infoPanel}>
          <div className={styles.infoBranding}>
            <div className={styles.brandLogo}>
              <svg viewBox="0 0 100 100" width="30" height="30">
                <polygon points="50,8 86,29 86,71 50,92 14,71 14,29" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinejoin="round"/>
                <path d="M50 47 L65 39 L50 31 L35 39 Z" fill="#38bdf8"/>
                <path d="M47 50 L34 42 L34 58 L47 66 Z" fill="#ffffff" opacity="0.95"/>
                <path d="M53 50 L53 66 L66 58 L66 42 Z" fill="#93c5fd" opacity="0.8"/>
              </svg>
            </div>
            <div className={styles.brandTitleGroup}>
              <span className={styles.brandName}>PIXELMIND IT SOLUTIONS</span>
              <span className={styles.brandSubtitle}>Central Identity & Access Platform</span>
            </div>
          </div>

          {/* Suitable Vector Graphic for Auth Application */}
          <div className={styles.illustrationContainer}>
            <AuthIllustration />
          </div>

          {/* Left panel footer */}
          <div className={styles.infoFooter}>
            <div className={styles.statusIndicator}>
              <span className={styles.statusDot}></span>
              <span>All Systems Operational</span>
            </div>
            <div className={styles.securityNote}>
              <i className="fa fa-shield-halved" style={{ color: '#38bdf8' }} aria-hidden="true"></i>
              <span>AES-256 TLS & FIDO2</span>
            </div>
          </div>
        </div>

        {/* Right authentication panel */}
        <div className={styles.formPanel}>
          
          {/* Simulated Login Overlay (Tunnel & MFA checkpoint) */}
          {isSubmitting && (
            <div className={styles.overlay}>
              {(submitPhase === 'tunnel' || submitPhase === 'handshake') && (
                <>
                  <div className={styles.secureLoader}>
                    <div className={styles.loaderRing}></div>
                    <div className={styles.loaderRingInner}></div>
                    {submitPhase === 'handshake' ? (
                      <i className={`fa fa-circle-check ${styles.loaderIcon}`} style={{ color: '#10b981' }} aria-hidden="true"></i>
                    ) : (
                      <i className={`fa fa-lock ${styles.loaderIcon}`} aria-hidden="true"></i>
                    )}
                  </div>
                  <h3 className={styles.loaderTitle}>
                    {submitPhase === 'handshake' ? 'Authentication Approved' : 'Verifying Security Gateway'}
                  </h3>
                  <p className={styles.loaderText}>{loaderMessage}</p>
                </>
              )}

              {/* MFA checkpoint screen after credential login */}
              {submitPhase === 'mfa' && (
                <div className={styles.mfaCard}>
                  <div className={styles.mfaIcon}>
                    <i className="fa fa-shield-halved" aria-hidden="true"></i>
                  </div>
                  <div className={styles.mfaHeader}>
                    <h3>Two-Factor Authentication</h3>
                    <p>Enter the 6-digit code from your authenticator device for <strong>{username}</strong>.</p>
                  </div>

                  <form onSubmit={handleOverlayMfaVerify}>
                    <div className={styles.otpGrid} onPaste={(e) => handleOtpPaste(e, false)}>
                      {overlayOtp.map((digit, index) => (
                        <input
                          key={index}
                          ref={overlayOtpRefs[index]}
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value, false)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e, false)}
                          className={styles.otpInput}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>

                    <div className={styles.mfaActions}>
                      <button
                        type="submit"
                        disabled={overlayOtp.join('').length !== 6}
                        className={styles.btnPrimary}
                      >
                        Verify MFA & Sign In
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className={styles.btnSecondary}
                      >
                        Cancel & Return
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Normal Login Forms */}
          {!isSubmitting && (
            <>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Sign In</h2>
                <p className={styles.formSubtitle}>Authenticate your digital credentials to enter your workspace.</p>
              </div>

              {/* Navigation Tabs: Credential Authentication & MFA Login */}
              <div className={styles.tabsContainer}>
                <button
                  type="button"
                  className={`${styles.tab} ${activeTab === 'credentials' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('credentials')}
                >
                  <i className="fa fa-id-badge" aria-hidden="true"></i>
                  <span>Credential Login</span>
                </button>
                <button
                  type="button"
                  className={`${styles.tab} ${activeTab === 'mfa' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('mfa')}
                >
                  <i className="fa fa-shield-halved" aria-hidden="true"></i>
                  <span>MFA Login</span>
                </button>
              </div>

              {/* TAB 1: Credential Based Authentication */}
              {activeTab === 'credentials' && (
                <form onSubmit={handleCredentialSubmit}>
                  {/* Username Field */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Username or Email</label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value)
                          if (!mfaUsername) setMfaUsername(e.target.value)
                        }}
                        placeholder="admin@pixelminditsolutions.com"
                        required
                      />
                      <i className={`fa fa-user ${styles.inputIcon}`} aria-hidden="true"></i>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Password</label>
                    <div className={styles.inputWrapper}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={styles.inputField}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyUp={handleKeyUp}
                        onKeyDown={handleKeyDown}
                        placeholder="••••••••••••"
                        required
                      />
                      <i className={`fa fa-lock ${styles.inputIcon}`} aria-hidden="true"></i>
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex="-1"
                        aria-label="Toggle password visibility"
                      >
                        <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                      </button>
                    </div>

                    {isCapsLock && (
                      <div className={styles.capsWarning}>
                        <i className="fa fa-triangle-exclamation" aria-hidden="true"></i>
                        <span>Caps Lock is ON</span>
                      </div>
                    )}
                  </div>

                  {/* Options: Remember me & Forgot Password */}
                  <div className={styles.optionsRow}>
                    <label className={styles.rememberMe}>
                      <input type="checkbox" className={styles.rememberCheckbox} />
                      <span>Remember secure session</span>
                    </label>
                    <a href="#/forgot-password" className={styles.forgotLink}>
                      Forgot credentials?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className={styles.btnPrimary}
                    disabled={!username || !password}
                  >
                    <span>Authenticate Gateway</span>
                    <i className="fa fa-arrow-right" aria-hidden="true"></i>
                  </button>
                </form>
              )}

              {/* TAB 2: Multi-Factor Authentication (MFA) Direct Login */}
              {activeTab === 'mfa' && (
                <div className={styles.mfaDirectContainer}>
                  <div className={styles.mfaBadgeInfo}>
                    <div className={styles.mfaBadgeIcon}>
                      <i className="fa fa-mobile-screen-button" aria-hidden="true"></i>
                    </div>
                    <div className={styles.mfaBadgeText}>
                      <h5>Authenticator Code</h5>
                      <p>Enter the 6-digit TOTP code from your mobile authenticator app (Google Authenticator, Microsoft Authenticator, etc.).</p>
                    </div>
                  </div>

                  <form onSubmit={handleDirectMfaSubmit}>
                    {/* Username or Identity ID */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Username or Employee ID</label>
                      <div className={styles.inputWrapper}>
                        <input
                          type="text"
                          className={styles.inputField}
                          value={mfaUsername}
                          onChange={(e) => setMfaUsername(e.target.value)}
                          placeholder="e.g. admin@pixelminditsolutions.com"
                          required
                        />
                        <i className={`fa fa-user-shield ${styles.inputIcon}`} aria-hidden="true"></i>
                      </div>
                    </div>

                    {/* 6-Digit OTP Grid */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>6-Digit Security Token</label>
                      <div className={styles.otpGrid} onPaste={(e) => handleOtpPaste(e, true)}>
                        {mfaOtp.map((digit, index) => (
                          <input
                            key={index}
                            ref={mfaOtpRefs[index]}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value, true)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e, true)}
                            className={styles.otpInput}
                            placeholder="•"
                            autoFocus={index === 0}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={styles.btnPrimary}
                      disabled={!mfaUsername || mfaOtp.join('').length !== 6}
                    >
                      <span>Verify MFA & Sign In</span>
                      <i className="fa fa-shield-check" aria-hidden="true"></i>
                    </button>

                    <div className={styles.mfaHelpRow}>
                      <span className="text-secondary small">Lost authenticator access?</span>
                      <a
                        href="#/mfa-recovery"
                        className={styles.mfaHelpLink}
                        onClick={(e) => {
                          e.preventDefault()
                          setActiveTab('credentials')
                        }}
                      >
                        Use Credentials instead
                      </a>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default Login

