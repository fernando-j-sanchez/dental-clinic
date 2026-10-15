import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooth } from "@/components/tooth"
import { ROLE_COLORS, ROLE_LABELS } from "@/lib/permissions"
import type { Role } from "@/lib/types"

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <div className="tooth-float" style={{ ["--tilt" as string]: "6deg" }}>
        <Tooth size={64} mood="wink" />
      </div>
      <p className="mt-4 font-semibold text-slate-800">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Pill({ className, children }: { className: string; children: ReactNode }) {
  return <Badge className={`border-0 font-medium ${className}`}>{children}</Badge>
}

export function RoleBadge({ role }: { role: Role }) {
  return <Pill className={ROLE_COLORS[role]}>{ROLE_LABELS[role]}</Pill>
}

const AVATAR_COLORS = ["bg-sky-500", "bg-cyan-500", "bg-teal-500", "bg-violet-500", "bg-pink-500", "bg-amber-500", "bg-emerald-500"]

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("")
  const color = AVATAR_COLORS[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % AVATAR_COLORS.length]
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${color}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials || "?"}
    </div>
  )
}

export function StatCard({ label, value, icon, tone = "sky" }: { label: string; value: ReactNode; icon: ReactNode; tone?: "sky" | "emerald" | "amber" | "violet" | "pink" }) {
  const tones = {
    sky: "bg-sky-50 text-sky-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
    pink: "bg-pink-50 text-pink-600",
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <div className={`rounded-xl p-2 ${tones[tone]}`}>{icon}</div>
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

export function Field({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 whitespace-pre-line text-sm text-slate-800">{value || "—"}</p>
    </div>
  )
}
