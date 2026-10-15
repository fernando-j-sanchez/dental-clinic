"use client"

import { ArrowRightLeft, CalendarCheck, ClipboardCheck, Inbox, UserRound } from "lucide-react"
import { EmptyState, Pill, StatCard } from "@/components/common"
import { Tooth } from "@/components/tooth"
import { daysFromToday, formatDate, formatDateTime, formatTime, todayKey } from "@/lib/dates"
import { APPOINTMENT_STATUS, APPOINTMENT_TYPE_LABELS, ROLE_LABELS, isProvider } from "@/lib/permissions"
import { visiblePatients } from "@/lib/selectors"
import { fullName, providerTitle, useStore, useUserLookup } from "@/lib/store"

export function DashboardView({ onOpenPatient }: { onOpenPatient: (id: string) => void }) {
  const { db, currentUser, currentOrg, orgId } = useStore()
  const userById = useUserLookup()
  if (!currentUser) return null

  if (!currentOrg) {
    return <EmptyState title="Elige una organización" description="Usa el selector del menú lateral para ver los datos de una clínica o escuela." />
  }

  const today = todayKey()
  const patients = visiblePatients(db, currentUser, orgId, currentOrg)
  const patientIds = new Set(patients.map((p) => p.id))
  const mine = (providerId: string) => !isProvider(currentUser.role) || currentUser.role === "teacher" || providerId === currentUser.id

  const todays = db.appointments
    .filter((a) => a.orgId === orgId && a.date === today && a.status !== "cancelled" && patientIds.has(a.patientId) && mine(a.providerId))
    .sort((a, b) => a.time.localeCompare(b.time))
  const requests = db.appointments.filter((a) => a.orgId === orgId && a.status === "requested" && a.date >= today && mine(a.providerId))
  const pendingReviews = db.notes.filter((n) => n.orgId === orgId && n.status === "pending_review" && (currentUser.role !== "student" || n.authorId === currentUser.id))
  const rejected = db.notes.filter((n) => n.authorId === currentUser.id && n.status === "rejected")
  const followUps = db.notes
    .filter((n) => patientIds.has(n.patientId) && n.status !== "voided" && n.followUpDate && n.followUpDate >= today && n.followUpDate <= daysFromToday(14) && mine(db.patients.find((p) => p.id === n.patientId)?.providerId ?? ""))
    .sort((a, b) => a.followUpDate!.localeCompare(b.followUpDate!))
  const transfersToMe = db.transfers.filter((t) => t.toProviderId === currentUser.id).slice(0, 3)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches"

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-400 p-6 text-white shadow-lg shadow-sky-200 sm:p-8">
        <div className="relative z-10 max-w-xl">
          <p className="text-sm text-white/80">{ROLE_LABELS[currentUser.role]} · {currentOrg.name}</p>
          <h1 className="mt-1 text-3xl font-bold">
            {greeting}, {currentUser.firstName} ✨
          </h1>
          <p className="mt-2 text-white/90">
            {todays.length ? `Hoy hay ${todays.length} cita${todays.length === 1 ? "" : "s"} en tu agenda.` : "Hoy no hay citas en tu agenda."}
            {rejected.length > 0 && ` Tienes ${rejected.length} nota${rejected.length === 1 ? "" : "s"} por corregir.`}
          </p>
        </div>
        <div className="tooth-float absolute -bottom-4 right-6 hidden sm:block" style={{ ["--tilt" as string]: "-6deg" }}>
          <Tooth size={120} mood="sparkle" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={isProvider(currentUser.role) && currentUser.role !== "teacher" ? "Mis pacientes" : "Pacientes"} value={patients.length} icon={<UserRound className="h-5 w-5" />} />
        <StatCard label="Citas hoy" value={todays.length} icon={<CalendarCheck className="h-5 w-5" />} tone="emerald" />
        <StatCard label="Solicitudes de cita" value={requests.length} icon={<Inbox className="h-5 w-5" />} tone="pink" />
        <StatCard
          label={currentUser.role === "student" ? "Notas en revisión" : "Notas por validar"}
          value={pendingReviews.length}
          icon={<ClipboardCheck className="h-5 w-5" />}
          tone="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">Agenda de hoy</h2>
          {todays.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Sin citas hoy 🦷</p>
          ) : (
            <div className="space-y-2">
              {todays.map((a) => {
                const patient = db.patients.find((p) => p.id === a.patientId)
                return (
                  <button key={a.id} onClick={() => onOpenPatient(a.patientId)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-slate-50">
                    <span className="w-20 font-semibold text-sky-700">{formatTime(a.time)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-slate-800">{fullName(patient)}</span>
                      <span className="block truncate text-xs text-slate-400">
                        {APPOINTMENT_TYPE_LABELS[a.type]} · {providerTitle(userById(a.providerId))}
                      </span>
                    </span>
                    <Pill className={APPOINTMENT_STATUS[a.status].className}>{APPOINTMENT_STATUS[a.status].label}</Pill>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">Seguimientos próximos (14 días)</h2>
          {followUps.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Nada pendiente</p>
          ) : (
            <div className="space-y-2">
              {followUps.slice(0, 6).map((n) => (
                <button key={n.id} onClick={() => onOpenPatient(n.patientId)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-slate-50">
                  <span className="w-24 text-sm font-medium text-amber-700">{formatDate(n.followUpDate!)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-slate-800">{fullName(db.patients.find((p) => p.id === n.patientId))}</span>
                    <span className="block truncate text-xs text-slate-400">{n.title}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {transfersToMe.length > 0 && (
        <section className="rounded-2xl border border-sky-200 bg-sky-50/50 p-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-sky-900">
            <ArrowRightLeft className="h-4 w-4" /> Expedientes que recibiste
          </h2>
          <div className="space-y-2">
            {transfersToMe.map((t) => (
              <button key={t.id} onClick={() => onOpenPatient(t.patientId)} className="flex w-full flex-wrap items-center gap-2 rounded-xl bg-white px-3 py-2 text-left text-sm hover:shadow-sm">
                <span className="font-medium text-slate-800">{fullName(db.patients.find((p) => p.id === t.patientId))}</span>
                <span className="text-slate-500">de {providerTitle(userById(t.fromProviderId))}</span>
                <span className="ml-auto text-xs text-slate-400">{formatDateTime(t.at)}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
