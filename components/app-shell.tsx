"use client"

import { useState, type ReactNode } from "react"
import {
  Building2,
  CalendarDays,
  ClipboardCheck,
  Clock,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ScrollText,
  Settings,
  Users,
  UserRound,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, RoleBadge } from "@/components/common"
import { NotificationsBell } from "@/components/notifications-bell"
import { ToothLogo } from "@/components/tooth"
import { brandOf } from "@/lib/branding"
import { ORG_TYPE_LABELS, can, isProvider } from "@/lib/permissions"
import type { OrgType } from "@/lib/types"
import { fullName, useStore } from "@/lib/store"
import type { Organization, User } from "@/lib/types"

export type View =
  | "dashboard"
  | "patients"
  | "validations"
  | "groups"
  | "agenda"
  | "schedule"
  | "users"
  | "organizations"
  | "audit"
  | "settings"

interface NavItem {
  id: View
  label: string
  icon: typeof LayoutDashboard
  badge?: number
}

function navFor(user: User, pendingReviews: number, org: Organization | undefined, pendingJoins: number): NavItem[] {
  const items: NavItem[] = [{ id: "dashboard", label: "Resumen", icon: LayoutDashboard }]
  if (can.manageOrganizations(user)) items.push({ id: "organizations", label: "Organizaciones", icon: Building2 })
  items.push({ id: "patients", label: user.role === "dentist" || user.role === "student" ? "Mis pacientes" : "Pacientes", icon: UserRound })
  if (org?.type === "school" && (user.role === "teacher" || can.manageUsers(user))) {
    items.push({ id: "groups", label: user.role === "teacher" ? "Mis grupos" : "Grupos", icon: GraduationCap, badge: pendingJoins })
  }
  if (can.validateNotes(user)) items.push({ id: "validations", label: "Validaciones", icon: ClipboardCheck, badge: pendingReviews })
  items.push({ id: "agenda", label: "Agenda", icon: CalendarDays })
  if (isProvider(user.role)) items.push({ id: "schedule", label: "Mi horario", icon: Clock })
  if (can.manageUsers(user)) items.push({ id: "users", label: "Personal", icon: Users })
  if (can.viewAudit(user)) items.push({ id: "audit", label: "Auditoría", icon: ScrollText })
  if (can.manageUsers(user)) items.push({ id: "settings", label: "Configuración", icon: Settings })
  return items
}

export function AppShell({ view, onNavigate, children }: { view: View; onNavigate: (v: View) => void; children: ReactNode }) {
  const { db, currentUser, currentOrg, session, actions } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  if (!currentUser) return null

  const mode: OrgType = currentOrg?.type ?? "clinic"
  const switchMode = (m: OrgType) => {
    const first = db.organizations.find((o) => o.type === m)
    if (first) actions.setActiveOrg(first.id)
  }

  const pendingReviews = db.notes.filter(
    (n) => n.status === "pending_review" && db.users.find((u) => u.id === n.authorId)?.supervisorId === currentUser.id,
  ).length
  const pendingJoins = db.members.filter((m) => {
    if (m.status !== "pending") return false
    const g = db.groups.find((x) => x.id === m.groupId)
    return g?.orgId === currentOrg?.id && (currentUser.role !== "teacher" || g?.teacherId === currentUser.id)
  }).length
  const items = navFor(currentUser, pendingReviews, currentOrg, pendingJoins)
  const brand = brandOf(currentOrg)

  const sidebar = (
    <div className="flex min-h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        {currentOrg?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentOrg.logoUrl} alt="" className="h-[38px] w-[38px] rounded-xl border border-slate-100 object-contain p-0.5" />
        ) : (
          <ToothLogo size={38} />
        )}
        <div className="min-w-0">
          <p className="truncate font-bold leading-tight text-slate-900">{currentOrg?.logoUrl ? currentOrg.name : "DentalCare"}</p>
          <p className="text-xs text-slate-500">{currentOrg ? ORG_TYPE_LABELS[currentOrg.type] : "Plataforma"}</p>
        </div>
      </div>

      {currentUser.role === "support" && (
        <div className="px-4 pb-4">
          <p className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Viendo organización</p>
          <Select value={session.activeOrgId ?? ""} onValueChange={actions.setActiveOrg}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Elegir…" />
            </SelectTrigger>
            <SelectContent>
              {db.organizations.filter((o) => o.type === mode).map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const Icon = item.icon
          const active = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id)
                setMobileOpen(false)
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? `bg-gradient-to-r text-white shadow-md ${brand.nav}` : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {!!item.badge && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${active ? "bg-white/25" : "bg-amber-100 text-amber-800"}`}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="m-3 rounded-2xl bg-slate-50 p-3">
        <div className="flex items-center gap-3">
          <Avatar name={fullName(currentUser)} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{fullName(currentUser)}</p>
            <RoleBadge role={currentUser.role} />
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={actions.logout} className="mt-2 w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 overflow-y-auto border-r border-slate-200 bg-white lg:block">{sidebar}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-white shadow-xl">
            <button className="absolute right-3 top-5 text-slate-400" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú">
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900">{currentOrg?.name ?? "Selecciona una organización"}</p>
            {currentOrg && <p className="truncate text-xs text-slate-500">{currentOrg.city}</p>}
          </div>
          {currentUser.role === "support" ? (
            <ModeSwitch mode={mode} onChange={switchMode} />
          ) : (
            currentOrg && (
              <span className={`hidden rounded-full px-3 py-1 text-xs font-medium sm:inline ${mode === "school" ? "bg-violet-100 text-violet-800" : "bg-sky-100 text-sky-800"}`}>
                {mode === "school" ? "🎓 Universidades" : "🦷 Clínicas"}
              </span>
            )
          )}
          <NotificationsBell />
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

function ModeSwitch({ mode, onChange }: { mode: OrgType; onChange: (m: OrgType) => void }) {
  return (
    <div className="flex rounded-full border border-slate-200 bg-white p-0.5 text-xs font-medium">
      <button
        onClick={() => onChange("clinic")}
        className={`rounded-full px-3 py-1.5 transition ${mode === "clinic" ? "bg-sky-500 text-white" : "text-slate-500 hover:text-slate-800"}`}
      >
        🦷 <span className="hidden sm:inline">Clínicas</span>
      </button>
      <button
        onClick={() => onChange("school")}
        className={`rounded-full px-3 py-1.5 transition ${mode === "school" ? "bg-violet-500 text-white" : "text-slate-500 hover:text-slate-800"}`}
      >
        🎓 <span className="hidden sm:inline">Universidades</span>
      </button>
    </div>
  )
}
