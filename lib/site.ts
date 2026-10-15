// Datos del sitio para metadatos y vistas previas (Open Graph).
// Cuando tengas dominio propio, configura NEXT_PUBLIC_SITE_URL en Vercel (ej. https://dentaula.com).

export const SITE_NAME = "DentalCare"

export const SITE_DESCRIPTION =
  "Expedientes clínicos, agenda en línea y portal del paciente para clínicas dentales y universidades de odontología."

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")

const TOOTH_PATH =
  "M50 8 C35 2 15 6 12 26 C9 44 18 56 22 72 C26 88 28 104 36 104 C44 104 44 82 50 80 C56 82 56 104 64 104 C72 104 74 88 78 72 C82 56 91 44 88 26 C85 6 65 2 50 8 Z"

// Dientecito con carita como imagen SVG embebida (las imágenes OG no cargan componentes)
export function toothDataUri({ cap = false }: { cap?: boolean } = {}) {
  const top = cap ? -24 : 0
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${top} 100 ${110 - top}">
    <path d="${TOOTH_PATH}" fill="#ffffff" stroke="#bae6fd" stroke-width="3" stroke-linejoin="round"/>
    <path d="M28 22 C30 15 38 12 44 13" fill="none" stroke="#e0f2fe" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="38" cy="45" rx="4.5" ry="5.5" fill="#0f172a"/>
    <ellipse cx="62" cy="45" rx="4.5" ry="5.5" fill="#0f172a"/>
    <circle cx="39.5" cy="43" r="1.5" fill="#ffffff"/>
    <circle cx="63.5" cy="43" r="1.5" fill="#ffffff"/>
    <ellipse cx="29" cy="56" rx="6" ry="3.5" fill="#f9a8d4"/>
    <ellipse cx="71" cy="56" rx="6" ry="3.5" fill="#f9a8d4"/>
    <path d="M41 57 Q50 67 59 57" fill="none" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>
    ${
      cap
        ? `<path d="M50 -20 L94 -6 L50 8 L6 -6 Z" fill="#1e1b4b" stroke="#312e81" stroke-width="2" stroke-linejoin="round"/>
    <path d="M26 0 L26 10 Q50 20 74 10 L74 0 L50 8 Z" fill="#312e81"/>
    <path d="M50 -6 L84 -2 L84 18" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="84" cy="21" r="4" fill="#fbbf24"/>`
        : `<path d="M86 6 L89 14 L97 17 L89 20 L86 28 L83 20 L75 17 L83 14 Z" fill="#fde047"/>`
    }
  </svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}` // el SVG es solo ASCII, btoa sirve en Node y en edge
}
