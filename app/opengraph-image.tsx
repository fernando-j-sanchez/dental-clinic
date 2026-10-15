import { ImageResponse } from "next/og"
import { SITE_NAME, toothDataUri } from "@/lib/site"

// Imagen que aparece al compartir el enlace (WhatsApp, Facebook, LinkedIn, X…)
export const alt = `${SITE_NAME}: gestión para clínicas dentales y universidades`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
// edge: evita un bug de Next 14 en Windows al cargar la fuente, y responde más rápido
export const runtime = "edge"

export default function OpengraphImage() {
  const tooth = toothDataUri()
  const graduate = toothDataUri({ cap: true })

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 80px",
          background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 45%, #8b5cf6 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Burbujas decorativas */}
        <div style={{ position: "absolute", top: 40, right: 120, width: 90, height: 90, borderRadius: 999, background: "rgba(255,255,255,0.15)" }} />
        <div style={{ position: "absolute", bottom: 60, right: 40, width: 160, height: 160, borderRadius: 999, background: "rgba(255,255,255,0.12)" }} />
        <div style={{ position: "absolute", top: 380, left: 360, width: 40, height: 40, borderRadius: 999, background: "rgba(255,255,255,0.2)" }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 70 }}>
          <img src={tooth} width={260} height={286} alt="" />
          <div style={{ width: 170, height: 18, marginTop: 16, borderRadius: 999, background: "rgba(15,23,42,0.18)" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", color: "white", flex: 1 }}>
          <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -2 }}>{SITE_NAME}</div>
          <div style={{ fontSize: 38, lineHeight: 1.25, marginTop: 12, color: "rgba(255,255,255,0.95)" }}>
            Expedientes, agenda y portal del paciente para tu consultorio
          </div>
          <div style={{ display: "flex", marginTop: 40 }}>
            <div style={{ display: "flex", alignItems: "center", padding: "12px 26px", borderRadius: 999, background: "white", color: "#0369a1", fontSize: 28, fontWeight: 700, marginRight: 16 }}>
              Clínicas dentales
            </div>
            <div style={{ display: "flex", alignItems: "center", padding: "8px 26px 8px 12px", borderRadius: 999, background: "rgba(30,27,75,0.35)", color: "white", fontSize: 28, fontWeight: 700 }}>
              <img src={graduate} width={44} height={54} alt="" style={{ marginRight: 10 }} />
              Universidades
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
