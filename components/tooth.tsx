import type { CSSProperties } from "react"

const TOOTH_PATH =
  "M50 8 C35 2 15 6 12 26 C9 44 18 56 22 72 C26 88 28 104 36 104 C44 104 44 82 50 80 C56 82 56 104 64 104 C72 104 74 88 78 72 C82 56 91 44 88 26 C85 6 65 2 50 8 Z"

interface ToothProps {
  size?: number
  className?: string
  style?: CSSProperties
  mood?: "happy" | "wink" | "sparkle"
  cap?: boolean // birrete de graduación (modo universidades)
}

// Dientecito con carita. Las animaciones (parpadeo, brillo) viven en globals.css
export function Tooth({ size = 64, className = "", style, mood = "happy", cap = false }: ToothProps) {
  // Con birrete se agrega espacio arriba para que no se corte
  const top = cap ? -24 : 0
  return (
    <svg
      viewBox={`0 ${top} 100 ${110 - top}`}
      width={size}
      height={(size * (110 - top)) / 100}
      className={className}
      style={style}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tooth-shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>
      <path d={TOOTH_PATH} fill="url(#tooth-shine)" stroke="#7dd3fc" strokeWidth="3" strokeLinejoin="round" />
      <path d="M28 22 C30 15 38 12 44 13" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
      <g className="tooth-eyes">
        {mood === "wink" ? (
          <path d="M33 45 Q38 41 43 45" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
        ) : (
          <ellipse cx="38" cy="45" rx="4.5" ry="5.5" fill="#0f172a" />
        )}
        <ellipse cx="62" cy="45" rx="4.5" ry="5.5" fill="#0f172a" />
        <circle cx="39.5" cy="43" r="1.5" fill="#ffffff" />
        <circle cx="63.5" cy="43" r="1.5" fill="#ffffff" />
      </g>
      <ellipse cx="29" cy="56" rx="6" ry="3.5" fill="#f9a8d4" opacity="0.8" />
      <ellipse cx="71" cy="56" rx="6" ry="3.5" fill="#f9a8d4" opacity="0.8" />
      <path d="M41 57 Q50 67 59 57" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
      {cap && (
        <g>
          <path d="M50 -20 L94 -6 L50 8 L6 -6 Z" fill="#1e1b4b" stroke="#312e81" strokeWidth="2" strokeLinejoin="round" />
          <path d="M26 0 L26 10 Q50 20 74 10 L74 0 L50 8 Z" fill="#312e81" />
          <path d="M50 -6 L84 -2 L84 18" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="84" cy="21" r="4" fill="#fbbf24" />
        </g>
      )}
      {mood === "sparkle" && (
        <path
          className="tooth-sparkle"
          d="M86 6 L89 14 L97 17 L89 20 L86 28 L83 20 L75 17 L83 14 Z"
          fill="#fde047"
          stroke="#facc15"
          strokeWidth="1"
        />
      )}
    </svg>
  )
}

export function ToothLogo({ size = 36 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 shadow-md shadow-sky-200"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 110" width={size * 0.62} height={size * 0.68} aria-hidden="true">
        <path d={TOOTH_PATH} fill="#ffffff" />
      </svg>
    </div>
  )
}
