'use client'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg
      width="240"
      height="60"
      viewBox="0 0 240 60"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Ícone */}
      <rect x="5" y="10" width="40" height="40" rx="8" fill="#2D7DF6" />
      <path
        d="M20 20 L30 30 L20 40"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Texto */}
      <text
        x="60"
        y="38"
        fontFamily="Inter"
        fontSize="28"
        fontWeight="700"
        fill="#0A2540"
      >
        Vitrine
        <tspan fill="#FF8C42">Fast</tspan>
      </text>
    </svg>
  )
}

export function LogoSmall({ className = '' }: { className?: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Ícone apenas */}
      <rect x="5" y="5" width="40" height="40" rx="8" fill="#2D7DF6" />
      <path
        d="M18 18 L30 32 L18 46"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
