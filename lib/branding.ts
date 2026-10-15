import type { BrandKey, Organization } from "./types"

// Paletas que el admin puede elegir para su organización. Las clases van completas
// (no armadas con variables) para que Tailwind las incluya en el CSS final.
export const BRANDS: Record<BrandKey, { label: string; swatch: string; hero: string; nav: string; solid: string; soft: string }> = {
  sky: {
    label: "Azul turquesa",
    swatch: "bg-gradient-to-br from-sky-500 to-teal-400",
    hero: "from-sky-500 via-cyan-500 to-teal-400 shadow-sky-200",
    nav: "from-sky-500 to-cyan-500 shadow-sky-200",
    solid: "bg-sky-600 hover:bg-sky-700",
    soft: "bg-sky-100 text-sky-800",
  },
  violet: {
    label: "Morado",
    swatch: "bg-gradient-to-br from-indigo-500 to-fuchsia-400",
    hero: "from-indigo-500 via-violet-500 to-fuchsia-400 shadow-violet-200",
    nav: "from-indigo-500 to-violet-500 shadow-violet-200",
    solid: "bg-violet-600 hover:bg-violet-700",
    soft: "bg-violet-100 text-violet-800",
  },
  emerald: {
    label: "Verde menta",
    swatch: "bg-gradient-to-br from-emerald-500 to-cyan-400",
    hero: "from-emerald-500 via-teal-500 to-cyan-400 shadow-emerald-200",
    nav: "from-emerald-500 to-teal-500 shadow-emerald-200",
    solid: "bg-emerald-600 hover:bg-emerald-700",
    soft: "bg-emerald-100 text-emerald-800",
  },
  rose: {
    label: "Rosa",
    swatch: "bg-gradient-to-br from-rose-500 to-orange-300",
    hero: "from-rose-500 via-pink-500 to-orange-300 shadow-rose-200",
    nav: "from-rose-500 to-pink-500 shadow-rose-200",
    solid: "bg-rose-600 hover:bg-rose-700",
    soft: "bg-rose-100 text-rose-800",
  },
  amber: {
    label: "Naranja",
    swatch: "bg-gradient-to-br from-amber-500 to-red-400",
    hero: "from-amber-500 via-orange-500 to-red-400 shadow-amber-200",
    nav: "from-amber-500 to-orange-500 shadow-amber-200",
    solid: "bg-orange-600 hover:bg-orange-700",
    soft: "bg-amber-100 text-amber-800",
  },
  greengold: {
    label: "Verde y oro",
    swatch: "bg-gradient-to-br from-green-700 to-yellow-500",
    hero: "from-green-800 via-green-700 to-yellow-500 shadow-green-200",
    nav: "from-green-700 to-emerald-600 shadow-green-200",
    solid: "bg-green-700 hover:bg-green-800",
    soft: "bg-yellow-100 text-green-900",
  },
  navy: {
    label: "Azul marino",
    swatch: "bg-gradient-to-br from-blue-800 to-indigo-950",
    hero: "from-blue-700 via-blue-800 to-indigo-950 shadow-blue-200",
    nav: "from-blue-700 to-indigo-800 shadow-blue-200",
    solid: "bg-blue-800 hover:bg-blue-900",
    soft: "bg-blue-100 text-blue-900",
  },
}

export const brandOf = (org?: Organization | null) => BRANDS[org?.brand ?? (org?.type === "school" ? "violet" : "sky")]
