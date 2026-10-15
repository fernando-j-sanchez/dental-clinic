import type { Metadata } from "next"
import { DentalApp } from "@/components/dental-app"
import { SITE_NAME } from "@/lib/site"

interface Props {
  params: { code: string }
}

// Título y descripción del link de invitación (la imagen sale de opengraph-image.tsx)
export function generateMetadata({ params }: Props): Metadata {
  const code = decodeURIComponent(params.code).toUpperCase()
  const title = `Únete a mi grupo · ${code}`
  const description = `Tu maestro te invitó a su grupo en ${SITE_NAME}. Crea tu cuenta con tu matrícula y entra con el código ${code}.`
  return {
    title,
    description,
    openGraph: { title, description, url: `/unirse/${code}`, type: "website", locale: "es_MX", siteName: SITE_NAME },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: false }, // los links de invitación no deben salir en Google
  }
}

export default function JoinPage({ params }: Props) {
  return <DentalApp joinCode={decodeURIComponent(params.code)} />
}
