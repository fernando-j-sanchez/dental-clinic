import { ImageResponse } from "next/og"
import { SITE_NAME, toothDataUri } from "@/lib/site"

// Vista previa del link de invitación a un grupo: muestra el código en grande
export const alt = "Invitación para unirte a un grupo"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
// edge: evita un bug de Next 14 en Windows al cargar la fuente, y responde más rápido
export const runtime = "edge"

export default function JoinOpengraphImage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code).toUpperCase().slice(0, 24)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #e879f9 100%)",
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 50, left: 60, width: 120, height: 120, borderRadius: 999, background: "rgba(255,255,255,0.12)" }} />
        <div style={{ position: "absolute", bottom: 40, right: 70, width: 180, height: 180, borderRadius: 999, background: "rgba(255,255,255,0.12)" }} />

        <img src={toothDataUri({ cap: true })} width={150} height={201} alt="" />
        <div style={{ fontSize: 44, marginTop: 18, color: "rgba(255,255,255,0.95)" }}>¡Te invitaron a un grupo!</div>
        <div
          style={{
            display: "flex",
            marginTop: 26,
            padding: "18px 44px",
            borderRadius: 28,
            background: "white",
            color: "#4c1d95",
            fontSize: 76,
            fontWeight: 900,
            letterSpacing: 6,
          }}
        >
          {code}
        </div>
        <div style={{ fontSize: 30, marginTop: 28, color: "rgba(255,255,255,0.85)" }}>{`Toca el enlace para unirte en ${SITE_NAME}`}</div>
      </div>
    ),
    size,
  )
}
