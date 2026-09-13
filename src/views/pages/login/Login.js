import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './login.module.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

const Login = () => {
  const navigate = useNavigate()

  // State Management
  const [activeTab, setActiveTab] = useState('credentials') // 'credentials' or 'passkey'
  const [realm, setRealm] = useState('default')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isCapsLock, setIsCapsLock] = useState(false)
  
  // Simulated Authentication States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitPhase, setSubmitPhase] = useState('tunnel') // 'tunnel', 'mfa', 'handshake'
  const [loaderMessage, setLoaderMessage] = useState('')
  const [passkeyStatus, setPasskeyStatus] = useState('idle') // 'idle', 'scanning', 'verified'
  
  // OTP States
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]

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

  // Handle standard credentials login submit
  const handleLoginSubmit = (e) => {
    e.preventDefault()
    if (!username || !password) return

    setIsSubmitting(true)
    setSubmitPhase('tunnel')
    setLoaderMessage('Establishing secure cryptographic tunnel...')

    // Phase 1: Simulate connection tunnel config
    setTimeout(() => {
      setLoaderMessage('Authorizing client signature with PixelMind IT Solutions server...')
      setTimeout(() => {
        setSubmitPhase('mfa')
      }, 1000)
    }, 1200)
  }

  // Handle Passkey simulation login
  const handlePasskeyAuth = () => {
    setPasskeyStatus('scanning')
    setIsSubmitting(true)
    setSubmitPhase('tunnel')
    setLoaderMessage('Accessing local authenticator hardware via WebAuthn...')

    setTimeout(() => {
      setLoaderMessage('Verifying cryptographic signature on authentication server...')
      setTimeout(() => {
        setLoaderMessage('Signature verified. Finalizing handshake...')
        setSubmitPhase('handshake')
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
      }, 1200)
    }, 1500)
  }

  // Shift focus for OTP inputs
  const handleOtpChange = (index, value) => {
    const cleanValue = value.replace(/[^0-9]/g, '')
    if (!cleanValue) {
      const newOtp = [...otp]
      newOtp[index] = ''
      setOtp(newOtp)
      return
    }

    const singleDigit = cleanValue.substring(cleanValue.length - 1)
    const newOtp = [...otp]
    newOtp[index] = singleDigit
    setOtp(newOtp)

    // Shift focus to next input
    if (index < 5) {
      otpRefs[index + 1].current.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp]
      newOtp[index - 1] = ''
      setOtp(newOtp)
      otpRefs[index - 1].current.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '')
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      otpRefs[5].current.focus()
    }
  }

  // Handle MFA completion
  const handleMfaVerify = (e) => {
    e.preventDefault()
    const otpCode = otp.join('')
    if (otpCode.length !== 6) return

    setSubmitPhase('handshake')
    setLoaderMessage('MFA verified. Exchanging OIDC tokens...')

    setTimeout(() => {
      setLoaderMessage('Creating user session environment...')
      setTimeout(() => {
        navigate('/dashboard')
      }, 800)
    }, 1000)
  }

  // Cancel login flow back to credentials page
  const handleCancel = () => {
    setIsSubmitting(false)
    setSubmitPhase('tunnel')
    setOtp(['', '', '', '', '', ''])
    setPasskeyStatus('idle')
  }

  return (
    <div className={styles.container}>
      <div className={styles.splitLayout}>
        
        {/* Left branding/features panel */}
        <div className={styles.infoPanel}>
          <div className={styles.infoBranding}>
            <div className={styles.brandLogo} style={{ background: 'none', boxShadow: 'none', width: 'auto', height: 'auto' }}>
              <svg viewBox="0 0 100 100" width="38" height="38">
                <polygon points="50,8 86,29 86,71 50,92 14,71 14,29" fill="none" stroke="#3b82f6" strokeWidth="3.5" strokeLinejoin="round"/>
                <path d="M50 47 L65 39 L50 31 L35 39 Z" fill="#00e5ff"/>
                <path d="M47 50 L34 42 L34 58 L47 66 Z" fill="#ffffff" opacity="0.9"/>
                <path d="M53 50 L53 66 L66 58 L66 42 Z" fill="#ffffff" opacity="0.5"/>
                <path d="M50 16 L56 20 L50 24 L44 20 Z" fill="#00e5ff"/>
                <path d="M25 32 L29 35 L25 38 L21 35 Z" fill="#ffffff"/>
                <path d="M75 32 L79 35 L75 38 L71 35 Z" fill="#ffffff"/>
                <path d="M25 62 L29 65 L25 68 L21 65 Z" fill="#ffffff"/>
                <path d="M75 62 L79 65 L75 68 L71 65 Z" fill="#ffffff"/>
                <path d="M50 76 L56 80 L50 84 L44 80 Z" fill="#00e5ff"/>
                <path d="M50 20 L50 30 M25 35 L32 40 M75 35 L68 40 M25 65 L32 60 M75 65 L68 60 M50 80 L50 70" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className={styles.brandName}>PIXELMIND IT SOLUTIONS</span>
          </div>

          <div className={styles.infoContent}>
            <h1>Secure Gateway for Digital Workspace</h1>
            <p>
              Access your centralized PixelMind IT Solutions platform. Protect resources with context-aware security policies and seamless authorization protocols.
            </p>

            <div className={styles.featuresGrid}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <i className="fa fa-key" aria-hidden="true"></i>
                </div>
                <div className={styles.featureText}>
                  <h4>Single Sign-On (SSO)</h4>
                  <p>One identity credentials to access authorized integrated workspaces seamlessly.</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <i className="fa fa-fingerprint" aria-hidden="true"></i>
                </div>
                <div className={styles.featureText}>
                  <h4>Passwordless MFA</h4>
                  <p>Support for secure hardware key authenticators, passkeys, and FIDO2 standards.</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <i className="fa fa-network-wired" aria-hidden="true"></i>
                </div>
                <div className={styles.featureText}>
                  <h4>Dedicated Auth Realm</h4>
                  <p>Isolated tenant spaces with customized permissions and access hierarchies.</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.infoFooter}>
            <div className={styles.statusIndicator}>
              <span className={styles.statusDot}></span>
              <span>All Systems Operational</span>
            </div>
            <div className={styles.securityNote}>
              <i className="fa fa-lock" aria-hidden="true"></i>
              <span>AES-256 Encrypted</span>
            </div>
          </div>
        </div>

        {/* Right authentication panel */}
        <div className={styles.formPanel}>
          
          {/* Simulated Login Overlay States */}
          {isSubmitting && (
            <div className={styles.overlay}>
              
              {/* Tunnel setup spinner / Loading states */}
              {(submitPhase === 'tunnel' || submitPhase === 'handshake') && (
                <>
                  <div className={styles.secureLoader}>
                    <div className={styles.loaderRing}></div>
                    <div className={styles.loaderRingInner}></div>
                    {submitPhase === 'handshake' ? (
                      <i className={`fa fa-check text-success ${styles.loaderIcon}`} aria-hidden="true"></i>
                    ) : (
                      <div className={styles.loaderIcon} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 100 100" width="36" height="36">
                          <polygon points="50,8 86,29 86,71 50,92 14,71 14,29" fill="none" stroke="#3b82f6" strokeWidth="3.5" strokeLinejoin="round"/>
                          <path d="M50 47 L65 39 L50 31 L35 39 Z" fill="#00e5ff"/>
                          <path d="M47 50 L34 42 L34 58 L47 66 Z" fill="#ffffff" opacity="0.9"/>
                          <path d="M53 50 L53 66 L66 58 L66 42 Z" fill="#ffffff" opacity="0.5"/>
                          <path d="M50 16 L56 20 L50 24 L44 20 Z" fill="#00e5ff"/>
                          <path d="M25 32 L29 35 L25 38 L21 35 Z" fill="#ffffff"/>
                          <path d="M75 32 L79 35 L75 38 L71 35 Z" fill="#ffffff"/>
                          <path d="M25 62 L29 65 L25 68 L21 65 Z" fill="#ffffff"/>
                          <path d="M75 62 L79 65 L75 68 L71 65 Z" fill="#ffffff"/>
                          <path d="M50 76 L56 80 L50 84 L44 80 Z" fill="#00e5ff"/>
                          <path d="M50 20 L50 30 M25 35 L32 40 M75 35 L68 40 M25 65 L32 60 M75 65 L68 60 M50 80 L50 70" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className={styles.loaderTitle}>
                    {submitPhase === 'handshake' ? 'Handshake Successful' : 'Security Checkpoint'}
                  </h3>
                  <p className={styles.loaderText}>{loaderMessage}</p>
                </>
              )}

              {/* MFA screen state */}
              {submitPhase === 'mfa' && (
                <div className={styles.mfaCard}>
                  <div className={styles.mfaIcon}>
                    <i className="fa fa-shield-halved" aria-hidden="true"></i>
                  </div>
                  <div className={styles.mfaHeader}>
                    <h3>Two-Factor Authentication</h3>
                    <p>Enter the 6-digit code from your authenticator app.</p>
                  </div>

                  <form onSubmit={handleMfaVerify}>
                    <div className={styles.otpGrid} onPaste={handleOtpPaste}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={otpRefs[index]}
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className={styles.otpInput}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>

                    <div className={styles.mfaActions}>
                      <button
                        type="submit"
                        disabled={otp.join('').length !== 6}
                        className={styles.btnPrimary}
                      >
                        Verify & Sign In
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className={styles.btnSecondary}
                      >
                        Cancel authentication
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
                <h2 className="fw-bold mb-1 text-white" style={{ letterSpacing: '0.5px' }}>Sign In</h2>
                <p className="text-secondary small">Authenticate to manage your adaptors and secure roles.</p>
              </div>

              {/* Security Realm Selection */}
              <div className={styles.realmContainer}>
                <label className={styles.realmLabel}>Authentication Realm</label>
                <div className={styles.realmWrapper}>
                  <select
                    value={realm}
                    onChange={(e) => setRealm(e.target.value)}
                    className={styles.realmSelect}
                  >
                    <option value="default">Default Security Domain</option>
                    <option value="enterprise">Active Directory (AD-FS)</option>
                    <option value="sandbox">Developer Sandbox Realm</option>
                  </select>
                </div>
              </div>

              {/* Navigation Tabs (Password vs Passkey) */}
              <div className={styles.tabsContainer}>
                <button
                  type="button"
                  className={`${styles.tab} ${activeTab === 'credentials' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('credentials')}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  className={`${styles.tab} ${activeTab === 'passkey' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('passkey')}
                >
                  Passkey / FIDO2
                </button>
              </div>

              {/* Form Content: Password / Credentials */}
              {activeTab === 'credentials' && (
                <form onSubmit={handleLoginSubmit}>
                  
                  {/* Username Field */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Username or Email</label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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

              {/* Form Content: Passkey Simulator */}
              {activeTab === 'passkey' && (
                <div className={styles.passkeyContainer}>
                  <div className={styles.passkeyIcon}>
                    <i className="fa fa-fingerprint" aria-hidden="true"></i>
                  </div>
                  <h4 className={styles.passkeyTitle}>FIDO2 Passwordless Auth</h4>
                  <p className={styles.passkeyDesc}>
                    Use biometrics, physical security keys, or your device passcode for cryptographic authentication.
                  </p>
                  <button
                    type="button"
                    onClick={handlePasskeyAuth}
                    className={styles.btnPrimary}
                  >
                    <i className="fa fa-key" aria-hidden="true"></i>
                    <span>Use Security Key</span>
                  </button>
                </div>
              )}

              {/* Social / SSO Integrations */}
              <div className={styles.divider}>Or authenticating with</div>

              <div className={styles.ssoGrid}>
                <button
                  type="button"
                  className={styles.ssoButton}
                  onClick={() => {
                    setIsSubmitting(true);
                    setSubmitPhase('tunnel');
                    setLoaderMessage('Redirecting to Microsoft Azure Active Directory...');
                    setTimeout(() => {
                      setSubmitPhase('handshake');
                      setLoaderMessage('Authorized. Creating token profile...');
                      setTimeout(() => navigate('/dashboard'), 800);
                    }, 1500);
                  }}
                >
                  <i className="fa-brands fa-microsoft text-info" aria-hidden="true"></i>
                  <span className={styles.ssoButtonSpan}>Azure AD</span>
                </button>
                <button
                  type="button"
                  className={styles.ssoButton}
                  onClick={() => {
                    setIsSubmitting(true);
                    setSubmitPhase('tunnel');
                    setLoaderMessage('Redirecting to Google Identity Cloud Services...');
                    setTimeout(() => {
                      setSubmitPhase('handshake');
                      setLoaderMessage('Authorized. Exchanging OIDC keys...');
                      setTimeout(() => navigate('/dashboard'), 800);
                    }, 1500);
                  }}
                >
                  <i className="fa-brands fa-google text-danger" aria-hidden="true"></i>
                  <span className={styles.ssoButtonSpan}>Google ID</span>
                </button>
                <button
                  type="button"
                  className={styles.ssoButton}
                  onClick={() => {
                    setIsSubmitting(true);
                    setSubmitPhase('tunnel');
                    setLoaderMessage('Redirecting to GitHub Enterprise Server OAuth...');
                    setTimeout(() => {
                      setSubmitPhase('handshake');
                      setLoaderMessage('Authorized. Setting user scopes...');
                      setTimeout(() => navigate('/dashboard'), 800);
                    }, 1500);
                  }}
                >
                  <i className="fa-brands fa-github" aria-hidden="true"></i>
                  <span className={styles.ssoButtonSpan}>GitHub</span>
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default Login
