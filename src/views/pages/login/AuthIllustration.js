import React from 'react'

const AuthIllustration = () => {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <svg
        viewBox="0 0 540 440"
        width="100%"
        height="100%"
        style={{ maxWidth: '480px', filter: 'drop-shadow(0 15px 30px rgba(14, 116, 224, 0.2))' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Blue Gradients */}
          <linearGradient id="primaryShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="innerShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0c1e4a" />
            <stop offset="100%" stopColor="#0f2b6e" />
          </linearGradient>
          <linearGradient id="accentCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="glowRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#2563eb" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="badgeGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(30, 58, 138, 0.85)" />
            <stop offset="100%" stopColor="rgba(15, 23, 42, 0.9)" />
          </linearGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#2563eb" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
          </radialGradient>

          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Ambient Glow */}
        <circle cx="270" cy="210" r="170" fill="url(#centerGlow)" />

        {/* Outer Orbital Tech Rings */}
        <circle
          cx="270"
          cy="210"
          r="165"
          fill="none"
          stroke="#1e3a8a"
          strokeWidth="1.5"
          strokeDasharray="4 8"
          opacity="0.6"
        />
        <circle
          cx="270"
          cy="210"
          r="140"
          fill="none"
          stroke="url(#glowRingGrad)"
          strokeWidth="2"
          strokeDasharray="20 40 10 30"
          opacity="0.8"
        />
        <circle
          cx="270"
          cy="210"
          r="115"
          fill="none"
          stroke="#2563eb"
          strokeWidth="1"
          strokeDasharray="6 6"
          opacity="0.5"
        />

        {/* Circuit Interconnect Lines */}
        <path
          d="M 120 120 L 190 170 L 230 190"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.6"
        />
        <path
          d="M 420 120 L 350 170 L 310 190"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.6"
        />
        <path
          d="M 140 310 L 210 260 L 240 240"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.6"
        />
        <path
          d="M 400 310 L 330 260 L 300 240"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.6"
        />

        {/* Central Shield Graphic */}
        {/* Shield Shadow */}
        <path
          d="M 270 95 L 345 130 C 345 220 270 295 270 310 C 270 295 195 220 195 130 Z"
          fill="#000000"
          opacity="0.35"
          transform="translate(0, 10)"
        />

        {/* Shield Outer Border */}
        <path
          d="M 270 95 L 345 130 C 345 220 270 295 270 310 C 270 295 195 220 195 130 Z"
          fill="url(#primaryShieldGrad)"
          stroke="#60a5fa"
          strokeWidth="2.5"
        />

        {/* Shield Inner Plate */}
        <path
          d="M 270 108 L 332 138 C 332 215 270 282 270 295 C 270 282 208 215 208 138 Z"
          fill="url(#innerShieldGrad)"
          stroke="rgba(56, 189, 248, 0.4)"
          strokeWidth="1.5"
        />

        {/* Center Lock / Keyhole / Biometric Symbol */}
        <g transform="translate(270, 195)">
          {/* Lock Shackle */}
          <path
            d="M -18 -10 C -18 -24 18 -24 18 -10 L 18 0 L -18 0 Z"
            fill="none"
            stroke="url(#accentCyanGrad)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Lock Body */}
          <rect
            x="-26"
            y="0"
            width="52"
            height="42"
            rx="8"
            fill="url(#primaryShieldGrad)"
            stroke="#93c5fd"
            strokeWidth="2"
          />
          {/* Keyhole Circle */}
          <circle cx="0" cy="16" r="6" fill="#ffffff" />
          <polygon points="-3,19 3,19 4,28 -4,28" fill="#ffffff" />

          {/* Biometric Scan Wave Curves */}
          <path
            d="M -38 12 C -42 20 -42 30 -38 38"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M 38 12 C 42 20 42 30 38 38"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M -46 5 C -52 18 -52 35 -46 48"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M 46 5 C 52 18 52 35 46 48"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
        </g>

        {/* Floating Feature Card 1: MFA Protected (Top Right) */}
        <g transform="translate(340, 80)">
          <rect
            x="0"
            y="0"
            width="165"
            height="54"
            rx="12"
            fill="url(#badgeGlassGrad)"
            stroke="rgba(56, 189, 248, 0.4)"
            strokeWidth="1.5"
            filter="drop-shadow(0 8px 16px rgba(0,0,0,0.3))"
          />
          <circle cx="28" cy="27" r="15" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="1.5" />
          <path d="M 22 27 L 26 31 L 34 23" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="52" y="23" fill="#ffffff" fontSize="12" fontWeight="700" fontFamily="sans-serif">MFA Protected</text>
          <text x="52" y="38" fill="#94a3b8" fontSize="10" fontWeight="500" fontFamily="sans-serif">TOTP & Authenticator</text>
        </g>

        {/* Floating Feature Card 2: Credential Auth (Bottom Left) */}
        <g transform="translate(35, 260)">
          <rect
            x="0"
            y="0"
            width="165"
            height="54"
            rx="12"
            fill="url(#badgeGlassGrad)"
            stroke="rgba(59, 130, 246, 0.4)"
            strokeWidth="1.5"
            filter="drop-shadow(0 8px 16px rgba(0,0,0,0.3))"
          />
          <circle cx="28" cy="27" r="15" fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" strokeWidth="1.5" />
          <path d="M 23 27 A 5 5 0 1 1 31 23 L 35 27 L 31 31 L 29 29" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="52" y="23" fill="#ffffff" fontSize="12" fontWeight="700" fontFamily="sans-serif">Credential Gateway</text>
          <text x="52" y="38" fill="#94a3b8" fontSize="10" fontWeight="500" fontFamily="sans-serif">Centralized Identity</text>
        </g>

        {/* Floating Feature Card 3: Zero Trust Access (Bottom Right) */}
        <g transform="translate(345, 275)">
          <rect
            x="0"
            y="0"
            width="160"
            height="54"
            rx="12"
            fill="url(#badgeGlassGrad)"
            stroke="rgba(147, 197, 253, 0.3)"
            strokeWidth="1.5"
            filter="drop-shadow(0 8px 16px rgba(0,0,0,0.3))"
          />
          <circle cx="28" cy="27" r="15" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="1.5" />
          <path d="M 28 18 L 36 22 C 36 29 28 34 28 35 C 28 34 20 29 20 22 Z" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinejoin="round" />
          <text x="52" y="23" fill="#ffffff" fontSize="12" fontWeight="700" fontFamily="sans-serif">Zero-Trust Security</text>
          <text x="52" y="38" fill="#94a3b8" fontSize="10" fontWeight="500" fontFamily="sans-serif">256-Bit Encrypted</text>
        </g>

        {/* Orbiting Satellite Nodes */}
        <circle cx="105" cy="210" r="5" fill="#38bdf8" filter="url(#glowFilter)" />
        <circle cx="435" cy="210" r="5" fill="#60a5fa" filter="url(#glowFilter)" />
        <circle cx="270" cy="45" r="4" fill="#38bdf8" />
        <circle cx="270" cy="375" r="4" fill="#60a5fa" />
      </svg>
    </div>
  )
}

export default AuthIllustration
